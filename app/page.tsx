"use client";

import { useState } from "react";

interface VdoCipherOtpData {
    otp: string;
    playbackInfo: string;
}

export default function HomePage() {
    const [userName, setUserName] = useState("");
    const [otpData, setOtpData] = useState<VdoCipherOtpData | null>(null);

    const handlePlay = async () => {
        try {
            const res = await fetch("/api/otp", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ userName }),
            });

            if (!res.ok) {
                const errorText = await res.text();
                console.error("Failed to fetch OTP:", res.status, errorText);
                setOtpData(null);
                return;
            }
            const data: VdoCipherOtpData = await res.json();
            setOtpData(data);
        } catch (error) {
            console.error("Error in handlePlay:", error);
            setOtpData(null);
        }
    };

    return (
        // Ensure the main container doesn't cause overflow issues.
        // The 'items-center' should center its direct children if they are narrower than main.
        <main className="flex min-h-screen flex-col items-center p-4 bg-gray-100">
            {/* This div constrains the width of your content, including the video player */}
            <div className="w-full max-w-2xl">
                {" "}
                {/* You can adjust max-w-2xl (e.g., 672px) as needed */}
                <h1 className="text-2xl md:text-3xl font-bold mb-4 text-black text-center">
                    DRM Video Test
                </h1>
                <input
                    type="text"
                    placeholder="Enter your name"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="p-2 border border-gray-400 rounded mb-4 w-full text-black"
                />
                <button
                    onClick={handlePlay}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 w-full mb-6"
                >
                    Load Video
                </button>
                {otpData && (
                    // This is the responsive video container
                    <div
                        style={{
                            position: "relative", // For positioning the iframe inside
                            width: "100%", // Take full width of the parent (max-w-2xl)
                            paddingBottom: "56.25%", // 16:9 aspect ratio (9 / 16 * 100)
                            overflow: "hidden", // Prevents any potential overflow from this container itself
                            backgroundColor: "#000", // Optional: shows while iframe loads
                            marginTop: "1rem",
                        }}
                    >
                        <iframe
                            src={`https://player.vdocipher.com/v2/?otp=${otpData.otp}&playbackInfo=${otpData.playbackInfo}`}
                            style={{
                                position: "absolute", // Positioned relative to the div above
                                top: 0,
                                left: 0,
                                width: "100%", // Fill the container div
                                height: "100%", // Fill the container div
                                border: 0, // No iframe border
                            }}
                            allow="encrypted-media"
                            allowFullScreen
                        ></iframe>
                    </div>
                )}
            </div>
        </main>
    );
}
