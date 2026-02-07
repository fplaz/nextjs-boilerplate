import { createClient } from "@/lib/supabase/server";
import { forgotPassword } from "@/domain/auth/auth.service";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const body = await request.json();

  const result = await forgotPassword(supabase, body);

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ data: result.data });
}
