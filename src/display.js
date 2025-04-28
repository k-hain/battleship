/* global setInterval, clearInterval, setTimeout */

import { BOARD_WIDTH } from './global-variables.js';
import { forEachSpace } from './helpers.js';
import { ShipTransformWidget } from './ship-transform-widget.js';
import { drawDomElement } from './dom-fns.js';
import PubSub from 'pubsub-js';
import { PLACE_SHIP, ATTACK_SPACE } from './event-types.js';

export class Display {
    #movedShip = null;
    #movedShipCoords = null;
    #hoveredCoordsList = [];

    constructor(id, boardEl, playerNameEl, playerName) {
        this.id = id;
        this.spaces = [];
        this.addName(playerNameEl, playerName);
        this.createSpaces(boardEl);
        this.container = boardEl;
        this.widgets = [];
    }

    addName(playerNameEl, playerName) {
        playerNameEl.textContent = playerName;
    }

    createSpaces(boardEl) {
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

    refresh(boardData) {
        forEachSpace(this.spaces, (el) => {
            el.className = 'space';
            if (this.id === 1 && !boardData.spaces[el.x][el.y].isHit) {
                el.classList.add('space-hidden');
            } else {
                if (boardData.spaces[el.x][el.y].ship) {
                    el.classList.add('space-ship');
                } else {
                    el.classList.add('space-empty');
                }
                if (boardData.spaces[el.x][el.y].isHit) {
                    el.textContent = 'X';
                }
            }
        });
    }

    refreshBoardAndWidgets(boardData) {
        this.refresh(boardData);
        this.resetWidgets(boardData);
    }

    refreshBoardAndClearWidgets(boardData) {
        this.refresh(boardData);
        this.clearWidgets();
    }

    addWidgets(boardData) {
        for (let ship of boardData.ships) {
            this.widgets.push(
                new ShipTransformWidget(this.id, ship, this.spaces)
            );
        }
    }

    clearWidgets() {
        for (let widget of this.widgets) {
            widget.clear();
        }
        this.widgets = [];
    }

    resetWidgets(boardData) {
        this.clearWidgets();
        this.addWidgets(boardData);
    }

    moveShip(ship, coords, lockedSpaces) {
        this.#movedShip = ship;
        this.#movedShipCoords = coords;
        this.setLockedSpaces(lockedSpaces);
        this.addMovementListeners();
    }

    placeShipOnHovered = function (evt) {
        this.removeMovementListeners();
        this.clearLockedSpaces();

        PubSub.publish(PLACE_SHIP, {
            id: this.id,
            ship: this.#movedShip,
            coords: { x: evt.target.x, y: evt.target.y },
            highlightAfterPlacement: true,
        });
    }.bind(this);

    doAfterFailedPlacement(lockedSpaces) {
        this.setLockedSpaces(lockedSpaces);
        this.addMovementListeners();
    }

    doAfterPlacement() {
        this.resetMovementVars();
    }

    mouseLeftContainer = function () {
        this.removeMovementListeners();
        this.clearLockedSpaces();
        PubSub.publish(PLACE_SHIP, {
            id: this.id,
            ship: this.#movedShip,
            coords: this.#movedShipCoords,
        });
        this.resetMovementVars();
    }.bind(this);

    displayShipOutline = function (evt) {
        evt.stopPropagation();
        const allWithinBounds = this.getHoveredCoords(
            { x: evt.target.x, y: evt.target.y },
            this.#movedShip
        );
        const moveLegal = this.checkLegality();
        for (let coords of this.#hoveredCoordsList) {
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
        for (let coords of this.#hoveredCoordsList) {
            this.spaces[coords.x][coords.y].classList.remove('ship-dummy');
            this.spaces[coords.x][coords.y].classList.remove(
                'ship-dummy-illegal'
            );
        }
        this.#hoveredCoordsList = [];
    }.bind(this);

    getHoveredCoords(hoveredCoords, ship) {
        let currentCoords = hoveredCoords;
        this.#hoveredCoordsList = [];

        for (let i = 0; i < ship.length; i++) {
            if (
                currentCoords.x < BOARD_WIDTH &&
                currentCoords.y < BOARD_WIDTH &&
                currentCoords.x >= 0 &&
                currentCoords.y >= 0
            ) {
                this.#hoveredCoordsList.push({
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
        for (let coords of this.#hoveredCoordsList) {
            if (this.spaces[coords.x][coords.y].isLocked) {
                return false;
            }
        }

        return true;
    }

    addMovementListeners() {
        this.container.addEventListener('mouseleave', this.mouseLeftContainer);

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
        this.#movedShip = null;
        this.#movedShipCoords = null;
        this.#hoveredCoordsList = [];
    }

    attackSpace = function (evt) {
        PubSub.publish(ATTACK_SPACE, {
            id: this.id,
            x: evt.target.x,
            y: evt.target.y,
        });
    }.bind(this);

    addAttackListeners(boardSpaces) {
        forEachSpace(boardSpaces, (space) => {
            if (!space.isHit) {
                this.spaces[space.x][space.y].addEventListener(
                    'click',
                    this.attackSpace
                );
            }
        });
    }

    removeAttackListeners() {
        forEachSpace(this.spaces, (el) => {
            el.removeEventListener('click', this.attackSpace);
        });
    }

    makeSpaceBlink(coords) {
        const el = this.spaces[coords.x][coords.y];

        function blinkBackground() {
            el.classList.toggle('blink');
        }

        const blinkingInterval = setInterval(blinkBackground, 110);

        setTimeout(() => {
            clearInterval(blinkingInterval);
        }, 440);
    }
}
