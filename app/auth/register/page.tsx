"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { type Resolver, useForm } from "react-hook-form";
import { Lock, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase";

const formSchema = z
  .object({
    email: z.string().email("Enter a valid email address."),
    password: z.string().min(1, "Password is required."),
    confirmPassword: z.string().min(1, "Confirm your password."),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: "custom",
        message: "Passwords do not match.",
        path: ["confirmPassword"],
      });
    }
  });

function getPasswordScore(password: string) {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  return score;
}

function PasswordStrength({ score }: { score: number }) {
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-4 gap-2">
        {[0, 1, 2, 3].map((segment) => (
          <div
            key={segment}
            className={
              segment < score
                ? "h-1.5 rounded-sm bg-white"
                : "h-1.5 rounded-sm bg-white/20"
            }
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        {score <= 1
          ? "Weak"
          : score === 2
            ? "Fair"
            : score === 3
              ? "Good"
              : "Strong"}
      </p>
    </div>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const [supabase] = useState(createClient);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");

  type RegisterValues = z.infer<typeof formSchema>;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema as any) as Resolver<RegisterValues>,
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const passwordValue = form.watch("password");
  const passwordScore = getPasswordScore(passwordValue);

  useEffect(() => {
    if (!passwordValue.length) {
      form.clearErrors("password");
      return;
    }

    if (passwordScore <= 1) {
      form.setError("password", {
        type: "manual",
        message: "Password is too weak. Please make it stronger.",
      });
      return;
    }

    if (
      form.getFieldState("password").error?.message ===
      "Password is too weak. Please make it stronger."
    ) {
      form.clearErrors("password");
    }
  }, [form, passwordScore, passwordValue]);

  async function handleSubmit(values: z.infer<typeof formSchema>) {
    setError(null);

    if (passwordScore <= 1) {
      form.setError("password", {
        type: "manual",
        message: "Password is too weak. Please make it stronger.",
      });
      return;
    }

    setSubmitting(true);

    const { error: authError } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
    });

    setSubmitting(false);

    if (authError) {
      setError(authError.message);
      return;
    }

    setSubmittedEmail(values.email);
    setDialogOpen(true);
  }

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md rounded-sm border border-border py-0">
        <CardHeader className="border-b border-border py-4">
          <CardTitle>Register</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-4">
          <Form {...form}>
            <form
              className="space-y-4"
              onSubmit={form.handleSubmit(handleSubmit)}
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        className="rounded-sm"
                        required
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        className="rounded-sm"
                        required
                        {...field}
                      />
                    </FormControl>
                    <PasswordStrength score={passwordScore} />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        className="rounded-sm"
                        required
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <p className="flex items-center gap-2 text-xs text-muted-foreground">
                <Lock className="size-3.5" />
                Your password is encrypted and cannot be accessed by anyone,
                including us.
              </p>

              {error ? (
                <p className="text-sm text-muted-foreground">{error}</p>
              ) : null}

              <Button
                type="submit"
                className="w-full rounded-sm"
                disabled={submitting || passwordScore <= 1}
              >
                Register
              </Button>
            </form>
          </Form>
          <p className="text-sm text-muted-foreground">
            Already registered?{" "}
            <Link href="/auth/login" className="text-foreground">
              Login
            </Link>
          </p>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen}>
        <DialogContent
          showCloseButton={false}
          onEscapeKeyDown={(event) => event.preventDefault()}
          onInteractOutside={(event) => event.preventDefault()}
          className="rounded-sm"
        >
          <DialogHeader className="items-center text-center">
            <Mail className="size-9 text-foreground" />
            <DialogTitle>Check your inbox</DialogTitle>
            <DialogDescription>
              We&apos;ve sent a confirmation link to {submittedEmail}. Please
              confirm your email before logging in. Check your spam folder if
              you don&apos;t see it.
            </DialogDescription>
          </DialogHeader>
          <Button
            type="button"
            className="w-full rounded-sm"
            onClick={() => {
              setDialogOpen(false);
              router.push("/");
            }}
          >
            Go to Homepage
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
