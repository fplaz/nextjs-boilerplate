import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/domain/auth/auth.service";
import { NextResponse } from "next/server";

export async function POST() {
  const supabase = await createClient();

  const result = await signOut(supabase);

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ data: result.data });
}
