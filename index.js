let prevEmoji;
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
  "🐎",
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
  "🦧",
  "🐟",
  "🪲",
  "🦃",
  "🐄",
  "🦣",
  "🐖",
  "🐆",
  "🦨",
  "🕊️",
  "🐦‍⬛",
  "🦂",
  "🦜",
  "🐝",
  "🐜",
  "🐌",
  "🐀",
  "🦬",
  "🦥",
  "🐸",
];

let gridTotal = 8;
let pairedEmojis = 0;
let currScore = 0;
let bestScore =
  JSON.parse(sessionStorage.getItem("image-pairing-best-score")) || 0;
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

let attempts = { attempted: new Set(), wrong: 0, total: 0 };
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

    if (!success) {
      // Hide non-matching pairs
      prevEmoji.classList.remove("emoji-reveal");
      currEmoji.classList.remove("emoji-reveal");
      // Update scores
      if (
        attempts.attempted.has(prevEmoji) ||
        attempts.attempted.has(currEmoji)
      )
        attempts.wrong++;
      else {
        attempts.attempted.add(prevEmoji);
        attempts.attempted.add(currEmoji);
      }
    }

    prevEmoji = null;
    prevPaired.pending = false;
  };

  attempts.total++;
  prevPaired.timeoutId = setTimeout(prevPaired.timeoutFunc, 700);
  prevPaired.pending = true;
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
  else finishGame();
}

function finishGame() {
  // Store score
  currScore = Math.round(
    ((attempts.total - attempts.wrong) / attempts.total) * 100
  );
  if (currScore > bestScore) {
    bestScore = currScore;
    sessionStorage.setItem("image-pairing-best-score", bestScore);
  }
  // Smooth reset
  setTimeout(() => {
    cardsGrid.classList.add("game-won");
    document.getElementById("score-number").innerText = `${currScore}%`;
    document.getElementById("score").style.display = "initial";
  }, 250);
  // Reset previous pointers
  attempts.attempted.clear();
  prevEmoji = null;
  pairedEmojis = attempts.wrong = attempts.total = 0;
}

function restartGame() {
  document.getElementById("score").style.display = "none";
  cardsGrid.classList.remove("game-won");
  cardsGrid.querySelectorAll(".js-emoji").forEach((emoji) => {
    emoji.classList.remove("emoji-reveal");
  });
  setTimeout(renderCards, 500);
}

function renderCards() {
  let cardsHTML = "";
  cardsArray(gridTotal).forEach((emoji) => {
    cardsHTML += `<div class="emoji js-emoji">${emoji}</div>`;
  });
  // Fill grid
  updateGrid();
  cardsGrid.innerHTML = cardsHTML;
  document.getElementById("best").innerText = `${bestScore}%`;
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

const sizeElement = document.getElementById("size");
sizeElement.addEventListener("input", () => {
  if (sizeElement.value < 2 || sizeElement.value > emojis.length) return;
  gridTotal = +sizeElement.value;
  renderCards();
});

document.getElementById("hide-score").addEventListener("click", restartGame);

renderCards();
