import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUserBillingState } from "@/domain/subscriptions/subscriptions.service";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await getUserBillingState(supabase, user.id);

  if (result.error !== null) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ data: result.data });
}
