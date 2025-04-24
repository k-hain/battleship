/* global document */

import { BOARD_WIDTH } from './global-variables.js';
import { forEachSpace } from './helpers.js';
import { Gameboard } from './gameboard.js';
import { drawDomElement, clearContents } from './dom-fns.js';
import moveIcon from './svg/drag_pan_24dp_000000_FILL0_wght400_GRAD0_opsz24.svg';
import rotateIcon from './svg/turn_right_24dp_000000_FILL0_wght400_GRAD0_opsz24.svg';
import PubSub from 'pubsub-js';
import { REMOVE_SPACE_LISTENERS } from './event-types.js';

class Display {
    constructor(id, boardEl, board, playerNameEl, playerName) {
        this.id = id;
        this.spaces = [];
        this.addName(playerNameEl, playerName);
        this.createSpaces(boardEl, board);
        this.container = boardEl;
    }

    addName(playerNameEl, playerName) {
        playerNameEl.textContent = playerName;
    }

    createSpaces(boardEl, board) {
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
/*
    addButtons(boardData) {
        for (let ship of boardData.ships) {
            const domSpaces = [];

            for (let space of ship.spaces) {
                domSpaces.push(this.spaces[space.x][space.y]);      
            }

            //
            const enterEvt = function () {
                for (let el of domSpaces) {
                    el.classList.add('space-hover');
                }
            };

            const leaveEvt = function () {
                for (let el of domSpaces) {
                    el.classList.remove('space-hover');
                }
            }

            for (let spaceEl of domSpaces) {
                spaceEl.addEventListener('mouseenter', enterEvt); 
                spaceEl.addEventListener('mouseleave', leaveEvt);
            }
            //

            const moveBtnEl = drawDomElement({
                type: 'button',
                classes: ['board-button'],
            });

            const moveBtnIconEl = drawDomElement({
                type: 'img',
                container: moveBtnEl,
                classes: ['board-button-icon'],
                src: moveIcon
            });

            const rotateBtnEl = drawDomElement({
                type: 'button',
                classes: ['board-button'],
            });

            const rotateBtnIconEl = drawDomElement({
                type: 'img',
                container: rotateBtnEl,
                classes: ['board-button-icon'],
                src: rotateIcon
            });

            this.spaces[ship.x][ship.y].appendChild(moveBtnEl);
            let spaceRotateBtnEl;
            if (ship.isHorizontal) {
                spaceRotateBtnEl = this.spaces[ship.x + 1][ship.y]; 
            } else {
                spaceRotateBtnEl = this.spaces[ship.x][ship.y + 1]; 
            }
            spaceRotateBtnEl.appendChild(rotateBtnEl);

            rotateBtnEl.addEventListener('click', (evt) => {
                for (let el of domSpaces) {
                    el.classList.remove('space-hover');
                    clearContents(el);
                    el.removeEventListener('mouseleave', leaveEvt);
                    el.removeEventListener('mouseenter', enterEvt);
                }
            });
        }        
    }

    addHoverEffects(boardData) {
        for (let ship of boardData.ships) {
            const domSpaces = [];

            for (let space of ship.spaces) {
                domSpaces.push(this.spaces[space.x][space.y]);      
            }

            for (let spaceEl of domSpaces) {
                const enterEvt = function () {
                    for (let el of domSpaces) {
                        el.classList.add('space-hover');
                    }
                };

                spaceEl.addEventListener('mouseenter', enterEvt); 

                const leaveEvt = function () {
                    for (let el of domSpaces) {
                        el.classList.remove('space-hover');
                    }
                }

                spaceEl.addEventListener('mouseleave', leaveEvt);
            }
        }
    }

    */
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
        this.boardSetup(this.boards[0]);
    }

    initBoards(boards) {
        for (let board of boards) {
            board.data.setupShips();
            board.display.refresh();
        }
    }

    boardSetup(board) {
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

        this.makeBoardEditable(board);

        startButtonEl.addEventListener('click', () => {
        });
    }

    makeBoardEditable(board) {
        for (let ship of board.data.ships) {
            this.MakeShipEditable(board, ship);
        }       
    }

    MakeShipEditable(board, ship) {
        const domSpaces = [];

        for (let space of ship.spaces) {
            domSpaces.push(board.display.spaces[space.x][space.y]);      
        }

        const enterEvt = function () {
            for (let el of domSpaces) {
                el.classList.add('space-hover');
            }
        };

        const leaveEvt = function () {
            for (let el of domSpaces) {
                el.classList.remove('space-hover');
            }
        }

        for (let spaceEl of domSpaces) {
            spaceEl.addEventListener('mouseenter', enterEvt); 
            spaceEl.addEventListener('mouseleave', leaveEvt);
        }

        const moveBtnEl = drawDomElement({
            type: 'button',
            classes: ['board-button'],
        });

        const moveBtnIconEl = drawDomElement({
            type: 'img',
            container: moveBtnEl,
            classes: ['board-button-icon'],
            src: moveIcon
        });

        const rotateBtnEl = drawDomElement({
            type: 'button',
            classes: ['board-button'],
        });

        const rotateBtnIconEl = drawDomElement({
            type: 'img',
            container: rotateBtnEl,
            classes: ['board-button-icon'],
            src: rotateIcon
        });

        board.display.spaces[ship.x][ship.y].appendChild(moveBtnEl);
        
        let spaceRotateBtnEl;
        if (ship.isHorizontal) {
            spaceRotateBtnEl = board.display.spaces[ship.x + 1][ship.y]; 
        } else {
            spaceRotateBtnEl = board.display.spaces[ship.x][ship.y + 1]; 
        }
        spaceRotateBtnEl.appendChild(rotateBtnEl);

        rotateBtnEl.addEventListener('click', (evt) => {
            for (let el of domSpaces) {
                el.classList.remove('space-hover');
                clearContents(el);
                el.removeEventListener('mouseleave', leaveEvt);
                el.removeEventListener('mouseenter', enterEvt);
            }

            board.data.rotateShip(ship);
            board.display.refresh();
            this.MakeShipEditable(board, ship);
        });        
    }
}
