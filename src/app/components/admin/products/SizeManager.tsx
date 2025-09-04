"use client";

import { useState } from "react";
import { Plus, Trash } from "lucide-react";

export default function SizeManager({ initialSizes }: { initialSizes?: string[] }) {
    const [sizes, setSizes] = useState(initialSizes || []);
    const [newSize, setNewSize] = useState("");

    const addSize = () => {
        if (!newSize.trim()) return;
        setSizes([...sizes, newSize.trim()]);
        setNewSize("");
    };

    const removeSize = (index: number) => {
        setSizes(sizes.filter((_, i) => i !== index));
    };
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addSize();
        }
    };

    return (
        <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Sizes</label>

            {/* Sizes list */}
            <div className="flex flex-wrap gap-2 mb-3">
                {sizes.map((s, i) => (
                    <div
                        key={i}
                        className="flex items-center gap-2 px-3 py-1 bg-[#2a3038] border border-[#3a404a] rounded-full text-white"
                    >
                        <span>{s}</span>
                        <button type="button" onClick={() => removeSize(i)} className="text-red-400 hover:text-red-500 cursor-pointer">
                            <Trash size={14} />
                        </button>
                    </div>
                ))}
            </div>

            {/* Add new size */}
            <div className="flex items-center gap-2 mb-3">
                <input
                    type="text"
                    placeholder="Add size (e.g. M)"
                    value={newSize}
                    onChange={(e) => setNewSize(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 px-3 py-2 bg-[#2a3038] border border-[#3a404a] rounded-lg text-white text-sm"
                />
                <button
                    type="button"
                    onClick={addSize}
                    className="p-2 bg-[#ffb100] text-black rounded-lg hover:bg-[#ffca42] cursor-pointer"
                >
                    <Plus size={18} />
                </button>
            </div>

            <input type="hidden" name="sizes" value={JSON.stringify(sizes)} />
        </div>
    );
}
