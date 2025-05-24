import { NextResponse } from "next/server";

const API_SECRET_KEY = process.env.VDOCIPHER_API_SECRET!;
const VIDEO_ID = process.env.VDOCIPHER_VIDEO_ID!;
const WEBAPP_NAME = "Sikatna Systems"; // Define your webapp name
const XENDIT_API_KEY = process.env.XENDIT_API_KEY!; // Ensure you load your Xendit key

export async function POST(request: Request) {
    const { userName, userEmail } = await request.json();

    if (typeof userEmail !== "string") {
        return NextResponse.json(
            { error: "Invalid email address" },
            { status: 400 }
        );
    }

    const userIpAddress =
        request.headers.get("x-forwarded-for")?.split(",")[0] ||
        request.headers.get("remote_addr") ||
        "IP N/A";
    const currentDate = new Date().toLocaleDateString();

    const annotations = [
        // ... (Your annotations remain the same) ...
        {
            type: "rtext",
            text: userName ? `User: ${userName}` : "Viewer",
            alpha: "0.60",
            color: "0xFFFFFF", // White
            size: "15",
            interval: "5000",
            skip: "100",
            x: "5",
            y: "5",
            shadow: "true",
            outline: "true",
        },
        {
            type: "rtext",
            text: `APP: ${WEBAPP_NAME}`,
            alpha: "0.50",
            color: "0x00FFFF", // Cyan
            size: "12",
            interval: "7000",
            skip: "100",
            x: "95",
            y: "5",
            align: "top_right",
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
            x: "5",
            y: "95",
            align: "bottom_left",
            shadow: "true",
            outline: "true",
        },
        {
            type: "rtext",
            text: "Unauthorized copying or distribution is strictly prohibited.",
            alpha: "0.30",
            color: "0xFF0000", // Red for warning
            size: "10",
            interval: "10000",
            skip: "100",
            x: "50",
            y: "90",
            align: "bottom_center",
            shadow: "true",
            outline: "true",
        },
    ];

    // Split userName into first and last names (simple split)
    const nameParts = userName ? userName.split(" ") : ["Valued"];
    const givenName = nameParts[0];
    const surname = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "Customer";


    const xenditRes = await fetch("https://api.xendit.co/v2/invoices", {
        method: "POST",
        headers: {
            Authorization: `Basic ${Buffer.from(XENDIT_API_KEY + ":").toString(
                "base64"
            )}`,
            "Content-Type": "application/json",
        },
        // --- MODIFIED BODY ---
        body: JSON.stringify({
            external_id: `invoice-${Date.now()}`,
            amount: 1000,
            description: `Trading Course for ${userName}`,
            success_redirect_url: `http://localhost:3000/success?userName=${encodeURIComponent(
                userName
            )}&userEmail=${encodeURIComponent(userEmail)}`,
            failure_redirect_url: "http://localhost:3000/failure",
            currency: "PHP", // Set your currency (e.g., PHP, IDR)
            customer: { // Add the customer object
                given_names: givenName,
                surname: surname,
                email: userEmail,
                // You can add more customer details if you collect them
            },
            customer_notification_preference: { // Add notification preferences
                // invoice_created: ["email"], // Send email when invoice is created
                invoice_paid: ["email"],    // Send email (receipt) when paid
                // You can add "whatsapp", "viber", "sms" if configured
            },
             payer_email: userEmail, // Keep payer_email as well for good measure
        }),
        // --- END MODIFIED BODY ---
    });

    if (!xenditRes.ok) {
        const errorData = await xenditRes.text();
        console.error("Xendit API Error:", errorData);
        return NextResponse.json(
            { error: "Failed to create invoice", details: errorData },
            { status: xenditRes.status }
        );
    }

    const xenditData = await xenditRes.json();
    const paymentLink = xenditData.invoice_url;

    // --- VdoCipher OTP Fetch (remains the same) ---
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
    return NextResponse.json({ ...data, paymentLink });
}