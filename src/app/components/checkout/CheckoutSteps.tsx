type CheckoutStepsProps = {
    currentStep: number;
}

export default function CheckoutSteps({ currentStep }: CheckoutStepsProps) {
    const steps = [
        { number: 1, title: "Review Order", icon: "📋" },
        { number: 2, title: "Shipping", icon: "🚚" },
        { number: 3, title: "Payment", icon: "💳" }
    ];

    return (
        <div className="mb-8 border border-gray-600/50 rounded-2xl p-6" style={{ backgroundColor: "#2a313c" }}>
            <div className="flex items-center justify-between">
                {steps.map((step, index) => (
                    <div key={step.number} className="flex items-center">
                        <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${currentStep >= step.number
                            ? 'border-[#ffb100] text-[#ffb100] font-bold'
                            : 'border-gray-600 text-gray-400'
                            }`} style={{
                                backgroundColor: currentStep >= step.number ? 'rgba(255, 177, 0, 0.1)' : 'transparent'
                            }}>
                            {currentStep > step.number ? (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                            ) : (
                                <span className="text-sm font-bold">{step.number}</span>
                            )}
                        </div>
                        <div className="ml-3">
                            <p className={`text-sm font-medium ${currentStep >= step.number ? 'text-[#ffb100]' : 'text-gray-400'
                                }`}>
                                Step {step.number}
                            </p>
                            <p className={`text-xs ${currentStep >= step.number ? 'text-gray-100' : 'text-gray-500'
                                }`}>
                                {step.title}
                            </p>
                        </div>
                        {index < steps.length - 1 && (
                            <div className={`w-16 h-0.5 ml-6 transition-all ${currentStep > step.number ? 'bg-[#ffb100]' : 'bg-gray-600'
                                }`} />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
