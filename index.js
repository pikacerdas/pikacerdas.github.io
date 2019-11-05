const congklak = require("congklak");

congklak.init();

const render = state => {
  for (let i = 0; i < 16; i += 1) {
    const ring = document.querySelector(`#ring-${i}`);
    ring.innerHTML = state[i];
  }
};

let prevState = congklak.getState();
render(prevState);

let stateStream;

for (let i = 0; i < 16; i += 1) {
  const ring = document.querySelector(`#ring-${i}`);
  ring.parentElement.addEventListener("click", () => {
    stateStream = congklak.play(i);
  });
}

const coloringTheChanges = newState => {
  for (let i = 0; i < 16; i += 1) {
    const ring = document.querySelector(`#outer-ring-${i}`);
    ring.style.backgroundColor = "#e7e7e7";
    if (prevState[i] !== newState[i]) {
      if (congklak.getTurn() === congklak.AI_MOVING) ring.style.backgroundColor = "#ff9494";
      if (congklak.getTurn() === congklak.PLAYER_MOVING) ring.style.backgroundColor = "#c1ffb0";
    }
  }
};

setInterval(() => {
  if (congklak.getTurn() === congklak.AI) {
    document.querySelector(".description").innerHTML = "It's enemy's turn";
    stateStream = congklak.aiPlay();
  }

  if (congklak.getTurn() === congklak.PLAYER) {
    document.querySelector(".description").innerHTML = "It's your turn";
  }

  const state = stateStream && stateStream.next().value;
  if (state) {
    render(state);
    coloringTheChanges(state);
    prevState = state.slice();
  }
}, 1000);
