import { createAdminClient } from "@/lib/supabase/admin";
import { userHasPassword } from "@/domain/auth/auth.service";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get("email");

  if (!email) {
    return NextResponse.json(
      { error: "Email is required" },
      { status: 400 }
    );
  }

  const adminClient = createAdminClient();
  const { data: { users } } = await adminClient.auth.admin.listUsers();
  const user = users.find((u) => u.email === email);
  const hasPassword = user ? userHasPassword(user) : false;

  // Always returns hasPassword: false for non-existent emails
  // to prevent email enumeration
  return NextResponse.json({ data: { hasPassword } });
}
