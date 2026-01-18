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
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const { updatePassword, stopRecovery, signOut } = useAuth();
    const supabase = createClient();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // 1. Check for session
            let { data: { session } } = await supabase.auth.getSession();

            // 2. If no session, try to verify token from URL
            if (!session) {
                const url = new URL(window.location.href);
                const token = url.searchParams.get("token") || url.searchParams.get("token_hash");
                const type = url.searchParams.get("type") || "recovery";

                if (token && type === "recovery") {
                    const isHash = token.length > 10;
                    const { data, error: verifyError } = await supabase.auth.verifyOtp(
                        isHash
                            ? { token_hash: token, type: 'recovery' }
                            : { email: '', token, type: 'recovery' }
                    );

                    if (verifyError) {
                        setError("This reset link is invalid or has expired. Please request a new one.");
                        setLoading(false);
                        return;
                    }
                    session = data.session;
                }
            }

            // 3. Final session check
            if (!session) {
                setError("No active reset session found. Please click the link in your email again.");
                setLoading(false);
                return;
            }

            // 4. Update the password
            const { error: updateError } = await updatePassword(password);
            if (updateError) {
                setError(updateError.message);
            } else {
                setSuccess(true);
            }
        } catch (err) {
            setError("An unexpected error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };



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
                                    <Button
                                        onClick={stopRecovery}
                                        className="w-full h-14 rounded-2xl text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                                    >
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
