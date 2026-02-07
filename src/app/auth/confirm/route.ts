import { createClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";
import { type EmailOtpType } from "@supabase/supabase-js";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/";

  if (token_hash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ token_hash, type });

    if (!error) {
      // For password recovery, redirect to reset password page
      if (type === "recovery") {
        return NextResponse.redirect(
          new URL("/reset-password", request.url)
        );
      }
      // For email confirmation (signup), redirect to login with success message
      if (type === "email") {
        return NextResponse.redirect(
          new URL("/login?message=Email confirmed. You can now sign in.", request.url)
        );
      }
      // For email change confirmation
      if (type === "email_change") {
        return NextResponse.redirect(
          new URL("/account?message=Email updated successfully.", request.url)
        );
      }
      return NextResponse.redirect(new URL(next, request.url));
    }
  }

  // If verification fails, redirect to login with error
  return NextResponse.redirect(
    new URL("/login?error=Could not verify email. Link may have expired.", request.url)
  );
}
