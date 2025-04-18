import { Gameboard } from "./gameboard.js";

export class Player {
    constructor (id, name, isHuman) {
        this.id = id;
        this.name = name;
        this.isHuman = isHuman;
        this.board = new Gameboard();
    }
}