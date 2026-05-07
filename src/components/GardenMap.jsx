import { useRef, useState } from "react";
import { eventToPercent, normalizeRect } from "../utils/coords";
import PatchRect from "./PatchRect";
import DrawingPreview from "./DrawingPreview";
import Spinner from "./Spinner";
import ErrorOverlay from "./ErrorOverlay";

/**
 * Minimum width and height (in percent) a drawn rectangle must reach before
 * it is treated as a new patch. Drags smaller than this are treated as
 * deselect clicks instead.
 */
const MIN_PATCH_SIZE_PERCENT = 2;

/**
 * Renders the garden map image with an absolutely-positioned SVG overlay for
 * drawing and selecting patches. Manages transient drawing state (start point
 * and live preview rect) locally; delegates persistence to the parent via
 * onSelect and onCreate callbacks.
 *
 * @param {Array}    patches       - List of patch objects to render.
 * @param {object}   selectedPatch - The currently selected patch, or null.
 * @param {Function} onSelect      - Called with a patch (or null) when selection changes.
 * @param {Function} onCreate      - Called with { x, y, width, height } when a new patch is drawn.
 * @param {boolean}  loading       - When true, shows a spinner overlay while data is being fetched.
 * @param {boolean}  error         - When true, shows an error overlay indicating the backend is unreachable.
 * @param {Function} onRetry       - Called when the user clicks retry in the error overlay.
 * @returns {JSX.Element}
 */
export default function GardenMap({ patches, selectedPatch, onSelect, onCreate, loading, error, onRetry }) {
    const svgRef = useRef(null);

    /** Percent coordinates of the mousedown anchor, or null when not drawing. */
    const [drawStart, setDrawStart] = useState(null);

    /** Live preview rect in percent coords { x, y, width, height }, or null. */
    const [previewRect, setPreviewRect] = useState(null);

    /** Aspect ratio derived from the image's natural dimensions once loaded. */
    const [aspectRatio, setAspectRatio] = useState(undefined);

    /** True while a new patch POST is in flight. */
    const [creating, setCreating] = useState(false);

    function handleImageLoad(event) {
        const { naturalWidth, naturalHeight } = event.target;
        setAspectRatio(`${naturalWidth} / ${naturalHeight}`);
    }

    /**
     * Begins a new drawing interaction on mousedown over the SVG background.
     * Ignored if the event target is a patch rect (those handle their own clicks).
     * @param {React.MouseEvent} event
     */
    function handleMouseDown(event) {
        if (event.target !== svgRef.current) return;
        const start = eventToPercent(event, svgRef.current.getBoundingClientRect());
        setDrawStart(start);
        setPreviewRect(null);
    }

    /**
     * Updates the live preview rect while the user is dragging.
     * @param {React.MouseEvent} event
     */
    function handleMouseMove(event) {
        if (!drawStart) return;
        const current = eventToPercent(event, svgRef.current.getBoundingClientRect());
        setPreviewRect(normalizeRect(drawStart.x, drawStart.y, current.x, current.y));
    }

    /**
     * Finalizes the drawing interaction on mouseup.
     * Creates a new patch if the drawn rect exceeds the minimum size threshold,
     * otherwise deselects the current patch.
     * @param {React.MouseEvent} event
     */
    function handleMouseUp(event) {
        if (!drawStart) return;
        const current = eventToPercent(event, svgRef.current.getBoundingClientRect());
        const rect = normalizeRect(drawStart.x, drawStart.y, current.x, current.y);

        if (rect.width >= MIN_PATCH_SIZE_PERCENT && rect.height >= MIN_PATCH_SIZE_PERCENT) {
            setCreating(true);
            onCreate(rect).finally(() => setCreating(false));
        } else {
            onSelect(null);
        }

        setDrawStart(null);
        setPreviewRect(null);
    }

    return (
        <div className="relative flex-1 bg-gray-100 flex items-center justify-center overflow-hidden select-none">
            {/*
              * Wrapper constrains the map + overlay to the correct aspect ratio so the
              * SVG overlay aligns exactly with the image at any viewport size.
              */}
            {loading && (
                <Spinner
                    message="Načítám…"
                    slowMessage="Backend se probouzí, může to chvíli trvat…"
                    slowThreshold={3000}
                />
            )}
            {creating && (
                <Spinner
                    message="Vytvářím…"
                />
            )}
            {!loading && error && <ErrorOverlay onRetry={onRetry} />}
            <div className="relative max-w-full max-h-full aspect-(--aspect-ratio)" style={{ "--aspect-ratio": aspectRatio }}>
                <img
                    src={"/garden-map.png"}
                    alt="Garden map"
                    className="w-full h-full object-contain"
                    draggable={false}
                    onLoad={handleImageLoad}
                />

                {/*
                  * SVG overlay — absolutely positioned to cover the image exactly.
                  * All patch rects and the drawing preview live here.
                  * cursor changes to crosshair to signal that drawing is available.
                  */}
                <svg
                    ref={svgRef}
                    className="absolute inset-0 w-full h-full cursor-crosshair"
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                >
                    {patches?.map((patch) => (
                        <PatchRect
                            key={patch.id}
                            patch={patch}
                            isSelected={selectedPatch?.id === patch.id}
                            onSelect={onSelect}
                        />
                    ))}

                    {/* Live drawing preview rect */}
                    {previewRect && <DrawingPreview rect={previewRect} />}
                </svg>
            </div>
        </div>
    );
}