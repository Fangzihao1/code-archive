import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const path = request.nextUrl.pathname;

  if (!url || !key) {
    if (path === "/login" || path.startsWith("/auth") || path === "/api/demo-login") return response;
    const target = request.nextUrl.clone();
    target.pathname = "/login";
    target.searchParams.set("setup", "1");
    return NextResponse.redirect(target);
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(items: { name: string; value: string; options?: Record<string, unknown> }[]) {
        items.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        items.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const { data: { user } } = await supabase.auth.getUser();
  const authPage = path === "/login" || path.startsWith("/auth/") || path === "/api/demo-login";

  const publicPage = path === "/" || path === "/home" || path === "/exercises" ||
    path.startsWith("/exercises/") || path === "/about";

  if (!user && !authPage && !publicPage) {
    const target = request.nextUrl.clone();
    target.pathname = "/login";
    target.searchParams.set("next", path);
    return NextResponse.redirect(target);
  }

  if (user && path.startsWith("/admin")) {
    const allowedEmails = [process.env.ADMIN_EMAIL, process.env.DEMO_ACCOUNT_EMAIL]
      .filter((value): value is string => Boolean(value))
      .map((value) => value.trim().toLowerCase());
    const currentEmail = user.email?.trim().toLowerCase();
    if (!currentEmail || !allowedEmails.includes(currentEmail)) {
      const target = request.nextUrl.clone();
      target.pathname = "/home";
      target.search = "";
      target.searchParams.set("admin", "forbidden");
      return NextResponse.redirect(target);
    }
  }

  if (user && path === "/login") {
    const target = request.nextUrl.clone();
    target.pathname = "/home";
    target.search = "";
    return NextResponse.redirect(target);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
