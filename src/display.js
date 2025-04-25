/* global document */

import { BOARD_WIDTH } from './global-variables.js';
import { forEachSpace } from './helpers.js';
import { Gameboard } from './gameboard.js';
import { shipTransformWidget } from './ship-transform-widget.js';
import { drawDomElement } from './dom-fns.js';
import PubSub from 'pubsub-js';
import {
    REFRESH_DISPLAY_AND_WIDGETS,
    START_SHIP_MOVEMENT,
    PLACE_SHIP,
} from './event-types.js';

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
        this.addMovementListeners();
    }

    placeShipOnHovered = function(evt) {
        /*
        TODO perhaps refactor this to check game logic instead of styling on the board?
        */
        let legal = true;

        forEachSpace(this.spaces, (spaceEl) => {
            if (spaceEl.classList.contains('ship-dummy-illegal')) {
                legal = false;
            }
        });

        if (legal) {
            this.removeMovementListeners();
            this.clearLockedSpaces(); 
            PubSub.publish(PLACE_SHIP, {
                id: this.id,
                ship: this.movedShip,
                coords: {x: evt.target.x, y: evt.target.y},
                highlightAfterPlacement: true,
            });
            this.resetMovementVars();
        }
    }.bind(this);

    mouseLeftContainer = function (evt) {
        this.removeMovementListeners();
        this.clearLockedSpaces();
        PubSub.publish(PLACE_SHIP, {
            id: this.id,
            ship: this.movedShip,
            coords: this.movedShipCoords,
        });
        this.resetMovementVars();
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
            el.addEventListener('click', this.placeShipOnHovered);
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
            el.removeEventListener('click', this.placeShipOnHovered);
            el.removeEventListener('mouseleave', this.clearShipOutline);       
        });
    }

    resetMovementVars() {
        this.movedShip = null;
        this.movedShipCoords = null;
        this.hoveredCoordsList = [];
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
        if (data.highlightAfterPlacement) {
            const evt = new Event('mouseenter');
            board.display.spaces[data.coords.x][data.coords.y].dispatchEvent(evt);
        }
    }.bind(this);
    placeShipToken = PubSub.subscribe(PLACE_SHIP, this.placeShipAndRefresh);
}
