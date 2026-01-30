"use client";

import React from "react";
import { motion } from "framer-motion";
import {
    ShieldCheck,
    Smartphone,
    Zap,
    Upload,
    Settings2,
    Download,
    Lock,
    Sparkles,
    FileCheck
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const steps = [
    {
        icon: <Upload className="w-6 h-6" />,
        title: "Upload",
        description: "Upload PDFs or images to compress instantly."
    },
    {
        icon: <Settings2 className="w-6 h-6" />,
        title: "Optimize",
        description: "Adjust quality or apply the 'Premium Scan' look instantly."
    },
    {
        icon: <Download className="w-6 h-6" />,
        title: "Download",
        description: "Get your compressed, professional PDF in seconds."
    }
];

const features = [
    {
        icon: <ShieldCheck className="w-5 h-5 text-green-500" />,
        title: "100% Private",
        description: "Files are processed on YOUR device. They NEVER leave your phone or laptop."
    },
    {
        icon: <Smartphone className="w-5 h-5 text-blue-500" />,
        title: "PWA Powered",
        description: "Install it on your home screen for a native app experience on iOS & Android."
    },
    {
        icon: <Zap className="w-5 h-5 text-amber-500" />,
        title: "Blazing Fast",
        description: "No slow server uploads. Instant optimization for the smallest file sizes."
    },
    {
        icon: <Sparkles className="w-5 h-5 text-purple-500" />,
        title: "Premium Scan Look",
        description: "Turn photos into clean, high-contrast digital documents automatically."
    }
];

export default function MarketingSections() {
    return (
        <div className="w-full max-w-4xl mx-auto space-y-24 py-12 px-2">

            {/* Trust Badges */}
            <div className="flex flex-wrap justify-center gap-4 md:gap-8 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                <div className="flex items-center gap-2 text-white">
                    <Lock className="w-4 h-4" />
                    <span className="text-sm font-semibold tracking-wide">ENCRYPTED</span>
                </div>
                <div className="flex items-center gap-2 text-white">
                    <ShieldCheck className="w-4 h-4" />
                    <span className="text-sm font-semibold tracking-wide">PRIVACY-FIRST</span>
                </div>
                <div className="flex items-center gap-2 text-white">
                    <FileCheck className="w-4 h-4" />
                    <span className="text-sm font-semibold tracking-wide">NO CLOUD STORAGE</span>
                </div>
            </div>

            {/* How it Works Section */}
            <section className="space-y-12">
                <div className="text-center space-y-4">
                    <h2 className="text-3xl font-bold text-white">How it Works</h2>
                    <p className="text-blue-100/60 max-w-lg mx-auto">Squeeze your documents in three simple steps without compromising your privacy.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {steps.map((step, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="relative text-center space-y-4"
                        >
                            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-white mx-auto shadow-xl backdrop-blur-sm border border-white/10">
                                {step.icon}
                            </div>
                            <h3 className="text-xl font-bold text-white">{step.title}</h3>
                            <p className="text-blue-100/60 text-sm leading-relaxed">{step.description}</p>

                            {index < steps.length - 1 && (
                                <div className="hidden md:block absolute top-8 -right-4 text-white/20">
                                    <ArrowRightIcon className="w-8 h-8" />
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Features Grid */}
            <section className="space-y-12 pb-12">
                <div className="text-center space-y-4">
                    <h2 className="text-3xl font-bold text-white">Why DocSqueezer?</h2>
                    <p className="text-blue-100/60 max-w-lg mx-auto">Other tools keep your files. We only keep your trust.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {features.map((feature, index) => (
                        <Card key={index} className="bg-white/5 border-white/10 backdrop-blur-md rounded-3xl">
                            <CardContent className="p-6 flex gap-4">
                                <div className="p-3 bg-white/10 rounded-xl h-fit">
                                    {feature.icon}
                                </div>
                                <div className="space-y-1">
                                    <h3 className="font-bold text-white">{feature.title}</h3>
                                    <p className="text-blue-100/90 text-sm">{feature.description}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>
        </div>
    );
}

function ArrowRightIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
        </svg>
    )
}
