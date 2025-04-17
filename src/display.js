/* global document */

import { BOARD_WIDTH } from './gameboard.js';

export class displayController {
    constructor (board1El, player1NameEl, board2El, player2NameEl) {
        this.board1 = new boardDisplay(board1El, player1NameEl);
        this.board2 = new boardDisplay(board2El, player2NameEl);
    }
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
                this.boardEl.append(spaceEl);
            }
        } 
    }
    
}