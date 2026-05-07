/**
 * Full-area error overlay shown when the backend is unreachable.
 * Intended to be placed inside a relative-positioned container.
 *
 * @param {function} onRetry - Called when the user clicks the retry button
 */
export default function ErrorOverlay({ onRetry }) {
    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/60 z-10 gap-4">
            <p className="text-gray-700 font-medium">Backend je nedostupný.</p>
            <button
                onClick={onRetry}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 hover:cursor-pointer"
            >
                Zkusit znovu
            </button>
        </div>
    );
}