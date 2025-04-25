/* global Event, document */

import PubSub from 'pubsub-js';
import { Gameboard } from './gameboard';
import { Display } from './display';
import { drawDomElement } from './dom-fns';
import {
    REFRESH_DISPLAY_AND_WIDGETS,
    START_SHIP_MOVEMENT,
    PLACE_SHIP,
} from './event-types';

export class DisplayController {
    constructor(board1El, player1NameEl, board2El, player2NameEl) {
        this.board1 = new Gameboard(0);
        this.board1Display = new Display(
            0,
            board1El,
            this.board1,
            player1NameEl,
            'Player'
        );
        this.board2 = new Gameboard(1);
        this.board2Display = new Display(
            1,
            board2El,
            this.board2,
            player2NameEl,
            'Computer'
        );
        this.boards = [
            { id: 0, data: this.board1, display: this.board1Display },
            { id: 1, data: this.board2, display: this.board2Display },
        ];

        this.initBoards(this.boards);
        this.boardSetup(this.boards[0]);
    }

    initBoards(boards) {
        for (let board of boards) {
            board.data.setupShips();
            board.display.refresh();
        }
    }

    boardSetup(board) {
        const infoWrapperEl = document.querySelector('.info-wrapper');

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

        startButtonEl.addEventListener('click', () => {});
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
}
