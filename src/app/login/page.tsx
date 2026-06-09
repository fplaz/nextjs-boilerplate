"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { signIn } from "@/app/actions/auth";
import { FormMessage } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Step = "email" | "sign-in" | "magic-link-sent";

function LoginForm() {
  const searchParams = useSearchParams();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [hasPassword, setHasPassword] = useState(false);
  const [checking, setChecking] = useState(false);
  const [sendingMagicLink, setSendingMagicLink] = useState(false);
  const [error, setError] = useState("");
  const redirectTo = searchParams.get("redirect_to") ?? "/dashboard";
  const inviteToken = searchParams.get("invite_token") ?? "";

  const emailValid = EMAIL_REGEX.test(email);
  const showEmailError = emailTouched && email.length > 0 && !emailValid;
  const passwordFormValid = emailValid && password.length > 0;

  async function handleCheckEmail(e: React.FormEvent) {
    e.preventDefault();
    if (!emailValid) return;

    setChecking(true);
    setError("");
    try {
      const res = await fetch(
        `/api/auth/check-email?email=${encodeURIComponent(email)}`
      );
      const json = await res.json();
      if (json.error) {
        setError(json.error);
      } else {
        setHasPassword(json.data.hasPassword);
        setStep("sign-in");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setChecking(false);
    }
  }

  async function handleSendMagicLink() {
    setSendingMagicLink(true);
    setError("");
    try {
      const res = await fetch("/api/auth/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, redirectTo }),
      });
      const json = await res.json();
      if (json.error) {
        setError(json.error);
      } else {
        setStep("magic-link-sent");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSendingMagicLink(false);
    }
  }

  function handleChangeEmail() {
    setStep("email");
    setPassword("");
    setError("");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="mb-6 text-center">
        <p className="text-2xl font-semibold tracking-tight">LaunchKit</p>
        <p className="text-sm text-muted-foreground">Sign in to your starter workspace</p>
      </div>
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Sign In</CardTitle>
          <CardDescription>
            {step === "email" && "Enter your email to continue"}
            {step === "sign-in" && "Sign in to your account"}
            {step === "magic-link-sent" && "Check your email"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === "email" && (
            <form onSubmit={handleCheckEmail} className="grid gap-4">
              <FormMessage />
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => setEmailTouched(true)}
                  className={showEmailError ? "border-destructive" : ""}
                />
                {showEmailError && (
                  <p className="text-xs text-destructive">
                    Please enter a valid email address.
                  </p>
                )}
              </div>
              <Button type="submit" disabled={!emailValid || checking}>
                {checking ? "Checking..." : "Continue"}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Link
                  href={`/signup?redirect_to=${encodeURIComponent(redirectTo)}${
                    inviteToken
                      ? `&invite_token=${encodeURIComponent(inviteToken)}`
                      : ""
                  }`}
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  Sign Up
                </Link>
              </p>
            </form>
          )}

          {step === "sign-in" && (
            <div className="grid gap-4">
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
              <div className="grid gap-1">
                <p className="text-sm text-muted-foreground">
                  Signing in as{" "}
                  <span className="font-medium text-foreground">
                    {email}
                  </span>
                </p>
                <button
                  type="button"
                  onClick={handleChangeEmail}
                  className="text-sm text-primary underline-offset-4 hover:underline w-fit"
                >
                  Change email
                </button>
              </div>

              {hasPassword && (
                <form className="grid gap-4">
                  <input type="hidden" name="email" value={email} />
                  <input type="hidden" name="redirect_to" value={redirectTo} />
                  <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <Link
                        href="/forgot-password"
                        className="text-sm text-muted-foreground underline-offset-4 hover:underline"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="Your password"
                      required
                      autoFocus
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <SubmitButton
                    formAction={signIn}
                    pendingText="Signing in..."
                    disabled={!passwordFormValid}
                  >
                    Sign In
                  </SubmitButton>
                </form>
              )}

              {hasPassword && (
                <div className="flex items-center gap-4">
                  <Separator className="flex-1" />
                  <span className="text-xs text-muted-foreground">or</span>
                  <Separator className="flex-1" />
                </div>
              )}

              <Button
                variant={hasPassword ? "outline" : "default"}
                onClick={handleSendMagicLink}
                disabled={sendingMagicLink}
              >
                {sendingMagicLink
                  ? "Sending..."
                  : "Send magic link"}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Link
                  href={`/signup?redirect_to=${encodeURIComponent(redirectTo)}${
                    inviteToken
                      ? `&invite_token=${encodeURIComponent(inviteToken)}`
                      : ""
                  }`}
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  Sign Up
                </Link>
              </p>
            </div>
          )}

          {step === "magic-link-sent" && (
            <div className="grid gap-4 text-center">
              <p className="text-sm text-muted-foreground">
                If an account exists with that email, we&apos;ll send a sign-in
                link to{" "}
                <span className="font-medium text-foreground">
                  {email}
                </span>
                .
              </p>
              <Button variant="outline" onClick={handleChangeEmail}>
                Use a different email
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
