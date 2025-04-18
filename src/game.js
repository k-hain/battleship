import { Player } from './player.js';
import { PUBLISH_PLAYER_NAMES, FETCH_PLAYER_NAMES } from './event-types.js';
import PubSub from 'pubsub-js';

export class Game {
    constructor () {
        this.player1 = new Player('Player', true);
        this.player2 = new Player('Computer', false);
        this.player1.board.setupShips();
        this.player2.board.setupShips();
    }

    publishPlayerNames = (function() {
        PubSub.publish(PUBLISH_PLAYER_NAMES, [this.player1.name, this.player2.name]);
    }).bind(this);
    publishPlayerNamesToken = PubSub.subscribe(FETCH_PLAYER_NAMES, this.publishPlayerNames);
}