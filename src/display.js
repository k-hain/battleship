export class displayController {
    constructor (board1El, board2El) {
        this.board1 = new boardDisplay(board1El);
        this.board2 = new boardDisplay(board2El);
    }
}

class boardDisplay {
    constructor (boardEl) {
        this.boardEl = boardEl;
        this.initDisplay();
    }

    initDisplay () {
        this.boardEl.textContent = 'hello world';
    }
}