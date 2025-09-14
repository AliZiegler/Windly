"use client"
import { useState } from "react";
import { updateUserField, setUserRole } from "@/app/actions/UserActions";

type EditableFieldProps = {
    label: string;
    field: 'name' | 'phone' | 'birthday' | 'gender' | 'role';
    value: string | null;
    className?: string;
    inputType?: 'text' | 'tel' | 'date' | 'email';
    placeholder?: string;
    options?: string[];
    showEditButton?: boolean;
}

export default function EditableField({
    label,
    field,
    value,
    className,
    inputType = 'text',
    placeholder,
    options,
    showEditButton = true
}: EditableFieldProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [fieldValue, setFieldValue] = useState(value || "");
    const [isSaving, setIsSaving] = useState(false);

    async function handleSave() {
        setIsSaving(true);
        try {
            let result;

            if (field === 'role') {
                // Use setUserRole for role changes
                result = await setUserRole(fieldValue as 'user' | 'seller');
            } else {
                // Use updateUserField for other fields
                result = await updateUserField(field, fieldValue);
            }

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

    // Define role options (only user and seller are changeable)
    const roleOptions = field === 'role' ? ['user', 'seller'] : options;

    return (
        <div className={className}>
            <div className="flex-1">
                <h2 className="text-lg font-light text-[#FCECDD] mb-1">{label}</h2>
                {isEditing ? (
                    <div className="space-y-3">
                        {(roleOptions || options) ? (
                            <select
                                value={fieldValue}
                                onChange={(e) => setFieldValue(e.target.value)}
                                className="w-full sm:w-auto bg-[#2d323a] text-[#FCECDD] font-bold outline-none border-b-2 
                                border-[#FCECDD] focus:border-golden transition-colors px-2 py-1"
                            >
                                {(roleOptions || options)!.map(option => (
                                    <option key={option} value={option} className="bg-[#2d323a] text-[#FCECDD]">
                                        {option.charAt(0).toUpperCase() + option.slice(1)}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <div className="flex items-center gap-1">
                                {field === "phone" && (
                                    <span className="text-[#FCECDD] font-bold">+964 </span>
                                )}
                                <input
                                    type={inputType}
                                    value={fieldValue}
                                    onChange={(e) => setFieldValue(e.target.value)}
                                    placeholder={placeholder}
                                    className="w-full sm:w-auto bg-transparent text-[#FCECDD] font-bold outline-none 
                                        border-b-2 border-[#FCECDD] focus:border-golden transition-colors px-2 py-1"
                                />
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row gap-2">
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="bg-golden/80 hover:bg-golden w-full sm:w-20 h-9 rounded-md font-bold 
                                cursor-pointer disabled:opacity-50 transition-colors text-[#2d323a] disabled:bg-golden/50"
                            >
                                {isSaving ? "..." : "Save"}
                            </button>
                            <button
                                onClick={handleCancel}
                                disabled={isSaving}
                                className="bg-[#393e46] hover:bg-[#4a4f58] border border-[#FCECDD]/20 w-full sm:w-20 h-9 rounded-md font-bold 
                                cursor-pointer disabled:opacity-50 transition-colors text-[#FCECDD]"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                ) : (
                    <p className="text-[#FCECDD] font-bold">
                        {field === "phone" && fieldValue && "+964 "}
                        {field === "role" && fieldValue ?
                            fieldValue.charAt(0).toUpperCase() + fieldValue.slice(1) :
                            fieldValue || "-"
                        }
                    </p>
                )}
            </div>

            {!isEditing && showEditButton && (
                <div className="flex-shrink-0 mt-4 sm:mt-0">
                    <button
                        onClick={handleEdit}
                        className="bg-golden/80 hover:bg-golden w-full sm:w-20 h-9 rounded-md font-bold 
                        cursor-pointer transition-colors text-midnight"
                    >
                        Edit
                    </button>
                </div>
            )}
        </div>
    );
}
