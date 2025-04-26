/* global alert */
/*
import {
    PUBLISH_PLAYER_NAMES,
    FETCH_PLAYER_NAMES,
    FETCH_BOARD_SPACES,
    PUBLISH_BOARD_SPACES,
    START_PLAYER_ROUND,
    ATTACK_SPACE,
    START_PLAYER_SETUP,
    START_GAME,
} from './event-types.js';
import { getRandomInt, forEachSpace } from './helpers.js';
import PubSub from 'pubsub-js';
*/
export class Player {
    constructor (id, name) {
        this.id = id;
        this.name = name;
    }
}

export class Game {
    constructor() {
        this.players = [
            new Player(0, 'Player'),
            new Player(1, 'Computer')
        ];

        this.currentPlayer;
    }

/*
    startSetup() {
        this.makeInitialShipSetup();
        PubSub.publish(START_PLAYER_SETUP);
    }

    makeInitialShipSetup() {
        for (let player of [this.player1, this.player2]) {
            player.board.setupShips();
            PubSub.publish(PUBLISH_BOARD_SPACES, [{
                id: player.id,
                spaces: player.board.spaces,
            }]);
        }
    }

    startGame = function () {
        //determine starting player
        this.startRound();
    }.bind(this);
    startGameToken = PubSub.subscribe(START_GAME, this.startGame);

    startRound() {
        //this.switchPlayers();

        if (this.currentPlayer === this.player1) {
            PubSub.publish(START_PLAYER_ROUND, {
                id: this.player2.id,
                spaces: this.player2.board.spaces,
            });
        } else {
            this.makeComputerMove();
        }
    }

    switchPlayers() {
        if (this.currentPlayer === this.player1) {
            this.currentPlayer = this.player2;
        } else {
            this.currentPlayer = this.player1;
        }
    }

    makeComputerMove() {
        const target = this.getLegalTarget(this.player1.board.spaces);
        PubSub.publish(ATTACK_SPACE, { id: 0, x: target.x, y: target.y });
    }

    getLegalTarget(spaces) {
        let targets = [];

        forEachSpace(spaces, (space) => {
            if (!space.isHit) {
                targets.push(space);
            }
        });

        let target = targets[getRandomInt(targets.length)];

        return { x: target.x, y: target.y };
    }

    resolveAttack = function (msg, obj) {
        let target;

        if (obj.id === 0) {
            target = this.player1;
        } else {
            target = this.player2;
        }

        target.board.receiveAttack(obj.x, obj.y);

        const targetShip = target.board.spaces[obj.x][obj.y].ship;
        if (targetShip) {
            if (targetShip.isSunk()) {
                target.board.addHitsAround(targetShip);
            }
        }

        PubSub.publish(PUBLISH_BOARD_SPACES, [
            {
                id: target.id,
                spaces: target.board.spaces,
            },
        ]);

        this.checkGameEnd();
    }.bind(this);
    resolveAttackToken = PubSub.subscribe(ATTACK_SPACE, this.resolveAttack);

    checkGameEnd() {
        if (this.player1.board.checkAllSunk()) {
            alert(`${this.player2.name} wins!`);
        } else if (this.player2.board.checkAllSunk()) {
            alert(`${this.player1.name} wins!`);
        } else {
            this.switchPlayers();
            this.startRound();
        }
    }
*/
}
