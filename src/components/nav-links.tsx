"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/profile", label: "Profile" },
  { href: "/resume", label: "Resume" },
  { href: "/interview", label: "Interview" },
  { href: "/history", label: "History" },
] as const;

export function NavLinks() {
  const pathname = usePathname();

  return (
    <nav aria-label="Main" className="flex flex-wrap items-center gap-1">
      {NAV.map((item) => {
        const active =
          pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className="nav-link"
            data-active={active}
            aria-current={active ? "page" : undefined}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
