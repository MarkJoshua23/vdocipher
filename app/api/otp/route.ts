import { NextResponse } from "next/server";

const API_SECRET_KEY = process.env.VDOCIPHER_API_SECRET!;
const VIDEO_ID = process.env.VDOCIPHER_VIDEO_ID!;
const XENDIT_API_KEY = process.env.XENDIT_API_KEY!;
const WEBAPP_NAME = "Sikatna Systems";

export async function POST(request: Request) {
    const { userName, userEmail } = await request.json();

    if (typeof userEmail !== "string") {
        return NextResponse.json(
            { error: "Invalid email address" },
            { status: 400 }
        );
    }

    // --- Dynamic Base URL ---
    const headers = request.headers;
    // Check for Vercel's URL first, then try constructing from host.
    // VERCEL_URL doesn't include the protocol.
    const vercelUrl = "vdocipher-4dyc.vercel.app/";
    let baseUrl;

    if (vercelUrl) {
        baseUrl = `https://${vercelUrl}`;
    } else {
        // Fallback for local or other deployments
        const host = headers.get("host")!;
        const protocol = host.startsWith("localhost") ? "http" : "https";
        baseUrl = `${protocol}://${host}`;
    }
    // --- End Dynamic Base URL ---

    const userIpAddress =
        headers.get("x-forwarded-for")?.split(",")[0] ||
        headers.get("remote_addr") ||
        "IP N/A";
    const currentDate = new Date().toLocaleDateString();

    const annotations = [
        // ... (Your annotations remain the same) ...
        {
            type: "rtext",
            text: userName ? `User: ${userName}` : "Viewer",
            alpha: "0.60",
            color: "0xFFFFFF",
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
            color: "0x00FFFF",
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
            color: "0xFFFF00",
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
            color: "0xFF0000",
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

    const nameParts = userName ? userName.split(" ") : ["Valued"];
    const givenName = nameParts[0];
    const surname =
        nameParts.length > 1 ? nameParts.slice(1).join(" ") : "Customer";

    const xenditRes = await fetch("https://api.xendit.co/v2/invoices", {
        method: "POST",
        headers: {
            Authorization: `Basic ${Buffer.from(XENDIT_API_KEY + ":").toString(
                "base64"
            )}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            external_id: `invoice-${Date.now()}`,
            amount: 1000,
            payer_email: userEmail,
            description: `Trading Course for ${userName}`,
            currency: "PHP", // Ensure currency is set
            // --- Use the dynamic baseUrl ---
            success_redirect_url: `${baseUrl}/success?userName=${encodeURIComponent(
                userName
            )}&userEmail=${encodeURIComponent(userEmail)}`,
            failure_redirect_url: `${baseUrl}/failure`,
            // --- End dynamic URLs ---
            customer: {
                given_names: givenName,
                surname: surname,
                email: userEmail,
            },
            customer_notification_preference: {
                invoice_created: ["email"],
                invoice_paid: ["email"],
            },
        }),
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

    const vdoRes = await fetch(
        `https://dev.vdocipher.com/api/videos/${VIDEO_ID}/otp`,
        {
            method: "POST",
            headers: {
                Authorization: `Apisecret ${API_SECRET_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                ttl: 300, // Consider if 300 seconds is enough post-payment
                annotate: JSON.stringify(annotations),
            }),
        }
    );

    if (!vdoRes.ok) {
        const errorData = await vdoRes.text();
        console.error("VdoCipher API Error:", errorData);
        // Even if VdoCipher fails, we should probably still send the payment link
        // Or handle this more gracefully. For now, we'll send it but log error.
        return NextResponse.json(
            {
                error: "Fetched payment link, but failed to get OTP",
                paymentLink,
            },
            { status: 500 } // Or a different status
        );
    }

    const vdoData = await vdoRes.json();

    // IMPORTANT: Your /api/otp route now seems to *always* return both VdoCipher OTP
    // AND a Xendit payment link. This is confusing. On the success page, you only
    // need the OTP. On the main page, you only need the payment link.
    // You should *strongly consider* splitting this into two API routes:
    // 1. /api/create-payment -> Creates Xendit invoice, returns paymentLink.
    // 2. /api/get-video-otp -> Called ONLY from success page, returns VdoCipher OTP.
    // For now, we return both as your previous code did.
    return NextResponse.json({ ...vdoData, paymentLink });
}
