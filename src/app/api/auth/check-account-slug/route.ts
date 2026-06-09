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
    .from("workspaces")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  return NextResponse.json({ available: !data });
}
