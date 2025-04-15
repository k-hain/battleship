export class Ship {
    constructor (length, isHorizontal) {
        this.length = length;
        this.hits = 0;
        this.x = undefined;
        this.y = undefined;
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