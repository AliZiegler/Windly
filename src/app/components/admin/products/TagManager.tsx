"use client";

import { useState } from "react";
import { Plus, Trash } from "lucide-react";

export default function TagManager({ initialTags }: { initialTags?: string[] }) {
    const [tags, setTags] = useState(initialTags || []);
    const [newTag, setNewTag] = useState("");

    const addTag = () => {
        if (!newTag.trim()) return;
        setTags([...tags, newTag.trim()]);
        setNewTag("");
    };

    const removeTag = (index: number) => {
        setTags(tags.filter((_, i) => i !== index));
    };
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addTag();
        }
    };

    return (
        <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Tags</label>

            <div className="flex flex-wrap gap-2 mb-3">
                {tags.map((t, i) => (
                    <div
                        key={i}
                        className="flex items-center gap-2 px-3 py-1 bg-[#2a3038] border border-[#3a404a] rounded-full text-white"
                    >
                        <span>{t}</span>
                        <button type="button" onClick={() => removeTag(i)} className="text-red-400 hover:text-red-500 cursor-pointer">
                            <Trash size={14} />
                        </button>
                    </div>
                ))}
            </div>

            <div className="flex items-center gap-2 mb-3">
                <input
                    type="text"
                    placeholder="Add tag"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 px-3 py-2 bg-[#2a3038] border border-[#3a404a] rounded-lg text-white text-sm"
                />
                <button
                    type="button"
                    onClick={addTag}
                    className="p-2 bg-[#ffb100] text-black rounded-lg hover:bg-[#ffca42] cursor-pointer"
                >
                    <Plus size={18} />
                </button>
            </div>

            <input type="hidden" name="tags" value={JSON.stringify(tags)} />
        </div>
    );
}
