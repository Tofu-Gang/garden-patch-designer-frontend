const FILL_DEFAULT = "var(--patch-default-color)";
const FILL_OPACITY = "var(--patch-fill-opacity)";
const STROKE_WIDTH = "var(--patch-stroke-width)";
const STROKE_WIDTH_SELECTED = "var(--patch-stroke-width-selected)";

const HANDLE_R = 5;
const HANDLE_STROKE = 2;

/** Corner and edge handles, defined as fractions of patch width/height from the top-left. */
const HANDLES = [
    { id: "nw", cx: 0,   cy: 0   },
    { id: "n",  cx: 0.5, cy: 0   },
    { id: "ne", cx: 1,   cy: 0   },
    { id: "e",  cx: 1,   cy: 0.5 },
    { id: "se", cx: 1,   cy: 1   },
    { id: "s",  cx: 0.5, cy: 1   },
    { id: "sw", cx: 0,   cy: 1   },
    { id: "w",  cx: 0,   cy: 0.5 },
];

const HANDLE_CURSORS = {
    nw: "nw-resize", n: "n-resize", ne: "ne-resize",
    e:  "e-resize",  se: "se-resize", s: "s-resize",
    sw: "sw-resize", w: "w-resize",
};

/**
 * Renders a single patch as an SVG <rect> with optional drag handles when selected.
 * All coordinates are percentages of the SVG container. When an interaction is
 * active, `liveRect` overrides the patch's stored coordinates for live feedback.
 *
 * @param {object}   patch                - The patch object to render.
 * @param {boolean}  isSelected           - Whether this patch is currently selected.
 * @param {Function} onInteractionStart   - Called with (patch, handleId|null, event) on mousedown.
 *                                          handleId null means move; a handle id means resize.
 * @param {object}   [liveRect]           - Override rect during an active drag interaction.
 * @param {boolean}  [isSaving]           - When true, renders a spinner at the rect's center while the PUT is in flight.
 * @returns {JSX.Element}
 */
export default function PatchRect({ patch, isSelected, onInteractionStart, liveRect, isSaving }) {
    const display = liveRect ?? patch;
    const color = patch?.member?.color ?? FILL_DEFAULT;
    const spinnerCx = `${display.x + display.width / 2}%`;
    const spinnerCy = `${display.y + display.height / 2}%`;

    function handleRectMouseDown(event) {
        event.stopPropagation();
        onInteractionStart(patch, null, event);
    }

    return (
        <g>
            <rect
                x={`${display.x}%`}
                y={`${display.y}%`}
                width={`${display.width}%`}
                height={`${display.height}%`}
                fill={color}
                fillOpacity={FILL_OPACITY}
                stroke={color}
                strokeWidth={isSelected ? STROKE_WIDTH_SELECTED : STROKE_WIDTH}
                style={{ cursor: isSelected ? "move" : "pointer" }}
                onMouseDown={handleRectMouseDown}
            />
            {isSaving && (
                <circle
                    cx={spinnerCx}
                    cy={spinnerCy}
                    r={10}
                    fill="none"
                    stroke={color}
                    strokeWidth={3}
                    strokeDasharray="44 16"
                    strokeLinecap="round"
                    className="animate-spin"
                    style={{ transformOrigin: `${spinnerCx} ${spinnerCy}` }}
                />
            )}
            {isSelected && HANDLES.map(({ id, cx, cy }) => (
                <circle
                    key={id}
                    cx={`${display.x + display.width * cx}%`}
                    cy={`${display.y + display.height * cy}%`}
                    r={HANDLE_R}
                    fill="white"
                    stroke={color}
                    strokeWidth={HANDLE_STROKE}
                    style={{ cursor: HANDLE_CURSORS[id] }}
                    onMouseDown={(event) => {
                        event.stopPropagation();
                        onInteractionStart(patch, id, event);
                    }}
                />
            ))}
        </g>
    );
}