import usePatches from "./hooks/usePatches";
import GardenMap from "./components/GardenMap";

function App() {
    const {
        patches,
        members,
        selectedPatch,
        setSelectedPatch,
        createPatch,
        updatePatch,
        deletePatch,
    } = usePatches();

    console.log("members", members);
    console.log("patches", patches);

    return (
        <div className="flex h-screen w-screen overflow-hidden">
            <GardenMap
                patches={patches}
                selectedPatch={selectedPatch}
                onSelect={setSelectedPatch}
                onCreate={createPatch}
            />
            <div className="w-80 shrink-0 border-l border-gray-200 bg-white overflow-y-auto">
                {/* PatchPanel — Phase 3 */}
                <span className="text-gray-400 p-4 block">Patch panel</span>
            </div>
        </div>
    );
}

export default App;