import { useState, useEffect } from "react";
import Select from "react-select";
import DatePicker from "./DatePicker";
import SeasonSelector from "./SeasonSelector";
import FieldSpinner from "./FieldSpinner";
import "bootstrap-icons/font/bootstrap-icons.css";

export default function PatchPanel({ patch, members, onUpdate, onDelete, selectedSeason, onSeasonChange }) {
    const [form, setForm] = useState(null);
    const [savingField, setSavingField] = useState(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        if (!patch) {
            setForm(null);
            return;
        }
        setForm({
            member_id: patch.member?.id ?? "",
            description: patch.description ?? "",
            planted_at: patch.planted_at ?? "",
            harvested_at: patch.harvested_at ?? "",
            season: patch.season ?? new Date().getFullYear(),
        });
    }, [patch]);

    const seasonSelector = (
        <SeasonSelector selectedSeason={selectedSeason} onSeasonChange={onSeasonChange} />
    );

    if (!patch || !form) {
        return (
            <div>
                {seasonSelector}
                <div className="p-4 text-gray-400 text-sm">
                    Vyber nebo nakresli záhonek.
                </div>
            </div>
        );
    }

    function handleChange(e) {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    }

    async function handleBlur(e) {
        const { name, value } = e.target;
        const payload = { ...form, [name]: value };
        const attributes = {
            description: payload.description,
            planted_at: payload.planted_at || null,
            harvested_at: payload.harvested_at || null,
            season: Number(payload.season),
            member: payload.member_id ? members.find((m) => String(m.id) === String(payload.member_id)) ?? null : null,
        };
        setSavingField(name);
        try {
            await onUpdate(patch.documentId, attributes);
        } finally {
            setSavingField(null);
        }
    }

    /**
     * Handles date selection from react-datepicker for planted_at and harvested_at fields.
     *
     * A dedicated handler is needed because react-datepicker works with Date objects, while
     * the form state and API expect ISO date strings (YYYY-MM-DD). Additionally, the picker
     * is displayed without a year (d. MMMM format), so the year must always be injected from
     * the patch's own season — the Date object returned by the picker cannot be trusted to
     * carry the correct year (it reflects whichever year the calendar was navigated to).
     *
     * @param {string} name - Field name: "planted_at" or "harvested_at"
     * @param {string|null} iso - ISO date string (YYYY-MM-DD) from DatePicker, or null if cleared
     */
    async function handleDateChange(name, iso) {
        const updated = { ...form, [name]: iso ?? "" };
        setForm(updated);
        setSavingField(name);
        try {
            await onUpdate(patch.documentId, {
                description: updated.description,
                planted_at: updated.planted_at || null,
                harvested_at: updated.harvested_at || null,
                season: Number(updated.season),
                member: updated.member_id ? members.find((m) => String(m.id) === String(updated.member_id)) ?? null : null,
            });
        } finally {
            setSavingField(null);
        }
    }

    async function handleMemberChange(option) {
        const value = option ? String(option.value) : "";
        setForm((prev) => ({ ...prev, member_id: value }));
        setSavingField("member_id");
        try {
            await onUpdate(patch.documentId, {
                description: form.description,
                planted_at: form.planted_at || null,
                harvested_at: form.harvested_at || null,
                season: Number(form.season),
                member: value ? members.find((m) => String(m.id) === String(value)) ?? null : null,
            });
        } finally {
            setSavingField(null);
        }
    }

    return (
        <>
            {seasonSelector}
            <div className="p-4 flex flex-col gap-4">
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-gray-800 select-none">Záhonek</h2>
                    <button
                        onClick={async () => {
                            setDeleting(true);
                            try {
                                await onDelete(patch.documentId);
                            } finally {
                                setDeleting(false);
                            }
                        }}
                        disabled={savingField !== null || deleting}
                        className="hover:cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        aria-label="Delete patch"
                    >
                        {deleting ? (
                            <FieldSpinner />
                        ) : (
                            <span className="group">
                                <i className="bi bi-trash group-hover:hidden text-2xl" />
                                <i className="bi bi-trash-fill hidden group-hover:inline text-2xl" />
                            </span>
                        )}
                    </button>
                </div>

                <label className="flex flex-col gap-1 text-sm text-gray-600 select-none">
                    <span className="flex items-center gap-2">
                        Pěstitel/ka
                        {savingField === "member_id" && <FieldSpinner />}
                    </span>
                    <Select
                        isClearable
                        isDisabled={savingField === "member_id"}
                        placeholder="— nepřiřazeno —"
                        value={members
                            .filter((m) => String(m.id) === String(form.member_id))
                            .map((m) => ({ value: m.id, label: m.name, color: m.color }))[0] ?? null}
                        options={members.map((m) => ({ value: m.id, label: m.name, color: m.color }))}
                        onChange={handleMemberChange}
                        formatOptionLabel={(opt) => (
                            <span className="flex items-center gap-2">
                                <span
                                    className="inline-block w-3 h-3 rounded-sm shrink-0"
                                    style={{ backgroundColor: opt.color }}
                                />
                                {opt.label}
                            </span>
                        )}
                    />
                </label>

                <label className="flex flex-col gap-1 text-sm text-gray-600 select-none">
                    <span className="flex items-center gap-2">
                        Popis
                        {savingField === "description" && <FieldSpinner />}
                    </span>
                    <textarea
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        disabled={savingField === "description"}
                        rows={3}
                        className="border border-gray-300 rounded px-2 py-1 text-gray-800 resize-none disabled:opacity-50"
                    />
                </label>

                <label className="flex flex-col gap-1 text-sm text-gray-600 select-none">
                    <span className="flex items-center gap-2">
                        Sezona
                        {savingField === "season" && <FieldSpinner />}
                    </span>
                    <input
                        type="number"
                        name="season"
                        value={form.season}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        disabled={savingField === "season"}
                        className="border border-gray-300 rounded px-2 py-1 text-gray-800 disabled:opacity-50"
                    />
                </label>

                <DatePicker
                    label="Zasazeno dne"
                    value={form.planted_at}
                    season={form.season}
                    placeholder="Kdypa jsme to zasadili?"
                    onChange={(iso) => handleDateChange("planted_at", iso)}
                    saving={savingField === "planted_at"}
                />

                <DatePicker
                    label="Sklizeno dne"
                    value={form.harvested_at}
                    season={form.season}
                    placeholder="Kdypa jsme to sklidili?"
                    onChange={(iso) => handleDateChange("harvested_at", iso)}
                    saving={savingField === "harvested_at"}
                />
            </div>
        </>
    );
}