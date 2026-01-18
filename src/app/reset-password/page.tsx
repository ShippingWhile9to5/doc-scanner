"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function ResetPasswordCapturePage() {
    const router = useRouter();
    const { session } = useAuth();

    useEffect(() => {
        // This page is a middle-man. 
        // Supabase will handle the hash in the URL, sign the user in, 
        // and our AuthContext will catch the PASSWORD_RECOVERY event to push them to /update-password.
        // We just show a loader here.

        const timeout = setTimeout(() => {
            // Fallback: if after 5 seconds nothing happened, but we have a session, 
            // maybe we missed the event but we are logged in.
            if (session) {
                router.push('/update-password');
            }
        }, 5000);

        return () => clearTimeout(timeout);
    }, [session, router]);

    return (
        <main className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white space-y-4">
            <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
            <h1 className="text-xl font-medium">Securing your session...</h1>
            <p className="text-slate-400 text-sm">Please wait while we redirect you.</p>
        </main>
    );
}
