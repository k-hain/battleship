import PubSub from "pubsub-js";
import { drawDomElement, clearContents } from "./dom-fns";
import moveIcon from './svg/drag_pan_24dp_000000_FILL0_wght400_GRAD0_opsz24.svg';
import rotateIcon from './svg/turn_right_24dp_000000_FILL0_wght400_GRAD0_opsz24.svg';
import { START_SHIP_MOVEMENT, REFRESH_DISPLAY_AND_WIDGETS } from "./event-types";

export class ShipTransformWidget {
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