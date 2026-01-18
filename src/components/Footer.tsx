"use client";

import Link from "next/link";
import { Mail, Shield, Scale } from "lucide-react";

export default function Footer() {
    return (
        <footer className="w-full max-w-4xl mx-auto py-12 px-4 border-t border-white/5 mt-24">
            <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="space-y-2 text-center md:text-left">
                    <h3 className="text-white font-black italic text-xl">DocSqueezer</h3>
                    <p className="text-slate-500 text-xs tracking-widest uppercase">Privacy-First Document Engine</p>
                </div>

                <div className="flex flex-wrap justify-center gap-6 md:gap-10">
                    <Link href="/privacy" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium">
                        <Shield className="w-4 h-4" /> Privacy
                    </Link>
                    <Link href="/terms" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium">
                        <Scale className="w-4 h-4" /> Terms
                    </Link>
                    <a href="mailto:support@docsqueezer.com" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium">
                        <Mail className="w-4 h-4" /> Support
                    </a>
                </div>
            </div>

            <div className="mt-12 text-center">
                <p className="text-slate-600 text-[10px] uppercase tracking-[0.2em]">
                    &copy; 2026 DocSqueezer &bull; Made with Privacy in mind
                </p>
            </div>
        </footer>
    );
}
