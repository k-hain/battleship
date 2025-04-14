import { Ship } from './ship.js';

/* global expect, test, */

test('Length 3, One hit', () => {
    const ship = new Ship(3);
    ship.hit();
    expect(ship.hits).toBe(1);
});

test('Length 2, Two hits', () => {
    const ship = new Ship(2);
    ship.hit();
    ship.hit();
    expect(ship.hits).toBe(2);
});

test('Length 2, Two hits - isSunk', () => {
    const ship = new Ship(2);
    ship.hit();
    ship.hit();
    expect(ship.isSunk()).toBeTrue;
});

test('Length 3, Four Hits', () => {
    const ship = new Ship(3);
    ship.hit();
    ship.hit();
    ship.hit();
    ship.hit();
    expect(ship.hits).toBe(3);
});

