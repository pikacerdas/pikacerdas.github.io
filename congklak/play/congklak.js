(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const congklak = require('congklak');

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
  ring.parentElement.addEventListener('click', () => {
    stateStream = congklak.play(i);
  });
}

const coloringTheChanges = newState => {
  for (let i = 0; i < 16; i += 1) {
    const ring = document.querySelector(`#outer-ring-${i}`);
    ring.style.backgroundColor = '#e7e7e7';
    if (prevState[i] !== newState[i]) {
      if (congklak.getTurn() === congklak.AI_MOVING) {
        ring.style.backgroundColor = '#ff9494';
      }
      if (congklak.getTurn() === congklak.PLAYER_MOVING) {
        ring.style.backgroundColor = '#c1ffb0';
      }
    }
  }
};

const seedDiv = document.querySelector('#seed span');

const gameOver = status => {
  document.querySelector('#game').style.display = 'none';
  document.querySelector('#end').style.display = 'initial';
  document.querySelector('#' + status).style.display = 'initial';
};

const checkGameOver = () => {
  if (congklak.getTurn() === congklak.AI_WIN) {
    gameOver('lose');
  }

  if (congklak.getTurn() === congklak.PLAYER_WIN) {
    gameOver('win');
  }

  if (congklak.getTurn() === congklak.TIE) {
    gameOver('tie');
  }
};

setInterval(() => {
  checkGameOver();
  if (congklak.getTurn() === congklak.AI) {
    document.querySelector('.description').innerHTML = "It's enemy's turn";
    stateStream = congklak.aiPlay();
  }

  if (congklak.getTurn() === congklak.PLAYER) {
    document.querySelector('.description').innerHTML = "It's your turn";
  }

  const tmp = stateStream && stateStream.next().value;
  if (tmp) {
    const { state, seed } = tmp;
    if (seed !== undefined) {
      seedDiv.innerHTML = seed;
    }
    render(state);
    coloringTheChanges(state);
    prevState = state.slice();
  }
}, 500);

},{"congklak":2}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.init = init;
exports.checkWinner = checkWinner;
exports.moveUntilEnd = moveUntilEnd;
exports.aiPlay = aiPlay;
exports.play = play;
const PLAYER = exports.PLAYER = 0;
const PLAYER_MOVING = exports.PLAYER_MOVING = 1;
const PLAYER_WIN = exports.PLAYER_WIN = 4;
const AI = exports.AI = 2;
const AI_MOVING = exports.AI_MOVING = 3;
const AI_WIN = exports.AI_WIN = 5;
const TIE = exports.TIE = 6;

const MAX_HOUSE = 16;
const PLAYER_POINT_INDEX = 7;
const ENEMY_POINT_INDEX = 15;
const INF = 7 * 14;
const SEED_PER_HOUSE = 7;

let houses = [];
let turn = PLAYER;

const isPoint = index => index === PLAYER_POINT_INDEX || index === ENEMY_POINT_INDEX;

const isValidIndex = index => index >= 0 && index < PLAYER_POINT_INDEX && houses[index] > 0;

function swapState(state) {
  return [...state.slice(8, 16), ...state.slice(0, 8)];
}

function init(firstTurn = true) {
  houses = [];
  for (let i = 0; i < MAX_HOUSE; i += 1) {
    houses.push(isPoint(i) ? 0 : SEED_PER_HOUSE);
  }
  turn = firstTurn ? PLAYER : AI;
}

const getState = exports.getState = () => houses.slice();

const playerCanPlay = state => state.slice(0, 7).some(i => !!i);

const aiCanPlay = state => state.slice(8, 15).some(i => !!i);

const switchTurn = () => {
  turn = turn === PLAYER || turn === PLAYER_MOVING ? AI : PLAYER;
  if (!playerCanPlay(houses)) turn = AI;
  if (!aiCanPlay(houses)) turn = PLAYER;
};

function checkWinner(currentState) {
  const allSeeds = (MAX_HOUSE - 2) * SEED_PER_HOUSE;
  const allSeedsExceptPoint = allSeeds - currentState[PLAYER_POINT_INDEX] - currentState[ENEMY_POINT_INDEX];
  if (Math.abs(currentState[PLAYER_POINT_INDEX] - currentState[ENEMY_POINT_INDEX]) > allSeedsExceptPoint) {
    if (currentState[PLAYER_POINT_INDEX] > currentState[ENEMY_POINT_INDEX]) {
      turn = PLAYER_WIN;
    } else {
      turn = AI_WIN;
    }
  }
  if (allSeedsExceptPoint === 0 && currentState[PLAYER_POINT_INDEX] === currentState[ENEMY_POINT_INDEX]) {
    turn = TIE;
  }
}

