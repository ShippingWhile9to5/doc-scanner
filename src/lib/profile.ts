import { createClient } from "./supabase";

export interface UserProfile {
    id: string;
    email: string;
    usage_count: number;
    is_pro: boolean;
    created_at: string;
}

export async function getProfile(userId: string): Promise<UserProfile | null> {
    try {
        const supabase = createClient();
        const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", userId)
            .single();

        if (error) {
            console.error("Error fetching profile:", error);
            // If profile doesn't exist, create it
            if (error.code === "PGRST116") {
                return await createProfile(userId);
            }
            return null;
        }

        return data;
    } catch (err) {
        console.error("Exception in getProfile:", err);
        return null;
    }
}

async function createProfile(userId: string): Promise<UserProfile | null> {
    try {
        const supabase = createClient();
        const { data: userData } = await supabase.auth.getUser();

        const { data, error } = await supabase
            .from("profiles")
            .insert({
                id: userId,
                email: userData.user?.email || "",
                usage_count: 0,
                is_pro: false,
            })
            .select()
            .single();

        if (error) {
            console.error("Error creating profile:", error);
            return null;
        }

        return data;
    } catch (err) {
        console.error("Exception in createProfile:", err);
        return null;
    }
}

export async function incrementUsage(userId: string): Promise<number | null> {
    try {
        const supabase = createClient();

        // First get current count
        const { data: profile } = await supabase
            .from("profiles")
            .select("usage_count")
            .eq("id", userId)
            .single();

        if (!profile) return null;

        const newCount = (profile.usage_count || 0) + 1;

        // Update the count
        const { error } = await supabase
            .from("profiles")
            .update({ usage_count: newCount })
            .eq("id", userId);

        if (error) {
            console.error("Error updating usage:", error);
            return null;
        }

        return newCount;
    } catch (err) {
        console.error("Exception in incrementUsage:", err);
        return null;
    }
}

export async function checkCanConvert(userId: string): Promise<{ canConvert: boolean; usageCount: number; isPro: boolean }> {
    try {
        const profile = await getProfile(userId);

        if (!profile) {
            // If no profile, allow conversion (we'll create profile on first use)
            return { canConvert: true, usageCount: 0, isPro: false };
        }

        const canConvert = profile.is_pro || profile.usage_count < 2;

        return {
            canConvert,
            usageCount: profile.usage_count,
            isPro: profile.is_pro,
        };
    } catch (err) {
        console.error("Exception in checkCanConvert:", err);
        // Default to allowing conversion if there's an error
        return { canConvert: true, usageCount: 0, isPro: false };
    }
}

export async function upgradeToPro(userId: string): Promise<boolean> {
    try {
        const supabase = createClient();
        const { error } = await supabase
            .from("profiles")
            .update({ is_pro: true })
            .eq("id", userId);

        if (error) {
            console.error("Error upgrading profile:", error);
            return false;
        }

        return true;
    } catch (err) {
        console.error("Exception in upgradeToPro:", err);
        return false;
    }
}
