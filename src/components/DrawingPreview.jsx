const COLOR = "var(--patch-default-color)";
const FILL_OPACITY = "var(--patch-fill-opacity)";
const STROKE_WIDTH = "var(--patch-stroke-width)";

/**
 * Live preview rectangle shown while the user is drawing a new patch.
 * Rendered inside the SVG overlay; coordinates are in percent units.
 *
 * @param {{ x: number, y: number, width: number, height: number }} rect - Preview rect in percent coords
 */
export default function DrawingPreview({ rect }) {
    return (
        <rect
            x={`${rect.x}%`}
            y={`${rect.y}%`}
            width={`${rect.width}%`}
            height={`${rect.height}%`}
            fill={COLOR}
            fillOpacity={FILL_OPACITY}
            stroke={COLOR}
            strokeWidth={STROKE_WIDTH}
            strokeDasharray="4 2"
            pointerEvents="none"
        />
    );
}