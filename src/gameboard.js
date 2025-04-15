import { Ship } from "./ship.js";

const BOARD_WIDTH = 10;

class Space {
    constructor (x, y) {
        this.x = x;
        this.y = y;
        this.ship = null;
        this.isHit = false;
        this.isLocked = false;
    }
}

export class Gameboard {
    constructor () {
        this.spaces = [];
        this.ships = [];
        this.makeBoard();
    }

    makeBoard () {
        for (let x = 0; x < BOARD_WIDTH; x++) {
            this.spaces.push(new Array());

            for (let y = 0; y < BOARD_WIDTH; y++) {
                this.spaces[x].push(new Space(x, y));
            }
        }
    }

    placeShip (length, x, y, isHorizontal) {
        let canPlace = this.validateShipPlacement(length, x, y, isHorizontal);

        if (canPlace) {
            const newShip = new Ship(length, x, y, isHorizontal);
            this.ships.push(newShip);

            for (let i = 0; i < length; i++) {
                let [iH, iV] = this.setShipDrawDirection(newShip.isHorizontal, i);
                this.spaces[x+iH][y+iV].ship = newShip;
            }

            this.addLockedArea(newShip);
        }
    }

    validateShipPlacement (length, x, y, isHorizontal) {
        for (let i = 0; i < length; i++) {
            let [iH, iV] = this.setShipDrawDirection(isHorizontal, i);

            if (this.spaces[x+iH][y+iV].ship || this.spaces[x+iH][y+iV].isLocked) {
                return false;
            }
        }
        return true;
    }

    receiveAttack (x, y) {
        if (!this.spaces[x][y].isHit) {
            this.spaces[x][y].isHit = true;

            if (this.spaces[x][y].ship) {
                this.spaces[x][y].ship.hit();
            }
        }
    }

    checkAllSunk () {
        for (let ship of this.ships) {
            if (!ship.isSunk()) {
                return false;
            }
        }
        return true;
    }

    addLockedArea (ship) {
        for (let i = -1; i < ship.length + 1; i++) {
            let [iH, iV] = this.setShipDrawDirection(ship.isHorizontal, i);
            let [offsetH, offsetV] = this.setShipDrawDirectionOffset(ship.isHorizontal);

            if (
                this.checkBounds([ship.x+iH+offsetH, ship.y+iV+offsetV])
            ) {
                this.spaces[ship.x+iH+offsetH][ship.y+iV+offsetV].isLocked = true;
            }
            if (
                this.checkBounds([ship.x+iH-offsetH, ship.y+iV-offsetV])
            ) {
               this.spaces[ship.x+iH-offsetH][ship.y+iV-offsetV].isLocked = true; 
            }
        
            if (i === -1 || i === ship.length) {
                if (
                    this.checkBounds([ship.x+iH, ship.y+iV])
                ) {
                    this.spaces[ship.x+iH][ship.y+iV].isLocked = true;
                }       
            }
        }
    }

    checkBounds (values) {
        for (let value of values) {
            if (value >= BOARD_WIDTH || value < 0) {
                return false;
            }
        }
        return true;
    }

    setShipDrawDirection (isHorizontal, i) {
        if (isHorizontal) {
            return [i, 0];
        } else {
            return [0, i];
        }
    }

    setShipDrawDirectionOffset (isHorizontal) {
        if (isHorizontal) {
            return [0, 1];
        } else {
            return [1, 0];
        }
    }
}