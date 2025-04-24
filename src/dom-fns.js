/* global document */

/*
data.type type of new DOM element
data.container Container to append new element to
data.classes Array of CSS classes to add to the element
data.text TextContent of the element
data.src src attribute of an image
*/
export function drawDomElement(data) {
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

export function clearContents(el) {
    while(el.firstChild){
        el.removeChild(el.firstChild);
    }
}
