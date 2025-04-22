/* global document */

/*
data.type type of new DOM element
data.container Container to append new element to
data.classes Array of CSS classes to add to the element
data.text TextContent of the element
*/
export function drawDomElement(data) {
    const el = document.createElement(data.type);

    data.container.appendChild(el);

    if (data.classes.length) {
        addCssClasses(el, data.classes);
    }

    if (data.text) {
        el.textContent = data.text;
    }

    return el;
}

/*
export const drawImgElement = (imgSrc, container, cssClasses) => {
  const domEl = document.createElement('img');
  container.appendChild(domEl);
  domEl.src = imgSrc;
  if (cssClasses !== undefined && cssClasses.length) {
    addCssClasses(domEl, cssClasses);
  }
  return domEl;
};
*/

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
