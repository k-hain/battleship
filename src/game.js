import {
    START_PLAYER_ROUND,
    START_COMPUTER_ROUND,
    END_GAME,
} from './event-types.js';

import PubSub from 'pubsub-js';
import { getRandomBool, forEachSpace, getRandomInt } from './helpers.js';

export class Player {
    constructor(id, name) {
        this.id = id;
        this.name = name;
    }
}

export class Game {
    constructor() {
        this.players = [new Player(0, 'Player'), new Player(1, 'Computer')];

        this.currentPlayer;
    }

    setStartingPlayer() {
        const roll = getRandomBool();

        if (roll) {
            this.currentPlayer = this.players[0];
        } else {
            this.currentPlayer = this.players[1];
        }
    }

    startGame() {
        this.setStartingPlayer();
        this.startRound();
    }

    startRound() {
        if (this.currentPlayer.id === 0) {
            PubSub.publish(START_PLAYER_ROUND);
        } else {
            PubSub.publish(START_COMPUTER_ROUND);
        }
    }

    startNextRound() {
        this.switchPlayers();
        this.startRound();
    }

    switchPlayers() {
        if (this.currentPlayer.id === 0) {
            this.currentPlayer = this.players[1];
        } else {
            this.currentPlayer = this.players[0];
        }
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

    checkGameEnd(boards) {
        for (let board of boards) {
            if (board.checkAllSunk()) {
                let winner;
                if (board.id === 0) {
                    winner = this.players[1].name;
                } else {
                    winner = this.players[0].name;
                }
                PubSub.publish(END_GAME, winner);
                return;
            }
        }

        this.startNextRound();
    }
}
