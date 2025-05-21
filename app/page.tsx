"use client";

import { useState } from "react";

// 1. Define the interface
interface VdoCipherOtpData {
    otp: string;
    playbackInfo: string;
    // Add any other fields your API might return and you use
}

export default function HomePage() {
    const [userName, setUserName] = useState("");
    // 2. Use the interface with useState
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
                // You might want to show an error to the user here
                return;
            }
            // 3. Type the JSON response
            const data: VdoCipherOtpData = await res.json();
            setOtpData(data);
        } catch (error) {
            console.error("Error in handlePlay:", error);
            setOtpData(null);
            // Handle network errors or other exceptions
        }
    };

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gray-100">
            <h1 className="text-3xl font-bold mb-4 text-black">
                DRM Video Test
            </h1>
            <input
                type="text"
                placeholder="Enter your name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="p-2 border border-gray-400 rounded mb-4 w-full text-black max-w-sm"
            />
            <button
                onClick={handlePlay}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
                Load Video
            </button>

            {otpData && ( // This check is now fully type-safe
                <iframe
                    src={`https://player.vdocipher.com/v2/?otp=${otpData.otp}&playbackInfo=${otpData.playbackInfo}`}
                    style={{
                        border: 0,
                        width: "720px",
                        height: "405px",
                        marginTop: "2rem",
                    }}
                    allow="encrypted-media"
                    allowFullScreen
                ></iframe>
            )}
        </main>
    );
}
