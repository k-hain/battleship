import { Gameboard } from "./gameboard.js";

/* global expect, test, */

test('Check horizontal ship', () => {
    const board = new Gameboard();
    board.placeShip(board.ships[2], 0, 0);
    expect(board.spaces[2][0].ship.length).toEqual(3);
    expect(board.spaces[2][0].ship.x).toEqual(0);
    expect(board.spaces[2][0].ship.y).toEqual(0);
    expect(board.spaces[2][0].ship.isHorizontal).toBe(true);
    expect(board.ships[2].spaces[0].x).toEqual(0);
    expect(board.ships[2].spaces[0].y).toEqual(0);
    expect(board.ships[2].spaces[1].x).toEqual(1);
    expect(board.ships[2].spaces[1].y).toEqual(0);
    expect(board.spaces[0][0].ship).toEqual(board.spaces[1][0].ship);
    expect(board.spaces[0][0].ship).toEqual(board.spaces[2][0].ship);
    
});

test('Check vertical ship', () => {
    const board = new Gameboard();
    board.ships[2].isHorizontal = false;
    board.placeShip(board.ships[2], 0, 0);
    expect(board.spaces[0][2].ship.length).toEqual(3);
    expect(board.spaces[0][2].ship.x).toEqual(0);
    expect(board.spaces[0][2].ship.y).toEqual(0);
    expect(board.spaces[0][2].ship.isHorizontal).toBe(false);
    expect(board.spaces[0][0].ship).toEqual(board.spaces[0][1].ship);
    expect(board.spaces[0][0].ship).toEqual(board.spaces[0][2].ship);
    expect(board.ships[2].spaces[0].x).toEqual(0);
    expect(board.ships[2].spaces[0].y).toEqual(0);
    expect(board.ships[2].spaces[1].x).toEqual(0);
    expect(board.ships[2].spaces[1].y).toEqual(1);
});

test('Remove a ship', () => {
    const board = new Gameboard();
    board.placeShip(board.ships[2], 0, 0);
    board.removeShip(board.spaces[2][0].ship);
    expect(board.spaces[2][0].ship).toBeNull();
});

test('Rotate ship', () => {
    const board = new Gameboard();
    board.placeShip(board.ships[3], 0, 0);
    board.rotateShip(board.spaces[0][0].ship);
    expect(board.spaces[0][1].ship).toEqual(board.ships[3]);
});

test('Rotate ship on an invalid space', () => {
    const board = new Gameboard();
    board.placeShip(board.ships[3], 0, 0);
    board.placeShip(board.ships[2], 0, 2);
    board.rotateShip(board.spaces[0][0].ship);
    expect(board.spaces[1][0].ship).toEqual(board.ships[3]);
    expect(board.spaces[0][2].ship).toEqual(board.ships[2]);
    expect(board.spaces[0][1].ship).toBeNull();
});

test('Move ship', () => {
    const board = new Gameboard();
    board.placeShip(board.ships[3], 0, 0);
    board.moveShip(board.spaces[0][0].ship, 0, 2);
    expect(board.spaces[0][2].ship).toEqual(board.ships[3]);
});

test('Move on an invalid space', () => {
    const board = new Gameboard();
    board.placeShip(board.ships[3], 0, 0);
    board.placeShip(board.ships[4], 0, 2);
    board.moveShip(board.spaces[0][0].ship, 0, 2);
    board.moveShip(board.spaces[0][0].ship, 0, 1);
    expect(board.spaces[0][2].ship).toEqual(board.ships[4]);
    expect(board.spaces[0][1].ship).toBeNull();
    expect(board.spaces[0][0].ship).toEqual(board.ships[3]);
});

test('Attacks on a ship', () => {
    const board = new Gameboard();
    board.placeShip(board.ships[2], 0, 0);
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
    board.placeShip(board.ships[0], 0, 0);
    board.receiveAttack(0, 0);
    board.receiveAttack(1, 0);
    board.receiveAttack(2, 0);
    board.receiveAttack(3, 0);
    board.receiveAttack(4, 0);
    board.placeShip(board.ships[1], 0, 2);
    board.receiveAttack(0, 2);
    board.receiveAttack(1, 2);
    board.receiveAttack(2, 2);
    board.receiveAttack(3, 2);
    board.placeShip(board.ships[2], 0, 4);
    board.receiveAttack(0, 4);
    board.receiveAttack(1, 4);
    board.receiveAttack(2, 4);
    board.placeShip(board.ships[3], 0, 6);
    board.receiveAttack(0, 6);
    board.receiveAttack(1, 6);
    board.receiveAttack(2, 6);
    board.placeShip(board.ships[4], 0, 8);
    board.receiveAttack(0, 8);
    board.receiveAttack(1, 8);
    expect(board.checkAllSunk()).toBe(true);
});

test('checkAllSunk - not all sunk', () => {
    const board = new Gameboard();
    board.placeShip(board.ships[0], 0, 0);
    board.receiveAttack(0, 0);
    board.receiveAttack(1, 0);
    board.receiveAttack(2, 0);
    board.receiveAttack(3, 0);
    board.receiveAttack(4, 0);
    board.placeShip(board.ships[1], 0, 2);
    board.receiveAttack(0, 2);
    board.receiveAttack(1, 2);
    board.receiveAttack(2, 2);
    board.receiveAttack(3, 2);
    board.placeShip(board.ships[2], 0, 4);
    board.receiveAttack(0, 4);
    board.receiveAttack(1, 4);
    board.receiveAttack(2, 4);
    board.placeShip(board.ships[3], 0, 6);
    board.receiveAttack(0, 6);
    board.receiveAttack(1, 6);
    board.receiveAttack(2, 6);
    board.placeShip(board.ships[4], 0, 8);
    expect(board.checkAllSunk()).toBe(false);
});