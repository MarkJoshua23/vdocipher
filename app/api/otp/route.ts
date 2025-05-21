import { NextResponse } from "next/server";

const API_SECRET_KEY = process.env.VDOCIPHER_API_SECRET!;
const VIDEO_ID = process.env.VDOCIPHER_VIDEO_ID!;
const WEBAPP_NAME = "Sikatna Systems"; // Define your webapp name

export async function POST(request: Request) {
    const { userName } = await request.json();
    const userIpAddress =
        request.headers.get("x-forwarded-for")?.split(",")[0] ||
        request.headers.get("remote_addr") ||
        "IP N/A"; // Example: Get User IP (might need adjustments based on your deployment)
    const currentDate = new Date().toLocaleDateString(); // Get current date

    const annotations = [
        {
            type: "rtext",
            text: userName ? `User: ${userName}` : "Viewer",
            alpha: "0.60",
            color: "0xFFFFFF", // White
            size: "15",
            interval: "5000",
            skip: "100",
            // Position this at the top-left area (example)
            x: "5", // 5% from the left
            y: "5", // 5% from the top
            shadow: "true", // Add a subtle shadow for better readability
            outline: "true", // Add an outline
        },
        {
            type: "rtext",
            text: `APP: ${WEBAPP_NAME}`,
            alpha: "0.50",
            color: "0x00FFFF", // Cyan
            size: "12",
            interval: "7000", // Show for 7 seconds
            skip: "100", // Wait for 3 seconds
            // Position this at the top-right area (example)
            x: "95", // 95% from the left (so it's near the right edge)
            y: "5", // 5% from the top
            align: "top_right", // Anchor point for x, y
            shadow: "true",
            outline: "true",
        },
        {
            type: "rtext",
            text: `IP: ${userIpAddress} | Date: ${currentDate}`,
            alpha: "0.40",
            color: "0xFFFF00", // Yellow
            size: "10",
            interval: "6000",
            skip: "100",
            // Position this at the bottom-left area (example)
            x: "5",
            y: "95",
            align: "bottom_left", // Anchor point for x, y
            shadow: "true",
            outline: "true",
        },
        {
            type: "rtext",
            text: "Unauthorized copying or distribution is strictly prohibited.",
            alpha: "0.30",
            color: "0xFF0000", // Red for warning
            size: "10",
            interval: "10000", // Show for a longer duration
            skip: "100",
            // Position this at the bottom-center (example)
            x: "50",
            y: "90",
            align: "bottom_center", // Anchor point for x, y
            shadow: "true",
            outline: "true",
        },
    ];

    const res = await fetch(
        `https://dev.vdocipher.com/api/videos/${VIDEO_ID}/otp`,
        {
            method: "POST",
            headers: {
                Authorization: `Apisecret ${API_SECRET_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                ttl: 300,
                annotate: JSON.stringify(annotations),
            }),
        }
    );

    if (!res.ok) {
        const errorData = await res.text();
        console.error("VdoCipher API Error:", errorData);
        return NextResponse.json(
            { error: "Failed to fetch OTP", details: errorData },
            { status: res.status }
        );
    }

    const data = await res.json();
    return NextResponse.json(data);
}
