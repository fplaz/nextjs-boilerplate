import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { signUp } from "@/domain/auth/auth.service";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();

  const turnstileValid = await verifyTurnstileToken(body.turnstileToken ?? "");
  if (!turnstileValid) {
    return NextResponse.json(
      { error: "Bot verification failed. Please try again." },
      { status: 403 }
    );
  }

  const supabase = await createClient();
  const adminClient = createAdminClient();

  const result = await signUp(supabase, adminClient, body);

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ data: result.data });
}
