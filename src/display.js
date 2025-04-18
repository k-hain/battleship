/* global document */

import { BOARD_WIDTH } from './gameboard.js';
import { PUBLISH_PLAYER_NAMES, FETCH_PLAYER_NAMES, FETCH_BOARD_SPACES, PUBLISH_BOARD_SPACES } from './event-types.js';
import PubSub from 'pubsub-js';

export class displayController {
    constructor (board1El, player1NameEl, board2El, player2NameEl) {
        this.boardDisplay1 = new boardDisplay(board1El, player1NameEl);
        this.boardDisplay2 = new boardDisplay(board2El, player2NameEl);
        this.boardDisplays = [this.boardDisplay1, this.boardDisplay2];
        PubSub.publish(FETCH_PLAYER_NAMES);
        PubSub.publish(FETCH_BOARD_SPACES);
    }

    refreshBoards = (function (msg, boardSpaces) {
        //TODO: allow to refresh a single board depending on the data sent
        for (let spaces of boardSpaces) {
            let current = boardSpaces.indexOf(spaces);
            for (let rowX of spaces) {
                for (let gameSpace of rowX) {
                    let displayedSpace = this.boardDisplays[current].spaces[gameSpace.x][gameSpace.y];
                    //TODO: hidden spaces
                    if (gameSpace.ship) {
                        displayedSpace.classList.add('space-ship');
                    }
                    if (gameSpace.isHit) {
                        displayedSpace.textContent = 'X';
                    }
                    if (!gameSpace.ship && !gameSpace.isHit) {
                        displayedSpace.classList.add('space-empty');
                    }
                }
            }
        }
    }).bind(this);
    refreshBoardsToken = PubSub.subscribe(PUBLISH_BOARD_SPACES, this.refreshBoards);

    printPlayerNames = (function (msg, playerNames) {
        for (let name of playerNames) {
            let current = playerNames.indexOf(name);
            this.boardDisplays[current].setPlayerName(name); 
        }
    }).bind(this);
    printPlayerNamesToken = PubSub.subscribe(PUBLISH_PLAYER_NAMES, this.printPlayerNames);

}

class boardDisplay {
    constructor (boardEl, playerNameEl) {
        this.boardEl = boardEl;
        this.playerNameEl = playerNameEl;
        this.playerNameEl.textContent = 'Name';
        this.spaces = [];
        this.initDisplay();
    }

    initDisplay () {
        this.boardEl.style.gridTemplateRows = `repeat(${BOARD_WIDTH}, 1fr)`;
        this.boardEl.style.gridTemplateColmuns = `repeat(${BOARD_WIDTH}, 1fr)`;
        this.createSpaces();
    }

    setPlayerName (name) {
        this.playerNameEl.textContent = name;
    }

    createSpaces () {
       for (let x = 0; x < BOARD_WIDTH; x++) {
            this.spaces.push(new Array());
        
            for (let y = 0; y < BOARD_WIDTH; y++) {
                const spaceEl = document.createElement('div');
                this.spaces[x].push(spaceEl);
                spaceEl.style.gridRow = `${y+1} / span 1`;
                spaceEl.style.gridColumn = `${x+1} / span 1`;
                //spaceEl.textContent = `${x}, ${y}`;
                spaceEl.classList.add('space');
                this.boardEl.append(spaceEl);
            }
        } 
    }
}