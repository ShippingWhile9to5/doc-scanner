"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Lock, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { createClient } from "@/lib/supabase";
import Link from "next/link";

export default function ResetPasswordPage() {
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [verifying, setVerifying] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const { updatePassword, session } = useAuth();
    const supabase = createClient();

    useEffect(() => {
        const handleToken = async () => {
            // 1. If we already have a session, we are likely good to go
            const { data: { session: existingSession } } = await supabase.auth.getSession();
            if (existingSession) {
                setVerifying(false);
                return;
            }

            // 2. Check for manual token in URL
            const url = new URL(window.location.href);
            const token = url.searchParams.get("token");
            const type = url.searchParams.get("type") || "recovery";

            if (token && type === "recovery") {
                // Determine if it's a 6-digit code or a long hash
                const isHash = token.length > 10;

                const { error: verifyError } = await supabase.auth.verifyOtp(
                    isHash
                        ? { token_hash: token, type: 'recovery' }
                        : { email: '', token, type: 'recovery' } // Note: recovery OTP usually isn't verified like this, 
                    // but Supabase supports it. Actually recovery links 
                    // from dashboard are hashes.
                );

                if (verifyError) {
                    console.error("Verification error:", verifyError);
                    setError("Invalid or expired reset link. Please try requesting a new one from the login page.");
                }
            } else {
                // If there's no token and no session, we shouldn't be here
                // But we'll let it pass and let handleSubmit catch the missing session
                // to avoid blocking users who might be in a weird state.
            }
            setVerifying(false);
        };

        handleToken();
    }, [supabase]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!session) {
            setError("Session not found. Please try clicking the reset link again or request a new one.");
            setLoading(false);
            return;
        }

        try {
            const { error } = await updatePassword(password);
            if (error) {
                setError(error.message);
            } else {
                setSuccess(true);
            }
        } catch (err) {
            setError("An unexpected error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (verifying) {
        return (
            <main className="min-h-screen flex items-center justify-center bg-slate-950">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </main>
        );
    }

    return (
        <main className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md"
            >
                <Card className="border-none shadow-2xl bg-white/95 backdrop-blur-sm rounded-3xl overflow-hidden">
                    <CardContent className="p-8">
                        {success ? (
                            <div className="text-center space-y-6">
                                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                                    <CheckCircle2 className="w-8 h-8" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">Password Updated!</h2>
                                    <p className="text-sm text-gray-500 mt-2">
                                        Your password has been changed successfully.
                                    </p>
                                </div>
                                <Link href="/" className="block">
                                    <Button className="w-full h-14 rounded-2xl text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                                        Back to Login
                                    </Button>
                                </Link>
                            </div>
                        ) : (
                            <>
                                <div className="text-center mb-8">
                                    <h2 className="text-2xl font-bold text-gray-900">Set New Password</h2>
                                    <p className="text-sm text-gray-500 mt-2">
                                        Enter a new secure password for your account.
                                    </p>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="password"
                                            placeholder="Min 8 characters"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            minLength={8}
                                            className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-gray-900"
                                        />
                                    </div>

                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm"
                                        >
                                            {error}
                                        </motion.div>
                                    )}

                                    <Button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full h-14 rounded-2xl text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                                    >
                                        {loading ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <>
                                                Update Password
                                                <ArrowRight className="w-5 h-5 ml-2" />
                                            </>
                                        )}
                                    </Button>
                                </form>
                            </>
                        )}
                    </CardContent>
                </Card>
            </motion.div>
        </main>
    );
}
