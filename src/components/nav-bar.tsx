import Link from "next/link";
import { signOut } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Rocket, Settings } from "lucide-react";

export function NavBar({
  needsPassword = false,
  userName,
  userEmail,
  isAdmin = false,
}: {
  needsPassword?: boolean;
  userName?: string | null;
  userEmail?: string | null;
  isAdmin?: boolean;
}) {
  return (
    <nav className="border-b">
      <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
        <Link href="/dashboard" className="inline-flex items-center gap-2 font-semibold tracking-tight">
          <Rocket className="h-5 w-5 text-primary" />
          <span>LaunchKit</span>
        </Link>
        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="inline-flex cursor-pointer items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                <Settings className="h-4 w-4" />
                Settings
                {needsPassword && <span className="h-2 w-2 rounded-full bg-red-500" />}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {(userName || userEmail) && (
                <>
                  <DropdownMenuLabel className="font-normal">
                    {userName && <p className="text-sm font-medium">{userName}</p>}
                    {userEmail && <p className="text-xs text-muted-foreground">{userEmail}</p>}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem className="cursor-pointer" asChild>
                <Link href="/account" className="flex items-center gap-2">
                  Account
                  {needsPassword && <span className="h-2 w-2 rounded-full bg-red-500" />}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" asChild>
                <Link href="/billing">Plan & Billing</Link>
              </DropdownMenuItem>
              {isAdmin && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer" asChild>
                    <Link href="/admin">Admin area</Link>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          <form>
            <Button variant="outline" size="sm" formAction={signOut}>
              Sign Out
            </Button>
          </form>
        </div>
      </div>
    </nav>
  );
}
