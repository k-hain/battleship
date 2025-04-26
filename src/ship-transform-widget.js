import PubSub from 'pubsub-js';
import { drawDomElement, clearContents } from './dom-fns';
import moveIcon from './svg/drag_pan_24dp_000000_FILL0_wght400_GRAD0_opsz24.svg';
import rotateIcon from './svg/turn_right_24dp_000000_FILL0_wght400_GRAD0_opsz24.svg';
import { START_SHIP_MOVEMENT, ROTATE_SHIP } from './event-types';

export class ShipTransformWidget {
    constructor(id, ship, domSpaces) {
        this.id = id;
        this.ship = ship;
        this.spaces = [];
        this.moveBtnContainer, this.rotateBtnContainer;
        this.setShipSpaces(domSpaces, ship);
        this.init();
    }

    init() {
        this.addHovers();
        this.addButtons();
    }

    clear() {
        this.removeHoverClass();
        this.removeButtons();
        this.removeHovers();
    }

    setShipSpaces(domSpaces, ship) {
        for (let space of ship.spaces) {
            this.spaces.push(domSpaces[space.x][space.y]);
        }

        this.moveBtnContainer = domSpaces[ship.x][ship.y];

        this.setRotateBtnContainer(domSpaces, ship);
    }

    setRotateBtnContainer(domSpaces, ship) {
        if (this.ship.isHorizontal) {
            this.rotateBtnContainer = domSpaces[ship.x + 1][ship.y];
        } else {
            this.rotateBtnContainer = domSpaces[ship.x][ship.y + 1];
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

    addButtons() {
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
            PubSub.publish(ROTATE_SHIP, { id: this.id, ship: this.ship });
        });

        moveBtnEl.addEventListener('click', () => {
            PubSub.publish(START_SHIP_MOVEMENT, {
                id: this.id,
                ship: this.ship,
                coords: { x: this.ship.x, y: this.ship.y },
            });
        });
    }

    removeButtons() {
        clearContents(this.moveBtnContainer);
        clearContents(this.rotateBtnContainer);
    }
}
