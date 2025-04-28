/* global Event, document, setTimeout */

import PubSub from 'pubsub-js';
import { Gameboard } from './gameboard.js';
import { Display } from './display.js';
import { clearContents, drawDomElement } from './dom-fns';
import { Game } from './game.js';
import {
    REFRESH_DISPLAY_AND_WIDGETS,
    START_SHIP_MOVEMENT,
    PLACE_SHIP,
    ROTATE_SHIP,
    ATTACK_SPACE,
    START_PLAYER_ROUND,
    START_COMPUTER_ROUND,
    END_GAME,
} from './event-types';

const board1El = document.getElementById('board1');
const board2El = document.getElementById('board2');
const player1NameEl = document.getElementById('player1-name');
const player2NameEl = document.getElementById('player2-name');

export class DisplayController {
    constructor() {
        this.domEls = [
            {
                board: board1El,
                playerName: player1NameEl,
            },
            {
                board: board2El,
                playerName: player2NameEl,
            },
        ];

        this.boards = [];
        this.game = new Game();

        this.initBoards();
    }

    initBoards() {
        for (let player of this.game.players) {
            const board = new Gameboard(player.id);
            const boardDisplay = new Display(
                player.id,
                this.domEls[player.id].board,
                this.domEls[player.id].playerName,
                player.name
            );

            this.boards.push({
                id: player.id,
                data: board,
                display: boardDisplay,
            });
        }

        for (let board of this.boards) {
            board.data.setupShips();
            board.display.refresh(board.data);
        }

        this.boardSetup(this.boards[0]);
    }

    boardSetup(board) {
        const callback = function () {
            board.display.refreshBoardAndClearWidgets(board.data);
            this.game.startGame();
        }.bind(this);

        this.addInfoElement(
            'Arrange your ships on the board',
            'Start Game',
            callback
        );

        board.display.addWidgets(board.data);
    }

    boardSetupRefresh = function (msg, id) {
        const board = this.boards[id];

        board.display.refreshBoardAndWidgets(board.data);
    }.bind(this);
    boardSetupRefreshToken = PubSub.subscribe(
        REFRESH_DISPLAY_AND_WIDGETS,
        this.boardSetupRefresh
    );

    startShipMovement = function (msg, data) {
        let board = this.boards[data.id];

        board.data.removeShip(data.ship);

        board.display.refreshBoardAndClearWidgets(board.data);

        const lockedSpaces = board.data.getLockedSpaces();
        board.display.moveShip(data.ship, data.coords, lockedSpaces);
    }.bind(this);
    startShipMovementToken = PubSub.subscribe(
        START_SHIP_MOVEMENT,
        this.startShipMovement
    );

    placeShipAndRefresh = function (msg, data) {
        let board = this.boards[data.id];

        const placed = board.data.placeShip(
            data.ship,
            data.coords.x,
            data.coords.y
        );

        if (placed) {
            board.display.doAfterPlacement();
            board.display.refreshBoardAndWidgets(board.data);
        } else {
            const lockedSpaces = board.data.getLockedSpaces();
            board.display.doAfterFailedPlacement(lockedSpaces);
        }

        if (data.highlightAfterPlacement) {
            const evt = new Event('mouseenter');
            board.display.spaces[data.coords.x][data.coords.y].dispatchEvent(
                evt
            );
        }
    }.bind(this);
    placeShipToken = PubSub.subscribe(PLACE_SHIP, this.placeShipAndRefresh);

    roateShip = function (msg, data) {
        const board = this.boards[data.id];

        const rotated = board.data.rotateShip(data.ship);

        if (rotated) {
            PubSub.publish(REFRESH_DISPLAY_AND_WIDGETS, data.id);
        }
    }.bind(this);
    roateShipToken = PubSub.subscribe(ROTATE_SHIP, this.roateShip);

    allowPlayerAttack = function () {
        const board = this.boards[1];

        board.display.addAttackListeners(board.data.spaces);
    }.bind(this);
    allowPlayerAttackToken = PubSub.subscribe(
        START_PLAYER_ROUND,
        this.allowPlayerAttack
    );

    makeComputerAttack = function () {
        const board = this.boards[0];
        const target = this.game.getLegalTarget(board.data.spaces);

        const attack = function () {
            this.resolveAttack(board, target.x, target.y);
        }.bind(this);

        setTimeout(attack, 500);
    }.bind(this);
    makeComputerAttackToken = PubSub.subscribe(
        START_COMPUTER_ROUND,
        this.makeComputerAttack
    );

    makePlayerAttack = function (msg, data) {
        const board = this.boards[data.id];

        if (data.id === 1) {
            board.display.removeAttackListeners();
        }

        this.resolveAttack(board, data.x, data.y);
    }.bind(this);
    makePlayerAttackToken = PubSub.subscribe(
        ATTACK_SPACE,
        this.makePlayerAttack
    );

    resolveAttack(board, x, y) {
        board.data.receiveAttack(x, y);
        board.display.refresh(board.data);

        board.display.makeSpaceBlink({ x, y });

        this.game.checkGameEnd([this.boards[0].data, this.boards[1].data]);
    }

    endGame = function (msg, winner) {
        const callback = function () {
            this.boards = [];
            this.initBoards();
        }.bind(this);

        this.addInfoElement(`${winner} wins the game!`, 'Play Again', callback);
    }.bind(this);
    endGameToken = PubSub.subscribe(END_GAME, this.endGame);

    addInfoElement(infoText, btnText, callback) {
        const infoWrapperEl = document.getElementById('info-wrapper');

        drawDomElement({
            type: 'div',
            container: infoWrapperEl,
            classes: ['info'],
            text: infoText,
        });

        const startButtonEl = drawDomElement({
            type: 'button',
            container: infoWrapperEl,
            classes: ['start-btn'],
            text: btnText,
        });

        startButtonEl.addEventListener('click', () => {
            clearContents(infoWrapperEl);
            callback();
        });
    }
}
