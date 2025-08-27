"use client"

interface ReadOnlyUserFieldProps {
    label: string;
    field: 'name' | 'phone' | 'birthday' | 'gender';
    value: string | null;
    className?: string;
}

export default function ReadOnlyUserField({
    label,
    field,
    value,
    className,
}: ReadOnlyUserFieldProps) {
    return (
        <div className={className}>
            <div className="flex-1">
                <h2 className="text-lg font-light text-[#FCECDD] mb-1">{label}</h2>
                <p className="text-[#FCECDD] font-bold">
                    {field === "phone" && value && "+964 "}
                    {value || "-"}
                </p>
            </div>
        </div>
    );
}
