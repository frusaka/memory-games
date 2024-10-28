let prevEmoji;
let prevPaired = { pending: false, timeoutId: null, timeoutFunc: null };
let emojis = [
  "🐊",
  "🦆",
  "🐼",
  "🦋",
  "🦚",
  "🐋",
  "🐦",
  "🐶",
  "🐠",
  "🦉",
  "🦖",
  "🦁",
  "🦅",
  "🐦‍🔥",
  "🐘",
  "🐐",
];
// emojis = emojis.concat(emojis);

function shuffle(arr) {
  return arr
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
}

function celebrate(currEmoji, success) {
  const celebrateClass = success ? "emoji-right" : "emoji-wrong";
  setTimeout(() => {
    currEmoji.classList.add(celebrateClass);
    prevEmoji.classList.add(celebrateClass);
  }, 250);

  prevPaired.timeoutFunc = () => {
    prevEmoji.classList.remove(celebrateClass);
    currEmoji.classList.remove(celebrateClass);
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

  //Dem fast clickers 😎
  if (prevPaired.pending) {
    clearTimeout(prevPaired.timeoutId);
    prevPaired.timeoutFunc();
  }

  currEmoji.classList.add("emoji-reveal");

  if (!prevEmoji) {
    prevEmoji = currEmoji;
    return;
  }

  if (currEmoji.innerHTML == prevEmoji.innerHTML) {
    currEmoji.removeEventListener("click", gameLogic);
    prevEmoji.removeEventListener("click", gameLogic);
    celebrate(currEmoji, true);
  } else {
    celebrate(currEmoji, false);
  }
}

function renderCards() {
  let cardsHTML = "";
  let gameEmojis = shuffle(emojis).slice(0, 8);
  shuffle(gameEmojis.concat(gameEmojis)).forEach((emoji) => {
    cardsHTML += `<div class="emoji js-emoji">${emoji}</div>`;
  });
  document.querySelector(".js-cards").innerHTML = cardsHTML;
  document.querySelector(".js-reset").addEventListener("click", renderCards);
  document.querySelectorAll(".js-emoji").forEach((emoji) => {
    /*
    // Wanna get a full picture before starting?
    emoji.classList.add("emoji-reveal");
    setTimeout(()=>emoji.classList.remove("emoji-reveal"),1000)
    */
    emoji.addEventListener("click", gameLogic);
  });
}

renderCards();
