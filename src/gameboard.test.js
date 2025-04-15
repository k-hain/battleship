import { Gameboard } from "./gameboard.js";

/* global expect, test, */

test('Check horizontal ship', () => {
    const board = new Gameboard();
    board.placeShip(3, 0, 0, true);
    expect(board.spaces[2][0].ship).toEqual({length: 3, hits: 0, x: 0, y: 0, isHorizontal:true});
    expect(board.spaces[0][0].ship).toEqual(board.spaces[1][0].ship);
    expect(board.spaces[0][0].ship).toEqual(board.spaces[2][0].ship);
});

test('Check vertical ship', () => {
    const board = new Gameboard();
    board.placeShip(3, 0, 0, false);
    expect(board.spaces[0][2].ship).toEqual({length: 3, hits: 0, x: 0, y: 0, isHorizontal:false});
    expect(board.spaces[0][0].ship).toEqual(board.spaces[0][1].ship);
    expect(board.spaces[0][0].ship).toEqual(board.spaces[0][2].ship);
});

test('Attacks on a ship', () => {
    const board = new Gameboard();
    board.placeShip(3, 0, 0, true);
    board.receiveAttack(1, 0);
    board.receiveAttack(0, 0);
    expect(board.spaces[0][0].ship.hits).toBe(2);
});

test('Attack on empty space', () => {
    const board = new Gameboard();
    board.receiveAttack(5, 3);
    expect(board.spaces[5][3].isHit).toBe(true);
});

test('checkAllSunk - all sunk', () => {
    const board = new Gameboard();
    board.placeShip(1, 0, 0, true);
    board.placeShip(1, 0, 3, true);
    board.receiveAttack(0, 0);
    board.receiveAttack(0, 3);
    expect(board.checkAllSunk()).toBe(true);
});

test('checkAllSunk - not all sunk', () => {
    const board = new Gameboard();
    board.placeShip(1, 0, 0, true);
    board.placeShip(3, 0, 3, true);
    board.receiveAttack(0, 0);
    board.receiveAttack(0, 3);
    expect(board.checkAllSunk()).toBe(false);
});

test('Locked area around ships', () => {
    const board = new Gameboard();
    board.placeShip(2, 3, 5, true);
    expect(board.spaces[2][4].isLocked).toBe(true);
    expect(board.spaces[2][5].isLocked).toBe(true);
    expect(board.spaces[2][6].isLocked).toBe(true);
    expect(board.spaces[3][4].isLocked).toBe(true);
    expect(board.spaces[3][6].isLocked).toBe(true);
    expect(board.spaces[4][4].isLocked).toBe(true);
    expect(board.spaces[4][6].isLocked).toBe(true);
    expect(board.spaces[5][4].isLocked).toBe(true);
    expect(board.spaces[5][5].isLocked).toBe(true);
    expect(board.spaces[5][6].isLocked).toBe(true);
});