import { Player } from './player.js';

export class Game {
    constructor () {
        this.player1 = new Player(true);
        this.player2 = new Player(false);
        this.player1.setupShips();
        this.player2.setupShips();
    }
}