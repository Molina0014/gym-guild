import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get("code");
    const token_hash = searchParams.get("token_hash");
    const type = searchParams.get("type");
    const next = searchParams.get("next") ?? "/home";
    const error_description = searchParams.get("error_description");

    // If there's an error from Supabase, redirect to login with error
    if (error_description) {
        console.error("Auth callback error:", error_description);
        return NextResponse.redirect(
            `${origin}/login?error=${encodeURIComponent(error_description)}`,
        );
    }

    const supabase = await createClient();

    // Handle PKCE flow (code-based) - this is what Supabase uses by default now
    if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
            console.error("Code exchange error:", error.message);
            return NextResponse.redirect(
                `${origin}/login?error=${encodeURIComponent(error.message)}`,
            );
        }

        return await redirectAfterAuth(supabase, origin, next);
    }

    // Handle token hash flow (email link - legacy)
    if (token_hash && type) {
        const { error } = await supabase.auth.verifyOtp({
            token_hash,
            type: type as "email" | "magiclink",
        });

        if (error) {
            console.error("OTP verification error:", error.message);
            return NextResponse.redirect(
                `${origin}/login?error=${encodeURIComponent(error.message)}`,
            );
        }

        return await redirectAfterAuth(supabase, origin, next);
    }

    // No valid auth parameters found
    console.error("No auth parameters found in callback URL");
    return NextResponse.redirect(`${origin}/login?error=invalid_callback`);
}

async function redirectAfterAuth(
    supabase: Awaited<ReturnType<typeof createClient>>,
    origin: string,
    next: string,
) {
    // Check if user has a character
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (user) {
        const { data: character } = await supabase
            .from("characters")
            .select("id")
            .eq("user_id", user.id)
            .single();

        // Redirect to onboarding if no character exists
        if (!character) {
            return NextResponse.redirect(`${origin}/onboarding`);
        }
    }

    return NextResponse.redirect(`${origin}${next}`);
}
