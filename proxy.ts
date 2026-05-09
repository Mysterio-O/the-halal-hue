import { createMiddlewareSupabase } from "@/utils/supabase/middleware";
import { NextResponse, type NextRequest } from "next/server";

const AUTH_ROUTES = [ "/login"];
const PROTECTED_PREFIXES = ["/admin","/admin/*"];

function isAuthRoute(pathname: string) {
    return AUTH_ROUTES.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

function isProtectedRoute(pathname: string) {
    return PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

// Copy cookies from one NextResponse to another
function copyCookies(from: NextResponse, to: NextResponse) {
    from.cookies.getAll().forEach((c) => {
        // Note: getAll() returns name/value; that's enough for Supabase cookies.
        to.cookies.set(c.name, c.value);
    });
    return to;
}

export async function proxy(request: NextRequest) {
    const { supabase, response } = createMiddlewareSupabase(request);
    const { pathname, search } = request.nextUrl;

    // This may refresh cookies and write them into `response`
    const { data: { user } } = await supabase.auth.getUser();

    // Protected without user -> redirect to login
    if (isProtectedRoute(pathname) && !user) {
        const url = request.nextUrl.clone();
        url.pathname = "/login";
        url.searchParams.set("reason", "expired");
        url.searchParams.set("next", pathname + search);

        const redirectRes = NextResponse.redirect(url);
        return copyCookies(response, redirectRes); // keep refreshed cookies
    }

    // Logged in user on auth route -> redirect away
    if (isAuthRoute(pathname) && user) {
        const url = request.nextUrl.clone();
        url.pathname = "/admin";
        url.search = "";

        const redirectRes = NextResponse.redirect(url);
        return copyCookies(response, redirectRes); // keep refreshed cookies
    }

    return response;
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
    ],
};