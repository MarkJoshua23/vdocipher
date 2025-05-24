"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link"; // Import Link from next/link
import { useEffect, useState } from "react";

interface VdoCipherOtpData {
    otp: string;
    playbackInfo: string;
}

export default function SuccessPage() {
    const searchParams = useSearchParams();
    const userName = searchParams.get("userName") || "";
    const userEmail = searchParams.get("userEmail") || "";
    const [otpData, setOtpData] = useState<VdoCipherOtpData | null>(null);
    const [isLoading, setIsLoading] = useState(true); // Add loading state
    const [error, setError] = useState<string | null>(null); // Add error state

    useEffect(() => {
        if (!userEmail) {
            setError("User email not found in URL.");
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        const fetchOtp = async () => {
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
                    console.error(
                        "Failed to fetch OTP:",
                        res.status,
                        errorText
                    );
                    setError("Failed to load video. Please try again later.");
                    setOtpData(null);
                } else {
                    const data: VdoCipherOtpData = await res.json();
                    setOtpData(data);
                }
            } catch (error) {
                console.error("Error in fetchOtp:", error);
                setError("An error occurred while fetching video details.");
                setOtpData(null);
            } finally {
                setIsLoading(false); // Set loading to false when done
            }
        };

        fetchOtp();
    }, [userName, userEmail]); // refetch if values change

    return (
        <main className="flex min-h-screen flex-col items-center p-4 bg-gray-100">
            <div className="w-full max-w-2xl text-center"> {/* Added text-center */}
                <h1 className="text-2xl md:text-3xl font-bold mb-4 text-black">
                    Payment Successful!
                </h1>
                <p className="text-black mb-6">Thank you, {userName || "Customer"}. You can now watch the course below.</p>

                {isLoading && <p className="text-black my-8">Loading your video, please wait...</p>}
                {error && <p className="text-red-600 my-8">{error}</p>}

                {otpData && !isLoading && !error && (
                    <div
                        style={{
                            position: "relative",
                            width: "100%",
                            paddingBottom: "56.25%", // 16:9 Aspect Ratio
                            overflow: "hidden",
                            backgroundColor: "#000",
                            marginTop: "1rem",
                            marginBottom: "2rem", // Added margin below video
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

                {/* --- Added Go Back Button --- */}
                <Link
                    href="/"
                    className="inline-block px-6 py-3 bg-gray-600 text-white rounded hover:bg-gray-700 transition duration-200"
                >
                    Go Back & Start Again
                </Link>
                {/* --- End Go Back Button --- */}

            </div>
        </main>
    );
}