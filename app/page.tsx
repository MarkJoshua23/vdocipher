"use client";

import { useState } from "react";

export default function HomePage() {
    const [userName, setUserName] = useState("");
    const [otpData, setOtpData] = useState<any>(null);

    const handlePlay = async () => {
        const res = await fetch("/api/otp", {
            method: "POST",
            body: JSON.stringify({ userName }),
        });
        const data = await res.json();
        setOtpData(data);
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
                className="p-2 border border-gray-400 rounded mb-4 w-full max-w-sm text-black"
            />
            <button
                onClick={handlePlay}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
                Load Video
            </button>

            {otpData && (
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
