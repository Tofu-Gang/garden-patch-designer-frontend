import { useState, useEffect } from "react";

export default function PatchPanel({ patch, members, onUpdate, onDelete, selectedSeason, onSeasonChange }) {
    const [form, setForm] = useState(null);

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
        <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200">
            <button
                onClick={() => onSeasonChange(selectedSeason - 1)}
                className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 text-gray-600"
                aria-label="Previous season"
            >
                ‹
            </button>
            <span className="flex-1 text-center font-medium text-gray-800">{selectedSeason}</span>
            <button
                onClick={() => onSeasonChange(selectedSeason + 1)}
                className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 text-gray-600"
                aria-label="Next season"
            >
                ›
            </button>
        </div>
    );

    if (!patch || !form) {
        return (
            <div>
                {seasonSelector}
                <div className="p-4 text-gray-400 text-sm">
                    Select or draw a patch to see its details.
                </div>
            </div>
        );
    }

    function handleChange(e) {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    }

    function handleBlur(e) {
        const { name, value } = e.target;
        const payload = { ...form, [name]: value };
        const attributes = {
            description: payload.description,
            planted_at: payload.planted_at || null,
            harvested_at: payload.harvested_at || null,
            season: Number(payload.season),
            member: payload.member_id ? { id: Number(payload.member_id) } : null,
        };
        onUpdate(patch.documentId, attributes);
    }

    function handleMemberChange(e) {
        const value = e.target.value;
        setForm((prev) => ({ ...prev, member_id: value }));
        onUpdate(patch.documentId, {
            description: form.description,
            planted_at: form.planted_at || null,
            harvested_at: form.harvested_at || null,
            season: Number(form.season),
            member: value ? { id: Number(value) } : null,
        });
    }

    return (
        <div>
        {seasonSelector}
        <div className="p-4 flex flex-col gap-4">
            <h2 className="font-semibold text-gray-800">Patch #{patch.id}</h2>

            <label className="flex flex-col gap-1 text-sm text-gray-600">
                Member
                <select
                    name="member_id"
                    value={form.member_id}
                    onChange={handleMemberChange}
                    className="border border-gray-300 rounded px-2 py-1 text-gray-800"
                >
                    <option value="">— unassigned —</option>
                    {members.map((m) => (
                        <option key={m.id} value={m.id}>
                            {m.name}
                        </option>
                    ))}
                </select>
            </label>

            <label className="flex flex-col gap-1 text-sm text-gray-600">
                Description
                <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    rows={3}
                    className="border border-gray-300 rounded px-2 py-1 text-gray-800 resize-none"
                />
            </label>

            <label className="flex flex-col gap-1 text-sm text-gray-600">
                Season
                <input
                    type="number"
                    name="season"
                    value={form.season}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="border border-gray-300 rounded px-2 py-1 text-gray-800"
                />
            </label>

            <label className="flex flex-col gap-1 text-sm text-gray-600">
                Planted at
                <input
                    type="date"
                    name="planted_at"
                    value={form.planted_at ?? ""}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="border border-gray-300 rounded px-2 py-1 text-gray-800"
                />
            </label>

            <label className="flex flex-col gap-1 text-sm text-gray-600">
                Harvested at
                <input
                    type="date"
                    name="harvested_at"
                    value={form.harvested_at ?? ""}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="border border-gray-300 rounded px-2 py-1 text-gray-800"
                />
            </label>

            <button
                onClick={() => onDelete(patch.documentId)}
                className="mt-2 px-3 py-2 rounded bg-red-600 text-white text-sm hover:bg-red-700"
            >
                Delete patch
            </button>
        </div>
        </div>
    );
}