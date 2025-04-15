export class Ship {
    constructor (length, x, y, isHorizontal) {
        this.length = length;
        this.hits = 0;
        this.x = x;
        this.y = y;
        this.isHorizontal = isHorizontal;
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