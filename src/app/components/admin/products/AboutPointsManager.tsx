"use client";

import { useState } from "react";
import { Plus, Trash } from "lucide-react";

export default function AboutPointsManager({ initialPoints }: { initialPoints?: string[] }) {
    const [points, setPoints] = useState(initialPoints || []);
    const [newPoint, setNewPoint] = useState("");

    const addPoint = () => {
        if (!newPoint.trim()) return;
        setPoints([...points, newPoint.trim()]);
        setNewPoint("");
    };

    const removePoint = (index: number) => {
        setPoints(points.filter((_, i) => i !== index));
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addPoint();
        }
    };

    return (
        <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">About Points</label>

            <div className="space-y-2 mb-3">
                {points.map((p, i) => (
                    <div
                        key={i}
                        className="flex items-center justify-between p-2 bg-[#2a3038] border border-[#3a404a] rounded-lg text-white"
                    >
                        <span>{p}</span>
                        <button type="button" onClick={() => removePoint(i)} className="text-red-400 hover:text-red-500 cursor-pointer">
                            <Trash size={16} />
                        </button>
                    </div>
                ))}
            </div>

            <div className="flex items-center gap-2 mb-3">
                <input
                    type="text"
                    placeholder="Add about point"
                    value={newPoint}
                    onChange={(e) => setNewPoint(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 px-3 py-2 bg-[#2a3038] border border-[#3a404a] rounded-lg text-white text-sm"
                />
                <button
                    type="button"
                    onClick={addPoint}
                    className="p-2 bg-[#ffb100] text-black rounded-lg hover:bg-[#ffca42] cursor-pointer"
                >
                    <Plus size={18} />
                </button>
            </div>

            <input type="hidden" name="about" value={JSON.stringify(points)} />
        </div>
    );
}
