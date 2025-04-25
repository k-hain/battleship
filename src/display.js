/* global document */

import { BOARD_WIDTH } from './global-variables.js';
import { forEachSpace } from './helpers.js';
import { Gameboard } from './gameboard.js';
import { drawDomElement, clearContents } from './dom-fns.js';
import moveIcon from './svg/drag_pan_24dp_000000_FILL0_wght400_GRAD0_opsz24.svg';
import rotateIcon from './svg/turn_right_24dp_000000_FILL0_wght400_GRAD0_opsz24.svg';
import PubSub from 'pubsub-js';
import {
    REFRESH_DISPLAY_AND_WIDGETS,
    START_SHIP_MOVEMENT,
    PLACE_SHIP,
} from './event-types.js';

class shipTransformWidget {
    constructor(ship, board) {
        this.id = board.id;
        this.ship = ship;
        this.spaces = this.getShipSpaces(ship, board);
        this.moveBtnContainer = this.getMoveBtnContainer(ship, board);
        this.rotateBtnContainer = this.getRotateBtnContainer(ship, board);
        this.init(board);
    }

    init(board) {
        this.addHovers();
        this.addButtons(board);
    }

    clear() {
        this.removeHoverClass();
        this.removeButtons();
        this.removeHovers();
    }

    getShipSpaces(ship, board) {
        const domSpaces = [];

        for (let space of ship.spaces) {
            domSpaces.push(board.display.spaces[space.x][space.y]);
        }

        return domSpaces;
    }

    getMoveBtnContainer(ship, board) {
        return board.display.spaces[ship.x][ship.y];
    }

    getRotateBtnContainer(ship, board) {
        if (ship.isHorizontal) {
            return board.display.spaces[ship.x + 1][ship.y];
        } else {
            return board.display.spaces[ship.x][ship.y + 1];
        }
    }

    highlightOn = function () {
        for (let el of this.spaces) {
            el.classList.add('space-hover');
        }
    }.bind(this);

    highlightOff = function () {
        for (let el of this.spaces) {
            el.classList.remove('space-hover');
        }
    }.bind(this);

    addHovers() {
        for (let el of this.spaces) {
            el.addEventListener('mouseenter', this.highlightOn);
            el.addEventListener('mouseleave', this.highlightOff);
        }
    }

    removeHovers() {
        for (let el of this.spaces) {
            el.removeEventListener('mouseleave', this.highlightOff);
            el.removeEventListener('mouseenter', this.highlightOn);
        }
    }

    removeHoverClass() {
        for (let el of this.spaces) {
            el.classList.remove('space-hover');
        }
    }

    addButtons(board) {
        const moveBtnEl = drawDomElement({
            type: 'button',
            container: this.moveBtnContainer,
            classes: ['board-button'],
        });

        drawDomElement({
            type: 'img',
            container: moveBtnEl,
            classes: ['board-button-icon'],
            src: moveIcon,
        });

        const rotateBtnEl = drawDomElement({
            type: 'button',
            container: this.rotateBtnContainer,
            classes: ['board-button'],
        });

        drawDomElement({
            type: 'img',
            container: rotateBtnEl,
            classes: ['board-button-icon'],
            src: rotateIcon,
        });

        rotateBtnEl.addEventListener('click', () => {
            const rotated = board.data.rotateShip(this.ship);

            if (rotated) {
                this.clear();
                PubSub.publish(REFRESH_DISPLAY_AND_WIDGETS, this.id);
            }
        });

        moveBtnEl.addEventListener('click', () => {
            const coords = { x: this.ship.x, y: this.ship.y };
            board.data.removeShip(this.ship);
            PubSub.publish(START_SHIP_MOVEMENT, {
                id: this.id,
                ship: this.ship,
                coords: coords,
            });
        });
    }

    removeButtons() {
        clearContents(this.moveBtnContainer);
        clearContents(this.rotateBtnContainer);
    }
}

