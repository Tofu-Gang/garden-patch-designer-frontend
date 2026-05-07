import { useState, useEffect, useCallback } from "react";
import axios from "axios";

/** Axios instance with the Strapi base URL and JSON headers pre-configured. */
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL ?? "",
    headers: { "Content-Type": "application/json" },
});

/**
 * Normalizes a Strapi v5 resource object for use in the app.
 * Strapi v5 returns fields flat (no attributes wrapper), so this is currently
 * a pass-through. Kept as a named function so future API changes only need
 * updating here.
 * @param {object} resource - A Strapi v5 resource object.
 * @returns {object} The resource unchanged.
 */
function normalizeResource(resource) {
    return resource;
}

/**
 * Thin wrapper around the axios instance.
 * @param {string} path - API path to request.
 * @param {object} options - Request options (method, body as JSON string).
 * @returns {Promise<object>} Parsed response data.
 */
async function apiFetch(path, options = {}) {
    const { method = "GET", body, ...rest } = options;
    const response = await api.request({ url: path, method, data: body ? JSON.parse(body) : undefined, ...rest });
    return response.data;
}

/**
 * Manages the full patch lifecycle: fetching, creating, updating, deleting,
 * and tracking which patch is currently selected.
 * @returns {{ patches, members, selectedPatch, setSelectedPatch, createPatch, updatePatch, deletePatch }}
 */
export default function usePatches() {
    const [patches, setPatches] = useState([]);
    const [members, setMembers] = useState([]);
    const [selectedPatch, setSelectedPatch] = useState(null);
    const [selectedSeason, setSelectedSeasonRaw] = useState(new Date().getFullYear());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [retryCount, setRetryCount] = useState(0);

    function setSelectedSeason(season) {
        setSelectedSeasonRaw(season);
        setSelectedPatch(null);
    }

    /** Fetch all patches (with member relation) and all members on mount and on retry. */
    useEffect(() => {
        setLoading(true);
        setError(false);
        Promise.all([
            apiFetch("/api/patches?populate=member"),
            apiFetch("/api/members"),
        ])
            .then(([patchesData, membersData]) => {
                setPatches((patchesData.data ?? []).map(normalizeResource));
                setMembers((membersData.data ?? []).map(normalizeResource));
            })
            .catch(() => setError(true))
            .finally(() => setLoading(false));
    }, [retryCount]);

    /**
     * POSTs a new patch, appends it to the list, and auto-selects it so the
     * panel opens immediately without a separate selection step.
     * @param {object} attributes - Patch fields to create (x, y, width, height, season, etc.).
     * @returns {Promise<object>} The normalized created patch.
     */
    const createPatch = useCallback(async (attributes) => {
        const data = await apiFetch("/api/patches", {
            method: "POST",
            body: JSON.stringify({ data: { ...attributes, season: selectedSeason } }),
        });
        const created = normalizeResource(data.data);
        setPatches((previous) => [...previous, created]);
        setSelectedPatch(created);
        return created;
    }, [selectedSeason]);

    /**
     * PUTs updated attributes for an existing patch and keeps both the list
     * and the selected patch in sync with the server response.
     * @param {number} id - ID of the patch to update.
     * @param {object} attributes - Fields to update.
     * @returns {Promise<object>} The normalized updated patch.
     */
    const updatePatch = useCallback(async (documentId, attributes) => {
        const data = await apiFetch(`/api/patches/${documentId}?populate=member`, {
            method: "PUT",
            body: JSON.stringify({ data: attributes }),
        });
        const updated = normalizeResource(data.data);
        setPatches((previous) => previous.map((patch) => (patch.documentId === documentId ? updated : patch)));
        setSelectedPatch((previous) => (previous?.documentId === documentId ? updated : previous));
        return updated;
    }, []);

    /**
     * DELETEs a patch and clears the selection if the deleted patch was active.
     * @param {string} documentId - documentId of the patch to delete.
     * @returns {Promise<void>}
     */
    const deletePatch = useCallback(async (documentId) => {
        await apiFetch(`/api/patches/${documentId}`, { method: "DELETE" });
        setPatches((previous) => previous.filter((patch) => patch.documentId !== documentId));
        setSelectedPatch((previous) => (previous?.documentId === documentId ? null : previous));
    }, []);

    const filteredPatches = patches.filter((patch) => patch.season === selectedSeason);

    return {
        patches: filteredPatches,
        members,
        selectedPatch,
        setSelectedPatch,
        createPatch,
        updatePatch,
        deletePatch,
        selectedSeason,
        setSelectedSeason,
        loading,
        error,
        retry: () => setRetryCount((c) => c + 1),
    };
}