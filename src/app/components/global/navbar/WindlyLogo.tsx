import Image from "next/image";
import Link from "next/link";

export default function WindlyLogo() {
    return (
        <Link title="Return to Home" href="/" prefetch>
            <Image
                alt="Windly Logo"
                src="/images/windlyLogo.png"
                width={80}
                height={80}
                className="cursor-pointer transition-transform hover:scale-105"
                priority
            />
        </Link>
    );
}
