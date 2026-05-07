import ReactDatePicker, { registerLocale } from "react-datepicker";
import { cs } from "date-fns/locale";
import { format } from "date-fns";
import "bootstrap-icons/font/bootstrap-icons.css";
import FieldSpinner from "./FieldSpinner";

// Required for react-datepicker to format month/day names in Czech
registerLocale("cs", cs);

/**
 * A season-scoped date picker showing only day and month (no year).
 * The year is always injected from `season` on save, regardless of what
 * the calendar internally navigated to.
 *
 * @param {string} label - Field label shown above the input
 * @param {string|null} value - ISO date string (YYYY-MM-DD) or empty string
 * @param {number} season - The patch season year; used as the year for min/max and saved dates
 * @param {string} placeholder - Placeholder text shown when no date is selected
 * @param {function} onChange - Called with an ISO date string or null when date changes
 * @param {boolean} saving - When true, disables the picker and shows an inline spinner
 */
export default function DatePicker({ label, value, season, placeholder, onChange, saving }) {
    const selectedDate = value ? new Date(value + "T00:00:00") : null;
    const seasonYear = Number(season);

    function handleChange(date) {
        if (!date) {
            onChange(null);
            return;
        }
        onChange(format(new Date(seasonYear, date.getMonth(), date.getDate()), "yyyy-MM-dd"));
    }

    return (
        <label className="flex flex-col gap-1 text-sm text-gray-600 select-none">
            <span className="flex items-center gap-2">
                {label}
                {saving && <FieldSpinner />}
            </span>
            <ReactDatePicker
                disabled={saving}
                locale="cs"
                dateFormat="d. MMMM"
                selected={selectedDate}
                onChange={handleChange}
                placeholderText={placeholder}
                openToDate={selectedDate ?? new Date(seasonYear, 0, 1)}
                minDate={new Date(seasonYear, 0, 1)}
                maxDate={new Date(seasonYear, 11, 31)}
                renderCustomHeader={({ monthDate, decreaseMonth, increaseMonth }) => (
                    <div className="flex items-center justify-between px-2 text-base">
                        <button onClick={decreaseMonth} className="hover:cursor-pointer">
                            <span className="group">
                                <i className="bi bi-arrow-left-circle group-hover:hidden text-2xl" />
                                <i className="bi bi-arrow-left-circle-fill hidden group-hover:inline text-2xl" />
                            </span>
                        </button>
                        <span>{format(monthDate, "LLLL", { locale: cs })}</span>
                        <button onClick={increaseMonth} className="hover:cursor-pointer">
                            <span className="group">
                                <i className="bi bi-arrow-right-circle group-hover:hidden text-2xl" />
                                <i className="bi bi-arrow-right-circle-fill hidden group-hover:inline text-2xl" />
                            </span>
                        </button>
                    </div>
                )}
                isClearable
                onChangeRaw={(e) => e.preventDefault()}
                className="border border-gray-300 rounded px-2 py-1 text-gray-800 w-full"
                wrapperClassName="w-full"
            />
        </label>
    );
}