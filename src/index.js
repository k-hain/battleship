/* global document */

import './style.css';
import { DisplayController } from './display-controller.js';

const board1El = document.getElementById('board1');
const board2El = document.getElementById('board2');
const player1NameEl = document.getElementById('player1-name');
const player2NameEl = document.getElementById('player2-name');

// eslint-disable-next-line no-unused-vars
const display = new DisplayController(
    board1El,
    player1NameEl,
    board2El,
    player2NameEl
);
