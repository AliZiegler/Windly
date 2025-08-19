import { Suspense } from "react";
import PriceFilter from "@/app/components/home/sidebar/PriceFilter";
import DiscountFilter from "@/app/components/home/sidebar/DiscountFilter";
import RatingFilter from "@/app/components/home/sidebar/RatingFilter";
import SortBy from "@/app/components/home/sidebar/SortBy";

export default function SideBar() {
    return (
        <div className="bg-[#272D36] h-full">
            <aside className="bg-[#272D36] w-full md:w-[260px] h-screen px-5 pt-5 sticky top-0 z-10">
                <div className="flex flex-col gap-4 p-1">
                    <Suspense fallback={<div>Loading Filters...</div>}>
                        <PriceFilter />
                        <DiscountFilter />
                        <RatingFilter />
                        <SortBy />
                    </Suspense>
                </div>
            </aside>
        </div>
    );
}
