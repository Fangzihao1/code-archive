"use client";
import Link from "next/link";import {usePathname,useRouter} from "next/navigation";import {createClient} from "@/lib/supabase/client";import {useState} from "react";
export default function SiteHeader(){const path=usePathname(),router=useRouter(),[busy,setBusy]=useState(false);
 const links=[["/home","首页"],["/exercises","课堂练习"],["/gallery","代码图库"],["/about","关于我"]];
async function logout() {
  setBusy(true);
  try {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  } finally {
    setBusy(false);
  }
}
 return <header className="site-header"><Link href="/home" className="brand">CODE ARCHIVE<span> / PYTHON</span></Link><nav>{links.map(([href,label])=><Link key={href} href={href} className={path===href?"active":""}>{label}</Link>)}</nav><div className="header-actions"><Link href="/admin" className="admin-link">管理后台 ↗</Link><button className="logout-button" onClick={logout} disabled={busy}>{busy?"退出中…":"退出登录"}</button></div></header>;
}
