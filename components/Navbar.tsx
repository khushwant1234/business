"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingCart, Menu, X } from "lucide-react";
import { useCart } from "./CartContext";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import type { User } from "@supabase/supabase-js";
import { BRAND_NAME } from "@/lib/site";
import ThemeToggle from "@/components/ThemeToggle";

export default function Navbar() {
  const { itemCount } = useCart();
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [supabase] = useState(createClient);
  const router = useRouter();

  const isAdmin = user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push("/");
    router.refresh();
  };

  const navLinks = (
    <>
      <Link
        href="/"
        className="text-muted-foreground transition-colors hover:text-foreground text-sm"
        onClick={() => setMenuOpen(false)}
      >
        Home
      </Link>
      <Link
        href="/products"
        className="text-muted-foreground transition-colors hover:text-foreground text-sm"
        onClick={() => setMenuOpen(false)}
      >
        Products
      </Link>
      <Link
        href="/request"
        className="text-muted-foreground transition-colors hover:text-foreground text-sm"
        onClick={() => setMenuOpen(false)}
      >
        Request Part
      </Link>
      {user ? (
        <Link
          href="/profile"
          className="text-muted-foreground transition-colors hover:text-foreground text-sm"
          onClick={() => setMenuOpen(false)}
        >
          Profile
        </Link>
      ) : null}
      {isAdmin && (
        <Link
          href="/admin"
          className="text-muted-foreground transition-colors hover:text-foreground text-sm"
          onClick={() => setMenuOpen(false)}
        >
          Admin
        </Link>
      )}
    </>
  );

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link
          href="/"
          className="text-lg font-semibold tracking-tight text-foreground"
        >
          {BRAND_NAME}
        </Link>

        <div className="hidden items-center gap-6 md:flex">{navLinks}</div>

        <div className="hidden items-center gap-4 md:flex">
          <ThemeToggle />
          <Link
            href="/cart"
            className="relative text-muted-foreground transition-colors hover:text-foreground"
          >
            <ShoppingCart size={20} />
            {itemCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-sm bg-foreground text-[10px] font-bold text-background">
                {itemCount}
              </span>
            )}
          </Link>
          {user ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="rounded-sm text-sm text-muted-foreground hover:text-foreground"
            >
              Logout
            </Button>
          ) : (
            <Link href="/auth/login">
              <Button
                variant="ghost"
                size="sm"
                className="rounded-sm text-sm text-muted-foreground hover:text-foreground"
              >
                Login
              </Button>
            </Link>
          )}
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <Link
            href="/cart"
            className="relative text-muted-foreground transition-colors hover:text-foreground"
          >
            <ShoppingCart size={20} />
            {itemCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-sm bg-foreground text-[10px] font-bold text-background">
                {itemCount}
              </span>
            )}
          </Link>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-muted-foreground hover:text-foreground"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="flex flex-col gap-3 border-t border-border px-4 py-4 md:hidden">
          {navLinks}
          {user ? (
            <button
              onClick={() => {
                handleLogout();
                setMenuOpen(false);
              }}
              className="text-left text-sm text-muted-foreground hover:text-foreground"
            >
              Logout
            </button>
          ) : (
            <Link
              href="/auth/login"
              className="text-sm text-muted-foreground hover:text-foreground"
              onClick={() => setMenuOpen(false)}
            >
              Login
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
