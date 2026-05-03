/**
 * Converts a pixel value to a percentage of the container size.
 * Use when storing or comparing positions in a resolution-independent format.
 * @param {number} pixels - The pixel value to convert.
 * @param {number} containerPixels - The total size of the container in pixels.
 * @returns {number} The value as a percentage (0–100) of the container size.
 */
export function toPercent(pixels, containerPixels) {
    return (pixels / containerPixels) * 100;
}

/**
 * Converts a percentage value back to pixels for a given container size.
 * Use when translating stored percentage coordinates into pixel positions for rendering.
 * @param {number} percent - The percentage value to convert (0–100).
 * @param {number} containerPixels - The total size of the container in pixels.
 * @returns {number} The value in pixels.
 */
export function toPixels(percent, containerPixels) {
    return (percent / 100) * containerPixels;
}

/**
 * Derives { x, y } as percentages of the container from a MouseEvent.
 * Use during mouse interactions (mousedown, mousemove) to get a position
 * that can be stored directly as a patch coordinate.
 * @param {MouseEvent} event - The mouse event to read clientX/clientY from.
 * @param {DOMRect} containerRect - The bounding rect of the container element.
 * @returns {{ x: number, y: number }} Position as percentages of the container.
 */
export function eventToPercent(event, containerRect) {
    return {
        x: toPercent(event.clientX - containerRect.left, containerRect.width),
        y: toPercent(event.clientY - containerRect.top, containerRect.height),
    };
}

/**
 * Normalizes two corner points into a { x, y, width, height } rect.
 * Use after a drag interaction to convert a start and end point into a
 * well-formed rect regardless of which direction the user dragged.
 * @param {number} x1 - X coordinate of the first corner.
 * @param {number} y1 - Y coordinate of the first corner.
 * @param {number} x2 - X coordinate of the opposite corner.
 * @param {number} y2 - Y coordinate of the opposite corner.
 * @returns {{ x: number, y: number, width: number, height: number }} Normalized rect.
 */
export function normalizeRect(x1, y1, x2, y2) {
    return {
        x: Math.min(x1, x2),
        y: Math.min(y1, y2),
        width: Math.abs(x2 - x1),
        height: Math.abs(y2 - y1),
    };
}
