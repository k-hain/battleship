import { Ship } from "./ship.js";

export const BOARD_WIDTH = 10;
const SHIP_LENGTHS = [5, 4, 3, 3, 2];

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
        this.makeShips();
        this.makeBoard();
    }

    makeShips () {
        for (let length of SHIP_LENGTHS) {
            this.ships.push(new Ship(length, true))
        }
    }

    makeBoard () {
        for (let x = 0; x < BOARD_WIDTH; x++) {
            this.spaces.push(new Array());

            for (let y = 0; y < BOARD_WIDTH; y++) {
                this.spaces[x].push(new Space(x, y));
            }
        }
    }

    setupShips () {
        let x = 0;
        let y = 0;
        for (let ship of this.ships) {
            this.placeShip(ship, x, y);
            y += 2;
        }
    }

    placeShip (ship, x, y) {
        if (
            this.validateShipPlacement(ship.length, x, y, ship.isHorizontal)
        ) {
            ship.x = x;
            ship.y = y;

            for (let i = 0; i < ship.length; i++) {
                let [iH, iV] = this.setShipDrawDirection(ship.isHorizontal, i);
                this.spaces[x+iH][y+iV].ship = ship;
            }

            this.addLockedArea(ship);
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

    forEachSpaceAround (ship, callback) {
        for (let i = -1; i < ship.length + 1; i++) {
            let [iH, iV] = this.setShipDrawDirection(ship.isHorizontal, i);
            let [offsetH, offsetV] = this.setShipDrawDirectionOffset(ship.isHorizontal);

            if (
                this.checkBounds([ship.x+iH+offsetH, ship.y+iV+offsetV])
            ) {
                callback(this.spaces[ship.x+iH+offsetH][ship.y+iV+offsetV]);
            }
            if (
                this.checkBounds([ship.x+iH-offsetH, ship.y+iV-offsetV])
            ) {
               callback(this.spaces[ship.x+iH-offsetH][ship.y+iV-offsetV]); 
            }
        
            if (i === -1 || i === ship.length) {
                if (
                    this.checkBounds([ship.x+iH, ship.y+iV])
                ) {
                    callback(this.spaces[ship.x+iH][ship.y+iV]);
                }       
            }
        }
    }

    addLockedArea (ship) {
        this.forEachSpaceAround(ship, (space) => {
            space.isLocked = true;
        });
    }

    addHitsAround (ship) {
        this.forEachSpaceAround(ship, (space) => {
            if (!space.isHit) {
                space.isHit = true;
            }  
        });
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