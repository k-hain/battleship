import { BOARD_WIDTH, SHIP_LENGTHS } from "./global-variables.js";

class Space {
    constructor (x, y) {
        this.x = x;
        this.y = y;
        this.ship = null;
        this.isHit = false;
        this.isLocked = false;
    }
}

class Ship {
    constructor (length, isHorizontal) {
        this.length = length;
        this.hits = 0;
        this.x = null;
        this.y = null;
        this.isHorizontal = isHorizontal;
        this.spaces = [];
    }

    isSunk () {
        if (this.hits === this.length) {
            return true;
        }
        return false;
    }

    hit () {
        if (!this.isSunk()) {
            this.hits += 1;
        }
    }
}

export class Gameboard {
    constructor (id) {
        this.id = id;
        this.spaces = [];
        this.ships = [];
        this.makeShips();
        this.makeBoard();
    }

    makeShips () {
        for (let length of SHIP_LENGTHS) {
            this.ships.push(new Ship(length, true));
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
            this.validateShipPlacement(ship, x, y)
        ) {
            ship.x = x;
            ship.y = y;

            for (let i = 0; i < ship.length; i++) {
                const [currX, currY] = this.getShipSegmentCoords(ship.x, ship.y, ship.isHorizontal, i);
                
                this.spaces[currX][currY].ship = ship;
                ship.spaces.push(this.spaces[currX][currY]);
            }

            this.addLockedArea(ship);
        }
    }

    removeShip (x, y) {
        const targetShip = this.spaces[x][y].ship;

        this.removeLockedArea(targetShip);

        for (let space of targetShip.spaces) {
            space.ship = null;
        }

        targetShip.spaces = [];
        targetShip.x = null;
        targetShip.y = null;

        for (let ship of this.ships) {
            if (ship.x !== null && ship.y !== null) {
                this.addLockedArea(ship);
            }
        }
    }

    validateShipPlacement (ship, x, y) {
        for (let i = 0; i < ship.length; i++) {
            const [currX, currY] = this.getShipSegmentCoords(x, y, ship.isHorizontal, i);

            if (this.spaces[currX][currY].ship || this.spaces[currX][currY].isLocked) {
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
            const targetSpaces = [];

            const [currX, currY] = this.getShipSegmentCoords(ship.x, ship.y, ship.isHorizontal, i);

            if (ship.isHorizontal) {
                targetSpaces.push({x: currX, y: currY + 1}, {x: currX, y: currY - 1});
            } else {
                targetSpaces.push({x: currX + 1, y: currY}, {x: currX - 1, y: currY});
            }
            if (i === -1 || i === ship.length) {
                targetSpaces.push({x: currX, y: currY});
            }

            for (let coords of targetSpaces) {
                if (this.checkBounds([coords.x, coords.y])) {
                    callback(this.spaces[coords.x][coords.y]); 
                }      
            }
        }
    }

    getShipSegmentCoords (x, y, isHorizontal, offset) {
        let newX, newY;

        if (isHorizontal) {
            newX = x + offset;
            newY = y;
        } else {
            newX = x;
            newY = y + offset;
        }

        return [newX, newY];
    }

    addLockedArea (ship) {
        this.forEachSpaceAround(ship, (space) => {
            space.isLocked = true;
        });
    }

    removeLockedArea (ship) {
        this.forEachSpaceAround(ship, (space) => {
            space.isLocked = false;
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
}