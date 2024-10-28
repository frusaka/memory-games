let prevEmoji;
let prevPaired = { pending: false, timeoutId: null, timeoutFunc: null };
let emojis = ["🦥", "🦆", "🐼", "🦋", "🦚", "🐋", "🐦", "🐶"];
emojis = emojis.concat(emojis);

function shuffle(arr) {
  return arr
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
}

function gameLogic(event) {
  const emojiCard = event.target;
  if (prevEmoji === emojiCard) return;

  emojiCard.classList.add("emoji-reveal");

  if (prevPaired.pending) {
    clearTimeout(prevPaired.timeoutId);
    prevPaired.timeoutFunc();
  }

  if (!prevEmoji) {
    prevEmoji = emojiCard;
    return;
  }

  if (emojiCard.innerHTML == prevEmoji.innerHTML) {
    emojiCard.removeEventListener("click", gameLogic);
    prevEmoji.removeEventListener("click", gameLogic);
    prevEmoji = null;
  } else {
    prevPaired.pending = true;
    prevPaired.timeoutFunc = () => {
      prevEmoji.classList.remove("emoji-reveal");
      emojiCard.classList.remove("emoji-reveal");
      prevEmoji = null;
      prevPaired.pending = false;
    };
    prevPaired.timeoutId = setTimeout(prevPaired.timeoutFunc, 700);
  }
}

function renderCards() {
  let cardsHTML = "";
  shuffle(emojis).forEach((emoji) => {
    cardsHTML += `<div class="emoji js-emoji">${emoji}</div>`;
  });
  document.querySelector(".js-cards").innerHTML = cardsHTML;
  document.querySelector(".js-reset").addEventListener("click", renderCards);
  document.querySelectorAll(".js-emoji").forEach((emojiCard) => {
    /*
    // Wanna get a full picture before starting?
    emojiCard.classList.add("emoji-reveal");
    setTimeout(()=>emojiCard.classList.remove("emoji-reveal"),1000)
    */
    emojiCard.addEventListener("click", gameLogic);
  });
}

renderCards();
