import { useRef, useState } from "react";
import { eventToPercent, normalizeRect, toPercent } from "../utils/coords";
import PatchRect from "./PatchRect";
import DrawingPreview from "./DrawingPreview";
import Spinner from "./Spinner";
import ErrorOverlay from "./ErrorOverlay";

const MIN_PATCH_SIZE_PERCENT = 2;

/** Pixel distance the pointer must move before a mousedown is treated as a drag. */
const DRAG_THRESHOLD_PX = 5;

/**
 * Computes the new rect when moving a patch by (dxPct, dyPct) percent, clamped to [0, 100].
 */
function applyMove(startRect, dxPct, dyPct) {
    return {
        x: Math.max(0, Math.min(100 - startRect.width, startRect.x + dxPct)),
        y: Math.max(0, Math.min(100 - startRect.height, startRect.y + dyPct)),
        width: startRect.width,
        height: startRect.height,
    };
}

/**
 * Computes the new rect when resizing via a named handle by (dxPct, dyPct) percent.
 * Enforces a minimum patch size of MIN_PATCH_SIZE_PERCENT on both axes.
 */
function applyResize(startRect, handle, dxPct, dyPct) {
    let { x, y, width, height } = startRect;

    if (handle.includes("w")) { x += dxPct; width -= dxPct; }
    if (handle.includes("e")) { width += dxPct; }
    if (handle.includes("n")) { y += dyPct; height -= dyPct; }
    if (handle.includes("s")) { height += dyPct; }

    if (width < MIN_PATCH_SIZE_PERCENT) {
        if (handle.includes("w")) x = startRect.x + startRect.width - MIN_PATCH_SIZE_PERCENT;
        width = MIN_PATCH_SIZE_PERCENT;
    }
    if (height < MIN_PATCH_SIZE_PERCENT) {
        if (handle.includes("n")) y = startRect.y + startRect.height - MIN_PATCH_SIZE_PERCENT;
        height = MIN_PATCH_SIZE_PERCENT;
    }

    return { x, y, width, height };
}

/**
 * Renders the garden map image with an absolutely-positioned SVG overlay for
 * drawing, selecting, moving, and resizing patches.
 *
 * @param {Array}    patches       - List of patch objects to render.
 * @param {object}   selectedPatch - The currently selected patch, or null.
 * @param {Function} onSelect      - Called with a patch (or null) when selection changes.
 * @param {Function} onCreate      - Called with { x, y, width, height } when a new patch is drawn.
 * @param {Function} onUpdate      - Called with (patch, { x, y, width, height }) after a move/resize drag.
 * @param {boolean}  loading       - When true, shows a spinner overlay while data is being fetched.
 * @param {boolean}  error         - When true, shows an error overlay indicating the backend is unreachable.
 * @param {Function} onRetry       - Called when the user clicks retry in the error overlay.
 * @returns {JSX.Element}
 */
export default function GardenMap({ patches, selectedPatch, onSelect, onCreate, onUpdate, loading, error, onRetry }) {
    const svgRef = useRef(null);

    const [drawStart, setDrawStart] = useState(null);
    const [previewRect, setPreviewRect] = useState(null);
    const [aspectRatio, setAspectRatio] = useState(undefined);
    const [creating, setCreating] = useState(false);

    /** documentId of the patch whose move/resize PUT is in flight, or null. */
    const [updatingPatchId, setUpdatingPatchId] = useState(null);

    /**
     * Active move/resize interaction, or null when idle.
     * {
     *   patch,
     *   handle: null (move) | string (resize handle id),
     *   startClientPos: { x, y },
     *   startRect: { x, y, width, height },
     *   currentRect: { x, y, width, height },
     *   isDragging: boolean,
     * }
     */
    const [interaction, setInteraction] = useState(null);

    function handleImageLoad(event) {
        const { naturalWidth, naturalHeight } = event.target;
        setAspectRatio(`${naturalWidth} / ${naturalHeight}`);
    }

    /** Called by PatchRect on mousedown — starts a potential move or resize. */
    function handleInteractionStart(patch, handle, event) {
        setInteraction({
            patch,
            handle,
            startClientPos: { x: event.clientX, y: event.clientY },
            startRect: { x: patch.x, y: patch.y, width: patch.width, height: patch.height },
            currentRect: { x: patch.x, y: patch.y, width: patch.width, height: patch.height },
            isDragging: false,
        });
    }

    function handleMouseDown(event) {
        if (event.target !== svgRef.current) return;
        const start = eventToPercent(event, svgRef.current.getBoundingClientRect());
        setDrawStart(start);
        setPreviewRect(null);
    }

    function handleMouseMove(event) {
        if (interaction) {
            const svgRect = svgRef.current.getBoundingClientRect();
            const dxPx = event.clientX - interaction.startClientPos.x;
            const dyPx = event.clientY - interaction.startClientPos.y;
            const nowDragging = interaction.isDragging || Math.hypot(dxPx, dyPx) >= DRAG_THRESHOLD_PX;

            if (nowDragging) {
                const dxPct = toPercent(dxPx, svgRect.width);
                const dyPct = toPercent(dyPx, svgRect.height);
                const currentRect = interaction.handle === null
                    ? applyMove(interaction.startRect, dxPct, dyPct)
                    : applyResize(interaction.startRect, interaction.handle, dxPct, dyPct);
                setInteraction((prev) => ({ ...prev, isDragging: true, currentRect }));
            }
            return;
        }

        if (!drawStart) return;
        const current = eventToPercent(event, svgRef.current.getBoundingClientRect());
        setPreviewRect(normalizeRect(drawStart.x, drawStart.y, current.x, current.y));
    }

    function handleMouseUp(event) {
        if (interaction) {
            if (interaction.isDragging) {
                setUpdatingPatchId(interaction.patch.documentId);
                onUpdate(interaction.patch, interaction.currentRect).finally(() => setUpdatingPatchId(null));
            } else {
                onSelect(interaction.patch);
            }
            setInteraction(null);
            return;
        }

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

    function handleMouseLeave() {
        if (interaction?.isDragging) {
            setUpdatingPatchId(interaction.patch.documentId);
            onUpdate(interaction.patch, interaction.currentRect).finally(() => setUpdatingPatchId(null));
            setInteraction(null);
        } else if (interaction) {
            setInteraction(null);
        }
        setDrawStart(null);
        setPreviewRect(null);
    }

    return (
        <div className="relative flex-1 bg-gray-100 flex items-center justify-center overflow-hidden select-none">
            {loading && (
                <Spinner
                    message="Načítám…"
                    slowMessage="Backend se probouzí, může to chvíli trvat…"
                    slowThreshold={3000}
                />
            )}
            {creating && (
                <Spinner message="Vytvářím…" />
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
                <svg
                    ref={svgRef}
                    className="absolute inset-0 w-full h-full cursor-crosshair"
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseLeave}
                >
                    {patches?.map((patch) => (
                        <PatchRect
                            key={patch.id}
                            patch={patch}
                            isSelected={selectedPatch?.id === patch.id}
                            onInteractionStart={handleInteractionStart}
                            liveRect={interaction?.patch?.id === patch.id && interaction.isDragging
                                ? interaction.currentRect
                                : undefined}
                            isSaving={updatingPatchId === patch.documentId}
                        />
                    ))}
                    {previewRect && <DrawingPreview rect={previewRect} />}
                </svg>
            </div>
        </div>
    );
}