import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get("code");
    const token_hash = searchParams.get("token_hash");
    const type = searchParams.get("type");
    const next = searchParams.get("next") ?? "/home";

    const supabase = await createClient();

    // Handle PKCE flow (code-based)
    if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error) {
            return await redirectAfterAuth(supabase, origin, next);
        }
    }

    // Handle token hash flow (email link)
    if (token_hash && type) {
        const { error } = await supabase.auth.verifyOtp({
            token_hash,
            type: type as "email" | "magiclink",
        });

        if (!error) {
            return await redirectAfterAuth(supabase, origin, next);
        }
    }

    // Return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/login?error=auth_failed`);
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