function* move(state, grabHouse, playerOne, realMove = false) {
  const conditionalSwapState = s => playerOne ? s.slice() : swapState(s);
  const conditionalGrabHouse = playerOne ? grabHouse : grabHouse - 8;
  const currentState = conditionalSwapState(state);
  let oneRound = false;

  let currentPos = conditionalGrabHouse + 1;
  let grabSeed = currentState[conditionalGrabHouse];
  currentState[conditionalGrabHouse] = 0;

  yield { state: conditionalSwapState(currentState), seed: grabSeed };

  while (grabSeed > 0) {
    if (currentPos === ENEMY_POINT_INDEX) {
      oneRound = true;
      currentPos = 0;
      continue;
    }

    if (currentPos !== PLAYER_POINT_INDEX && grabSeed === 1 && currentState[currentPos] !== 0) {
      grabSeed += currentState[currentPos];
      currentState[currentPos] = 0;
    } else {
      currentState[currentPos] += 1;
      grabSeed -= 1;
    }

    currentPos = (currentPos + 1) % MAX_HOUSE;
    yield { state: conditionalSwapState(currentState), seed: grabSeed };
  }

  currentPos -= 1;
  if (oneRound && currentPos < PLAYER_POINT_INDEX && currentState[currentPos] === 1) {
    currentState[PLAYER_POINT_INDEX] += currentState[14 - currentPos] + 1;
    currentState[14 - currentPos] = 0;
    currentState[currentPos] = 0;
  }

  let playAgain = false;
  if (currentPos === PLAYER_POINT_INDEX) {
    playAgain = true;
  }

  if (realMove) {
    houses = conditionalSwapState(currentState);
    switchTurn();
    if (playAgain) switchTurn();
    checkWinner(conditionalSwapState(currentState));
  }

  return { state: conditionalSwapState(currentState), seed: grabSeed, playAgain };
}

function moveUntilEnd(state, grabHouse, playerOne) {
  const stateStream = move(state, grabHouse, playerOne);

  let result;
  for (let tmp = stateStream.next().value; tmp !== undefined; tmp = stateStream.next().value) {
    result = tmp;
  }

  return result;
}

function MIN(state, depth, p) {
  let holeIndex;
  let playerPoint = -INF;
  let enemyPoint = INF;
  let diff = INF;

  for (let i = PLAYER_POINT_INDEX + 1; i < ENEMY_POINT_INDEX; i += 1) {
    if (state[i] === 0) continue;
    if (holeIndex === undefined) holeIndex = i;
    if (depth === 0 || !playerCanPlay(state)) {
      const tmp = moveUntilEnd(state.slice(), i, false);
      const newState = tmp.state;
      if (newState[PLAYER_POINT_INDEX] - newState[ENEMY_POINT_INDEX] < diff) {
        holeIndex = i;
        playerPoint = newState[PLAYER_POINT_INDEX];
        enemyPoint = newState[ENEMY_POINT_INDEX];
      }
    } else {
      const nextAiMove = moveUntilEnd(state.slice(), i, false);
      const nextState = nextAiMove.state;
      const { playAgain } = nextAiMove;
      const temp = playAgain ? MIN(nextState, depth - 1, p) : MAX(nextState, depth - 1, p);
      if (temp.playerPoint - temp.enemyPoint < diff) {
        holeIndex = i;
        playerPoint = temp.playerPoint;
        enemyPoint = temp.enemyPoint;
      }
    }
    diff = playerPoint - enemyPoint;
    if (diff <= p.a) return { holeIndex, playerPoint, enemyPoint };
    p.b = Math.min(p.b, diff);
  }

  return { holeIndex, playerPoint, enemyPoint };
}

function MAX(state, depth, p) {
  let holeIndex;
  let playerPoint = -INF;
  let enemyPoint = INF;
  let diff = -INF;

  for (let i = PLAYER_POINT_INDEX + 1; i < ENEMY_POINT_INDEX; i += 1) {
    if (state[i] === 0) continue;
    if (holeIndex === undefined) holeIndex = i;
    if (depth === 0 || !aiCanPlay(state)) {
      const tmp = moveUntilEnd(state.slice(), i, true);
      const newState = tmp.state;
      if (newState[PLAYER_POINT_INDEX] - newState[ENEMY_POINT_INDEX] > diff) {
        holeIndex = i;
        playerPoint = newState[PLAYER_POINT_INDEX];
        enemyPoint = newState[ENEMY_POINT_INDEX];
      }
    } else {
      const nextPlayerMove = moveUntilEnd(state.slice(), i, true);
      const nextState = nextPlayerMove.state;
      const { playAgain } = nextPlayerMove;
      const temp = playAgain ? MAX(nextState, depth - 1, p) : MIN(nextState, depth - 1, p);
      if (temp.playerPoint - temp.enemyPoint > diff) {
        holeIndex = i;
        playerPoint = temp.playerPoint;
        enemyPoint = temp.enemyPoint;
      }
    }
    diff = playerPoint - enemyPoint;
    if (diff >= p.b) return { holeIndex, playerPoint, enemyPoint };
    p.a = Math.max(p.a, diff);
  }

  return { holeIndex, playerPoint, enemyPoint };
}

function aiPlay() {
  turn = AI_MOVING;

  const index = MIN(houses.slice(), 3, { a: -INF, b: INF }).holeIndex;
  return move(houses.slice(), index, false, true, true);
}

function play(index) {
  if (!isValidIndex(index)) {
    throw new Error('Invalid move');
  }

  if (turn !== PLAYER) {
    throw new Error("You can't move at this moment");
  }

  turn = PLAYER_MOVING;

  return move(houses.slice(), index, true, true, false);
}

const getTurn = exports.getTurn = () => turn;
},{}]},{},[1]);
