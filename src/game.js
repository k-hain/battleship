import { Player } from './player.js';

export class Game {
    constructor () {
        this.player1 = new Player('Player', true);
        this.player2 = new Player('Computer', false);
        this.player1.board.setupShips();
        this.player2.board.setupShips();
    }
}