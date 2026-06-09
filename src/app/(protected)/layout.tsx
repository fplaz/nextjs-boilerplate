import { NavBar } from "@/components/nav-bar";
import { TrialBanner } from "@/components/trial-banner";
import { createClient } from "@/lib/supabase/server";
import { userHasPassword, getUserRole } from "@/domain/auth/auth.service";
import { getUserSubscription } from "@/domain/subscriptions/subscriptions.service";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const needsPassword = user ? !userHasPassword(user) : false;

  let isAdmin = false;
  if (user) {
    const roleResult = await getUserRole(supabase, user.id);
    isAdmin = roleResult.data === "admin";
  }

  let showTrialBanner = false;
  let trialEnd: string | null = null;

  if (user) {
    const subResult = await getUserSubscription(supabase, user.id);
    if (subResult.data?.status === "trialing" && subResult.data.trial_end) {
      showTrialBanner = true;
      trialEnd = subResult.data.trial_end;
    }
  }

  return (
    <>
      <NavBar
        needsPassword={needsPassword}
        isAdmin={isAdmin}
        userName={
          user
            ? [user.user_metadata?.first_name, user.user_metadata?.last_name]
                .filter(Boolean)
                .join(" ") || null
            : null
        }
        userEmail={user?.email ?? null}
      />
      {showTrialBanner && trialEnd && <TrialBanner trialEnd={trialEnd} />}
      <main className="mx-auto max-w-4xl px-4 py-8">{children}</main>
    </>
  );
}
