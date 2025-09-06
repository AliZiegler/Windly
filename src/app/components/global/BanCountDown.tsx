'use client';

import { useState, useEffect } from 'react';

type BanCountdownProps = {
    expiresAt: string;
}

type TimeRemaining = {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}

export default function BanCountdown({ expiresAt }: BanCountdownProps) {
    const [timeRemaining, setTimeRemaining] = useState<TimeRemaining | null>(null);
    const [isExpired, setIsExpired] = useState(false);

    useEffect(() => {
        const calculateTimeRemaining = (): TimeRemaining => {
            const now = new Date().getTime();
            const expiry = new Date(expiresAt).getTime();
            const difference = expiry - now;

            if (difference <= 0) {
                setIsExpired(true);
                return { days: 0, hours: 0, minutes: 0, seconds: 0 };
            }

            const days = Math.floor(difference / (1000 * 60 * 60 * 24));
            const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((difference % (1000 * 60)) / 1000);

            return { days, hours, minutes, seconds };
        };

        // Initial calculation
        setTimeRemaining(calculateTimeRemaining());

        // Update every second
        const timer = setInterval(() => {
            setTimeRemaining(calculateTimeRemaining());
        }, 1000);

        return () => clearInterval(timer);
    }, [expiresAt]);

    if (isExpired) {
        return (
            <div className="text-center">
                <p className="text-green-400 font-semibold">Ban has expired! Please refresh the page.</p>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                >
                    Refresh Page
                </button>
            </div>
        );
    }

    if (!timeRemaining) {
        return <div className="text-red-300">Loading countdown...</div>;
    }

    return (
        <div className="text-center">
            <p className="text-red-300 mb-4 text-sm">Ban expires in:</p>
            <div className="text-3xl font-mono font-bold text-red-400 tracking-wider">
                {timeRemaining.days > 0 && `${timeRemaining.days}d `}
                {String(timeRemaining.hours).padStart(2, '0')}:
                {String(timeRemaining.minutes).padStart(2, '0')}:
                {String(timeRemaining.seconds).padStart(2, '0')}
            </div>
        </div>
    );
}
