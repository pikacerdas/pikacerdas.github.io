(function() {
  function r(e, n, t) {
    function o(i, f) {
      if (!n[i]) {
        if (!e[i]) {
          var c = 'function' == typeof require && require;
          if (!f && c) return c(i, !0);
          if (u) return u(i, !0);
          var a = new Error("Cannot find module '" + i + "'");
          throw ((a.code = 'MODULE_NOT_FOUND'), a);
        }
        var p = (n[i] = { exports: {} });
        e[i][0].call(
          p.exports,
          function(r) {
            var n = e[i][1][r];
            return o(n || r);
          },
          p,
          p.exports,
          r,
          e,
          n,
          t
        );
      }
      return n[i].exports;
    }
    for (
      var u = 'function' == typeof require && require, i = 0;
      i < t.length;
      i++
    )
      o(t[i]);
    return o;
  }
  return r;
})()(
  {
    1: [
      function(require, module, exports) {
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
              if (congklak.getTurn() === congklak.AI_MOVING)
                ring.style.backgroundColor = '#ff9494';
              if (congklak.getTurn() === congklak.PLAYER_MOVING)
                ring.style.backgroundColor = '#c1ffb0';
            }
          }
        };

        setInterval(() => {
          if (congklak.getTurn() === congklak.AI) {
            document.querySelector('.description').innerHTML =
              "It's enemy's turn";
            stateStream = congklak.aiPlay();
          }

          if (congklak.getTurn() === congklak.PLAYER) {
            document.querySelector('.description').innerHTML = "It's your turn";
          }

          const state = stateStream && stateStream.next().value;
          if (state) {
            render(state);
            coloringTheChanges(state);
            prevState = state.slice();
          }
        }, 333);
      },
      { congklak: 2 },
    ],
    2: [
      function(require, module, exports) {
        'use strict';

        Object.defineProperty(exports, '__esModule', {
          value: true,
        });
        exports.init = init;
        exports.moveUntilEnd = moveUntilEnd;
        exports.aiPlay = aiPlay;
        exports.play = play;
        const PLAYER = (exports.PLAYER = 0);
        const PLAYER_MOVING = (exports.PLAYER_MOVING = 1);
        const AI = (exports.AI = 2);
        const AI_MOVING = (exports.AI_MOVING = 3);

        const MAX_HOUSE = 16;
        const PLAYER_POINT_INDEX = 7;
        const ENEMY_POINT_INDEX = 15;
        const INF = 7 * 14;
        const SEED_PER_HOUSE = 7;

        let houses = [];
        let turn = PLAYER;

        const isPoint = index =>
          index === PLAYER_POINT_INDEX || index === ENEMY_POINT_INDEX;

        const isValidIndex = index =>
          index >= 0 && index < PLAYER_POINT_INDEX && houses[index] > 0;

        function swapState(state) {
          return [...state.slice(8, 16), ...state.slice(0, 8)];
        }

        function swapPoint({ holeIndex, playerPoint, enemyPoint }) {
          return {
            holeIndex,
            playerPoint: enemyPoint,
            enemyPoint: playerPoint,
          };
        }

        function init(firstTurn = true) {
          houses = [];
          for (let i = 0; i < MAX_HOUSE; i += 1) {
            houses.push(isPoint(i) ? 0 : SEED_PER_HOUSE);
          }
          turn = firstTurn ? PLAYER : AI;
        }

        const getState = (exports.getState = () => houses.slice());

        const switchTurn = () => {
          turn = turn === PLAYER || turn === PLAYER_MOVING ? AI : PLAYER;
        };
        function* move(state, grabHouse, realMove = false, swap = false) {
          const currentState = state.slice();
          let oneRound = false;

          let currentPos = grabHouse + 1;
          let grabSeed = currentState[grabHouse];
          currentState[grabHouse] = 0;

          yield currentState;

          while (grabSeed > 0) {
            if (currentPos === ENEMY_POINT_INDEX) {
              oneRound = true;
              currentPos = 0;
              continue;
            }

            if (
              currentPos !== PLAYER_POINT_INDEX &&
              grabSeed === 1 &&
              currentState[currentPos] !== 0
            ) {
              grabSeed += currentState[currentPos];
              currentState[currentPos] = 0;
            } else {
              currentState[currentPos] += 1;
              grabSeed -= 1;
            }

            currentPos = (currentPos + 1) % MAX_HOUSE;
            yield currentState;
          }

          currentPos -= 1;
          if (
            oneRound &&
            currentPos < PLAYER_POINT_INDEX &&
            currentState[currentPos] === 1
          ) {
            currentState[PLAYER_POINT_INDEX] +=
              currentState[14 - currentPos] + 1;
            currentState[14 - currentPos] = 0;
            currentState[currentPos] = 0;
          }

          if (realMove) {
            switchTurn();
            houses = swap ? swapState(currentState) : currentState;
            winner = checkWinner(currentState);
            if (winner !== -1) {
              document.querySelector(`game`).style.display = none;
              if (winner === PLAYER_WIN) {
                document.querySelector(`win`).style.display = block;
              } else if (winner === AI_WIN) {
                document.querySelector(`lose`).style.display = block;
              } else if (winner === TIE) {
                document.querySelector(`tie`).style.display = block;
              }
              document.querySelector(`end`).style.display = block;
            }
          }

          return currentState;
        }

        function moveUntilEnd(state, grabHouse) {
          const stateStream = move(state, grabHouse);

          let result;
          for (
            let tmp = stateStream.next().value;
            tmp !== undefined;
            tmp = stateStream.next().value
          ) {
            result = tmp;
          }

          return result;
        }

        function bestMove(state, depth) {
          let holeIndex;
          let playerPoint = -INF;
          let enemyPoint = INF;

          for (let i = 0; i < PLAYER_POINT_INDEX; i += 1) {
            if (depth === 0) {
              const newState = moveUntilEnd(state, i);
              if (newState[PLAYER_POINT_INDEX] > playerPoint) {
                holeIndex = i;
                playerPoint = newState[PLAYER_POINT_INDEX];
                enemyPoint = newState[ENEMY_POINT_INDEX];
              }
            } else {
              const nextState = swapState(moveUntilEnd(state, i));
              const temp = swapPoint(bestMove(nextState, depth - 1));
              if (temp.playerPoint > playerPoint) {
                holeIndex = i;
                playerPoint = temp.playerPoint;
                enemyPoint = temp.enemyPoint;
              }
            }
          }

          return { holeIndex, playerPoint, enemyPoint };
        }

        function* aiPlay() {
          turn = AI_MOVING;

          const swappedState = swapState(houses);
          const index = bestMove(swappedState, 3).holeIndex;
          const stateStream = move(swappedState, index, true, true);
          for (
            let tmp = stateStream.next().value;
            tmp !== undefined;
            tmp = stateStream.next().value
          ) {
            yield swapState(tmp);
          }
        }

        function play(index) {
          if (!isValidIndex(index)) {
            throw new Error('Invalid move');
          }

          if (turn !== PLAYER) {
            throw new Error("You can't move at this moment");
          }

          turn = PLAYER_MOVING;

          return move(houses, index, true, false);
        }

        const getTurn = (exports.getTurn = () => turn);
      },
      {},
    ],
  },
  {},
  [1]
);
