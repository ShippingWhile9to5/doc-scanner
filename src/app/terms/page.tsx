"use client";

import Link from "next/link";
import { ArrowLeft, Scale, CreditCard, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TermsPage() {
    return (
        <main className="min-h-screen py-20 px-4 bg-slate-950 text-slate-200">
            <div className="max-w-3xl mx-auto space-y-12">
                <Link href="/">
                    <Button variant="ghost" className="text-slate-400 hover:text-white mb-8">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to App
                    </Button>
                </Link>

                <div className="space-y-4">
                    <h1 className="text-4xl font-black text-white italic">Terms of Service</h1>
                    <p className="text-slate-400">Last Updated: January 18, 2026</p>
                </div>

                <div className="prose prose-invert max-w-none space-y-8">
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                            <Scale className="w-6 h-6 text-blue-500" /> 1. Acceptance of Terms
                        </h2>
                        <p className="text-slate-400">
                            By accessing or using DocSqueezer, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the application.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                            <CreditCard className="w-6 h-6 text-purple-500" /> 2. Subscriptions & Payments
                        </h2>
                        <div className="space-y-4 text-slate-400">
                            <p>
                                <strong>Free Plan:</strong> Limited to 2 documents per scan and a total of 2 conversions per account.
                            </p>
                            <p>
                                <strong>Pro Plan:</strong> Offers unlimited conversions and premium filters. Subscriptions are billed monthly or yearly and recur automatically unless cancelled.
                            </p>
                            <p>
                                <strong>Refunds:</strong> If you are unsatisfied with your Pro subscription, we offer a 7-day money-back guarantee. Contact support to request a refund.
                            </p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                            <Ban className="w-6 h-6 text-red-500" /> 3. Prohibited Use
                        </h2>
                        <p className="text-slate-400">
                            You agree not to use DocSqueezer for any illegal activities or to scan documents that you do not have the legal right to possess. You may not attempt to reverse-engineer or bypass the application's usage limits.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">4. Service Availability</h2>
                        <p className="text-slate-400">
                            While we strive for 100% uptime, DocSqueezer is provided "as is" without warranties of any kind. We reserve the right to modify or discontinue the service at any time.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">5. Limitation of Liability</h2>
                        <p className="text-slate-400">
                            DocSqueezer shall not be liable for any indirect, incidental, or consequential damages resulting from the use or inability to use the service.
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
