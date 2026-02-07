import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div>
      <h1 className="text-3xl font-bold">Welcome</h1>
      <p className="mt-2 text-muted-foreground">
        You are signed in as {user?.email}.
      </p>
    </div>
  );
}
