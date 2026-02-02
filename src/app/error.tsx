"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCcw } from "lucide-react";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to console for debugging
        console.error("Application error:", error);
    }, [error]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
            <div className="max-w-md w-full bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 space-y-6 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                    <AlertCircle className="w-8 h-8 text-red-600" />
                </div>

                <div className="space-y-2">
                    <h1 className="text-2xl font-bold text-gray-900">
                        Oops! Something went wrong
                    </h1>
                    <p className="text-gray-600 text-sm">
                        We encountered an unexpected error. Don't worry, your data is safe.
                    </p>
                </div>

                {error.message && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                        <p className="text-xs text-red-800 font-mono break-words">
                            {error.message}
                        </p>
                    </div>
                )}

                <div className="flex flex-col gap-3">
                    <Button
                        onClick={reset}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl h-12"
                    >
                        <RefreshCcw className="w-4 h-4 mr-2" />
                        Try Again
                    </Button>

                    <Button
                        variant="outline"
                        onClick={() => window.location.href = "/"}
                        className="w-full rounded-xl h-12"
                    >
                        Go to Home
                    </Button>
                </div>

                <p className="text-xs text-gray-400">
                    If this problem persists, please contact support.
                </p>
            </div>
        </div>
    );
}
