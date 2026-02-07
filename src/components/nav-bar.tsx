import Link from "next/link";
import { signOut } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";

export function NavBar() {
  return (
    <nav className="border-b">
      <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
        <Link href="/" className="text-lg font-medium">
          App Name
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/account"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Account
          </Link>
          <form>
            <Button
              variant="outline"
              size="sm"
              formAction={signOut}
            >
              Sign Out
            </Button>
          </form>
        </div>
      </div>
    </nav>
  );
}
