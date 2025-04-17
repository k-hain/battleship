/* global document */

import { BOARD_WIDTH } from './gameboard.js';

export class displayController {
    constructor (board1El, board2El) {
        this.board1 = new boardDisplay(board1El);
        this.board2 = new boardDisplay(board2El);
    }
}

class boardDisplay {
    constructor (boardEl) {
        this.boardEl = boardEl;
        this.spaces = [];
        this.initDisplay();
    }

    initDisplay () {
        this.boardEl.style.gridTemplateRows = `repeat(${BOARD_WIDTH}, 1fr)`;
        this.boardEl.style.gridTemplateColmuns = `repeat(${BOARD_WIDTH}, 1fr)`;
        this.createSpaces();
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