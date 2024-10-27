let prevEmoji;
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
  emojiCard.classList.add("emoji-revealed");

  if (!prevEmoji) {
    prevEmoji = emojiCard;
    return;
  }
  if (prevEmoji === emojiCard) return;

  if (emojiCard.innerHTML == prevEmoji.innerHTML) {
    emojiCard.removeEventListener("click", gameLogic);
    prevEmoji.removeEventListener("click", gameLogic);
  } else {
    const localprevEmoji = prevEmoji;
    setTimeout(() => {
      localprevEmoji.classList.remove("emoji-revealed");
      emojiCard.classList.remove("emoji-revealed");
    }, 300);
  }
  prevEmoji = null;
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
    emojiCard.classList.add("emoji-revealed");
    setTimeout(()=>emojiCard.classList.remove("emoji-revealed"),1000)
    */
    emojiCard.addEventListener("click", gameLogic);
  });
}

renderCards();
