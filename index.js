const congklak = require('congklak')

congklak.init()
const states = congklak.getState()

for (let i = 0; i < 16; i += 1) {
  const ring = document.querySelector(`#ring-${i}`)
  ring.innerHTML = states[i]
  ring.parentElement.addEventListener('click', () => {
    const skipRing = i < 7 ? 15 : 7
    let seedInHand = parseInt(ring.innerHTML)
    ring.innerHTML = states[i] = 0
    let currentRing = i + 1
    while (seedInHand--) {
      if (currentRing === skipRing) continue
      const current = document.querySelector(`#ring-${currentRing}`)
      const seedInRing = parseInt(current.innerHTML)
      if (seedInHand) current.innerHTML = states[currentRing] = seedInRing + 1
      else if (seedInRing) {
        current.innerHTML = states[currentRing] = 0
        seedInHand = seedInRing + 1
      }
      if (states[currentRing + 1] === undefined) currentRing = 0
      else currentRing++
    }
  })
}
