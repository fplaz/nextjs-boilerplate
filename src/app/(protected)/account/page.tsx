import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { UpdateNameForm } from "./update-name-form";
import { ChangeEmailForm } from "./change-email-form";
import { ChangePasswordForm } from "./change-password-form";
import { DeleteAccountSection } from "./delete-account-section";
import { Separator } from "@/components/ui/separator";
import { Suspense } from "react";
import { ArrowLeft } from "lucide-react";
import { AccountToast } from "./account-toast";
import { userHasPassword } from "@/domain/auth/auth.service";

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, last_name")
    .eq("user_id", user.id)
    .single();

  const hasPassword = userHasPassword(user);

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/dashboard"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to app
        </Link>
        <h1 className="mt-2 text-3xl font-bold">Account Settings</h1>
        <p className="mt-1 text-muted-foreground">
          Manage your profile and account preferences
        </p>
        {!hasPassword && (
          <p className="mt-3 text-sm text-red-600">
            <a href="#password" className="underline font-medium">
              Create a password
            </a>{" "}
            for easier sign in.
          </p>
        )}
      </div>

      <Suspense>
        <AccountToast />
      </Suspense>

      <UpdateNameForm
        firstName={profile?.first_name ?? ""}
        lastName={profile?.last_name ?? ""}
      />

      <Separator />

      <ChangeEmailForm email={user.email ?? ""} />

      <Separator />

      <ChangePasswordForm hasPassword={hasPassword} />

      <Separator />

      <DeleteAccountSection />
    </div>
  );
}
