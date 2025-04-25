import { BOARD_WIDTH, SHIP_LENGTHS } from './global-variables.js';
import { getRandomBool, getRandomCoords } from './helpers.js';

class Space {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.ship = null;
        this.isHit = false;
    }
}

class Ship {
    constructor(length, isHorizontal) {
        this.length = length;
        this.hits = 0;
        this.x = null;
        this.y = null;
        this.isHorizontal = isHorizontal;
        this.spaces = [];
    }

    isSunk() {
        if (this.hits === this.length) {
            return true;
        }
        return false;
    }

    hit() {
        if (!this.isSunk()) {
            this.hits += 1;
        }
    }
}

export class Gameboard {
    constructor(id) {
        this.id = id;
        this.spaces = [];
        this.ships = [];
        this.makeShips();
        this.makeBoard();
    }

    makeShips() {
        for (let length of SHIP_LENGTHS) {
            this.ships.push(new Ship(length, true));
        }
    }

    makeBoard() {
        for (let x = 0; x < BOARD_WIDTH; x++) {
            this.spaces.push(new Array());

            for (let y = 0; y < BOARD_WIDTH; y++) {
                this.spaces[x].push(new Space(x, y));
            }
        }
    }

    setupShips() {
        for (let ship of this.ships) {
            ship.isHorizontal = getRandomBool();

            while (true) {
                const coords = getRandomCoords(BOARD_WIDTH);

                //debuging stuff
                console.log('placing on board: ' + this.id);
                console.log(ship);
                console.log(coords);

                const placed = this.placeShip(ship, coords.x, coords.y);
                if (placed) {
                    break;
                }
            }
        }
    }

    placeShip(ship, x, y) {
        if (this.validateShipPlacement(ship, x, y)) {
            ship.x = x;
            ship.y = y;

            for (let i = 0; i < ship.length; i++) {
                const [currX, currY] = this.getShipSegmentCoords(
                    ship.x,
                    ship.y,
                    ship.isHorizontal,
                    i
                );

                this.spaces[currX][currY].ship = ship;
                ship.spaces.push(this.spaces[currX][currY]);
            }

            return true;
        } else {
            return false;
        }
    }

    removeShip(targetShip) {
        for (let space of targetShip.spaces) {
            space.ship = null;
        }

        targetShip.spaces = [];
        targetShip.x = null;
        targetShip.y = null;
    }

    rotateShip(targetShip) {
        const x = targetShip.x;
        const y = targetShip.y;

        this.removeShip(targetShip);

        if (targetShip.isHorizontal) {
            targetShip.isHorizontal = false;
        } else {
            targetShip.isHorizontal = true;
        }

        const rotated = this.placeShip(targetShip, x, y);

        if (!rotated) {
            if (targetShip.isHorizontal) {
                targetShip.isHorizontal = false;
            } else {
                targetShip.isHorizontal = true;
            }

            this.placeShip(targetShip, x, y);
            return false;
        }

        return true;
    }

    moveShip(targetShip, newX, newY) {
        const x = targetShip.x;
        const y = targetShip.y;

        this.removeShip(targetShip);

        const moved = this.placeShip(targetShip, newX, newY);

        if (!moved) {
            this.placeShip(targetShip, x, y);
        }
    }

    validateShipPlacement(ship, x, y) {
        let validation = true;

        const dummyShip = new Ship(ship.length, ship.isHorizontal);
        dummyShip.x = x;
        dummyShip.y = y;

        if (this.checkValidFootprint(dummyShip)) {
            this.forEachSpaceAround(dummyShip, (space) => {
                if (space.ship) {
                    //debuging stuff
                    console.log(
                        'ship adjacent to another ship at origin (' +
                            dummyShip.x +
                            ',' +
                            dummyShip.y +
                            ')'
                    );
                    validation = false;
                }
            });
        } else {
            validation = false;
        }

        //debuging stuff
        console.log('validation: ' + validation);
        console.log(' ');

        return validation;
    }

    receiveAttack(x, y) {
        if (!this.spaces[x][y].isHit) {
            this.spaces[x][y].isHit = true;

            if (this.spaces[x][y].ship) {
                this.spaces[x][y].ship.hit();
            }
        }
    }

    checkAllSunk() {
        for (let ship of this.ships) {
            if (!ship.isSunk()) {
                return false;
            }
        }
        return true;
    }

    checkValidFootprint(ship) {
        const spaces = [];

        for (let i = 0; i < ship.length; i++) {
            const [currX, currY] = this.getShipSegmentCoords(
                ship.x,
                ship.y,
                ship.isHorizontal,
                i
            );

            spaces.push({ x: currX, y: currY });
        }

        for (let coords of spaces) {
            if (!this.checkBounds([coords.x, coords.y])) {
                //debuging stuff
                console.log(
                    'ship placement out of bounds at origin (' +
                        ship.x +
                        ',' +
                        ship.y +
                        ')'
                );
                return false;
            } else if (this.spaces[coords.x][coords.y].ship) {
                //debuging stuff
                console.log(
                    'ship placement on occupied (' + ship.x + ',' + ship.y + ')'
                );
                return false;
            }
        }

        return true;
    }

    forEachSpaceAround(ship, callback) {
        const targetSpaces = this.getSpacesAround(ship);

        for (let coords of targetSpaces) {
            callback(this.spaces[coords.x][coords.y]);
        }
    }

    getSpacesAround(ship) {
        const spaces = [];
        const validatedSpaces = [];

        for (let i = -1; i < ship.length + 1; i++) {
            const [currX, currY] = this.getShipSegmentCoords(
                ship.x,
                ship.y,
                ship.isHorizontal,
                i
            );

            if (ship.isHorizontal) {
                spaces.push(
                    { x: currX, y: currY + 1 },
                    { x: currX, y: currY - 1 }
                );
            } else {
                spaces.push(
                    { x: currX + 1, y: currY },
                    { x: currX - 1, y: currY }
                );
            }
            if (i === -1 || i === ship.length) {
                spaces.push({ x: currX, y: currY });
            }
        }

        for (let coords of spaces) {
            if (this.checkBounds([coords.x, coords.y])) {
                validatedSpaces.push(coords);
            }
        }

        return validatedSpaces;
    }

    getShipSegmentCoords(x, y, isHorizontal, offset) {
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

    addHitsAround(ship) {
        this.forEachSpaceAround(ship, (space) => {
            if (!space.isHit) {
                space.isHit = true;
            }
        });
    }

    checkBounds(values) {
        for (let value of values) {
            if (value >= BOARD_WIDTH || value < 0) {
                return false;
            }
        }
        return true;
    }

    getLockedSpaces() {
        const lockedSpaces = [];

        for (let ship of this.ships) {
            if (ship.x !== null && ship.y !== null) {
                for (let shipSpace of ship.spaces) {
                    lockedSpaces.push(shipSpace);
                }

                const spacesAround = this.getSpacesAround(ship);

                for (let space of spacesAround) {
                    if (!lockedSpaces.includes(space)) {
                        lockedSpaces.push(space);
                    }
                }
            }
        }

        return lockedSpaces;
    }
}
