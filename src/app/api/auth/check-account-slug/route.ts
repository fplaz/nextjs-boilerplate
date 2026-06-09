import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { SLUG_REGEX } from "@/lib/slug";

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("slug");

  if (!slug || !SLUG_REGEX.test(slug)) {
    return NextResponse.json({ available: false });
  }

  const adminClient = createAdminClient();
  const { data } = await adminClient
    .from("profiles")
    .select("user_id")
    .eq("account_slug", slug)
    .maybeSingle();

  return NextResponse.json({ available: !data });
}
