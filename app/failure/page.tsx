"use client";

export default function FailurePage() {
    return (
        <main className="flex min-h-screen flex-col items-center p-4 bg-gray-100">
            <div className="w-full max-w-2xl">
                <h1 className="text-2xl md:text-3xl font-bold mb-4 text-black text-center">
                    Payment Failed
                </h1>
                <p className="text-center">
                    Unfortunately, your payment could not be processed. Please try again or contact support for assistance.
                </p>
            </div>
        </main>
    );
}
