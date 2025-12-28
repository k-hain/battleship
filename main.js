/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 224:
/***/ (function(module, exports, __webpack_require__) {

/* module decorator */ module = __webpack_require__.nmd(module);
/**
 * Copyright (c) 2010,2011,2012,2013,2014 Morgan Roderick http://roderick.dk
 * License: MIT - http://mrgnrdrck.mit-license.org
 *
 * https://github.com/mroderick/PubSubJS
 */

(function (root, factory){
    'use strict';

    var PubSub = {};

    if (root.PubSub) {
        PubSub = root.PubSub;
        console.warn("PubSub already loaded, using existing version");
    } else {
        root.PubSub = PubSub;
        factory(PubSub);
    }
    // CommonJS and Node.js module support
    if (true){
        if (module !== undefined && module.exports) {
            exports = module.exports = PubSub; // Node.js specific `module.exports`
        }
        exports.PubSub = PubSub; // CommonJS module 1.1.1 spec
        module.exports = exports = PubSub; // CommonJS
    }
    // AMD support
    /* eslint-disable no-undef */
    else {}

}(( typeof window === 'object' && window ) || this || __webpack_require__.g, function (PubSub){
    'use strict';

    var messages = {},
        lastUid = -1,
        ALL_SUBSCRIBING_MSG = '*';

    function hasKeys(obj){
        var key;

        for (key in obj){
            if ( Object.prototype.hasOwnProperty.call(obj, key) ){
                return true;
            }
        }
        return false;
    }

    /**
     * Returns a function that throws the passed exception, for use as argument for setTimeout
     * @alias throwException
     * @function
     * @param { Object } ex An Error object
     */
    function throwException( ex ){
        return function reThrowException(){
            throw ex;
        };
    }

    function callSubscriberWithDelayedExceptions( subscriber, message, data ){
        try {
            subscriber( message, data );
        } catch( ex ){
            setTimeout( throwException( ex ), 0);
        }
    }

    function callSubscriberWithImmediateExceptions( subscriber, message, data ){
        subscriber( message, data );
    }

    function deliverMessage( originalMessage, matchedMessage, data, immediateExceptions ){
        var subscribers = messages[matchedMessage],
            callSubscriber = immediateExceptions ? callSubscriberWithImmediateExceptions : callSubscriberWithDelayedExceptions,
            s;

        if ( !Object.prototype.hasOwnProperty.call( messages, matchedMessage ) ) {
            return;
        }

        for (s in subscribers){
            if ( Object.prototype.hasOwnProperty.call(subscribers, s)){
                callSubscriber( subscribers[s], originalMessage, data );
            }
        }
    }

    function createDeliveryFunction( message, data, immediateExceptions ){
        return function deliverNamespaced(){
            var topic = String( message ),
                position = topic.lastIndexOf( '.' );

            // deliver the message as it is now
            deliverMessage(message, message, data, immediateExceptions);

            // trim the hierarchy and deliver message to each level
            while( position !== -1 ){
                topic = topic.substr( 0, position );
                position = topic.lastIndexOf('.');
                deliverMessage( message, topic, data, immediateExceptions );
            }

            deliverMessage(message, ALL_SUBSCRIBING_MSG, data, immediateExceptions);
        };
    }

    function hasDirectSubscribersFor( message ) {
        var topic = String( message ),
            found = Boolean(Object.prototype.hasOwnProperty.call( messages, topic ) && hasKeys(messages[topic]));

        return found;
    }

    function messageHasSubscribers( message ){
        var topic = String( message ),
            found = hasDirectSubscribersFor(topic) || hasDirectSubscribersFor(ALL_SUBSCRIBING_MSG),
            position = topic.lastIndexOf( '.' );

        while ( !found && position !== -1 ){
            topic = topic.substr( 0, position );
            position = topic.lastIndexOf( '.' );
            found = hasDirectSubscribersFor(topic);
        }

        return found;
    }

    function publish( message, data, sync, immediateExceptions ){
        message = (typeof message === 'symbol') ? message.toString() : message;

        var deliver = createDeliveryFunction( message, data, immediateExceptions ),
            hasSubscribers = messageHasSubscribers( message );

        if ( !hasSubscribers ){
            return false;
        }

        if ( sync === true ){
            deliver();
        } else {
            setTimeout( deliver, 0 );
        }
        return true;
    }

    /**
     * Publishes the message, passing the data to it's subscribers
     * @function
     * @alias publish
     * @param { String } message The message to publish
     * @param {} data The data to pass to subscribers
     * @return { Boolean }
     */
    PubSub.publish = function( message, data ){
        return publish( message, data, false, PubSub.immediateExceptions );
    };

    /**
     * Publishes the message synchronously, passing the data to it's subscribers
     * @function
     * @alias publishSync
     * @param { String } message The message to publish
     * @param {} data The data to pass to subscribers
     * @return { Boolean }
     */
    PubSub.publishSync = function( message, data ){
        return publish( message, data, true, PubSub.immediateExceptions );
    };

    /**
     * Subscribes the passed function to the passed message. Every returned token is unique and should be stored if you need to unsubscribe
     * @function
     * @alias subscribe
     * @param { String } message The message to subscribe to
     * @param { Function } func The function to call when a new message is published
     * @return { String }
     */
    PubSub.subscribe = function( message, func ){
        if ( typeof func !== 'function'){
            return false;
        }

        message = (typeof message === 'symbol') ? message.toString() : message;

        // message is not registered yet
        if ( !Object.prototype.hasOwnProperty.call( messages, message ) ){
            messages[message] = {};
        }

        // forcing token as String, to allow for future expansions without breaking usage
        // and allow for easy use as key names for the 'messages' object
        var token = 'uid_' + String(++lastUid);
        messages[message][token] = func;

        // return token for unsubscribing
        return token;
    };

    PubSub.subscribeAll = function( func ){
        return PubSub.subscribe(ALL_SUBSCRIBING_MSG, func);
    };

    /**
     * Subscribes the passed function to the passed message once
     * @function
     * @alias subscribeOnce
     * @param { String } message The message to subscribe to
     * @param { Function } func The function to call when a new message is published
     * @return { PubSub }
     */
    PubSub.subscribeOnce = function( message, func ){
        var token = PubSub.subscribe( message, function(){
            // before func apply, unsubscribe message
            PubSub.unsubscribe( token );
            func.apply( this, arguments );
        });
        return PubSub;
    };

    /**
     * Clears all subscriptions
     * @function
     * @public
     * @alias clearAllSubscriptions
     */
    PubSub.clearAllSubscriptions = function clearAllSubscriptions(){
        messages = {};
    };

    /**
     * Clear subscriptions by the topic
     * @function
     * @public
     * @alias clearAllSubscriptions
     * @return { int }
     */
    PubSub.clearSubscriptions = function clearSubscriptions(topic){
        var m;
        for (m in messages){
            if (Object.prototype.hasOwnProperty.call(messages, m) && m.indexOf(topic) === 0){
                delete messages[m];
            }
        }
    };

    /**
       Count subscriptions by the topic
     * @function
     * @public
     * @alias countSubscriptions
     * @return { Array }
    */
    PubSub.countSubscriptions = function countSubscriptions(topic){
        var m;
        // eslint-disable-next-line no-unused-vars
        var token;
        var count = 0;
        for (m in messages) {
            if (Object.prototype.hasOwnProperty.call(messages, m) && m.indexOf(topic) === 0) {
                for (token in messages[m]) {
                    count++;
                }
                break;
            }
        }
        return count;
    };


    /**
       Gets subscriptions by the topic
     * @function
     * @public
     * @alias getSubscriptions
    */
    PubSub.getSubscriptions = function getSubscriptions(topic){
        var m;
        var list = [];
        for (m in messages){
            if (Object.prototype.hasOwnProperty.call(messages, m) && m.indexOf(topic) === 0){
                list.push(m);
            }
        }
        return list;
    };

    /**
     * Removes subscriptions
     *
     * - When passed a token, removes a specific subscription.
     *
	 * - When passed a function, removes all subscriptions for that function
     *
	 * - When passed a topic, removes all subscriptions for that topic (hierarchy)
     * @function
     * @public
     * @alias subscribeOnce
     * @param { String | Function } value A token, function or topic to unsubscribe from
     * @example // Unsubscribing with a token
     * var token = PubSub.subscribe('mytopic', myFunc);
     * PubSub.unsubscribe(token);
     * @example // Unsubscribing with a function
     * PubSub.unsubscribe(myFunc);
     * @example // Unsubscribing from a topic
     * PubSub.unsubscribe('mytopic');
     */
    PubSub.unsubscribe = function(value){
        var descendantTopicExists = function(topic) {
                var m;
                for ( m in messages ){
                    if ( Object.prototype.hasOwnProperty.call(messages, m) && m.indexOf(topic) === 0 ){
                        // a descendant of the topic exists:
                        return true;
                    }
                }

                return false;
            },
            isTopic    = typeof value === 'string' && ( Object.prototype.hasOwnProperty.call(messages, value) || descendantTopicExists(value) ),
            isToken    = !isTopic && typeof value === 'string',
            isFunction = typeof value === 'function',
            result = false,
            m, message, t;

        if (isTopic){
            PubSub.clearSubscriptions(value);
            return;
        }

        for ( m in messages ){
            if ( Object.prototype.hasOwnProperty.call( messages, m ) ){
                message = messages[m];

                if ( isToken && message[value] ){
                    delete message[value];
                    result = value;
                    // tokens are unique, so we can just stop here
                    break;
                }

                if (isFunction) {
                    for ( t in message ){
                        if (Object.prototype.hasOwnProperty.call(message, t) && message[t] === value){
                            delete message[t];
                            result = true;
                        }
                    }
                }
            }
        }

        return result;
    };
}));


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			id: moduleId,
/******/ 			loaded: false,
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/node module decorator */
/******/ 	(() => {
/******/ 		__webpack_require__.nmd = (module) => {
/******/ 			module.paths = [];
/******/ 			if (!module.children) module.children = [];
/******/ 			return module;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/publicPath */
/******/ 	(() => {
/******/ 		var scriptUrl;
/******/ 		if (__webpack_require__.g.importScripts) scriptUrl = __webpack_require__.g.location + "";
/******/ 		var document = __webpack_require__.g.document;
/******/ 		if (!scriptUrl && document) {
/******/ 			if (document.currentScript && document.currentScript.tagName.toUpperCase() === 'SCRIPT')
/******/ 				scriptUrl = document.currentScript.src;
/******/ 			if (!scriptUrl) {
/******/ 				var scripts = document.getElementsByTagName("script");
/******/ 				if(scripts.length) {
/******/ 					var i = scripts.length - 1;
/******/ 					while (i > -1 && (!scriptUrl || !/^http(s?):/.test(scriptUrl))) scriptUrl = scripts[i--].src;
/******/ 				}
/******/ 			}
/******/ 		}
/******/ 		// When supporting browsers where an automatic publicPath is not supported you must specify an output.publicPath manually via configuration
/******/ 		// or pass an empty string ("") and set the __webpack_public_path__ variable from your code to use your own logic.
/******/ 		if (!scriptUrl) throw new Error("Automatic publicPath is not supported in this browser");
/******/ 		scriptUrl = scriptUrl.replace(/#.*$/, "").replace(/\?.*$/, "").replace(/\/[^\/]+$/, "/");
/******/ 		__webpack_require__.p = scriptUrl;
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be in strict mode.
(() => {
"use strict";

// EXTERNAL MODULE: ./node_modules/pubsub-js/src/pubsub.js
var pubsub = __webpack_require__(224);
var pubsub_default = /*#__PURE__*/__webpack_require__.n(pubsub);
;// ./src/global-variables.js
const BOARD_WIDTH = 10;
const SHIP_LENGTHS = [5, 4, 3, 3, 2];

;// ./src/helpers.js


function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

function forEachSpace (spacesArr, callback) {
    for (let rowX of spacesArr) {
        for (let space of rowX) {
            callback(space);
        }
    }
}

function getRandomCoords(max) {
    return {x: getRandomInt(max), y: getRandomInt(max)};
}

function getRandomBool() {
    const ar = [true, false];
    const index = Math.round(Math.random());
    return(ar[index]);
}

function checkBounds(values) {
    for (let value of values) {
        if (value >= BOARD_WIDTH || value < 0) {
            return false;
        }
    }
    return true;
}
;// ./src/gameboard.js



class Space {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.ship = null;
        this.isHit = false;
    }
}

class Ship {
    constructor(length, isHorizontal) {
        this.length = length;
        this.hits = 0;
        this.x = null;
        this.y = null;
        this.isHorizontal = isHorizontal;
        this.spaces = [];
    }

    isSunk() {
        if (this.hits === this.length) {
            return true;
        }
        return false;
    }

    hit() {
        if (!this.isSunk()) {
            this.hits += 1;
        }
    }
}

class Gameboard {
    constructor(id) {
        this.id = id;
        this.spaces = [];
        this.ships = [];
        this.makeShips();
        this.makeBoard();
    }

    makeShips() {
        for (let length of SHIP_LENGTHS) {
            this.ships.push(new Ship(length, true));
        }
    }

    makeBoard() {
        for (let x = 0; x < BOARD_WIDTH; x++) {
            this.spaces.push(new Array());

            for (let y = 0; y < BOARD_WIDTH; y++) {
                this.spaces[x].push(new Space(x, y));
            }
        }
    }

    setupShips() {
        for (let ship of this.ships) {
            ship.isHorizontal = getRandomBool();

            while (true) {
                const coords = getRandomCoords(BOARD_WIDTH);

                const placed = this.placeShip(ship, coords.x, coords.y);
                if (placed) {
                    break;
                }
            }
        }
    }

    placeShip(ship, x, y) {
        if (this.validateShipPlacement(ship, x, y)) {
            ship.x = x;
            ship.y = y;

            for (let i = 0; i < ship.length; i++) {
                const [currX, currY] = this.getShipSegmentCoords(
                    ship.x,
                    ship.y,
                    ship.isHorizontal,
                    i
                );

                this.spaces[currX][currY].ship = ship;
                ship.spaces.push(this.spaces[currX][currY]);
            }

            return true;
        } else {
            return false;
        }
    }

    removeShip(targetShip) {
        for (let space of targetShip.spaces) {
            space.ship = null;
        }

        targetShip.spaces = [];
        targetShip.x = null;
        targetShip.y = null;
    }

    rotateShip(targetShip) {
        const x = targetShip.x;
        const y = targetShip.y;

        this.removeShip(targetShip);

        if (targetShip.isHorizontal) {
            targetShip.isHorizontal = false;
        } else {
            targetShip.isHorizontal = true;
        }

        const rotated = this.placeShip(targetShip, x, y);

        if (!rotated) {
            if (targetShip.isHorizontal) {
                targetShip.isHorizontal = false;
            } else {
                targetShip.isHorizontal = true;
            }

            this.placeShip(targetShip, x, y);
            return false;
        }

        return true;
    }

    moveShip(targetShip, newX, newY) {
        const x = targetShip.x;
        const y = targetShip.y;

        this.removeShip(targetShip);

        const moved = this.placeShip(targetShip, newX, newY);

        if (!moved) {
            this.placeShip(targetShip, x, y);
        }
    }

    validateShipPlacement(ship, x, y) {
        let validation = true;

        const dummyShip = new Ship(ship.length, ship.isHorizontal);
        dummyShip.x = x;
        dummyShip.y = y;

        if (this.checkValidFootprint(dummyShip)) {
            this.forEachSpaceAround(dummyShip, (space) => {
                if (space.ship) {
                    validation = false;
                }
            });
        } else {
            validation = false;
        }

        return validation;
    }

    receiveAttack(x, y) {
        const target = this.spaces[x][y];
        if (!target.isHit) {
            target.isHit = true;

            if (target.ship) {
                target.ship.hit();

                if (target.ship.isSunk()) {
                    this.addHitsAround(target.ship);
                }
            }
        }
    }

    checkAllSunk() {
        for (let ship of this.ships) {
            if (!ship.isSunk()) {
                return false;
            }
        }
        return true;
    }

    checkValidFootprint(ship) {
        const spaces = [];

        for (let i = 0; i < ship.length; i++) {
            const [currX, currY] = this.getShipSegmentCoords(
                ship.x,
                ship.y,
                ship.isHorizontal,
                i
            );

            spaces.push({ x: currX, y: currY });
        }

        for (let coords of spaces) {
            if (!checkBounds([coords.x, coords.y])) {
                return false;
            } else if (this.spaces[coords.x][coords.y].ship) {
                return false;
            }
        }

        return true;
    }

    forEachSpaceAround(ship, callback) {
        const targetSpaces = this.getSpacesAround(ship);

        for (let coords of targetSpaces) {
            callback(this.spaces[coords.x][coords.y]);
        }
    }

    getSpacesAround(ship) {
        const spaces = [];
        const validatedSpaces = [];

        for (let i = -1; i < ship.length + 1; i++) {
            const [currX, currY] = this.getShipSegmentCoords(
                ship.x,
                ship.y,
                ship.isHorizontal,
                i
            );

            if (ship.isHorizontal) {
                spaces.push(
                    { x: currX, y: currY + 1 },
                    { x: currX, y: currY - 1 }
                );
            } else {
                spaces.push(
                    { x: currX + 1, y: currY },
                    { x: currX - 1, y: currY }
                );
            }
            if (i === -1 || i === ship.length) {
                spaces.push({ x: currX, y: currY });
            }
        }

        for (let coords of spaces) {
            if (checkBounds([coords.x, coords.y])) {
                validatedSpaces.push(coords);
            }
        }

        return validatedSpaces;
    }

    getShipSegmentCoords(x, y, isHorizontal, offset) {
        let newX, newY;

        if (isHorizontal) {
            newX = x + offset;
            newY = y;
        } else {
            newX = x;
            newY = y + offset;
        }

        return [newX, newY];
    }

    addHitsAround(ship) {
        this.forEachSpaceAround(ship, (space) => {
            if (!space.isHit) {
                space.isHit = true;
            }
        });
    }

    getLockedSpaces() {
        const lockedSpaces = [];

        for (let ship of this.ships) {
            if (ship.x !== null && ship.y !== null) {
                for (let shipSpace of ship.spaces) {
                    lockedSpaces.push(shipSpace);
                }

                const spacesAround = this.getSpacesAround(ship);

                for (let space of spacesAround) {
                    if (!lockedSpaces.includes(space)) {
                        lockedSpaces.push(space);
                    }
                }
            }
        }

        return lockedSpaces;
    }
}

;// ./src/dom-fns.js
/* global document */

/*
data.type type of new DOM element
data.container Container to append new element to
data.classes Array of CSS classes to add to the element
data.text TextContent of the element
data.src src attribute of an image
*/
function drawDomElement(data) {
    const el = document.createElement(data.type);

    if (data.container) {
        data.container.appendChild(el); 
    }
    
    if (data.classes.length) {
        addCssClasses(el, data.classes);
    }

    if (data.text) {
        el.textContent = data.text;
    }

    if (data.type === 'img' && data.src) {
        el.src = data.src;
    }

    return el;
}

function addCssClasses(el, classes) {
    for (let css of classes) {
        el.classList.add(css);
    }
}

function clearContents(el) {
    while(el.firstChild){
        el.removeChild(el.firstChild);
    }
}

;// ./src/svg/drag_pan_24dp_000000_FILL0_wght400_GRAD0_opsz24.svg
const drag_pan_24dp_000000_FILL0_wght400_GRAD0_opsz24_namespaceObject = __webpack_require__.p + "b4fa42702a6d4d7c27f7.svg";
;// ./src/svg/turn_right_24dp_000000_FILL0_wght400_GRAD0_opsz24.svg
const turn_right_24dp_000000_FILL0_wght400_GRAD0_opsz24_namespaceObject = __webpack_require__.p + "5350682e8e3034b7df8a.svg";
;// ./src/event-types.js
const START_PLAYER_ROUND = Symbol('START_PLAYER_ROUND');
const START_COMPUTER_ROUND = Symbol('START_COMPUTER_ROUND');
const ATTACK_SPACE = Symbol('ATTACK_SPACE');
const REFRESH_DISPLAY_AND_WIDGETS = Symbol('REFRESH_DISPLAY_AND_WIDGETS');
const START_SHIP_MOVEMENT = Symbol('START_SHIP_MOVEMENT');
const PLACE_SHIP = Symbol('PLACE_SHIP');
const ROTATE_SHIP = Symbol('ROTATE_SHIP');
const END_GAME = Symbol('END_GAME');
;// ./src/ship-transform-widget.js






class ShipTransformWidget {
    constructor(id, ship, domSpaces) {
        this.id = id;
        this.ship = ship;
        this.spaces = [];
        this.moveBtnContainer, this.rotateBtnContainer;
        this.setShipSpaces(domSpaces, ship);
        this.init();
    }

    init() {
        this.addHovers();
        this.addButtons();
    }

    clear() {
        this.removeHoverClass();
        this.removeButtons();
        this.removeHovers();
    }

    setShipSpaces(domSpaces, ship) {
        for (let space of ship.spaces) {
            this.spaces.push(domSpaces[space.x][space.y]);
        }

        this.moveBtnContainer = domSpaces[ship.x][ship.y];

        this.setRotateBtnContainer(domSpaces, ship);
    }

    setRotateBtnContainer(domSpaces, ship) {
        if (this.ship.isHorizontal) {
            this.rotateBtnContainer = domSpaces[ship.x + 1][ship.y];
        } else {
            this.rotateBtnContainer = domSpaces[ship.x][ship.y + 1];
        }
    }

    highlightOn = function () {
        for (let el of this.spaces) {
            el.classList.add('space-hover');
        }
    }.bind(this);

    highlightOff = function () {
        for (let el of this.spaces) {
            el.classList.remove('space-hover');
        }
    }.bind(this);

    addHovers() {
        for (let el of this.spaces) {
            el.addEventListener('mouseenter', this.highlightOn);
            el.addEventListener('mouseleave', this.highlightOff);
        }
    }

    removeHovers() {
        for (let el of this.spaces) {
            el.removeEventListener('mouseleave', this.highlightOff);
            el.removeEventListener('mouseenter', this.highlightOn);
        }
    }

    removeHoverClass() {
        for (let el of this.spaces) {
            el.classList.remove('space-hover');
        }
    }

    addButtons() {
        const moveBtnEl = drawDomElement({
            type: 'button',
            container: this.moveBtnContainer,
            classes: ['board-button'],
        });

        drawDomElement({
            type: 'img',
            container: moveBtnEl,
            classes: ['board-button-icon'],
            src: drag_pan_24dp_000000_FILL0_wght400_GRAD0_opsz24_namespaceObject,
        });

        const rotateBtnEl = drawDomElement({
            type: 'button',
            container: this.rotateBtnContainer,
            classes: ['board-button'],
        });

        drawDomElement({
            type: 'img',
            container: rotateBtnEl,
            classes: ['board-button-icon'],
            src: turn_right_24dp_000000_FILL0_wght400_GRAD0_opsz24_namespaceObject,
        });

        rotateBtnEl.addEventListener('click', () => {
            pubsub_default().publish(ROTATE_SHIP, { id: this.id, ship: this.ship });
        });

        moveBtnEl.addEventListener('click', () => {
            pubsub_default().publish(START_SHIP_MOVEMENT, {
                id: this.id,
                ship: this.ship,
                coords: { x: this.ship.x, y: this.ship.y },
            });
        });
    }

    removeButtons() {
        clearContents(this.moveBtnContainer);
        clearContents(this.rotateBtnContainer);
    }
}

;// ./src/svg/close_24dp_000000_FILL0_wght400_GRAD0_opsz24.svg
const close_24dp_000000_FILL0_wght400_GRAD0_opsz24_namespaceObject = __webpack_require__.p + "30508a6d00696f2dc5c6.svg";
;// ./src/svg/local_fire_department_24dp_000000_FILL0_wght400_GRAD0_opsz24.svg
const local_fire_department_24dp_000000_FILL0_wght400_GRAD0_opsz24_namespaceObject = __webpack_require__.p + "a059fbf281d51a270ae1.svg";
;// ./src/display.js
/* global setInterval, clearInterval, setTimeout */










class Display {
    #movedShip = null;
    #movedShipCoords = null;
    #hoveredCoordsList = [];

    constructor(id, boardEl, playerNameEl, playerName) {
        this.id = id;
        this.spaces = [];
        this.addName(playerNameEl, playerName);
        this.createSpaces(boardEl);
        this.container = boardEl;
        this.widgets = [];
    }

    addName(playerNameEl, playerName) {
        playerNameEl.textContent = playerName;
    }

    createSpaces(boardEl) {
        for (let x = 0; x < BOARD_WIDTH; x++) {
            this.spaces.push(new Array());

            for (let y = 0; y < BOARD_WIDTH; y++) {
                const spaceEl = drawDomElement({
                    type: 'div',
                    container: boardEl,
                    classes: ['space'],
                });
                this.spaces[x].push(spaceEl);
                spaceEl.style.gridRow = `${y + 1} / span 1`;
                spaceEl.style.gridColumn = `${x + 1} / span 1`;
                spaceEl.x = x;
                spaceEl.y = y;
                spaceEl.isLocked = false;
            }
        }
    }

    setLockedSpaces(coordsArr) {
        for (let coords of coordsArr) {
            this.spaces[coords.x][coords.y].isLocked = true;
        }
    }

    clearLockedSpaces() {
        forEachSpace(this.spaces, (space) => {
            space.isLocked = false;
        });
    }

    refresh(boardData) {
        forEachSpace(this.spaces, (el) => {
            clearContents(el);

            el.className = 'space';

            const space = boardData.spaces[el.x][el.y];

            if (this.id === 1 && !space.isHit) {
                el.classList.add('space-hidden');
            } else {
                if (space.ship) {
                    el.classList.add('space-ship');
                } else {
                    el.classList.add('space-empty');
                }

                if (space.isHit) {
                    if (space.ship) {
                        drawDomElement({
                            type: 'img',
                            container: el,
                            classes: ['.board-button-icon'],
                            src: local_fire_department_24dp_000000_FILL0_wght400_GRAD0_opsz24_namespaceObject,
                        });
                    } else {
                        drawDomElement({
                            type: 'img',
                            container: el,
                            classes: ['.board-button-icon'],
                            src: close_24dp_000000_FILL0_wght400_GRAD0_opsz24_namespaceObject,
                        });
                    }
                }
            }
        });
    }

    refreshBoardAndWidgets(boardData) {
        this.refresh(boardData);
        this.resetWidgets(boardData);
    }

    refreshBoardAndClearWidgets(boardData) {
        this.refresh(boardData);
        this.clearWidgets();
    }

    addWidgets(boardData) {
        for (let ship of boardData.ships) {
            this.widgets.push(
                new ShipTransformWidget(this.id, ship, this.spaces)
            );
        }
    }

    clearWidgets() {
        for (let widget of this.widgets) {
            widget.clear();
        }
        this.widgets = [];
    }

    resetWidgets(boardData) {
        this.clearWidgets();
        this.addWidgets(boardData);
    }

    moveShip(ship, coords, lockedSpaces) {
        this.#movedShip = ship;
        this.#movedShipCoords = coords;
        this.setLockedSpaces(lockedSpaces);
        this.addMovementListeners();
    }

    placeShipOnHovered = function (evt) {
        this.removeMovementListeners();
        this.clearLockedSpaces();

        pubsub_default().publish(PLACE_SHIP, {
            id: this.id,
            ship: this.#movedShip,
            coords: { x: evt.target.x, y: evt.target.y },
            highlightAfterPlacement: true,
        });
    }.bind(this);

    doAfterFailedPlacement(lockedSpaces) {
        this.setLockedSpaces(lockedSpaces);
        this.addMovementListeners();
    }

    doAfterPlacement() {
        this.resetMovementVars();
    }

    mouseLeftContainer = function () {
        this.removeMovementListeners();
        this.clearLockedSpaces();
        pubsub_default().publish(PLACE_SHIP, {
            id: this.id,
            ship: this.#movedShip,
            coords: this.#movedShipCoords,
        });
        this.resetMovementVars();
    }.bind(this);

    displayShipOutline = function (evt) {
        evt.stopPropagation();
        const allWithinBounds = this.getHoveredCoords(
            { x: evt.target.x, y: evt.target.y },
            this.#movedShip
        );
        const moveLegal = this.checkLegality();
        for (let coords of this.#hoveredCoordsList) {
            if (allWithinBounds && moveLegal) {
                this.spaces[coords.x][coords.y].classList.add('ship-dummy');
            } else {
                this.spaces[coords.x][coords.y].classList.add(
                    'ship-dummy-illegal'
                );
            }
        }
    }.bind(this);

    clearShipOutline = function (evt) {
        evt.stopPropagation();
        for (let coords of this.#hoveredCoordsList) {
            this.spaces[coords.x][coords.y].classList.remove('ship-dummy');
            this.spaces[coords.x][coords.y].classList.remove(
                'ship-dummy-illegal'
            );
        }
        this.#hoveredCoordsList = [];
    }.bind(this);

    getHoveredCoords(hoveredCoords, ship) {
        let currentCoords = hoveredCoords;
        this.#hoveredCoordsList = [];

        for (let i = 0; i < ship.length; i++) {
            if (
                currentCoords.x < BOARD_WIDTH &&
                currentCoords.y < BOARD_WIDTH &&
                currentCoords.x >= 0 &&
                currentCoords.y >= 0
            ) {
                this.#hoveredCoordsList.push({
                    x: currentCoords.x,
                    y: currentCoords.y,
                });
            } else {
                return false;
            }

            if (ship.isHorizontal) {
                currentCoords.x += 1;
            } else {
                currentCoords.y += 1;
            }
        }

        return true;
    }

    checkLegality() {
        for (let coords of this.#hoveredCoordsList) {
            if (this.spaces[coords.x][coords.y].isLocked) {
                return false;
            }
        }

        return true;
    }

    addMovementListeners() {
        this.container.addEventListener('mouseleave', this.mouseLeftContainer);

        forEachSpace(this.spaces, (el) => {
            el.addEventListener('mouseenter', this.displayShipOutline);
            el.addEventListener('click', this.placeShipOnHovered);
            el.addEventListener('mouseleave', this.clearShipOutline);
        });
    }

    removeMovementListeners() {
        this.container.removeEventListener(
            'mouseleave',
            this.mouseLeftContainer
        );

        forEachSpace(this.spaces, (el) => {
            el.removeEventListener('mouseenter', this.displayShipOutline);
            el.removeEventListener('click', this.placeShipOnHovered);
            el.removeEventListener('mouseleave', this.clearShipOutline);
        });
    }

    resetMovementVars() {
        this.#movedShip = null;
        this.#movedShipCoords = null;
        this.#hoveredCoordsList = [];
    }

    attackSpace = function (evt) {
        pubsub_default().publish(ATTACK_SPACE, {
            id: this.id,
            x: evt.target.x,
            y: evt.target.y,
        });
    }.bind(this);

    addAttackListeners(boardSpaces) {
        forEachSpace(boardSpaces, (space) => {
            if (!space.isHit) {
                this.spaces[space.x][space.y].addEventListener(
                    'click',
                    this.attackSpace
                );
            }
        });
    }

    removeAttackListeners() {
        forEachSpace(this.spaces, (el) => {
            el.removeEventListener('click', this.attackSpace);
        });
    }

    makeSpaceBlink(coords) {
        const el = this.spaces[coords.x][coords.y];

        function blinkBackground() {
            el.classList.toggle('blink');
        }

        const blinkingInterval = setInterval(blinkBackground, 110);

        setTimeout(() => {
            clearInterval(blinkingInterval);
        }, 440);
    }
}

;// ./src/game.js





class Player {
    constructor(id, name) {
        this.id = id;
        this.name = name;
    }
}

class Game {
    constructor() {
        this.players = [new Player(0, 'Player'), new Player(1, 'Computer')];

        this.currentPlayer;
    }

    setStartingPlayer() {
        const roll = getRandomBool();

        if (roll) {
            this.currentPlayer = this.players[0];
        } else {
            this.currentPlayer = this.players[1];
        }
    }

    startGame() {
        this.setStartingPlayer();
        this.startRound();
    }

    startRound() {
        if (this.currentPlayer.id === 0) {
            pubsub_default().publish(START_PLAYER_ROUND);
        } else {
            pubsub_default().publish(START_COMPUTER_ROUND);
        }
    }

    startNextRound() {
        this.switchPlayers();
        this.startRound();
    }

    switchPlayers() {
        if (this.currentPlayer.id === 0) {
            this.currentPlayer = this.players[1];
        } else {
            this.currentPlayer = this.players[0];
        }
    }

    getRandomTarget(targets) {
        const target = targets[getRandomInt(targets.length)];

        return { x: target.x, y: target.y };
    }

    getAllLegalTargets(spaces) {
        let targets = [];

        forEachSpace(spaces, (space) => {
            if (!space.isHit) {
                targets.push(space);
            }
        });

        return targets;
    }

    getTarget(boardSpaces) {
        const unsunkShipSpaces = [];
        let targets = [];
        let target;

        forEachSpace(boardSpaces, (space) => {
            if (space.isHit && space.ship && !space.ship.isSunk()) {
                unsunkShipSpaces.push(space);
            }
        });

        if (unsunkShipSpaces.length) {
            targets = this.findTargetsAround(boardSpaces, unsunkShipSpaces);

            if (!targets.length) {
                targets = this.getAllLegalTargets(boardSpaces);
            }
        } else {
            targets = this.getAllLegalTargets(boardSpaces);
        }

        target = this.getRandomTarget(targets);
        return { x: target.x, y: target.y };
    }

    findTargetsAround (boardSpaces, unsunkShipSpaces) {
        const targets = [];

        for (let space of unsunkShipSpaces) {
            const legalSpacesX = [];
            const legalSpacesY = [];
            let targetX = true;
            let targetY = true;

            const spacesAround = [
                { x: space.x + 1, y: space.y },
                { x: space.x - 1, y: space.y },
                { x: space.x, y: space.y + 1 },
                { x: space.x, y: space.y - 1 },
            ];

            for (let coords of spacesAround) {
                if (checkBounds([coords.x, coords.y])) {
                    const current = boardSpaces[coords.x][coords.y];

                    if (current.isHit && current.ship) {
                        if (current.x > space.x || current.x < space.x) {
                            targetY = false;
                        } else {
                            targetX = false;
                        }
                    }

                    if (!current.isHit) {
                        if (current.x > space.x || current.x < space.x) {
                            legalSpacesX.push({ x: coords.x, y: coords.y });
                        } else {
                            legalSpacesY.push({ x: coords.x, y: coords.y });
                        }
                    }
                }
            }

            if (legalSpacesX.length && targetX) {
                for (let space of legalSpacesX) {
                    targets.push(space);
                }
            }

            if (legalSpacesY.length && targetY) {
                for (let space of legalSpacesY) {
                    targets.push(space);
                }
            }
        }

        return targets;
    }

    checkGameEnd(boards) {
        for (let board of boards) {
            if (board.checkAllSunk()) {
                let winner;
                if (board.id === 0) {
                    winner = this.players[1].name;
                } else {
                    winner = this.players[0].name;
                }
                pubsub_default().publish(END_GAME, winner);
                return;
            }
        }

        this.startNextRound();
    }
}

;// ./src/display-controller.js
/* global Event, document, setTimeout */








const board1El = document.getElementById('board1');
const board2El = document.getElementById('board2');
const player1NameEl = document.getElementById('player1-name');
const player2NameEl = document.getElementById('player2-name');

class DisplayController {
    constructor() {
        this.domEls = [
            {
                board: board1El,
                playerName: player1NameEl,
            },
            {
                board: board2El,
                playerName: player2NameEl,
            },
        ];

        this.boards = [];
        this.game = new Game();

        this.initBoards();
    }

    initBoards() {
        for (let player of this.game.players) {
            const board = new Gameboard(player.id);
            const boardDisplay = new Display(
                player.id,
                this.domEls[player.id].board,
                this.domEls[player.id].playerName,
                player.name
            );

            this.boards.push({
                id: player.id,
                data: board,
                display: boardDisplay,
            });
        }

        for (let board of this.boards) {
            board.data.setupShips();
            board.display.refresh(board.data);
        }

        this.boardSetup(this.boards[0]);
    }

    boardSetup(board) {
        const callback = function () {
            board.display.refreshBoardAndClearWidgets(board.data);
            this.game.startGame();
        }.bind(this);

        this.addInfoElement(
            'Arrange your ships on the board',
            'Start Game',
            callback
        );

        board.display.addWidgets(board.data);
    }

    boardSetupRefresh = function (msg, id) {
        const board = this.boards[id];

        board.display.refreshBoardAndWidgets(board.data);
    }.bind(this);
    boardSetupRefreshToken = pubsub_default().subscribe(
        REFRESH_DISPLAY_AND_WIDGETS,
        this.boardSetupRefresh
    );

    startShipMovement = function (msg, data) {
        let board = this.boards[data.id];

        board.data.removeShip(data.ship);

        board.display.refreshBoardAndClearWidgets(board.data);

        const lockedSpaces = board.data.getLockedSpaces();
        board.display.moveShip(data.ship, data.coords, lockedSpaces);
    }.bind(this);
    startShipMovementToken = pubsub_default().subscribe(
        START_SHIP_MOVEMENT,
        this.startShipMovement
    );

    placeShipAndRefresh = function (msg, data) {
        let board = this.boards[data.id];

        const placed = board.data.placeShip(
            data.ship,
            data.coords.x,
            data.coords.y
        );

        if (placed) {
            board.display.doAfterPlacement();
            board.display.refreshBoardAndWidgets(board.data);
        } else {
            const lockedSpaces = board.data.getLockedSpaces();
            board.display.doAfterFailedPlacement(lockedSpaces);
        }

        if (data.highlightAfterPlacement) {
            const evt = new Event('mouseenter');
            board.display.spaces[data.coords.x][data.coords.y].dispatchEvent(
                evt
            );
        }
    }.bind(this);
    placeShipToken = pubsub_default().subscribe(PLACE_SHIP, this.placeShipAndRefresh);

    roateShip = function (msg, data) {
        const board = this.boards[data.id];

        const rotated = board.data.rotateShip(data.ship);

        if (rotated) {
            pubsub_default().publish(REFRESH_DISPLAY_AND_WIDGETS, data.id);
        } else {
            for (let space of data.ship.spaces) {
                board.display.makeSpaceBlink({x: space.x, y: space.y});
            }

            const refresh = function () {
                for (let space of data.ship.spaces) {
                    board.display.spaces[space.x][space.y].classList.remove('blink');
                }
            };
            setTimeout(refresh, 460);
        }
    }.bind(this);
    roateShipToken = pubsub_default().subscribe(ROTATE_SHIP, this.roateShip);

    allowPlayerAttack = function () {
        const board = this.boards[1];

        board.display.addAttackListeners(board.data.spaces);
    }.bind(this);
    allowPlayerAttackToken = pubsub_default().subscribe(
        START_PLAYER_ROUND,
        this.allowPlayerAttack
    );

    makeComputerAttack = function () {
        const board = this.boards[0];
        const target = this.game.getTarget(board.data.spaces);

        const attack = function () {
            this.resolveAttack(board, target.x, target.y);
        }.bind(this);

        setTimeout(attack, 500);
    }.bind(this);
    makeComputerAttackToken = pubsub_default().subscribe(
        START_COMPUTER_ROUND,
        this.makeComputerAttack
    );

    makePlayerAttack = function (msg, data) {
        const board = this.boards[data.id];

        if (data.id === 1) {
            board.display.removeAttackListeners();
        }

        this.resolveAttack(board, data.x, data.y);
    }.bind(this);
    makePlayerAttackToken = pubsub_default().subscribe(
        ATTACK_SPACE,
        this.makePlayerAttack
    );

    resolveAttack(board, x, y) {
        board.data.receiveAttack(x, y);
        board.display.refresh(board.data);

        board.display.makeSpaceBlink({ x, y });

        this.game.checkGameEnd([this.boards[0].data, this.boards[1].data]);
    }

    endGame = function (msg, winner) {
        const callback = function () {
            this.boards = [];
            this.initBoards();
        }.bind(this);

        this.addInfoElement(`${winner} wins the game!`, 'Play Again', callback);
    }.bind(this);
    endGameToken = pubsub_default().subscribe(END_GAME, this.endGame);

    addInfoElement(infoText, btnText, callback) {
        const infoWrapperEl = document.getElementById('info-wrapper');

        drawDomElement({
            type: 'div',
            container: infoWrapperEl,
            classes: ['info'],
            text: infoText,
        });

        const startButtonEl = drawDomElement({
            type: 'button',
            container: infoWrapperEl,
            classes: ['start-btn'],
            text: btnText,
        });

        startButtonEl.addEventListener('click', () => {
            clearContents(infoWrapperEl);
            callback();
        });
    }
}

;// ./src/index.js



// eslint-disable-next-line no-unused-vars
const display = new DisplayController();

})();

/******/ })()
;
//# sourceMappingURL=main.js.map