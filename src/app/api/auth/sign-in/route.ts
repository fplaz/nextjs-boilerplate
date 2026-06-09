import { createClient } from "@/lib/supabase/server";
import { signIn } from "@/domain/auth/auth.service";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const body = await request.json();

  const result = await signIn(supabase, body);

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 401 });
  }

  return NextResponse.json({ data: result.data });
}
