"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ScannerUI from "@/components/ScannerUI";
import AuthForm from "@/components/AuthForm";
import { Loader2, LogOut, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import MarketingSections from "@/components/MarketingSections";
import Footer from "@/components/Footer";

export default function Home() {
  const { user, loading, signOut, isRecovering } = useAuth();
  const router = useRouter();

  const [isPro, setIsPro] = useState(false);

  useEffect(() => {
    if (user?.id) {
      import("@/lib/profile").then(({ checkCanConvert }) => {
        checkCanConvert(user.id).then(info => setIsPro(info.isPro));
      });
    }
  }, [user?.id]);

  useEffect(() => {
    // Fail-safe: if the user lands on Home with a recovery hash, kick them to reset page
    if (window.location.hash.includes("type=recovery") || window.location.search.includes("type=recovery")) {
      router.push("/reset-password" + window.location.hash + window.location.search);
    }
  }, [router]);

  if (loading || isRecovering) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white space-y-4">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        <p className="text-sm text-slate-400">Securing your session...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen py-10 md:py-20 px-4">
      {user ? (
        <div className="w-full space-y-4">
          {/* User Bar */}
          <div className="max-w-2xl mx-auto w-full flex justify-between items-center text-white/80 text-sm">
            <div className="flex items-center gap-2">
              <span className="bg-white/10 px-3 py-1 rounded-full text-xs">👋 {user.email}</span>
              {isPro && (
                <span className="bg-gradient-to-r from-amber-400 to-amber-600 text-black text-[10px] font-black px-2 py-0.5 rounded-full tracking-tighter shadow-lg shadow-amber-500/20">
                  PRO
                </span>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={signOut}
              className="text-white/60 hover:text-white hover:bg-white/10"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
          <ScannerUI />
        </div>
      ) : (
        <div className="w-full space-y-12">
          <div className="text-center text-white space-y-4">
            <h1 className="text-5xl md:text-7xl font-black tracking-tight bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent italic">
              DocSqueezer
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 opacity-80 font-medium">The Privacy-First Document Scanner</p>
          </div>

          <AuthForm />

          <MarketingSections />
        </div>
      )}
    </main>
  );
}
