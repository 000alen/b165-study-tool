"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";

const studentLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/flashcards", label: "Flashcards" },
  { href: "/practice", label: "Practice" },
  { href: "/cases", label: "Cases" },
  { href: "/frameworks", label: "Frameworks" },
  { href: "/interview", label: "Mock Interview" },
  { href: "/sessions", label: "Sessions" },
  { href: "/outcomes", label: "LO Map" },
];

const profLinks = [
  ...studentLinks,
  { href: "/prof", label: "Prof Dashboard" },
];

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { isAuthenticated, role, logout } = useAuth();

  // Don't show nav links on the login page
  if (!isAuthenticated) {
    return (
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="font-semibold text-sm tracking-tight">
            B165 Study Tool
          </Link>
        </div>
      </header>
    );
  }

  const links = role === "professor" ? profLinks : studentLinks;

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/dashboard" className="font-semibold text-sm tracking-tight">
          B165 Study Tool
        </Link>
        <div className="flex items-center gap-2">
          <button
            className="md:hidden p-2 text-muted-foreground"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {open ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
          <nav className="hidden md:flex items-center gap-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "px-3 py-1.5 text-sm rounded-md transition-colors",
                  pathname === l.href
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                {l.label}
              </Link>
            ))}
            <button
              onClick={logout}
              className="px-3 py-1.5 text-sm rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              Logout
            </button>
          </nav>
        </div>
      </div>
      {open && (
        <nav className="md:hidden border-t px-4 py-2 flex flex-wrap gap-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className={cn(
                "px-3 py-1.5 text-sm rounded-md transition-colors",
                pathname === l.href
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              {l.label}
            </Link>
          ))}
          <button
            onClick={() => { setOpen(false); logout(); }}
            className="px-3 py-1.5 text-sm rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            Logout
          </button>
        </nav>
      )}
    </header>
  );
}
