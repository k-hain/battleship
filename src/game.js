import { Player } from './player.js';
import { PUBLISH_PLAYER_NAMES, FETCH_PLAYER_NAMES, FETCH_BOARD_SPACES, PUBLISH_BOARD_SPACES, START_PLAYER_ROUND, ATTACK_SPACE } from './event-types.js';
import PubSub from 'pubsub-js';

export class Game {
    constructor () {
        this.player1 = new Player(0, 'Player', true);
        this.player2 = new Player(1, 'Computer', false);
        this.player1.board.setupShips();
        this.player2.board.setupShips();
        this.currentPlayer = this.player1;
    }

    publishPlayerNames = (function () {
        PubSub.publish(PUBLISH_PLAYER_NAMES, [this.player1.name, this.player2.name]);
    }).bind(this);
    publishPlayerNamesToken = PubSub.subscribe(FETCH_PLAYER_NAMES, this.publishPlayerNames);

    publishBoardSpaces = (function () {
        PubSub.publish(PUBLISH_BOARD_SPACES, [{
            id: this.player1.id,
            spaces: this.player1.board.spaces
        }, {
            id: this.player2.id,
            spaces: this.player2.board.spaces
        }])
    }).bind(this);
    publishBoardSpacesToken = PubSub.subscribe(FETCH_BOARD_SPACES,this.publishBoardSpaces);

    startRound () {
        //switch currentPlayer

        if (this.currentPlayer === this.player1) {
            PubSub.publish(START_PLAYER_ROUND, {
                id: this.player2.id,
                spaces: this.player2.board.spaces
            })
        } else {
            //play computer's round
        }    
    }

    resolveAttack = (function (msg, obj) {
        let target;
        
        if (obj.id === 0) {
            target = this.player1;
        } else {
            target = this.player2;
        }

        target.board.receiveAttack(obj.x, obj.y);

        PubSub.publish(PUBLISH_BOARD_SPACES, [{
            id: target.id,
            spaces: target.board.spaces
        }]);
        this.startRound();
    }).bind(this);
    resolveAttackToken = PubSub.subscribe(ATTACK_SPACE, this.resolveAttack);
}