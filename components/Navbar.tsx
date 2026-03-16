"use client";

import Link from "next/link";
import { ShoppingCart, Menu, X } from "lucide-react";
import { useCart } from "./CartContext";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import type { User } from "@supabase/supabase-js";

export default function Navbar() {
  const { itemCount } = useCart();
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const supabase = createClient();

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
    window.location.href = "/";
  };

  const navLinks = (
    <>
      <Link
        href="/"
        className="text-white/70 hover:text-white transition-opacity text-sm"
        onClick={() => setMenuOpen(false)}
      >
        Home
      </Link>
      <Link
        href="/products"
        className="text-white/70 hover:text-white transition-opacity text-sm"
        onClick={() => setMenuOpen(false)}
      >
        Products
      </Link>
      <Link
        href="/request"
        className="text-white/70 hover:text-white transition-opacity text-sm"
        onClick={() => setMenuOpen(false)}
      >
        Request Part
      </Link>
      {isAdmin && (
        <Link
          href="/admin"
          className="text-white/70 hover:text-white transition-opacity text-sm"
          onClick={() => setMenuOpen(false)}
        >
          Admin
        </Link>
      )}
    </>
  );

  return (
    <nav className="border-b border-white/10 bg-[#202020] sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="text-white font-semibold tracking-tight text-lg">
          [BRAND_NAME]
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks}
        </div>

        <div className="hidden md:flex items-center gap-4">
          <Link href="/cart" className="relative text-white/70 hover:text-white transition-opacity">
            <ShoppingCart size={20} />
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-white text-[#202020] text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                {itemCount}
              </span>
            )}
          </Link>
          {user ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-white/70 hover:text-white text-sm"
            >
              Logout
            </Button>
          ) : (
            <Link href="/auth/login">
              <Button variant="ghost" size="sm" className="text-white/70 hover:text-white text-sm">
                Login
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile */}
        <div className="flex items-center gap-3 md:hidden">
          <Link href="/cart" className="relative text-white/70 hover:text-white transition-opacity">
            <ShoppingCart size={20} />
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-white text-[#202020] text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
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

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-white/10 px-4 py-4 flex flex-col gap-3">
          {navLinks}
          {user ? (
            <button
              onClick={() => {
                handleLogout();
                setMenuOpen(false);
              }}
              className="text-white/70 hover:text-white text-sm text-left"
            >
              Logout
            </button>
          ) : (
            <Link
              href="/auth/login"
              className="text-white/70 hover:text-white text-sm"
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
