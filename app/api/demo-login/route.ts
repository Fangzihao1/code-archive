import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const email = process.env.DEMO_ACCOUNT_EMAIL?.trim();
    const password = process.env.DEMO_ACCOUNT_PASSWORD;

    if (!url || !anonKey || !email || !password) {
      return NextResponse.json(
        { error: "体验账号尚未配置，请检查 Vercel 环境变量 DEMO_ACCOUNT_EMAIL 和 DEMO_ACCOUNT_PASSWORD。" },
        { status: 503 }
      );
    }

    const response = NextResponse.json({ ok: true });
    const supabase = createServerClient(url, anonKey, {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet: { name: string; value: string; options?: any }[]) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    });

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      return NextResponse.json(
        { error: "体验账号登录失败。请检查 Supabase 中该体验账号是否已创建、邮箱是否已验证，以及账号密码是否与 Vercel 环境变量一致。" },
        { status: 401 }
      );
    }

    return response;
  } catch (error) {
    console.error("[demo-login] unexpected error:", error);
    return NextResponse.json(
      { error: "体验登录服务暂时不可用，请稍后重试；如持续出现，请检查 Vercel Function Logs。" },
      { status: 500 }
    );
  }
}
