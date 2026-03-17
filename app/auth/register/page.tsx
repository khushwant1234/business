"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase";

export default function RegisterPage() {
  const router = useRouter();
  const [supabase] = useState(createClient);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    setSubmitting(false);

    if (authError) {
      setError(authError.message);
      return;
    }

    router.push("/products");
    router.refresh();
  }

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md rounded-sm border border-white/10 bg-[#202020] py-0">
        <CardHeader className="border-b border-white/10 py-4">
          <CardTitle>Register</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-4">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="register-email">Email</Label>
              <Input
                id="register-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="rounded-sm border-white/10 bg-transparent"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="register-password">Password</Label>
              <Input
                id="register-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="rounded-sm border-white/10 bg-transparent"
                required
              />
            </div>
            {error ? <p className="text-sm text-white/70">{error}</p> : null}
            <Button
              type="submit"
              className="w-full rounded-sm"
              disabled={submitting}
            >
              Register
            </Button>
          </form>
          <p className="text-sm text-white/55">
            Already registered?{" "}
            <Link href="/auth/login" className="text-white">
              Login
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
