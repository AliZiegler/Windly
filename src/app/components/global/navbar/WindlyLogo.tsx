import Image from "next/image";
import Link from "next/link";

export default function WindlyLogo() {
    return (
        <Link href="/" prefetch={true}>
            <Image
                alt="windly logo"
                src="/images/windlyLogo.png"
                className="h-[80px] cursor-pointer"
                width="80"
                height="80"
            />
        </Link>
    );
}
