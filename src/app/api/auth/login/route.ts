import { createRouteSupabase } from "@/utils/supabase/route";
import { NextResponse } from "next/server";

export async function POST(req: Request) {

    const supabase = await createRouteSupabase()

    try {
        const body = await req.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json({ error: "Email and password required" }, { status: 400 });
        }

        const {
            data,
            error,
        } = await supabase.auth.signInWithPassword({ email, password });

        if (error) return NextResponse.json({ error: error.message }, { status: 400 });

        return NextResponse.json({ user: data.user ?? null, session: data.session ?? null });
    } catch (err) {
        return NextResponse.json({ error: err instanceof Error ? err?.message : String(err) }, { status: 500 });
    }
}
