import Image from "next/image";
import Link from "next/link";
import Stars from "@/app/components/global/ReactStars";

type ReviewDetailsProps = {
    productName: string;
    name: string;
    fReview: {
        id: number;
        rating: number;
        review: string;
        createdAt: Date;
        updatedAt: Date;
        description: string;
    };
};

export default function ReviewDetails({ productName, name, fReview }: ReviewDetailsProps) {
    const { rating, review, createdAt, updatedAt, description } = fReview;
    const formattedDate = createdAt.toLocaleString();
    const formattedUpdateDate = updatedAt.toLocaleString();
    const isUpdated = formattedDate !== formattedUpdateDate;

    return (
        <div className="w-full flex flex-col gap-3 pr-4">
            <h1 className="font-bold text-xl">Review Details</h1>
            <span className="flex flex-col gap-3 w-full border-2 bg-[#393e46] border-[#1c2129] p-5">
                <span className="flex gap-3 mb-5">
                    <Link href={`/${name}`} className="cursor-pointer">
                        <Image
                            src="/images/placeholder.png"
                            width={350}
                            height={350}
                            alt="Product Image"
                            className="w-[473px] h-[350px]"
                        />
                    </Link>
                    <span className="flex flex-col gap-7 w-full h-[350px] pt-10 pl-5">
                        <span>
                            <Link href={`/${name}`} className="cursor-pointer hover:text-[#00CAFF] duration-200">
                                <h2 className="text-3xl font-bold mb-0.5">{productName}</h2>
                            </Link>
                            <b className="text-md font-light text-gray-300">{description}</b>
                        </span>
                        <span className="flex gap-5">
                            <b className="text-xl font-light mt-2.5">Your Rating:</b>
                            <Stars value={rating} edit={false} count={5} size={30} />
                        </span>
                    </span>
                </span>
                <span className="flex justify-between items-center">
                    <p>Your Review (submitted on {formattedDate} {isUpdated && `, updated on ${formattedUpdateDate}`})</p>
                    <Link href="?edit=true">
                        <button className="block bg-[#ffb100] px-4 py-1 rounded-lg font-bold text-black cursor-pointer">
                            Edit
                        </button>
                    </Link>
                </span>
                <div className="text-lg font-light w-full h-auto p-3 border-1 border-[#1c2129]">
                    {review}
                </div>
            </span>
        </div>
    );
}
