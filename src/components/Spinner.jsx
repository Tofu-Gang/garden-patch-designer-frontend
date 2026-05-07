import { useState, useEffect } from "react";

/**
 * Full-area loading overlay with a spinner and message.
 * Intended to be placed inside a relative-positioned container.
 *
 * After `slowThreshold` ms the message switches to `slowMessage` to inform
 * the user that the load is taking longer than usual (e.g. Render.com cold start).
 *
 * @param {string} message - Text shown initially below the spinner
 * @param {string} slowMessage - Text shown after the slow threshold is reached
 * @param {number} slowThreshold - Ms before switching to slowMessage (default 5000)
 */
export default function Spinner({ message, slowMessage, slowThreshold = 5000 }) {
    const [isSlow, setIsSlow] = useState(false);

    useEffect(() => {
        if (!slowMessage) return;
        const timer = setTimeout(() => setIsSlow(true), slowThreshold);
        return () => clearTimeout(timer);
    }, [slowMessage, slowThreshold]);

    const displayMessage = isSlow ? slowMessage : message;

    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/60 z-10">
            <div className="w-16 h-16 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
            {displayMessage && <p className="mt-4 text-gray-600 text-sm">{displayMessage}</p>}
        </div>
    );
}