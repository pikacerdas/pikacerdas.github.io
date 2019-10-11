(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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
let currentPos = 0;
let grabSeed = 0;

const isPoint = index => index === PLAYER_POINT_INDEX || index === AI_POINT_INDEX;
const isValidIndex = index => index >= 0 && index <= MAX_HOUSE;

const init = exports.init = (firstTurn = true) => {
  houses = [];

  for (let i = 0; i < MAX_HOUSE; i += 1) {
    houses.push(isPoint(i) ? 0 : SEED_PER_HOUSE);
  }

  turn = firstTurn ? PLAYER : AI;
};

const nextState = exports.nextState = () => {
  if (grabSeed === 0) {
    return null;
  }

  houses[(currentPos + 1) % MAX_HOUSE] += 1;
  currentPos += 1;
  grabSeed -= 1;

  return getState();
};

const play = exports.play = index => {
  if (!isValidIndex(index)) {
    throw new Error('Invalid house');
  }

  currentPos = index;
  grabSeed = houses[currentPos];
  houses[currentPos] = 0;
};

const getState = exports.getState = () => houses.slice();

const getTurn = exports.getTurn = () => turn;
},{}]},{},[1]);
