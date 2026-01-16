"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Sparkles, Zap, Shield, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface UpgradeModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function UpgradeModal({ isOpen, onClose }: UpgradeModalProps) {
    const [billingCycle, setBillingCycle] = React.useState<'monthly' | 'yearly'>('yearly');

    const price = billingCycle === 'monthly' ? "£6.99" : "£35.99";
    const period = billingCycle === 'monthly' ? "/ month" : "/ year";
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-lg"
                    >
                        <Card className="border-none shadow-2xl bg-white/95 backdrop-blur-md overflow-hidden rounded-3xl">
                            <CardContent className="p-0">
                                {/* Header with Gradient */}
                                <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-8 text-white text-center relative overflow-hidden">
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                        className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-3xl"
                                    />

                                    <div className="relative z-10 flex flex-col items-center gap-4">
                                        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md shadow-lg mb-2">
                                            <Crown className="w-8 h-8 text-white" />
                                        </div>
                                        <div>
                                            <h2 className="text-3xl font-bold">Upgrade to Pro</h2>
                                            <p className="text-white/80 mt-2">Unlock unlimited potential.</p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={onClose}
                                        className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Content */}
                                <div className="p-8 space-y-8">
                                    <div className="space-y-4">
                                        <FeatureItem icon={<Zap className="w-5 h-5 text-yellow-500" />} text="Unlimited PDF Conversions" />
                                        <FeatureItem icon={<Sparkles className="w-5 h-5 text-purple-500" />} text="Premium Scan Filters" />
                                        <FeatureItem icon={<Shield className="w-5 h-5 text-blue-500" />} text="Priority Processing" />
                                    </div>

                                    {/* Billing Toggle */}
                                    <div className="flex justify-center">
                                        <div className="bg-gray-200 p-1.5 rounded-xl flex items-center relative">
                                            <button
                                                onClick={() => setBillingCycle('monthly')}
                                                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${billingCycle === 'monthly' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-600 hover:text-gray-900'}`}
                                            >
                                                Monthly
                                            </button>
                                            <button
                                                onClick={() => setBillingCycle('yearly')}
                                                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all duration-300 relative ${billingCycle === 'yearly' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-600 hover:text-gray-900'}`}
                                            >
                                                Yearly
                                                {/* Savings Badge */}
                                                <motion.span
                                                    initial={{ opacity: 0, scale: 0.5 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    className="absolute -top-3 -right-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md border border-white"
                                                >
                                                    SAVE 57%
                                                </motion.span>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 rounded-2xl p-6 text-center space-y-1 relative overflow-hidden">
                                        <div className="flex items-center justify-center gap-1 relative z-10">
                                            <span className="text-4xl font-bold text-gray-900">{price}</span>
                                            <span className="text-gray-400 text-lg">{period}</span>
                                        </div>
                                        <p className="text-xs text-gray-400">Cancel anytime. No questions asked.</p>
                                    </div>

                                    <Button
                                        className="w-full h-14 rounded-xl text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-xl shadow-purple-200 transition-all hover:scale-[1.02]"
                                        onClick={handleSubscribe}
                                    >
                                        Unlock Unlimited Access
                                    </Button>

                                    <p className="text-center text-xs text-gray-400">
                                        Secure payment powered by Stripe
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

function FeatureItem({ icon, text }: { icon: React.ReactNode; text: string }) {
    return (
        <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors">
            <div className="w-10 h-10 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center">
                {icon}
            </div>
            <span className="font-medium text-gray-700">{text}</span>
            <Check className="w-5 h-5 text-green-500 ml-auto" />
        </div>
    );
}
