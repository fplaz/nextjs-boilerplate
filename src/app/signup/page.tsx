"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { signUp } from "@/app/actions/auth";
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
import { PASSWORD_RULES, isPasswordValid } from "@/lib/validation";
import { Check, X, Loader2 } from "lucide-react";
import { Suspense } from "react";
import { Turnstile } from "@marsidev/react-turnstile";

const SLUG_CHAR_REGEX = /[^a-z0-9-]/g;

function SignUpForm() {
  const searchParams = useSearchParams();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [password, setPassword] = useState("");

  const [turnstileToken, setTurnstileToken] = useState("");
  const inviteToken = searchParams.get("invite_token") ?? "";
  const redirectTo = searchParams.get("redirect_to") ?? "/dashboard";

  const [accountSlug, setAccountSlug] = useState("");
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [slugChecking, setSlugChecking] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const emailValid = EMAIL_REGEX.test(email);
  const showEmailError = emailTouched && email.length > 0 && !emailValid;

  const checkSlugAvailability = useCallback((slug: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!slug || slug.length === 0) {
      setSlugAvailable(null);
      setSlugChecking(false);
      return;
    }

    setSlugChecking(true);
    setSlugAvailable(null);

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/auth/check-account-slug?slug=${encodeURIComponent(slug)}`
        );
        const json = await res.json();
        setSlugAvailable(json.available);
      } catch {
        setSlugAvailable(null);
      } finally {
        setSlugChecking(false);
      }
    }, 400);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  function handleSlugChange(value: string) {
    const filtered = value.toLowerCase().replace(SLUG_CHAR_REGEX, "");
    setAccountSlug(filtered);
    checkSlugAvailability(filtered);
  }

  const allFieldsFilled =
    firstName.trim() !== "" &&
    lastName.trim() !== "" &&
    accountSlug.trim() !== "" &&
    password !== "";

  const passwordValid = isPasswordValid(password);
  const formValid =
    allFieldsFilled &&
    emailValid &&
    passwordValid &&
    slugAvailable === true &&
    turnstileToken !== "";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="mb-6 text-center">
        <p className="text-2xl font-semibold tracking-tight">LaunchKit</p>
        <p className="text-sm text-muted-foreground">Create your starter workspace</p>
      </div>
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Sign Up</CardTitle>
          <CardDescription>
            Create an account to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-4"
            onSubmit={() => {
              if (formValid) {
                window.dataLayer = window.dataLayer || [];
                window.dataLayer.push({ event: "signup_completed" });
              }
            }}
          >
            <FormMessage />
            <input type="hidden" name="invite_token" value={inviteToken} />
            <input type="hidden" name="redirect_to" value={redirectTo} />
            <div className="grid gap-2">
              <Label htmlFor="first_name">First Name</Label>
              <Input
                id="first_name"
                name="first_name"
                type="text"
                placeholder="John"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="last_name">Last Name</Label>
              <Input
                id="last_name"
                name="last_name"
                type="text"
                placeholder="Doe"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="account_slug">Account Slug</Label>
              <div className="relative">
                <Input
                  id="account_slug"
                  name="account_slug"
                  type="text"
                  placeholder="my-company"
                  required
                  maxLength={50}
                  value={accountSlug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  className={
                    accountSlug.length > 0 && slugAvailable === false
                      ? "border-destructive pr-8"
                      : "pr-8"
                  }
                />
                {accountSlug.length > 0 && (
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2">
                    {slugChecking ? (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    ) : slugAvailable === true ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : slugAvailable === false ? (
                      <X className="h-4 w-4 text-destructive" />
                    ) : null}
                  </span>
                )}
              </div>
              {accountSlug.length > 0 && slugAvailable === false && !slugChecking && (
                <p className="text-xs text-destructive">
                  This slug is already taken.
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Used in your workspace URLs. Lowercase letters, numbers, and
                hyphens only.
              </p>
            </div>
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
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                minLength={8}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {password.length > 0 && (
                <ul className="mt-1 space-y-1">
                  {PASSWORD_RULES.map((rule) => {
                    const passed = rule.test(password);
                    return (
                      <li
                        key={rule.label}
                        className={`flex items-center gap-1.5 text-xs ${
                          passed ? "text-green-600" : "text-muted-foreground"
                        }`}
                      >
                        {passed ? (
                          <Check className="h-3 w-3" />
                        ) : (
                          <X className="h-3 w-3" />
                        )}
                        {rule.label}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
            <Turnstile
              siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
              onSuccess={setTurnstileToken}
              onExpire={() => setTurnstileToken("")}
              onError={() => setTurnstileToken("")}
            />
            <input type="hidden" name="turnstile_token" value={turnstileToken} />
            <SubmitButton
              formAction={signUp}
              pendingText="Signing up..."
              disabled={!formValid}
            >
              Sign Up
            </SubmitButton>
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                href={`/login?redirect_to=${encodeURIComponent(redirectTo)}`}
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                Sign In
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense>
      <SignUpForm />
    </Suspense>
  );
}
