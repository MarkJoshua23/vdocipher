"use client";

import useUserStore from "@/store/userStore";
import { useState } from "react";

export default function HomePage() {
    const [isLoading, setIsLoading] = useState(false); // Add loading state
    const [error, setError] = useState<string | null>(null); // Add error state

    // Get user state and setters from Zustand store
    const { userName, userEmail, setUserName, setUserEmail } = useUserStore();

    const handleBuyNow = async () => {
        // Basic validation
        if (!userName.trim() || !userEmail.trim()) {
            setError("Please enter both your name and email.");
            return;
        }
        // Basic email format check (optional but recommended)
        if (!/\S+@\S+\.\S+/.test(userEmail)) {
            setError("Please enter a valid email address.");
            return;
        }

        setError(null); // Clear previous errors
        setIsLoading(true); // Set loading state

        try {
            const res = await fetch("/api/otp", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ userName, userEmail }),
            });

            if (!res.ok) {
                const errorText = await res.text();
                console.error("Failed to fetch payment link:", res.status, errorText);
                setError("Failed to initiate payment. Please try again.");
                setIsLoading(false);
                return;
            }

            const data = await res.json();
            if (data.paymentLink) {
                window.location.href = data.paymentLink;
                // No need to set loading to false, as we are navigating away
            } else {
                console.error("No payment link received:", data);
                setError("Could not retrieve payment link. Please contact support.");
                setIsLoading(false);
            }
        } catch (error) {
            console.error("Error in handleBuyNow:", error);
            setError("An unexpected error occurred. Please try again.");
            setIsLoading(false);
        }
    };

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gray-100"> {/* Centered content */}
            {/* --- Course Offer Card --- */}
            <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md transform transition-all hover:scale-105 duration-300">

                {/* Optional: Add an image here if you like */}
                {/* <img src="/course-image.jpg" alt="Trading Course" className="w-full h-40 object-cover rounded-t-lg mb-6"/> */}

                <h1 className="text-3xl font-bold mb-3 text-gray-900 text-center">
                    Master the Market: Pro Trading Course
                </h1>

                <p className="text-gray-600 mb-6 text-center text-sm">
                    Unlock proven strategies, master technical analysis, and learn risk management to trade confidently and profitably.
                </p>

                <div className="text-center mb-8 bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <span className="block text-gray-500 text-xs uppercase">One-Time Payment</span>
                    <span className="text-5xl font-extrabold text-blue-600">
                        ₱1000
                    </span>
                    <span className="block text-gray-500 text-xs">Full Lifetime Access</span>
                </div>

                <div className="space-y-4 mb-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input
                            id="name"
                            type="text"
                            placeholder="Juan Dela Cruz"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            className="p-3 border border-gray-300 rounded-lg w-full text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={isLoading}
                        />
                    </div>
                    <div>
                         <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                        <input
                            id="email"
                            type="email"
                            placeholder="you@example.com"
                            value={userEmail}
                            onChange={(e) => setUserEmail(e.target.value)}
                            className="p-3 border border-gray-300 rounded-lg w-full text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={isLoading}
                        />
                    </div>
                </div>

                {error && <p className="text-red-600 text-sm mt-3 mb-3 text-center font-medium">{error}</p>}

                <button
                    onClick={handleBuyNow}
                    disabled={isLoading}
                    className="w-full px-6 py-4 bg-blue-600 text-white font-bold text-lg rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-200 disabled:opacity-60 disabled:cursor-wait"
                >
                    {isLoading ? "Redirecting to Payment..." : "Enroll Now for ₱1000"}
                </button>

                 <p className="text-gray-400 text-xs mt-4 text-center">Secure Payment via Xendit. You will be redirected.</p>
            </div>
            {/* --- End Card --- */}
        </main>
    );
}