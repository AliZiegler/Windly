"use client";

import { useState } from "react";
import { Plus, Trash } from "lucide-react";

export default function ColorManager({ initialColors }: { initialColors?: { colorName: string; colorHex: string }[] }) {
    const [colors, setColors] = useState(initialColors || []);
    const [newColor, setNewColor] = useState({ colorName: "", colorHex: "#000000" });

    const addColor = () => {
        if (!newColor.colorName.trim()) return;
        setColors([...colors, newColor]);
        setNewColor({ colorName: "", colorHex: "#000000" });
    };

    const removeColor = (index: number) => {
        setColors(colors.filter((_, i) => i !== index));
    };
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addColor();
        }
    };

    return (
        <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Colors</label>

            {/* Color list */}
            <div className="space-y-2 mb-3">
                {colors.map((c, i) => (
                    <div
                        key={i}
                        className="flex items-center justify-between p-2 bg-[#2a3038] rounded-lg border border-[#3a404a]"
                    >
                        <div className="flex items-center gap-3">
                            <div
                                className="w-6 h-6 rounded border"
                                style={{ backgroundColor: c.colorHex }}
                            />
                            <span className="text-white">{c.colorName}</span>
                            <span className="text-xs text-gray-400">{c.colorHex}</span>
                        </div>
                        <button
                            type="button"
                            onClick={() => removeColor(i)}
                            className="text-red-400 hover:text-red-500 cursor-pointer"
                        >
                            <Trash size={16} />
                        </button>
                    </div>
                ))}
            </div>

            {/* Add new color */}
            <div className="flex items-center gap-2 mb-3">
                <input
                    type="text"
                    placeholder="Color name"
                    value={newColor.colorName}
                    onChange={(e) => setNewColor({ ...newColor, colorName: e.target.value })}
                    onKeyDown={handleKeyDown}
                    className="flex-1 px-3 py-2 bg-[#2a3038] border border-[#3a404a] rounded-lg text-white text-sm"
                />
                <input
                    type="color"
                    value={newColor.colorHex}
                    onChange={(e) => setNewColor({ ...newColor, colorHex: e.target.value })}
                    className="w-12 h-10 rounded cursor-pointer"
                />
                <button
                    type="button"
                    onClick={addColor}
                    className="p-2 bg-[#ffb100] text-black rounded-lg hover:bg-[#ffca42] cursor-pointer"
                >
                    <Plus size={18} />
                </button>
            </div>

            {/* Hidden input with JSON for form submission */}
            <input type="hidden" name="colors" value={JSON.stringify(colors)} />
        </div>
    );
}
