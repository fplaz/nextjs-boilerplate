import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { UpdateNameForm } from "./update-name-form";
import { ChangeEmailForm } from "./change-email-form";
import { ChangePasswordForm } from "./change-password-form";
import { DeleteAccountSection } from "./delete-account-section";
import { Separator } from "@/components/ui/separator";
import { FormMessage } from "@/components/form-message";
import { Suspense } from "react";

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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Account Settings</h1>
        <p className="mt-1 text-muted-foreground">
          Manage your profile and account preferences
        </p>
      </div>

      <Suspense>
        <FormMessage />
      </Suspense>

      <UpdateNameForm
        firstName={profile?.first_name ?? ""}
        lastName={profile?.last_name ?? ""}
      />

      <Separator />

      <ChangeEmailForm email={user.email ?? ""} />

      <Separator />

      <ChangePasswordForm />

      <Separator />

      <DeleteAccountSection />
    </div>
  );
}
