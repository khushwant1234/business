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
        className="text-white/70 transition-opacity hover:text-white text-sm"
        onClick={() => setMenuOpen(false)}
      >
        Home
      </Link>
      <Link
        href="/products"
        className="text-white/70 transition-opacity hover:text-white text-sm"
        onClick={() => setMenuOpen(false)}
      >
        Products
      </Link>
      <Link
        href="/request"
        className="text-white/70 transition-opacity hover:text-white text-sm"
        onClick={() => setMenuOpen(false)}
      >
        Request Part
      </Link>
      {isAdmin && (
        <Link
          href="/admin"
          className="text-white/70 transition-opacity hover:text-white text-sm"
          onClick={() => setMenuOpen(false)}
        >
          Admin
        </Link>
      )}
    </>
  );

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#202020]">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link
          href="/"
          className="text-lg font-semibold tracking-tight text-white"
        >
          {BRAND_NAME}
        </Link>

        <div className="hidden items-center gap-6 md:flex">{navLinks}</div>

        <div className="hidden items-center gap-4 md:flex">
          <Link
            href="/cart"
            className="relative text-white/70 transition-opacity hover:text-white"
          >
            <ShoppingCart size={20} />
            {itemCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-sm bg-white text-[10px] font-bold text-[#202020]">
                {itemCount}
              </span>
            )}
          </Link>
          {user ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="rounded-sm text-sm text-white/70 hover:text-white"
            >
              Logout
            </Button>
          ) : (
            <Link href="/auth/login">
              <Button
                variant="ghost"
                size="sm"
                className="rounded-sm text-sm text-white/70 hover:text-white"
              >
                Login
              </Button>
            </Link>
          )}
        </div>

        <div className="flex items-center gap-3 md:hidden">
          <Link
            href="/cart"
            className="relative text-white/70 transition-opacity hover:text-white"
          >
            <ShoppingCart size={20} />
            {itemCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-sm bg-white text-[10px] font-bold text-[#202020]">
                {itemCount}
              </span>
            )}
          </Link>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-white/70 hover:text-white"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="flex flex-col gap-3 border-t border-white/10 px-4 py-4 md:hidden">
          {navLinks}
          {user ? (
            <button
              onClick={() => {
                handleLogout();
                setMenuOpen(false);
              }}
              className="text-left text-sm text-white/70 hover:text-white"
            >
              Logout
            </button>
          ) : (
            <Link
              href="/auth/login"
              className="text-sm text-white/70 hover:text-white"
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
