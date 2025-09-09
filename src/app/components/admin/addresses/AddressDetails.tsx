import { ReactNode, InputHTMLAttributes } from "react";
import { db } from "@/lib/db";
import { addressTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ChevronLeft, MapPin, User } from "lucide-react";
import { iraqiProvinces } from "../../global/Atoms";
import Link from "next/link";
const inputClass =
    "w-full px-4 py-3 bg-[#2a2f38] border border-[#4a5568] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00CAFF] focus:border-transparent transition-all duration-200";
const labelClass = "block text-sm font-medium text-gray-300";
const sectionClass =
    "bg-[#252c37] border-2 border-[#1c2129] rounded-lg overflow-hidden";
const sectionHeaderClass =
    "bg-[#1c2129] px-4 sm:px-6 py-4 border-b border-[#4a5568]";
const optionSelectClass =
    "w-full px-4 py-3 bg-[#2a2f38] border border-[#4a5568] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00CAFF] focus:border-transparent transition-all duration-200";

type FieldProps = {
    label: string;
    name: string;
    type?: string;
    placeholder?: string;
    required?: boolean;
    children?: ReactNode;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "name" | "type" | "placeholder">;
const provincesOptions = iraqiProvinces.map(p => <option key={p} value={p}>{p}</option>);

const Field = ({ label, name, type = "text", placeholder, required = true, children, ...props }: FieldProps) => (
    <div className="space-y-2">
        <label htmlFor={name} className={labelClass}>
            {label} {required && <span className="text-red-400">*</span>}
        </label>
        {children || (
            <input disabled required={required} type={type} name={name} id={name} placeholder={placeholder} className={inputClass} {...props} />
        )}
    </div>
);

export default async function Page({ id }: { id: number }) {
    const [address] = await db.select().from(addressTable).where(eq(addressTable.id, id))

    return (
        <div className="w-full  mx-auto p-4 sm:p-6">
            <div className="mb-8">
                <span className="flex items-center gap-3 mb-8">
                    <Link
                        href={"/admin/addresses"}
                        title="Back"
                        className="text-gray-400 hover:text-white transition-colors duration-200"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </Link>
                    <b>Back To Addresses</b>
                </span>
                <h1 className="font-bold text-2xl sm:text-3xl text-white mb-2">View Address</h1>
                <p className="text-gray-400 text-sm sm:text-base">View the Details of {address.name} Address.</p>
            </div>

            <form className="space-y-8">
                <div className={sectionClass}>
                    <div className={sectionHeaderClass}>
                        <h2 className="font-bold text-lg sm:text-xl text-white flex items-center gap-3">
                            <User className="w-5 h-5 text-[#00CAFF]" />
                            Contact Information
                        </h2>
                    </div>
                    <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <Field name="name" label="Full Name" defaultValue={address.name} placeholder="Enter your full name" />
                        <div className="space-y-2">
                            <label htmlFor="phone" className={labelClass}>Phone Number <span className="text-red-400">*</span></label>
                            <div className="flex">
                                <div className="flex items-center px-3 bg-[#2a2f38] border border-r-0 
                                    border-[#4a5568] rounded-l-lg text-gray-300 text-sm font-semibold">+964</div>
                                <input disabled required type="tel" name="phone" id="phone" defaultValue={address.phone} placeholder="7XX XXX XXXX"
                                    className="flex-1 px-4 py-3 bg-[#2a2f38] border border-[#4a5568] rounded-r-lg text-white placeholder-gray-400 
                                    focus:outline-none focus:ring-2 focus:ring-[#00CAFF] focus:border-transparent transition-all duration-200" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className={sectionClass}>
                    <div className={sectionHeaderClass}>
                        <h2 className="font-bold text-lg sm:text-xl text-white flex items-center gap-3">
                            <MapPin className="w-5 h-5 text-[#00CAFF]" />
                            Address Details
                        </h2>
                    </div>

                    <div className="p-4 sm:p-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            <Field label="State/Province" name="state">
                                <select disabled required value={address.state} name="state" id="state" className={optionSelectClass}>
                                    {provincesOptions}
                                </select>
                            </Field>
                            <Field label="City/Town" defaultValue={address.city} name="city" placeholder="Enter city name" />
                            <Field label="Building/House No." defaultValue={address.buildingNumber} name="buildingNumber" placeholder="e.g., 123, Apt 4B" />
                            <Field label="Street Name" name="street" defaultValue={address.street} placeholder="Enter street name" />
                            <Field label="Postal/Zip Code" name="zipCode" defaultValue={address.zipCode} placeholder="Enter postal code" />
                            <input disabled name="country" id="country" value="Iraq" className="hidden" />
                            <Field label="Address Type" name="addressType">
                                <select disabled value={address.addressType} required name="addressType" id="addressType" className={optionSelectClass}>
                                    <option value="home">🏠 Home</option>
                                    <option value="office">🏢 Office</option>
                                </select>
                            </Field>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
