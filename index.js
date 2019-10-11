const congklak = require("congklak");

congklak.init();

const render = state => {
  for (let i = 0; i < 16; i += 1) {
    const ring = document.querySelector(`#ring-${i}`);
    ring.innerHTML = state[i];
  }
};

render(congklak.getState());

for (let i = 0; i < 16; i += 1) {
  const ring = document.querySelector(`#ring-${i}`);
  ring.parentElement.addEventListener("click", () => {
    congklak.play(i);
  });
}

setInterval(() => {
  const state = congklak.nextState();
  if (state) render(state);
}, 500);
