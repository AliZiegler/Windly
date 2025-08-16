import { z } from 'zod';

export const paymentSchema = z.object({
    cardNumber: z.string()
        .min(1, "Card number is required")
        .regex(/^[0-9\s]{13,19}$/, "Please enter a valid card number")
        .transform(str => str.replace(/\s/g, '')) // Remove spaces
        .refine(val => {
            // Luhn algorithm for card validation
            const digits = val.split('').map(Number);
            let sum = 0;
            let isEven = false;
            for (let i = digits.length - 1; i >= 0; i--) {
                let digit = digits[i];
                if (isEven) {
                    digit *= 2;
                    if (digit > 9) digit -= 9;
                }
                sum += digit;
                isEven = !isEven;
            }
            return sum % 10 === 0;
        }, "Invalid card number"),
    cardholderName: z.string()
        .min(1, "Cardholder name is required")
        .min(2, "Name must be at least 2 characters")
        .regex(/^[a-zA-Z\s]+$/, "Name should only contain letters and spaces"),
    expiryMonth: z.string()
        .regex(/^(0[1-9]|1[0-2])$/, "Invalid month"),
    expiryYear: z.string()
        .regex(/^[0-9]{2}$/, "Invalid year format")
        .refine(val => {
            const currentYear = new Date().getFullYear() % 100;
            const year = parseInt(val);
            return year >= currentYear;
        }, "Card has expired"),
    cvc: z.string()
        .regex(/^[0-9]{3,4}$/, "CVC must be 3 or 4 digits"),
});

export type PaymentFormData = z.infer<typeof paymentSchema>;

export default function PaymentForm() {
    return (
        <form className="space-y-6">
            <div className="border border-gray-600/50 rounded-2xl p-6 mb-6" style={{ backgroundColor: "#2a313c" }}>
                <h2 className="text-xl font-bold text-gray-100 mb-6">Payment Method</h2>
                <div className="space-y-4">
                    <div className="border border-gray-600/30 rounded-xl p-4" style={{ backgroundColor: "#1e252d" }}>
                        <div className="flex items-center gap-3 mb-4">
                            <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M3 10h18M7 15h1m4 0h1M5 5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2V7a2 2 0 00-2-2H5z" />
                            </svg>
                            <span className="font-medium text-gray-100">Credit/Debit Card</span>
                        </div>
                        <div className="space-y-4 ml-8">
                            <input
                                type="text"
                                name="cardNumber"
                                placeholder="1234 5678 9012 3456"
                                maxLength={19}
                                className="w-full p-3 border border-gray-600/50 rounded-lg text-gray-100 focus:border-blue-400 
                focus:outline-none transition-colors placeholder-gray-400"
                                style={{ backgroundColor: "#222831" }}
                            />
                            <input
                                type="text"
                                name="cardholderName"
                                placeholder="John Doe"
                                className="w-full p-3 border border-gray-600/50 rounded-lg text-gray-100 
                focus:border-blue-400 focus:outline-none transition-colors placeholder-gray-400"
                                style={{ backgroundColor: "#222831" }}
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid grid-cols-2 gap-2">
                                    <select
                                        name="expiryMonth"
                                        className="p-3 border border-gray-600/50 rounded-lg text-gray-100 
                    focus:border-blue-400 focus:outline-none transition-colors"
                                        style={{ backgroundColor: "#222831" }}
                                        defaultValue=""
                                    >
                                        <option value="" disabled className="text-gray-400">MM</option>
                                        {Array.from({ length: 12 }, (_, i) => (
                                            <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                                                {String(i + 1).padStart(2, '0')}
                                            </option>
                                        ))}
                                    </select>
                                    <select
                                        name="expiryYear"
                                        className="p-3 border border-gray-600/50 rounded-lg text-gray-100 
                    focus:border-blue-400 focus:outline-none transition-colors"
                                        style={{ backgroundColor: "#222831" }}
                                        defaultValue=""
                                    >
                                        <option value="" disabled className="text-gray-400">YY</option>
                                        {Array.from({ length: 10 }, (_, i) => {
                                            const year = new Date().getFullYear() + i;
                                            return (
                                                <option key={year} value={String(year).slice(-2)}>
                                                    {String(year).slice(-2)}
                                                </option>
                                            );
                                        })}
                                    </select>
                                </div>
                                <input
                                    type="text"
                                    name="cvc"
                                    placeholder="123"
                                    maxLength={4}
                                    className="p-3 border border-gray-600/50 rounded-lg text-gray-100 focus:border-blue-400 
                  focus:outline-none transition-colors placeholder-gray-400"
                                    style={{ backgroundColor: "#222831" }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
}
