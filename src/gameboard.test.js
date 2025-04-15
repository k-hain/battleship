import { Gameboard } from "./gameboard.js";

/* global expect, test, */

test('Check horizontal ship', () => {
    const board = new Gameboard();
    board.placeShip(3, 0, 0, true);
    expect(board.spaces[2][0].ship).toEqual({length: 3, hits: 0, x: 0, y: 0, isHorizontal:true});
});

test('Check vertical ship', () => {
    const board = new Gameboard();
    board.placeShip(3, 0, 0, false);
    expect(board.spaces[0][2].ship).toEqual({length: 3, hits: 0, x: 0, y: 0, isHorizontal:false});
});

test('Ship - make 2 attacks', () => {
    const board = new Gameboard();
    board.placeShip(3, 0, 0, true);
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
    board.placeShip(1, 0, 0, true);
    board.placeShip(1, 0, 3, true);
    board.receiveAttack(0, 0);
    board.receiveAttack(0, 3);
    expect(board.checkAllSunk()).toBeTrue;
});

test('All ships not sunk', () => {
    const board = new Gameboard();
    board.placeShip(1, 0, 0, true);
    board.placeShip(3, 0, 3, true);
    board.receiveAttack(0, 0);
    board.receiveAttack(0, 3);
    expect(board.checkAllSunk()).toBeFalse;
});