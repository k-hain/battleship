/* global document */

import './style.css';
import { displayController } from './display.js';
import { Game } from './game.js';

const game = new Game();

const board1El = document.getElementById('board1');
const board2El = document.getElementById('board2');
const player1NameEl = document.getElementById('player1-name');
const player2NameEl = document.getElementById('player2-name');

const display = new displayController(board1El, player1NameEl, board2El, player2NameEl);

display.board1.setPlayerName(game.player1.name);
display.board2.setPlayerName(game.player2.name);