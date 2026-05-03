import { useState, useEffect, useCallback } from "react";
import axios from "axios";

// Axios instance with the Strapi base URL and JSON headers pre-configured.
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL ?? "",
    headers: { "Content-Type": "application/json" },
});

// Thin wrapper around the axios instance. Accepts the same options shape as
// the native fetch API (method, body as a JSON string) so call sites don't
// need to change when switching HTTP clients.
async function apiFetch(path, options = {}) {
    const { method = "GET", body, ...rest } = options;
    const res = await api.request({ url: path, method, data: body ? JSON.parse(body) : undefined, ...rest });
    return res.data;
}

// Manages the full patch lifecycle: fetching, creating, updating, deleting,
// and tracking which patch is currently selected.
export default function usePatches() {
    const [patches, setPatches] = useState([]);
    const [members, setMembers] = useState([]);
    const [selectedPatch, setSelectedPatch] = useState(null);

    // Fetch all patches (with member relation) and all members on mount.
    useEffect(() => {
        apiFetch("/api/patches?populate=member")
            .then((data) => setPatches(data.data ?? []))
            .catch(console.error);
        apiFetch("/api/members")
            .then((data) => setMembers(data.data ?? []))
            .catch(console.error);
    }, []);

    // POST a new patch, append it to the list, and auto-select it so the
    // panel opens immediately without a separate selection step.
    const createPatch = useCallback(async (attrs) => {
        const data = await apiFetch("/api/patches", {
            method: "POST",
            body: JSON.stringify({ data: attrs }),
        });
        const created = data.data;
        setPatches((prev) => [...prev, created]);
        setSelectedPatch(created);
        return created;
    }, []);

    // PUT updated attributes for an existing patch and keep both the list
    // and the selected patch in sync with the server response.
    const updatePatch = useCallback(async (id, attrs) => {
        const data = await apiFetch(`/api/patches/${id}`, {
            method: "PUT",
            body: JSON.stringify({ data: attrs }),
        });
        const updated = data.data;
        setPatches((prev) => prev.map((p) => (p.id === id ? updated : p)));
        setSelectedPatch((prev) => (prev?.id === id ? updated : prev));
        return updated;
    }, []);

    // DELETE a patch and clear the selection if the deleted patch was active.
    const deletePatch = useCallback(async (id) => {
        await apiFetch(`/api/patches/${id}`, { method: "DELETE" });
        setPatches((prev) => prev.filter((p) => p.id !== id));
        setSelectedPatch((prev) => (prev?.id === id ? null : prev));
    }, []);

    return {
        patches,
        members,
        selectedPatch,
        setSelectedPatch,
        createPatch,
        updatePatch,
        deletePatch,
    };
}