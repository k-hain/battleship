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