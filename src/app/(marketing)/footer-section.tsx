import Link from "next/link";
import { Rocket } from "lucide-react";

export function FooterSection() {
  return (
    <footer className="border-t px-4 py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 font-semibold tracking-tight">
            <Rocket className="h-5 w-5 text-primary" />
            <span>LaunchKit</span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            A reusable SaaS starter for shipping faster.
          </p>
        </div>
        <div className="flex gap-4 text-sm text-muted-foreground">
          <Link href="/terms" className="hover:text-foreground">Terms</Link>
          <Link href="/login" className="hover:text-foreground">Sign in</Link>
          <Link href="/signup" className="hover:text-foreground">Start free</Link>
        </div>
      </div>
    </footer>
  );
}
