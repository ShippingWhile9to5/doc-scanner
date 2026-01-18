"use client";

import Link from "next/link";
import { ArrowLeft, ShieldCheck, Lock, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PrivacyPage() {
    return (
        <main className="min-h-screen py-20 px-4 bg-slate-950 text-slate-200">
            <div className="max-w-3xl mx-auto space-y-12">
                <Link href="/">
                    <Button variant="ghost" className="text-slate-400 hover:text-white mb-8">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to App
                    </Button>
                </Link>

                <div className="space-y-4">
                    <h1 className="text-4xl font-black text-white italic">Privacy Policy</h1>
                    <p className="text-slate-400">Effective Date: January 18, 2026</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-8">
                    <div className="p-6 bg-white/5 rounded-3xl border border-white/10 space-y-3">
                        <Lock className="w-6 h-6 text-blue-500" />
                        <h3 className="font-bold text-white">On-Device</h3>
                        <p className="text-xs text-slate-400">Your documents never reach our servers.</p>
                    </div>
                    <div className="p-6 bg-white/5 rounded-3xl border border-white/10 space-y-3">
                        <EyeOff className="w-6 h-6 text-purple-500" />
                        <h3 className="font-bold text-white">No Tracking</h3>
                        <p className="text-xs text-slate-400">We don't use invasive analytics or ads.</p>
                    </div>
                    <div className="p-6 bg-white/5 rounded-3xl border border-white/10 space-y-3">
                        <ShieldCheck className="w-6 h-6 text-green-500" />
                        <h3 className="font-bold text-white">Secure Pay</h3>
                        <p className="text-xs text-slate-400">Payment data is handled entirely by Stripe.</p>
                    </div>
                </div>

                <div className="prose prose-invert max-w-none space-y-8">
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">1. Information We Collect</h2>
                        <p>We believe in "Data Minimalism." We only collect the bare minimum required to provide the service:</p>
                        <ul className="list-disc pl-6 space-y-2 text-slate-400">
                            <li><strong>Account Data:</strong> Your email address and basic profile info via Supabase (for logging in and tracking your subscription).</li>
                            <li><strong>Usage Data:</strong> We keep track of the number of conversions you perform to enforce our free/pro limits.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">2. Your Documents (Crucial)</h2>
                        <p className="text-xl text-blue-100/90 font-medium">Your files never leave your device.</p>
                        <p className="text-slate-400">
                            Unlike traditional PDF tools, DocSqueezer uses your device's local processing power (JavaScript) to scan and compress documents. We do not upload, store, or view your private documents on our servers.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">3. Payments</h2>
                        <p className="text-slate-400">
                            Subscription payments are processed securely via <strong>Stripe</strong>. DocSqueezer does not store your credit card details or billing information on its own databases.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">4. Cookies</h2>
                        <p className="text-slate-400">
                            We use essential cookies to keep you logged in and remember your preferences. We do not use third-party tracking or advertising cookies.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">5. Contact</h2>
                        <p className="text-slate-400">
                            If you have questions about your privacy, contact us at: <span className="text-blue-400">support@docsqueezer.com</span>
                        </p>
                    </section>
                </div>

                <div className="pt-12 border-t border-white/10 text-center text-slate-500 text-sm">
                    &copy; 2026 DocSqueezer. All rights reserved.
                </div>
            </div>
        </main>
    );
}
