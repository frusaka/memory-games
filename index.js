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
  "🐚",
];
let pairedEmojis = 0;
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

function shuffle(arr) {
  return arr
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
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
    }

    prevEmoji = null;
    prevPaired.pending = false;
  };

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
  if (pairedEmojis < 8) celebrate(currEmoji, true);
  else resetGame();
}

function resetGame() {
  // Smooth reset
  const cardsGrid = document.querySelector(".js-cards");
  setTimeout(() => cardsGrid.classList.add("game-won"), 250);
  setTimeout(() => {
    cardsGrid.classList.remove("game-won");
    cardsGrid.querySelectorAll(".js-emoji").forEach((emoji) => {
      emoji.classList.remove("emoji-reveal");
    });
    setTimeout(renderCards, 500);
  }, 1000);

  // Reset previous pointers
  pairedEmojis = 0;
  prevEmoji = null;
}

function renderCards() {
  let cardsHTML = "";
  let gameEmojis = shuffle(emojis).slice(0, 8);
  shuffle(gameEmojis.concat(gameEmojis)).forEach((emoji) => {
    cardsHTML += `<div class="emoji emoji-hide js-emoji">${emoji}</div>`;
  });
  document.querySelector(".js-cards").innerHTML = cardsHTML;
  document
    .querySelectorAll(".js-emoji")
    .forEach((emoji) => emoji.addEventListener("click", gameLogic));
}

renderCards();
