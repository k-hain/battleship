import {
    START_PLAYER_ROUND,
    START_COMPUTER_ROUND,
    END_GAME,
} from './event-types.js';

import PubSub from 'pubsub-js';
import {
    getRandomBool,
    forEachSpace,
    getRandomInt,
    checkBounds,
} from './helpers.js';

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

    getRandomTarget(targets) {
        const target = targets[getRandomInt(targets.length)];

        return { x: target.x, y: target.y };
    }

    getAllLegalTargets(spaces) {
        let targets = [];

        forEachSpace(spaces, (space) => {
            if (!space.isHit) {
                targets.push(space);
            }
        });

        return targets;
    }

    getTarget(boardSpaces) {
        const unsunkShipSpaces = [];
        let targets = [];
        let target;

        forEachSpace(boardSpaces, (space) => {
            if (space.isHit && space.ship && !space.ship.isSunk()) {
                unsunkShipSpaces.push(space);
            }
        });

        if (unsunkShipSpaces.length) {
            targets = this.findTargetsAround(boardSpaces, unsunkShipSpaces);

            if (!targets.length) {
                targets = this.getAllLegalTargets(boardSpaces);
            }
        } else {
            targets = this.getAllLegalTargets(boardSpaces);
        }

        target = this.getRandomTarget(targets);
        return { x: target.x, y: target.y };
    }

    findTargetsAround (boardSpaces, unsunkShipSpaces) {
        const targets = [];

        for (let space of unsunkShipSpaces) {
            const legalSpacesX = [];
            const legalSpacesY = [];
            let targetX = true;
            let targetY = true;

            const spacesAround = [
                { x: space.x + 1, y: space.y },
                { x: space.x - 1, y: space.y },
                { x: space.x, y: space.y + 1 },
                { x: space.x, y: space.y - 1 },
            ];

            for (let coords of spacesAround) {
                if (checkBounds([coords.x, coords.y])) {
                    const current = boardSpaces[coords.x][coords.y];

                    if (current.isHit && current.ship) {
                        if (current.x > space.x || current.x < space.x) {
                            targetY = false;
                        } else {
                            targetX = false;
                        }
                    }

                    if (!current.isHit) {
                        if (current.x > space.x || current.x < space.x) {
                            legalSpacesX.push({ x: coords.x, y: coords.y });
                        } else {
                            legalSpacesY.push({ x: coords.x, y: coords.y });
                        }
                    }
                }
            }

            if (legalSpacesX.length && targetX) {
                for (let space of legalSpacesX) {
                    targets.push(space);
                }
            }

            if (legalSpacesY.length && targetY) {
                for (let space of legalSpacesY) {
                    targets.push(space);
                }
            }
        }

        return targets;
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
