"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SiteHeader() {
  const path = usePathname();
  const links = [
    ["/home", "首页"],
    ["/exercises", "课堂练习"],
    ["/gallery", "代码图库"],
    ["/about", "关于我"]
  ];
  return (
    <header className="site-header">
      <Link href="/home" className="brand">CODE ARCHIVE<span> / PYTHON</span></Link>
      <nav>
        {links.map(([href, label]) => (
          <Link key={href} href={href} className={path === href ? "active" : ""}>{label}</Link>
        ))}
      </nav>
      <Link href="/admin" className="admin-link">管理员入口 ↗</Link>
    </header>
  );
}
