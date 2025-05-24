"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useState, Suspense } from "react"; // 1. Import Suspense

interface VdoCipherOtpData {
    otp: string;
    playbackInfo: string;
}

// 2. Create an inner component with all the logic
function SuccessContent() {
    const searchParams = useSearchParams(); // This now runs *inside* Suspense
    const userName = searchParams.get("userName") || "";
    const userEmail = searchParams.get("userEmail") || "";
    const [otpData, setOtpData] = useState<VdoCipherOtpData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Your existing useEffect logic remains largely the same
        if (!userEmail) {
            setError("User email not found. Cannot load video.");
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        const fetchOtp = async () => {
            try {
                // IMPORTANT: This /api/otp call *might* try to create a *new*
                // invoice based on your current API code. You might need
                // to adjust /api/otp or create a new route specifically
                // to *only* fetch OTP without creating an invoice again.
                // For now, we are keeping your original fetch call.
                const res = await fetch("/api/otp", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ userName, userEmail }),
                });

                if (!res.ok) {
                    const errorText = await res.text();
                    console.error(
                        "Failed to fetch OTP:",
                        res.status,
                        errorText
                    );
                    setError(
                        "Failed to load video. Please try again or contact support."
                    );
                    setOtpData(null);
                } else {
                    const data = await res.json();
                    // Check if we got OTP data or something else (like a new payment link)
                    if (data.otp && data.playbackInfo) {
                        setOtpData(data);
                    } else {
                        console.error("Unexpected data received:", data);
                        setError("Could not retrieve video details.");
                        setOtpData(null);
                    }
                }
            } catch (err) {
                console.error("Error in fetchOtp:", err);
                setError("An error occurred while fetching video details.");
                setOtpData(null);
            } finally {
                setIsLoading(false);
            }
        };

        fetchOtp();
    }, [userName, userEmail]);

    // This is the JSX previously returned by SuccessPage
    return (
        <div className="w-full max-w-2xl text-center p-6 bg-white rounded-lg shadow-xl">
            <h1 className="text-2xl md:text-3xl font-bold mb-4 text-black">
                Payment Successful!
            </h1>
            <p className="text-gray-700 mb-6">
                Thank you, {userName || "Customer"}. You can now watch the
                course below.
            </p>

            {isLoading && (
                <p className="text-black my-8">
                    Loading your video, please wait...
                </p>
            )}
            {error && (
                <p className="text-red-600 my-8 font-semibold">{error}</p>
            )}

            {otpData && !isLoading && !error && (
                <div
                    style={{
                        position: "relative",
                        width: "100%",
                        paddingBottom: "56.25%",
                        overflow: "hidden",
                        backgroundColor: "#000",
                        marginTop: "1rem",
                        marginBottom: "2rem",
                        borderRadius: "8px", // Added rounded corners
                    }}
                >
                    <iframe
                        src={`https://player.vdocipher.com/v2/?otp=${otpData.otp}&playbackInfo=${otpData.playbackInfo}`}
                        style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            border: 0,
                        }}
                        allow="encrypted-media"
                        allowFullScreen
                    ></iframe>
                </div>
            )}

            <Link
                href="/"
                className="inline-block px-6 py-3 bg-gray-600 text-white rounded hover:bg-gray-700 transition duration-200 mt-4"
            >
                Go Back & Start Again
            </Link>
        </div>
    );
}

// 3. Create the main page component that wraps SuccessContent in Suspense
export default function SuccessPage() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-100">
            <Suspense
                fallback={
                    <div className="text-center p-10 bg-white rounded-lg shadow-xl">
                        <h1 className="text-2xl font-bold text-black">
                            Loading Payment Details...
                        </h1>
                        <p className="text-gray-600 mt-2">
                            Please wait a moment.
                        </p>
                    </div>
                }
            >
                <SuccessContent />
            </Suspense>
        </main>
    );
}
