import { Filter, ChevronDown } from "lucide-react";
import { ReactNode } from "react";

export default function SummaryFilter({ children }: { children: ReactNode }) {
    return (
        <details className="bg-midnight border border-[#76ABAE]/20 overflow-hidden shadow-lg [&[open]_.details-marker]:rotate-180">
            <summary className="text-[#FCECDD] font-medium px-4 py-3 cursor-pointer border-none hover:bg-[#76ABAE]/10 transition-colors 
                duration-200 flex items-center justify-between select-none">
                <span className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-[#76ABAE]" />
                    Filter Options
                </span>
                <ChevronDown className="w-4 h-4 text-[#76ABAE] transform transition-transform duration-200 details-marker" />
            </summary>
            <div className="border-t border-[#76ABAE]/10">
                {children}
            </div>
        </details>
    );
}
