"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase";
import { BRAND_NAME } from "@/lib/site";
import { Separator } from "@/components/ui/separator";

export default function Footer() {
  const [user, setUser] = useState<User | null>(null);
  const [supabase] = useState(createClient);

  const isAdmin = user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto w-full max-w-6xl px-4 py-10 md:px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <p className="text-base font-semibold tracking-tight">
              {BRAND_NAME}
            </p>
            <p className="text-sm text-muted-foreground">
              Quality parts for builders, engineers, and makers.
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Quick Links</p>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <Link href="/" className="hover:text-foreground">
                Home
              </Link>
              <Link href="/products" className="hover:text-foreground">
                Products
              </Link>
              <Link href="/request" className="hover:text-foreground">
                Request a Part
              </Link>
              {isAdmin ? (
                <Link href="/admin" className="hover:text-foreground">
                  Admin
                </Link>
              ) : null}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Legal and Contact</p>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <a
                href="mailto:support@[brandname].com"
                className="hover:text-foreground"
              >
                Contact Us: support@[brandname].com
              </a>
              <Link href="/legal/privacy" className="hover:text-foreground">
                Privacy Policy
              </Link>
              <Link href="/legal/terms" className="hover:text-foreground">
                Terms of Service
              </Link>
              <Link href="/legal/returns" className="hover:text-foreground">
                Return Policy
              </Link>
            </div>
          </div>
        </div>

        <Separator className="mt-8" />
        <p className="pt-4 text-center text-sm text-muted-foreground">
          © 2026 {BRAND_NAME}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
