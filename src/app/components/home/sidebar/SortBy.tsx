"use client";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { updateSearchParams } from "@/app/components/global/Atoms";

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
        <section className="flex flex-col gap-2">
            <b>Sort By:</b>
            <span className="flex justify-center mr-5">
                <select
                    value={sort}
                    onChange={changeSort}
                    className="w-40 h-9 bg-[#697565] cursor-pointer text-left pl-3"
                >
                    <option value="relevance">Relevance</option>
                    <option value="price">Price</option>
                    <option value="discount">Discount</option>
                    <option value="rating">Rating</option>
                </select>
                <button
                    onClick={flipReverse}
                    className="bg-[#FEBA17] h-9 w-10 flex items-center hover:bg-[#e3a001] cursor-pointer justify-center"
                >
                    <Image
                        src="/images/reverseIcon.png"
                        alt="reverseIcon"
                        width={25}
                        height={25}
                    />
                </button>
            </span>
        </section>
    );
}
