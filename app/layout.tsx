import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Trading",
    description: "Generated by create next app",
};
export async function generateViewport(): Promise<Viewport> {
    return {
        width: "device-width",
        initialScale: 1.0,
        // You can add other viewport properties here if needed:
        // maximumScale: 1.0,
        // userScalable: false,
        // themeColor: '#000000', // Example
    };
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
                {children}
            </body>
        </html>
    );
}
