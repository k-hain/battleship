export function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

export function forEachSpace (spacesArr, callback) {
    for (let rowX of spacesArr) {
        for (let space of rowX) {
            callback(space);
        }
    }
}

export function getRandomCoords(max) {
    return {x: getRandomInt(max), y: getRandomInt(max)};
}

export function getRandomBool() {
    const ar = [true, false];
    const index = Math.round(Math.random());
    return(ar[index]);
}