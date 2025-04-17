/* global document */

import './style.css';
import { displayController } from './display.js';

const board1El = document.getElementById('board1');
const board2El = document.getElementById('board2');
const display = new displayController(board1El, board2El);