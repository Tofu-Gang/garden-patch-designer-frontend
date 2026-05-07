import "bootstrap-icons/font/bootstrap-icons.css";

/**
 * Displays the current season with prev/next buttons to navigate between years.
 *
 * @param {number} selectedSeason - The currently active season year
 * @param {function} onSeasonChange - Called with the new season year when prev/next is clicked
 */
export default function SeasonSelector({ selectedSeason, onSeasonChange }) {
    return (
        <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200">
            <button
                onClick={() => onSeasonChange(selectedSeason - 1)}
                className="hover:cursor-pointer"
                aria-label="Previous season"
            >
                <span className="group">
                    <i className="bi bi-arrow-left-circle group-hover:hidden text-2xl" />
                    <i className="bi bi-arrow-left-circle-fill hidden group-hover:inline text-2xl" />
                </span>
            </button>
            <span className="flex-1 text-center font-medium text-gray-800 select-none">{selectedSeason}</span>
            <button
                onClick={() => onSeasonChange(selectedSeason + 1)}
                className="hover:cursor-pointer"
                aria-label="Next season"
            >
                <span className="group">
                    <i className="bi bi-arrow-right-circle group-hover:hidden text-2xl" />
                    <i className="bi bi-arrow-right-circle-fill hidden group-hover:inline text-2xl" />
                </span>
            </button>
        </div>
    );
}