"use client"
import { useState } from "react";
import { updateUserField } from "@/app/actions/UserActions";

interface EditableFieldProps {
    label: string;
    field: 'name' | 'phone' | 'birthday' | 'gender';
    value: string | null;
    className?: string;
    inputType?: 'text' | 'tel' | 'date' | 'email';
    placeholder?: string;
    options?: string[]; // For select fields like gender
}

export default function EditableField({
    label,
    field,
    value,
    className,
    inputType = 'text',
    placeholder,
    options
}: EditableFieldProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [fieldValue, setFieldValue] = useState(value || "");
    const [isSaving, setIsSaving] = useState(false);

    async function handleSave() {
        setIsSaving(true);
        try {
            const result = await updateUserField(field, fieldValue);

            if (result.success) {
                setIsEditing(false);
            } else {
                console.error('Failed to update field:', result.error);
                setFieldValue(value || "");
            }
        } catch (error) {
            console.error('Error updating field:', error);
            setFieldValue(value || "");
        } finally {
            setIsSaving(false);
        }
    }

    function handleCancel() {
        setFieldValue(value || "");
        setIsEditing(false);
    }

    function handleEdit() {
        setIsEditing(true);
    }

    return (
        <li className={className}>
            <span className="flex flex-col m-2.5">
                <h2 className="text-lg font-light">{label}</h2>
                {isEditing ? (
                    options ? (
                        <select
                            value={fieldValue}
                            onChange={(e) => setFieldValue(e.target.value)}
                            className="text-[#FCECDD] font-bold outline-none bg-transparent border-b border-[#FCECDD]"
                        >
                            <option value="">Select {label}</option>
                            {options.map(option => (
                                <option key={option} value={option} className="bg-[#393e46] text-[#FCECDD]">
                                    {option}
                                </option>
                            ))}
                        </select>
                    ) : (
                        <input
                            type={inputType}
                            value={fieldValue}
                            onChange={(e) => setFieldValue(e.target.value)}
                            placeholder={placeholder}
                            className="text-[#FCECDD] font-bold outline-none bg-transparent border-b border-[#FCECDD]"
                        />
                    )
                ) : (
                    <p className="text-[#FCECDD] font-bold">{fieldValue || "-"}</p>
                )}
            </span>
            <div className="flex gap-2 ml-auto">
                {isEditing ? (
                    <span className="pr-3 flex gap-3">
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="bg-[#32363d] w-20 h-9 rounded-md font-bold cursor-pointer disabled:opacity-50"
                        >
                            {isSaving ? "..." : "Save"}
                        </button>
                        <button
                            onClick={handleCancel}
                            disabled={isSaving}
                            className="bg-gray-500 w-20 h-9 rounded-md font-bold cursor-pointer disabled:opacity-50"
                        >
                            Cancel
                        </button>
                    </span>
                ) : (
                    <button
                        onClick={handleEdit}
                        className="bg-[#32363d] w-20 h-9 rounded-md font-bold cursor-pointer mr-3"
                    >
                        Edit
                    </button>
                )}
            </div>
        </li>
    );
}
