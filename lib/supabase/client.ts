import { createBrowserClient } from "@supabase/ssr";
export function createClient() {
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL, key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if(!url||!key) throw new Error("尚未配置 Supabase 环境变量。");
  return createBrowserClient(url,key);
}
