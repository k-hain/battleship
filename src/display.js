/* global document */

import { BOARD_WIDTH } from './gameboard.js';
import {
    PUBLISH_PLAYER_NAMES,
    FETCH_PLAYER_NAMES,
    FETCH_BOARD_SPACES,
    PUBLISH_BOARD_SPACES,
    START_PLAYER_ROUND,
    ATTACK_SPACE,
    START_PLAYER_SETUP,
    START_GAME,
} from './event-types.js';
import { forEachSpace } from './helpers.js';
import PubSub from 'pubsub-js';

export class DisplayController {
    constructor(board1El, player1NameEl, board2El, player2NameEl) {
        this.boardDisplay1 = new BoardDisplay(board1El, player1NameEl, 0);
        this.boardDisplay2 = new BoardDisplay(board2El, player2NameEl, 1);
        this.boardDisplays = [this.boardDisplay1, this.boardDisplay2];
        PubSub.publish(FETCH_PLAYER_NAMES);
        PubSub.publish(FETCH_BOARD_SPACES);
    }

    refreshBoards = function (msg, boardSpaces) {
        for (let spacesObj of boardSpaces) {
            this.boardDisplays[spacesObj.id].refreshSpaces(spacesObj);
        }
    }.bind(this);
    refreshBoardsToken = PubSub.subscribe(
        PUBLISH_BOARD_SPACES,
        this.refreshBoards
    );

    printPlayerNames = function (msg, playerNames) {
        for (let name of playerNames) {
            let current = playerNames.indexOf(name);
            this.boardDisplays[current].setPlayerName(name);
        }
    }.bind(this);
    printPlayerNamesToken = PubSub.subscribe(
        PUBLISH_PLAYER_NAMES,
        this.printPlayerNames
    );

    setActiveBoard = function (msg, obj) {
        this.boardDisplays[obj.id].makeActive(obj);
    }.bind(this);
    setActiveBoardToken = PubSub.subscribe(
        START_PLAYER_ROUND,
        this.setActiveBoard
    );

    startBoardSetup = function (msg) {
        const infoWrapperEl = document.querySelector('.info-wrapper');

        const infoEl = document.createElement('div');
        infoEl.classList.add('info');
        infoEl.textContent = 'Arrange your ships on the board';
        infoWrapperEl.appendChild(infoEl);

        const startButtonEl = document.createElement('button');
        startButtonEl.classList.add('start-btn')
        startButtonEl.textContent = 'Start Game';
        infoWrapperEl.appendChild(startButtonEl);

        startButtonEl.addEventListener('click', () => {
            startButtonEl.remove();
            infoEl.remove();
            PubSub.publish(START_GAME);
        });
    }
    startBoardSetupToken = PubSub.subscribe(START_PLAYER_SETUP, this.startBoardSetup);
}

class BoardDisplay {
    constructor(boardEl, playerNameEl, id) {
        this.id = id;
        this.boardEl = boardEl;
        this.playerNameEl = playerNameEl;
        this.playerNameEl.textContent = 'Name';
        this.spaces = [];
        this.initDisplay();
    }

    initDisplay() {
        this.boardEl.style.gridTemplateRows = `repeat(${BOARD_WIDTH}, 1fr)`;
        this.boardEl.style.gridTemplateColmuns = `repeat(${BOARD_WIDTH}, 1fr)`;
        this.createSpaces();
    }

    setPlayerName(name) {
        this.playerNameEl.textContent = name;
    }

    createSpaces() {
        for (let x = 0; x < BOARD_WIDTH; x++) {
            this.spaces.push(new Array());

            for (let y = 0; y < BOARD_WIDTH; y++) {
                const spaceEl = document.createElement('div');
                this.spaces[x].push(spaceEl);
                spaceEl.style.gridRow = `${y + 1} / span 1`;
                spaceEl.style.gridColumn = `${x + 1} / span 1`;
                //spaceEl.textContent = `${x}, ${y}`;
                spaceEl.classList.add('space');
                spaceEl.x = x;
                spaceEl.y = y;
                this.boardEl.append(spaceEl);
            }
        }
    }

    refreshSpaces(spacesObj) {
        forEachSpace(spacesObj.spaces, (gameSpace) => {
            let spaceEl = this.spaces[gameSpace.x][gameSpace.y];
            spaceEl.className = 'space';
            if (spacesObj.id === 1 && !gameSpace.isHit) {
                spaceEl.classList.add('space-hidden');
            } else {
                if (gameSpace.ship) {
                    spaceEl.classList.add('space-ship');
                }
                if (gameSpace.isHit) {
                    spaceEl.textContent = 'X';
                }
                if (!gameSpace.ship) {
                    spaceEl.classList.add('space-empty');
                }
            }
        });
    }

    makeActive(obj) {
        forEachSpace(obj.spaces, (gameSpace) => {
            const spaceEl = this.spaces[gameSpace.x][gameSpace.y];
            if (!gameSpace.isHit) {
                spaceEl.classList.add('space-interactive');
                spaceEl.addEventListener('click', this.makeAttack);
            }
        });
    }

    makeAttack = function (event) {
        this.clearEventListeners();
        PubSub.publish(ATTACK_SPACE, {
            id: this.id,
            x: event.currentTarget.x,
            y: event.currentTarget.y,
        });
    }.bind(this);

    clearEventListeners = function () {
        forEachSpace(this.spaces, (space) => {
            space.classList.remove('space-interactive');
            space.removeEventListener('click', this.makeAttack);
        });
    }.bind(this);
}
