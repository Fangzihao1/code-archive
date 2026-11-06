
import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const path = request.nextUrl.pathname;

  if (!url || !key) {
    if (path === "/login" || path.startsWith("/auth")) {
      return response;
    }

    const u = request.nextUrl.clone();
    u.pathname = "/login";
    u.searchParams.set("setup", "1");
    return NextResponse.redirect(u);
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(
        items: {
          name: string;
          value: string;
          options?: Record<string, unknown>;
        }[]
      ) {
        items.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });

        response = NextResponse.next({ request });

        items.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const authPage =
    path === "/login" ||
    path.startsWith("/auth/") ||
    path === "/api/demo-login";

  if (!user && !authPage) {
    const u = request.nextUrl.clone();
    u.pathname = "/login";
    u.searchParams.set("next", path);
    return NextResponse.redirect(u);
  }

  if (user && path === "/login") {
    const u = request.nextUrl.clone();
    u.pathname = "/home";
    u.search = "";
    return NextResponse.redirect(u);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
