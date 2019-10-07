const congklak = require('congklak');

congklak.init();
states = congklak.getState();

for (let i = 0; i < 16; i += 1) {
  document.getElementById(`ring-${i}`).innerHTML = states[i];
}

console.log(states);
