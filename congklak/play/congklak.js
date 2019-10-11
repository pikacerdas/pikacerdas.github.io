(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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

},{"congklak":2}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
const PLAYER = exports.PLAYER = 0;
const AI = exports.AI = 1;

const MAX_HOUSE = 16;
const SEED_PER_HOUSE = 7;
const PLAYER_POINT_INDEX = 7;
const AI_POINT_INDEX = 15;

let houses = [];
let turn = PLAYER;

const isPoint = index => index === PLAYER_POINT_INDEX || index === AI_POINT_INDEX;
const isValidIndex = index => index >= 0 && index <= MAX_HOUSE;

const init = exports.init = (firstTurn = true) => {
  houses = [];

  for (let i = 0; i < MAX_HOUSE; i += 1) {
    houses.push(isPoint(i) ? 0 : SEED_PER_HOUSE);
  }

  turn = firstTurn ? PLAYER : AI;
};

const play = exports.play = index => {
  if (!isValidIndex(index)) {
    throw new Error('Invalid house');
  }
};

const getState = exports.getState = () => houses.slice();

const getTurn = exports.getTurn = () => turn;
},{}]},{},[1]);
