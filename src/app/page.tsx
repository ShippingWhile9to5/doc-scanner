"use client";

import { useAuth } from "@/contexts/AuthContext";
import ScannerUI from "@/components/ScannerUI";
import AuthForm from "@/components/AuthForm";
import { Loader2, LogOut, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import MarketingSections from "@/components/MarketingSections";

export default function Home() {
  const { user, loading, signOut } = useAuth();

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
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

          {/* Small Pro Reminder for Authenticated Users */}
          <div className="max-w-2xl mx-auto w-full text-center pt-8">
            <div className="inline-flex items-center gap-2 text-xs text-white/40 bg-white/5 px-4 py-2 rounded-full border border-white/5">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Go Pro for unlimited documents & premium scan filters</span>
            </div>
          </div>
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
