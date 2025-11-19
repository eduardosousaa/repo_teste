"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Sidebar.module.css";

export default function Sidebar({ items = [], collapsed = false }) {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar ?? "sidebar"}>
      <div className={styles.brand ?? "sidebar-brand"}>
        <Link href="/">MeuSite</Link>
      </div>

      <nav className={styles.nav ?? "sidebar-nav"}>
        {items.map((it) => {
          const active = pathname === it.href || pathname?.startsWith(it.href + "/");
          return (
            <div key={it.key ?? it.href} className={`${styles.item ?? "sidebar-item"} ${active ? styles.active ?? "active" : ""}`}>
              <Link href={it.href}>
                <a aria-current={active ? "page" : undefined}>
                  {it.icon && <span className={styles.icon ?? "icon"}>{it.icon}</span>}
                  <span className={styles.label ?? "label"}>{it.label}</span>
                </a>
              </Link>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
