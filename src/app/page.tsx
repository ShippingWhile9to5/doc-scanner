"use client";

import { useAuth } from "@/contexts/AuthContext";
import ScannerUI from "@/components/ScannerUI";
import AuthForm from "@/components/AuthForm";
import { Loader2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

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
        <div className="space-y-4">
          {/* User Bar */}
          <div className="max-w-2xl mx-auto flex justify-between items-center text-white/80 text-sm">
            <span>👋 {user.email}</span>
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
        <div className="space-y-8">
          <div className="text-center text-white space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">Squeezer</h1>
            <p className="text-blue-100 opacity-80">Premium Document Scanner & Compressor</p>
          </div>
          <AuthForm />
        </div>
      )}
    </main>
  );
}
