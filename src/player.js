import { Gameboard } from "./gameboard.js";

export class Player {
    constructor (name, isHuman) {
        this.name = name;
        this.isHuman = isHuman;
        this.board = new Gameboard();
    }
}