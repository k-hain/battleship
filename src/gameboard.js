import { Ship } from "./ship.js";

const BOARD_WIDTH = 10;

class Space {
    constructor (x, y) {
        this.x = x;
        this.y = y;
        this.ship = null;
        this.isHit = false;
    }
}

export class Gameboard {
    constructor () {
        this.spaces = [];
        this.ships = [];
        this.makeBoard();
    }

    makeBoard() {
        for (let x = 0; x < BOARD_WIDTH; x++) {
            this.spaces.push(new Array());

            for (let y = 0; y < BOARD_WIDTH; y++) {
                this.spaces[x].push(new Space(x, y));
            }
        }
    }

    placeShip(length, x, y, isHorizontal) {
        let canPlace = true;
        if (isHorizontal) {
            for (let i = 0; i <= length; i++) {
                if (this.spaces[x+i][y].ship) {
                    canPlace = false;
                }
            }

            if (canPlace) {
                const newShip = new Ship(length, x, y, isHorizontal);
                this.ships.push(newShip);

                for (let i = 0; i <= length; i++) {
                    this.spaces[x+i][y].ship = newShip;
                }
            } 
        } else {
            for (let i = 0; i <= length; i++) {
                if (this.spaces[x][y+i].ship) {
                    canPlace = false;
                }
            }

            if (canPlace) {
                const newShip = new Ship(length, x, y, isHorizontal);
                this.ships.push(newShip);

                for (let i = 0; i <= length; i++) {
                    this.spaces[x][y+i].ship = newShip;
                }
            } 
        }    
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
            if (ship.isSunk()) {
                return true;
            }
        }
        return false;
    }
}