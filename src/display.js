/* global document */

import { BOARD_WIDTH } from './gameboard.js';
import { PUBLISH_PLAYER_NAMES, FETCH_PLAYER_NAMES } from './event-types.js';
import PubSub from 'pubsub-js';

export class displayController {
    constructor (board1El, player1NameEl, board2El, player2NameEl) {
        this.boardDisplay1 = new boardDisplay(board1El, player1NameEl);
        this.boardDisplay2 = new boardDisplay(board2El, player2NameEl);
        this.boardDisplays = [this.boardDisplay1, this.boardDisplay2];
        PubSub.publish(FETCH_PLAYER_NAMES);
    }

    refreshBoards() {
        for (let boardDisplay of this.boardDisplays) {            
            for (let rowX of boardDisplay.spaces) {
                for (let space of rowX) {
                    space.className = 'space';
                }  
            }
        }
    }

    printBoards(boards) {
        for (let board of boards) {
            let current = boards.indexOf(board);
            for (let rowX of board) {
                for (let space of rowX) {
                    if (space.ship) {
                        this.boardDisplays[current].spaces[space.x][space.y].classList.add('space-ship');
                    } else {
                        this.boardDisplays[current].spaces[space.x][space.y].classList.add('space-empty');
                    }
                }
            }
        }   
    }

    printPlayerNames = (function(msg, playerNames) {
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
                spaceEl.textContent = `${x}, ${y}`;
                spaceEl.classList.add('space');
                this.boardEl.append(spaceEl);
            }
        } 
    }
}