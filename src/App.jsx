import usePatches from "./hooks/usePatches";
import GardenMap from "./components/GardenMap";
import PatchPanel from "./components/PatchPanel";

function App() {
    const {
        patches,
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
        retry,
    } = usePatches();

    return (
        <div className="flex h-screen w-screen overflow-hidden">
            <GardenMap
                patches={patches}
                selectedPatch={selectedPatch}
                onSelect={setSelectedPatch}
                onCreate={createPatch}
                loading={loading}
                error={error}
                onRetry={retry}
            />
            <div className="w-80 shrink-0 border-l border-gray-200 bg-white overflow-y-auto">
                <PatchPanel
                    patch={selectedPatch}
                    members={members}
                    onUpdate={updatePatch}
                    onDelete={deletePatch}
                    selectedSeason={selectedSeason}
                    onSeasonChange={setSelectedSeason}
                />
            </div>
        </div>
    );
}

export default App;