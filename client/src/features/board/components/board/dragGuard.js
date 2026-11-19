// After a drag ends, the browser can still fire a click on the card's full-card link
// (e.g. when you drop the card back where it started). This lets the card ignore that click.
let lastDragEnd = 0;
export const markDragEnd = () => {
  lastDragEnd = Date.now();
};
export const justDragged = () => Date.now() - lastDragEnd < 250;
