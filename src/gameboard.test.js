import { Gameboard } from "./gameboard.js";

/* global expect, test, */

test('Ship (length: 3, x: 0, y: 0) checking at (1, 0)', () => {
    const board = new Gameboard();
    board.placeShip(3, 0, 0);
    expect(board.spaces[1][0].ship).toEqual({length: 3, hits: 0, x: 0, y: 0, isHorizontal:true});
});

test('Ship (length: 3, x: 0, y: 0) - make 2 attacks', () => {
    const board = new Gameboard();
    board.placeShip(3, 0, 0);
    board.receiveAttack(1, 0);
    board.receiveAttack(0, 0);
    expect(board.spaces[0][0].ship.hits).toBe(2);
});

test('Empty board - make attack', () => {
    const board = new Gameboard();
    board.receiveAttack(5, 3);
    expect(board.spaces[5][3].isHit).toBeTrue;
});

test('Sink all ships - check if true', () => {
    const board = new Gameboard();
    board.placeShip(1, 0, 0);
    board.placeShip(1, 0, 3);
    board.receiveAttack(0, 0);
    board.receiveAttack(0, 3);
    expect(board.checkAllSunk()).toBeTrue;
});

test('All ships not sunk', () => {
    const board = new Gameboard();
    board.placeShip(1, 0, 0);
    board.placeShip(3, 0, 3);
    board.receiveAttack(0, 0);
    board.receiveAttack(0, 3);
    expect(board.checkAllSunk()).toBeFalse;
});