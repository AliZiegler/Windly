import { Suspense } from "react";
import PriceFilter from "./PriceFilter.tsx";
import DiscountFilter from "./DiscountFilter.tsx";
import RatingFilter from "./RatingFilter.tsx";
import SortBy from "./SortBy.tsx";

export default function SideBar() {
    return (
        <div className="bg-[#272D36] h-full">
            <aside className="bg-[#272D36] w-[260px] h-screen pl-10 pt-5">
                <div className="flex flex-col gap-3 fixed">
                    <Suspense fallback={<FilterSkeleton />}>
                        <PriceFilter />
                    </Suspense>

                    <Suspense fallback={<FilterSkeleton />}>
                        <DiscountFilter />
                    </Suspense>

                    <Suspense fallback={<FilterSkeleton />}>
                        <RatingFilter />
                    </Suspense>

                    <Suspense fallback={<FilterSkeleton />}>
                        <SortBy />
                    </Suspense>
                </div>
            </aside>
        </div>
    );
}
export function FilterSkeleton() {
    return (
        <section className="animate-pulse">
            <div className="h-4 w-1/2 bg-gray-600 mb-2 rounded"></div>
            <div className="h-3 w-3/4 bg-gray-700 mb-3 rounded"></div>
            <div className="h-2 w-full bg-gray-800 rounded"></div>
        </section>
    );
}
