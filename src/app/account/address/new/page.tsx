"use server";
import { ReactNode, InputHTMLAttributes } from "react";
import { addAddress } from "@/app/actions/AddressActions";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { iraqiProvinces } from "@/app/components/global/Atoms";
import { z } from "zod";

const inputClass =
    "w-full px-4 py-3 bg-[#2a2f38] border border-[#4a5568] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00CAFF] focus:border-transparent transition-all duration-200";
const labelClass = "block text-sm font-medium text-gray-300";
const sectionClass =
    "bg-[#393e46] border-2 border-[#1c2129] rounded-lg overflow-hidden";
const sectionHeaderClass =
    "bg-[#2a2f38] px-4 sm:px-6 py-4 border-b border-[#1c2129]";
const optionSelectClass =
    "w-full px-4 py-3 bg-[#2a2f38] border border-[#4a5568] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00CAFF] focus:border-transparent transition-all duration-200";

const AddressSchema = z.object({
    name: z.string().min(3, "3 letters at least").max(30, "Name must be at most 30 letters"),
    phone: z.string().min(10, "10 digits at least").max(15, "15 digits at most"),
    state: z.enum(iraqiProvinces),
    country: z.string(),
    city: z.string().min(3, "3 letters at least").max(30, "City must be at most 30 letters"),
    buildingNumber: z.string().min(1, "Enter a building/house number").max(30, "Must be at most 30 characters"),
    street: z.string().min(3, "3 letters at least").max(30, "Street must be at most 30 letters"),
    zipCode: z.string().min(3, "3 characters at least").max(20, "Zip code must be at most 20 characters"),
    addressType: z.enum(["home", "office"]),
});

const provincesOptions = iraqiProvinces.map(p => <option key={p} value={p}>{p}</option>);
type FieldProps = {
    label: string;
    name: string;
    type?: string;
    placeholder?: string;
    required?: boolean;
    children?: ReactNode;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "name" | "type" | "placeholder">;

const Field = ({ label, name, type = "text", placeholder, required = true, children, ...props }: FieldProps) => (
    <div className="space-y-2">
        <label htmlFor={name} className={labelClass}>
            {label} {required && <span className="text-red-400">*</span>}
        </label>
        {children || (
            <input required={required} type={type} name={name} id={name} placeholder={placeholder} className={inputClass} {...props} />
        )}
    </div>
);

export default async function Page() {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Not authenticated");

    async function handleSubmit(formData: FormData) {
        "use server";
        const data = Object.fromEntries(formData) as Record<string, string>;
        data.country = "Iraq";
        data.addressType = data.type as "home" | "office";

        const parsed = AddressSchema.safeParse(data);
        if (!parsed.success)
            throw new Error(parsed.error.issues.map(i => `${i.path}: ${i.message}`).join("; "));

        await addAddress(parsed.data);
        redirect("/account/address");
    }

    return (
        <div className="w-full  mx-auto p-4 sm:p-6">
            <div className="mb-8">
                <h1 className="font-bold text-2xl sm:text-3xl text-white mb-2">Add New Address</h1>
                <p className="text-gray-400 text-sm sm:text-base">Fill in the form below to add a new delivery address to your account.</p>
            </div>

            <form action={handleSubmit} className="space-y-8">
                <div className={sectionClass}>
                    <div className={sectionHeaderClass}>
                        <h2 className="font-bold text-lg sm:text-xl text-white flex items-center gap-3">
                            <svg className="w-5 h-5 text-[#00CAFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Contact Information
                        </h2>
                    </div>
                    <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <Field name="name" label="Full Name" placeholder="Enter your full name" />
                        <div className="space-y-2">
                            <label htmlFor="phone" className={labelClass}>Phone Number <span className="text-red-400">*</span></label>
                            <div className="flex">
                                <div className="flex items-center px-3 bg-[#2a2f38] border border-r-0 
                                    border-[#4a5568] rounded-l-lg text-gray-300 text-sm font-semibold">+964</div>
                                <input required type="tel" name="phone" id="phone" placeholder="7XX XXX XXXX"
                                    className="flex-1 px-4 py-3 bg-[#2a2f38] border border-[#4a5568] rounded-r-lg text-white placeholder-gray-400 
                                    focus:outline-none focus:ring-2 focus:ring-[#00CAFF] focus:border-transparent transition-all duration-200" />
                            </div>
                            <p className="text-xs text-gray-500">Enter your phone number without the country code</p>
                        </div>
                    </div>
                </div>

                <div className={sectionClass}>
                    <div className={sectionHeaderClass}>
                        <h2 className="font-bold text-lg sm:text-xl text-white flex items-center gap-3">
                            <svg className="w-5 h-5 text-[#00CAFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Address Details
                        </h2>
                    </div>

                    <div className="p-4 sm:p-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            <Field label="State/Province" name="state">
                                <select required name="state" id="state" className={optionSelectClass}>
                                    <option value="" className="text-gray-400">Select province</option>
                                    {provincesOptions}
                                </select>
                            </Field>
                            <Field label="City/Town" name="city" placeholder="Enter city name" />
                            <Field label="Building/House No." name="buildingNumber" placeholder="e.g., 123, Apt 4B" />
                            <Field label="Street Name" name="street" placeholder="Enter street name" />
                            <Field label="Postal/Zip Code" name="zipCode" placeholder="Enter postal code" />
                            <Field label="Country" name="country" required={false}>
                                <input type="text" name="country" id="country" value="Iraq" disabled
                                    className="w-full px-4 py-3 bg-[#1a1f28] border 
                                    border-[#4a5568] rounded-lg text-gray-400 cursor-not-allowed" />
                            </Field>
                        </div>

                        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <Field label="Address Type" name="type">
                                <select required name="type" id="type" className={optionSelectClass}>
                                    <option value="home">🏠 Home</option>
                                    <option value="office">🏢 Office</option>
                                </select>
                            </Field>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button type="submit"
                        className="inline-flex items-center justify-center bg-[#ffb100] hover:bg-[#e09d00] text-black 
                        font-semibold px-8 py-3 rounded-lg transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 
                        focus:ring-[#ffb100] focus:ring-offset-2 focus:ring-offset-[#222831] active:scale-95 min-w-[160px]">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Save Address
                    </button>
                </div>
            </form>
        </div>
    );
}
