import {NextResponse} from "next/server";import {createClient} from "@/lib/supabase/server";
export async function GET(request:Request){const {searchParams,origin}=new URL(request.url),code=searchParams.get("code"),next=searchParams.get("next")??"/home";
 if(code){const sb=await createClient();const {error}=await sb.auth.exchangeCodeForSession(code);if(!error)return NextResponse.redirect(`${origin}${next.startsWith("/")?next:"/home"}`);}
 return NextResponse.redirect(`${origin}/login?error=verification`);}
