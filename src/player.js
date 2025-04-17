import { Gameboard } from "./gameboard.js";

export class Player {
    constructor (isHuman) {
        this.isHuman = isHuman;
        this.board = new Gameboard();
    }
}