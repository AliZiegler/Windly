"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { updateSearchParams } from "@/app/components/global/Atoms";
import { ArrowDownUp, ArrowDownAZ } from "lucide-react";

export default function SortBy() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const sort = searchParams.get("sort") || "relevance";
    const reverse = searchParams.get("reverse") || "false";
    function changeSort(event: React.ChangeEvent<HTMLSelectElement>): void {
        const newSort = event.target.value === "relevance" ? null : event.target.value;
        router.push(
            `?${updateSearchParams(searchParams, "sort", newSort).toString()
            }`,
        );
    }
    function flipReverse(): void {
        if (reverse === "false") {
            router.push(`?${updateSearchParams(searchParams, "reverse", "true").toString()}`);
        } else {
            router.push(`?${updateSearchParams(searchParams, "reverse", null).toString()}`);
        }
    }
    return (
        <section className="flex flex-col gap-2.5">
            <span className="flex items-center gap-2">
                <b>Sort By</b>
                <ArrowDownAZ className="size-6 md:size-[20px]" strokeWidth={1.5} />
            </span>
            <span className="flex justify-center">
                <select
                    defaultValue={sort}
                    onChange={changeSort}
                    className="w-full h-9 bg-[#697565] hover:bg-[#4e5c5a] duration-200 hover:font-bold rounded-l-md cursor-pointer text-left pl-3"
                >
                    <option value="relevance">Relevance</option>
                    <option value="price">Price</option>
                    <option value="discount">Discount</option>
                    <option value="rating">Rating</option>
                </select>
                <button
                    onClick={flipReverse}
                    className="group bg-[#FEBA17] h-9 w-14 rounded-r-md flex items-center hover:bg-[#e3a001] cursor-pointer justify-center"
                >
                    <ArrowDownUp
                        size={25}
                        color="black"
                        className="flex-shrink-0 transition-transform duration-200 group-hover:scale-110"
                    />
                </button>
            </span>
        </section>
    );
}
