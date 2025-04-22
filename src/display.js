/* global document */

import { BOARD_WIDTH } from './global-variables.js';
import { forEachSpace } from './helpers.js';
import { Gameboard } from './gameboard.js';
import { drawDomElement } from './dom-fns.js';

class Display {
    constructor(id, boardEl, board, playerNameEl, playerName) {
        this.id = id;
        this.spaces = [];
        this.createSpaces(boardEl, board, playerNameEl, playerName);
    }

    createSpaces(boardEl, board, playerNameEl, playerName) {
        playerNameEl.textContent = playerName;

        for (let x = 0; x < BOARD_WIDTH; x++) {
            this.spaces.push(new Array());

            for (let y = 0; y < BOARD_WIDTH; y++) {
                const spaceEl = drawDomElement({
                    type: 'div',
                    container: boardEl,
                    classes: ['space'],
                });
                this.spaces[x].push(spaceEl);
                spaceEl.style.gridRow = `${y + 1} / span 1`;
                spaceEl.style.gridColumn = `${x + 1} / span 1`;
                spaceEl.data = board.spaces[x][y];
            }
        }
    }

    refresh() {
        forEachSpace(this.spaces, (spaceEl) => {
            spaceEl.className = 'space';
            if (this.id === 1 && !spaceEl.data.isHit) {
                spaceEl.classList.add('space-hidden');
            } else {
                if (spaceEl.data.ship) {
                    spaceEl.classList.add('space-ship');
                }
                if (spaceEl.data.isHit) {
                    spaceEl.textContent = 'X';
                }
                if (!spaceEl.data.ship) {
                    spaceEl.classList.add('space-empty');
                }
            }
        });
    }
}

export class DisplayController {
    constructor(board1El, player1NameEl, board2El, player2NameEl) {
        this.board1 = new Gameboard(0);
        this.board1Display = new Display(
            0,
            board1El,
            this.board1,
            player1NameEl,
            'Player'
        );
        this.board2 = new Gameboard(1);
        this.board2Display = new Display(
            1,
            board2El,
            this.board2,
            player2NameEl,
            'Computer'
        );
        this.boards = [
            { id: 0, data: this.board1, display: this.board1Display },
            { id: 1, data: this.board2, display: this.board2Display },
        ];

        this.initBoards(this.boards);
        this.boardSetup();
        this.makeBoardEditable(this.boards[0]);
    }

    initBoards(boards) {
        for (let board of boards) {
            board.data.setupShips();
            board.display.refresh();
        }
    }

    boardSetup() {
        const infoWrapperEl = document.querySelector('.info-wrapper');

        const infoEl = drawDomElement({
            type: 'div',
            container: infoWrapperEl,
            classes: ['info'],
            text: 'Arrange your ships on the board'
        });

        const startButtonEl = drawDomElement({
            type: 'button',
            container: infoWrapperEl,
            classes: ['start-btn'],
            text: 'Start Game'
        });

        startButtonEl.addEventListener('click', () => {
            //
        });
    }

    makeBoardEditable(board) {
        for (let ship of board.data.ships) {
            const domSpaces = [];

            for (let space of ship.spaces) {
                domSpaces.push(board.display.spaces[space.x][space.y]);      
            }

            for (let spaceEl of domSpaces) {
                spaceEl.addEventListener('mouseenter', () => {
                    for (let el of domSpaces) {
                        el.classList.add('space-hover');
                    }
                    //show move & rotate icons in the middle
                })

                spaceEl.addEventListener('mouseleave', () => {
                    for (let el of domSpaces) {
                        el.classList.remove('space-hover');
                    }
                    //remove icons when leaving
                })
            }
        }
    }
}
