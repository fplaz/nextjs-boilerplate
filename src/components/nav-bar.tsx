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
import { ChevronsUpDown, Rocket, Settings } from "lucide-react";

export function NavBar({
  needsPassword = false,
  userName,
  userEmail,
  isAdmin = false,
  workspaces = [],
  currentWorkspaceSlug,
}: {
  needsPassword?: boolean;
  userName?: string | null;
  userEmail?: string | null;
  isAdmin?: boolean;
  workspaces?: Array<{ slug: string; name: string; role: string }>;
  currentWorkspaceSlug?: string | null;
}) {
  const currentWorkspace =
    workspaces.find((workspace) => workspace.slug === currentWorkspaceSlug) ??
    workspaces[0];
  const dashboardHref = currentWorkspace
    ? `/w/${currentWorkspace.slug}/dashboard`
    : "/dashboard";
  const billingHref = currentWorkspace
    ? `/w/${currentWorkspace.slug}/billing`
    : "/billing";
  const membersHref = currentWorkspace
    ? `/w/${currentWorkspace.slug}/members`
    : null;
  const workspaceSettingsHref = currentWorkspace
    ? `/w/${currentWorkspace.slug}/settings`
    : null;

  return (
    <nav className="border-b">
      <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
        <Link href={dashboardHref} className="inline-flex items-center gap-2 font-semibold tracking-tight">
          <Rocket className="h-5 w-5 text-primary" />
          <span>LaunchKit</span>
        </Link>
        <div className="flex items-center gap-4">
          {currentWorkspace && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="inline-flex cursor-pointer items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                  <ChevronsUpDown className="h-4 w-4" />
                  <span className="max-w-40 truncate">{currentWorkspace.name}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
                {workspaces.map((workspace) => (
                  <DropdownMenuItem key={workspace.slug} asChild className="cursor-pointer">
                    <Link
                      href={`/api/workspaces/switch?slug=${encodeURIComponent(
                        workspace.slug
                      )}&next=${encodeURIComponent(
                        `/w/${workspace.slug}/dashboard`
                      )}`}
                      className="flex w-full items-center justify-between gap-3"
                    >
                      <span className="truncate">
                        {workspace.slug === currentWorkspace.slug ? "• " : ""}
                        {workspace.name}
                      </span>
                      <span className="text-xs capitalize text-muted-foreground">
                        {workspace.role}
                      </span>
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
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
                <Link href={billingHref}>Plan & Billing</Link>
              </DropdownMenuItem>
              {membersHref && (
                <DropdownMenuItem className="cursor-pointer" asChild>
                  <Link href={membersHref}>Members</Link>
                </DropdownMenuItem>
              )}
              {workspaceSettingsHref && (
                <DropdownMenuItem className="cursor-pointer" asChild>
                  <Link href={workspaceSettingsHref}>Workspace Settings</Link>
                </DropdownMenuItem>
              )}
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
