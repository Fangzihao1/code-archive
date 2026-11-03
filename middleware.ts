import {NextResponse,type NextRequest} from "next/server";
import {createServerClient} from "@supabase/ssr";
export async function middleware(request:NextRequest){
 let response=NextResponse.next({request});
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,path=request.nextUrl.pathname;
 if(!url||!key){if(path==="/login"||path.startsWith("/auth"))return response;const u=request.nextUrl.clone();u.pathname="/login";u.searchParams.set("setup","1");return NextResponse.redirect(u);}
 const supabase=createServerClient(url,key,{cookies:{getAll:()=>request.cookies.getAll(),setAll(items){items.forEach(({name,value})=>request.cookies.set(name,value));response=NextResponse.next({request});items.forEach(({name,value,options})=>response.cookies.set(name,value,options));}}});
 const {data:{user}}=await supabase.auth.getUser(), authPage=path==="/login"||path.startsWith("/auth/")||path==="/api/demo-login";
 if(!user&&!authPage){const u=request.nextUrl.clone();u.pathname="/login";u.searchParams.set("next",path);return NextResponse.redirect(u);}
 if(user&&path==="/login"){const u=request.nextUrl.clone();u.pathname="/home";u.search="";return NextResponse.redirect(u);}
 if(user&&path.startsWith("/admin")&&(!process.env.ADMIN_EMAIL||user.email!==process.env.ADMIN_EMAIL)){const u=request.nextUrl.clone();u.pathname="/home";u.search="";return NextResponse.redirect(u);}
 return response;
}
export const config={matcher:["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"]};
