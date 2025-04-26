/* global Event, document */

import PubSub from 'pubsub-js';
import { Gameboard } from './gameboard';
import { Display } from './display';
import { drawDomElement } from './dom-fns';
import {
    REFRESH_DISPLAY_AND_WIDGETS,
    START_SHIP_MOVEMENT,
    PLACE_SHIP,
    ROTATE_SHIP
} from './event-types';

export class DisplayController {
    constructor(board1El, player1NameEl, board2El, player2NameEl) {
        this.board1El = board1El;
        this.player1NameEl = player1NameEl;
        this.board2El = board2El;
        this.player2NameEl = player2NameEl;

        this.board1, this.board1Display, this.board2, this.board2Display;
        this.boards = [];

        this.initBoards();
    }

    initBoards() {
        this.board1 = new Gameboard(0);
        this.board1Display = new Display(
            0,
            this.board1El,
            this.board1,
            this.player1NameEl,
            'Player'
        );
        this.board2 = new Gameboard(1);
        this.board2Display = new Display(
            1,
            this.board2El,
            this.board2,
            this.player2NameEl,
            'Computer'
        );
        this.boards = [
            { id: 0, data: this.board1, display: this.board1Display },
            { id: 1, data: this.board2, display: this.board2Display },
        ];

        for (let board of this.boards) {
            board.data.setupShips();
            board.display.refresh();
        }

        this.boardSetup(this.boards[0]);
    }

    boardSetup(board) {
        const infoWrapperEl = document.querySelector('.info-wrapper');

        // eslint-disable-next-line no-unused-vars
        const infoEl = drawDomElement({
            type: 'div',
            container: infoWrapperEl,
            classes: ['info'],
            text: 'Arrange your ships on the board',
        });

        const startButtonEl = drawDomElement({
            type: 'button',
            container: infoWrapperEl,
            classes: ['start-btn'],
            text: 'Start Game',
        });

        startButtonEl.addEventListener('click', () => {
            //logic to start new game
        });
        board.display.addWidgets(board);
    }

    boardSetupRefresh = function (msg, id) {
        const board = this.boards[id];
        board.display.refreshBoardAndWidgets(board);
    }.bind(this);
    boardSetupRefreshToken = PubSub.subscribe(
        REFRESH_DISPLAY_AND_WIDGETS,
        this.boardSetupRefresh
    );

    startShipMovement = function (msg, data) {
        let board = this.boards[data.id];
        board.data.removeShip(data.ship);
        board.display.refreshBoardAndClearWidgets();
        const lockedSpaces = board.data.getLockedSpaces();
        board.display.moveShip(data.ship, data.coords, lockedSpaces);
    }.bind(this);
    startShipMovementToken = PubSub.subscribe(
        START_SHIP_MOVEMENT,
        this.startShipMovement
    );

    placeShipAndRefresh = function (msg, data) {
        let board = this.boards[data.id];
        board.data.placeShip(data.ship, data.coords.x, data.coords.y);
        board.display.refreshBoardAndWidgets(board);
        if (data.highlightAfterPlacement) {
            const evt = new Event('mouseenter');
            board.display.spaces[data.coords.x][data.coords.y].dispatchEvent(
                evt
            );
        }
    }.bind(this);
    placeShipToken = PubSub.subscribe(PLACE_SHIP, this.placeShipAndRefresh);

    roateShip = function(msg, data) {
        const board = this.boards[data.id];
        const rotated = board.data.rotateShip(data.ship);

        if (rotated) {
            PubSub.publish(REFRESH_DISPLAY_AND_WIDGETS, data.id);
        }
    }.bind(this);
    roateShipToken = PubSub.subscribe(ROTATE_SHIP, this.roateShip);
}
