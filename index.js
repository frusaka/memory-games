let prevEmoji, sizeTimoutId;
let emojis = [
  "🐊",
  "🦆",
  "🐼",
  "🦋",
  "🦚",
  "🐋",
  "🐦",
  "🐩",
  "🐠",
  "🦉",
  "🦖",
  "🦁",
  "🦅",
  "🦀",
  "🐘",
  "🐐",
  "🦭",
  "🐈",
  "🐧",
  "🦩",
  "🪼",
  "🦄",
  "🐓",
  "🦔",
  "🦢",
  "🦈",
  "🐚",
  "🐢",
  "🦝",
  "🐯",
  "🦒",
  "🦇",
  "🐑",
  "🐞",
  "🐥",
  "🐒",
  "🦓",
  "🐃",
  "🦛",
  "🦘",
];

let gridTotal = 8;
let pairedEmojis = (totalClicks = wrongClicks = 0);
let bestScore =
  JSON.parse(localStorage.getItem("image-pairing-best-score")) || 0;
let prevPaired = {
  pending: false,
  timeoutId: null,
  timeoutFunc: null,
  celebrateId: null,
  cancel() {
    clearTimeout(this.timeoutId);
    clearTimeout(this.celebrateId);
    this.timeoutFunc();
  },
};

const cardsGrid = document.getElementById("cards");

function shuffle(arr) {
  return arr
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
}

function cardsArray(total) {
  let gameEmojis = shuffle(emojis).slice(0, total);
  gameEmojis = gameEmojis.concat(gameEmojis);
  return shuffle(gameEmojis);
}

function celebrate(currEmoji, success) {
  const celebrateClass = success ? "emoji-right" : "emoji-wrong";
  // Use color to temporarily show user whether they are right or not
  prevPaired.celebrateId = setTimeout(() => {
    currEmoji.classList.add(celebrateClass);
    prevEmoji.classList.add(celebrateClass);
  }, 250);

  prevPaired.timeoutFunc = () => {
    // Hide right/wrong feedback
    prevEmoji.classList.remove(celebrateClass);
    currEmoji.classList.remove(celebrateClass);

    // Hide non-matching pairs
    if (!success) {
      prevEmoji.classList.remove("emoji-reveal");
      currEmoji.classList.remove("emoji-reveal");
      wrongClicks++;
    }

    prevEmoji = null;
    prevPaired.pending = false;
  };

  prevPaired.timeoutId = setTimeout(prevPaired.timeoutFunc, 700);
  prevPaired.pending = true;
  totalClicks++;
}

function gameLogic(event) {
  const currEmoji = event.target;
  if (prevEmoji === currEmoji) return;

  // Dem fast clickers 😎
  if (prevPaired.pending) prevPaired.cancel();

  currEmoji.classList.add("emoji-reveal");

  // User has not yet clicked another card to match
  if (!prevEmoji) {
    prevEmoji = currEmoji;
    return;
  }

  // Pair chosen is incorrect
  if (currEmoji.innerHTML != prevEmoji.innerHTML) {
    celebrate(currEmoji, false);
    return;
  }

  // Pair has been found
  currEmoji.removeEventListener("click", gameLogic);
  prevEmoji.removeEventListener("click", gameLogic);

  // Finished the game?
  pairedEmojis++;
  if (pairedEmojis < gridTotal) celebrate(currEmoji, true);
  else resetGame();
}

function resetGame() {
  // Smooth reset
  setTimeout(() => cardsGrid.classList.add("game-won"), 250);
  setTimeout(() => {
    cardsGrid.classList.remove("game-won");
    cardsGrid.querySelectorAll(".js-emoji").forEach((emoji) => {
      emoji.classList.remove("emoji-reveal");
    });
    setTimeout(renderCards, 500);
  }, 1000);
  // Record Score
  let newScore = Math.round(((totalClicks - wrongClicks) / totalClicks) * 100);
  if (newScore > bestScore) {
    bestScore = newScore;
    localStorage.setItem("image-pairing-best-score", bestScore);
  }
}

function renderCards() {
  // Reset previous pointers
  pairedEmojis = 0;
  prevEmoji = null;
  let cardsHTML = "";
  cardsArray(gridTotal).forEach((emoji) => {
    cardsHTML += `<div class="emoji js-emoji">${emoji}</div>`;
  });
  // Fill grid
  updateGrid();
  cardsGrid.innerHTML = cardsHTML;
  document.getElementById("accuracy").innerText = `${bestScore}%`;
  document
    .querySelectorAll(".js-emoji")
    .forEach((emoji) => emoji.addEventListener("click", gameLogic));
}

function updateGrid() {
  // let totalArea = (Math.min(window.innerWidth, window.innerHeight) * 0.8) ** 2;
  let totalArea = window.innerWidth * window.innerHeight ** 0.854;
  let size = Math.floor(Math.sqrt(totalArea / (gridTotal * 2)));
  cardsGrid.style.setProperty("--size", `${size}px`);
}

window.addEventListener("resize", updateGrid);

document.getElementById("start").addEventListener("click", () => {
  document.getElementById("home").style.visibility = "collapse";
  document.getElementById("game").style.display = "flex";
});

document.getElementById("add").addEventListener("click", () => {
  if (gridTotal == emojis.length) {
    return;
  }
  gridTotal++;
  document.getElementById("size").innerHTML = gridTotal;
  renderCards();
});

document.getElementById("sub").addEventListener("click", () => {
  if (gridTotal == 2) {
    return;
  }
  gridTotal--;
  document.getElementById("size").innerHTML = gridTotal;
  renderCards();
});

renderCards();
