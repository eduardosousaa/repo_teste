"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header({ items = [] }) {
  const pathname = usePathname();

  return (
    <header style={{display: "flex", alignItems:"center", justifyContent:"space-between", padding: "0.75rem 1rem", borderBottom: "1px solid #e6e6e6"}}>
      <div style={{fontWeight:700}}>Logo</div>
      <nav style={{display:"flex", gap: "0.5rem"}}>
        {items.map(it => {
          const active = pathname === it.href || pathname?.startsWith(it.href + "/");
          return (
            <Link key={it.key ?? it.href} href={it.href}>
              <a style={{padding: "0.5rem 0.75rem", borderBottom: active ? "2px solid #2563eb" : "2px solid transparent"}}>{it.label}</a>
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
