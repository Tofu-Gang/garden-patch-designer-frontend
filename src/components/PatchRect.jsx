/**
 * Renders a single patch as an SVG <rect>, visually highlighted when selected.
 * Intended to be used inside the GardenMap SVG overlay.
 * All coordinates and dimensions are expressed as percentages of the SVG container.
 *
 * @param {object}   patch          - The patch object to render.
 * @param {boolean}  isSelected     - Whether this patch is currently selected.
 * @param {Function} onSelect       - Called with the patch when the rect is clicked.
 * @returns {JSX.Element}
 */
export default function PatchRect({ patch, isSelected, onSelect }) {
    /**
     * Handles click on the rect, stopping propagation so the SVG background
     * does not also receive the event and trigger a deselect.
     * @param {React.MouseEvent} event
     */
    function handleClick(event) {
        event.stopPropagation();
        onSelect(patch);
    }

    return (
        <rect
            x={`${patch.x}%`}
            y={`${patch.y}%`}
            width={`${patch.width}%`}
            height={`${patch.height}%`}
            fill={isSelected ? "rgba(59, 130, 246, 0.4)" : "rgba(59, 130, 246, 0.25)"}
            stroke={isSelected ? "#1d4ed8" : "#3b82f6"}
            strokeWidth={isSelected ? 2 : 1}
            style={{ cursor: "pointer" }}
            onClick={handleClick}
        />
    );
}