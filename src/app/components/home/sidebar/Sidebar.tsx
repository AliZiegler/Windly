import { Suspense } from "react";
import PriceFilter from "@/app/components/home/sidebar/PriceFilter";
import DiscountFilter from "@/app/components/home/sidebar/DiscountFilter";
import RatingFilter from "@/app/components/home/sidebar/RatingFilter";
import SortBy from "@/app/components/home/sidebar/SortBy";

export default function SideBar() {
    return (
        <div className="bg-[#272D36] h-full">
            <aside className="bg-[#272D36] w-[260px] h-screen pl-10 pt-5">
                <div className="flex flex-col gap-3 fixed">
                    <Suspense fallback={<div>Loading...</div>}>
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