class Display {
    constructor(id, boardEl, board, playerNameEl, playerName) {
        this.id = id;
        this.spaces = [];
        this.addName(playerNameEl, playerName);
        this.createSpaces(boardEl, board);
        this.container = boardEl;
        this.widgets = [];
        this.movedShip = null;
        this.movedShipCoords = null;
        this.hoveredCoordsList = [];
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
                spaceEl.x = x;
                spaceEl.y = y;
                spaceEl.isLocked = false;
            }
        }
    }

    setLockedSpaces(coordsArr) {
        for (let coords of coordsArr) {
            this.spaces[coords.x][coords.y].isLocked = true;
        }
    }

    clearLockedSpaces() {
        forEachSpace(this.spaces, (space) => {
            space.isLocked = false;
        });
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

    refreshBoardAndWidgets(board) {
        this.refresh();
        this.resetWidgets(board);
    }

    refreshBoardAndClearWidgets() {
        this.refresh();
        this.clearWidgets();
    }

    addWidgets(board) {
        for (let ship of board.data.ships) {
            this.widgets.push(new shipTransformWidget(ship, board));
        }
    }

    clearWidgets() {
        for (let widget of this.widgets) {
            widget.clear();
        }
        this.widgets = [];
    }

    resetWidgets(board) {
        this.clearWidgets();
        this.addWidgets(board);
    }

    moveShip(ship, coords, lockedSpaces) {
        this.movedShip = ship;
        this.movedShipCoords = coords;
        this.setLockedSpaces(lockedSpaces);
        console.log(lockedSpaces);
        this.addMovementListeners();
    }

    mouseLeftContainer = function (evt) {
        this.removeMovementListeners();
        PubSub.publish(PLACE_SHIP, {
            id: this.id,
            ship: this.movedShip,
            coords: this.movedShipCoords,
        });
        this.movedShip = null;
        this.movedShipCoords = null;
        this.clearLockedSpaces();
    }.bind(this);

    displayShipOutline = function (evt) {
        evt.stopPropagation();
        const allWithinBounds = this.getHoveredCoords(
            { x: evt.target.x, y: evt.target.y },
            this.movedShip
        );
        const moveLegal = this.checkLegality();
        for (let coords of this.hoveredCoordsList) {
            if (allWithinBounds && moveLegal) {
                this.spaces[coords.x][coords.y].classList.add('ship-dummy');
            } else {
                this.spaces[coords.x][coords.y].classList.add(
                    'ship-dummy-illegal'
                );
            }
        }
    }.bind(this);

    clearShipOutline = function (evt) {
        evt.stopPropagation();
        for (let coords of this.hoveredCoordsList) {
            this.spaces[coords.x][coords.y].classList.remove('ship-dummy');
            this.spaces[coords.x][coords.y].classList.remove(
                'ship-dummy-illegal'
            );
        }
        this.hoveredCoordsList = [];
    }.bind(this);

    getHoveredCoords(hoveredCoords, ship) {
        let currentCoords = hoveredCoords;
        this.hoveredCoordsList = [];

        for (let i = 0; i < ship.length; i++) {
            if (
                currentCoords.x < BOARD_WIDTH &&
                currentCoords.y < BOARD_WIDTH &&
                currentCoords.x >= 0 &&
                currentCoords.y >= 0
            ) {
                this.hoveredCoordsList.push({
                    x: currentCoords.x,
                    y: currentCoords.y,
                });
            } else {
                return false;
            }

            if (ship.isHorizontal) {
                currentCoords.x += 1;
            } else {
                currentCoords.y += 1;
            }
        }

        return true;
    }

    checkLegality() {
        for (let coords of this.hoveredCoordsList) {
            if (this.spaces[coords.x][coords.y].isLocked) {
                return false;
            }
        }

        return true;
    }

    addMovementListeners() {
        this.container.addEventListener(
            'mouseleave',
            this.mouseLeftContainer
        );

        forEachSpace(this.spaces, (el) => {
            el.addEventListener('mouseenter', this.displayShipOutline);
            //click listener to place ship
            el.addEventListener('mouseleave', this.clearShipOutline);  
        });
    }

    removeMovementListeners() {
        this.container.removeEventListener(
            'mouseleave',
            this.mouseLeftContainer
        );

        forEachSpace(this.spaces, (el) => {
            el.removeEventListener('mouseenter', this.displayShipOutline);
            //click listener to place ship
            el.removeEventListener('mouseleave', this.clearShipOutline);       
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
            text: 'Arrange your ships on the board',
        });

        const startButtonEl = drawDomElement({
            type: 'button',
            container: infoWrapperEl,
            classes: ['start-btn'],
            text: 'Start Game',
        });

        startButtonEl.addEventListener('click', () => {});
        board.display.addWidgets(board);
    }

    boardSetupRefresh = function (msg, id) {
        const board = this.boards[id];

        board.display.refreshBoardAndWidgets(board);
    }.bind(this);
    boardSetupRefreshToken = PubSub.subscribe(
        REFRESH_DISPLAY_AND_WIDGETS,
        this.boardSetupRefresh
    );

    startShipMovement = function (msg, data) {
        let board = this.boards[data.id];
        board.display.refreshBoardAndClearWidgets();
        const lockedSpaces = board.data.getLockedSpaces();
        //board.display.setLockedSpaces(lockedSpaces);
        board.display.moveShip(data.ship, data.coords, lockedSpaces);
    }.bind(this);
    startShipMovementToken = PubSub.subscribe(
        START_SHIP_MOVEMENT,
        this.startShipMovement
    );

    placeShipAndRefresh = function (msg, data) {
        let board = this.boards[data.id];
        board.data.placeShip(data.ship, data.coords.x, data.coords.y);
        board.display.refreshBoardAndWidgets(board);
    }.bind(this);
    placeShipToken = PubSub.subscribe(PLACE_SHIP, this.placeShipAndRefresh);
}
