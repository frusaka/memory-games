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

let pairedEmojis = (currScore = 0);
let gridTotal = JSON.parse(localStorage.getItem("image-pairing-size")) || 8;
let bestScore =
  JSON.parse(sessionStorage.getItem("image-pairing-best-score")) || 0;
let attempts = { seen: new Map(), wrong: 0, right: 0 };
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
  // Give each value a random weight then sort based on that
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
    document.getElementById("success-rate").innerHTML = `${attempts.right}/${
      attempts.right + attempts.wrong
    }`;
  }, 250);

  prevPaired.timeoutFunc = () => {
    // Hide right/wrong feedback
    prevEmoji.classList.remove(celebrateClass);
    currEmoji.classList.remove(celebrateClass);

    if (!success) {
      // Hide non-matching pairs
      prevEmoji.classList.remove("emoji-reveal");
      currEmoji.classList.remove("emoji-reveal");
    }
    // Let game logic know celebration effects are complete
    prevEmoji = null;
    prevPaired.pending = false;
  };

  // Update scores
  if (success) {
    attempts.right++;
  } else {
    // Criteria to deduct score
    if (
      attempts.seen[currEmoji.innerHTML].has(currEmoji) || // Already clicked most recent
      (attempts.seen[prevEmoji.innerHTML].size && // First image has been seen (no matter where)
        !attempts.seen[prevEmoji.innerHTML].has(prevEmoji)) // First image was seen but not on the same card
    ) {
      attempts.wrong++;
    }
    // Mark revealed cards as seen
    attempts.seen[prevEmoji.innerHTML].add(prevEmoji);
    attempts.seen[currEmoji.innerHTML].add(currEmoji);
  }
  // Let game logic know celebration effects are pending
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

  // Pair has been found so cards no longer responds to clicks
  currEmoji.removeEventListener("click", gameLogic);
  prevEmoji.removeEventListener("click", gameLogic);

  // Finished the game?
  pairedEmojis++;
  celebrate(currEmoji, true);
  if (pairedEmojis == gridTotal) {
    // Do the logic but not the visuals
    prevPaired.cancel();
    document.getElementById("success-rate").innerHTML = `${attempts.right}/${
      attempts.right + attempts.wrong
    }`;
    finishGame();
  }
}

function finishGame() {
  // Store score
  currScore = Math.round(
    (attempts.right / (attempts.right + attempts.wrong)) * 100
  );
  if (currScore > bestScore) {
    bestScore = currScore;
    sessionStorage.setItem("image-pairing-best-score", bestScore);
  }

  setTimeout(() => {
    cardsGrid.classList.add("game-won");
    // Display scores
    document.getElementById("score-number").innerText = `${currScore}%`;
    document.getElementById("best-score").innerText = `${bestScore}%`;
    document.getElementById("result").style.display = "initial";
  }, 250);
}

function restartGame() {
  document.getElementById("result").style.display = "none";
  cardsGrid.classList.remove("game-won");
  cardsGrid.querySelectorAll(".js-emoji").forEach((emoji) => {
    emoji.classList.remove("emoji-reveal");
  });
  setTimeout(renderCards, 500);
}

function renderCards() {
  // Reset previous pointers
  prevEmoji = null;
  attempts.seen.clear();
  pairedEmojis = attempts.wrong = attempts.right = 0;
  // Generate the HTML
  let cardsHTML = "";
  cardsArray(gridTotal).forEach((emoji) => {
    cardsHTML += `<div class="emoji js-emoji">${emoji}</div>`;
    attempts.seen[emoji] = new Set();
  });
  // Fill grid
  updateGrid();
  cardsGrid.innerHTML = cardsHTML;
  document.getElementById("best-score").innerText = `${bestScore}%`;
  // Make cards handle clicks
  document
    .querySelectorAll(".js-emoji")
    .forEach((emoji) => emoji.addEventListener("click", gameLogic));
  document.getElementById("success-rate").innerHTML = "0/0";
}

function updateGrid() {
  // let totalArea = (Math.min(window.innerWidth, window.innerHeight) * 0.8) ** 2;
  let totalArea = window.innerWidth * window.innerHeight ** 0.854;
  let size = Math.floor(Math.sqrt(totalArea / (gridTotal * 2)));
  cardsGrid.style.setProperty("--size", `${size}px`);
}

window.addEventListener("resize", updateGrid);

// Hide start page on "Start" click
document.getElementById("start").addEventListener("click", () => {
  document.getElementById("home").style.visibility = "collapse";
  document.getElementById("game").style.display = "flex";
});

// Respond to changes in size control
const sizeElement = document.getElementById("size");
sizeElement.addEventListener("input", () => {
  if (sizeElement.value < 2 || sizeElement.value > emojis.length) return;
  gridTotal = +sizeElement.value;
  localStorage.setItem("image-pairing-size", gridTotal);
  renderCards();
});

sizeElement.value = gridTotal;

document.getElementById("score-ok").addEventListener("click", restartGame);

renderCards();
