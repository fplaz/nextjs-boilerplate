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
import { ChevronsUpDown, Settings } from "lucide-react";

function WorkspaceLogo({
  name,
  logoUrl,
  className = "h-5 w-5",
}: {
  name: string;
  logoUrl?: string | null;
  className?: string;
}) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded bg-muted text-[10px] font-medium uppercase text-muted-foreground ${className}`}
    >
      {logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logoUrl}
          alt={`${name} logo`}
          className="h-full w-full object-cover"
        />
      ) : (
        name.charAt(0)
      )}
    </span>
  );
}

export function NavBar({
  userName,
  userEmail,
  isAdmin = false,
  workspaces = [],
  currentWorkspaceSlug,
}: {
  userName?: string | null;
  userEmail?: string | null;
  isAdmin?: boolean;
  workspaces?: Array<{
    slug: string;
    name: string;
    role: string;
    logoUrl?: string | null;
  }>;
  currentWorkspaceSlug?: string | null;
}) {
  const currentWorkspace =
    workspaces.find((workspace) => workspace.slug === currentWorkspaceSlug) ??
    workspaces[0];
  const billingHref = currentWorkspace
    ? `/w/${currentWorkspace.slug}/settings?tab=billing`
    : "/billing";
  const membersHref = currentWorkspace
    ? `/w/${currentWorkspace.slug}/settings?tab=members`
    : null;
  const workspaceSettingsHref = currentWorkspace
    ? `/w/${currentWorkspace.slug}/settings`
    : null;

  return (
    <nav className="border-b">
      <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
        {currentWorkspace ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold tracking-tight hover:text-muted-foreground">
                <WorkspaceLogo
                  name={currentWorkspace.name}
                  logoUrl={currentWorkspace.logoUrl}
                />
                <span className="max-w-40 truncate">
                  {currentWorkspace.name}
                </span>
                <ChevronsUpDown className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
              {workspaces.map((workspace) => (
                <DropdownMenuItem
                  key={workspace.slug}
                  asChild
                  className="cursor-pointer"
                >
                  <Link
                    href={`/api/workspaces/switch?slug=${encodeURIComponent(
                      workspace.slug,
                    )}&next=${encodeURIComponent(
                      `/w/${workspace.slug}/dashboard`,
                    )}`}
                    className="flex w-full items-center justify-between gap-3"
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <WorkspaceLogo
                        name={workspace.name}
                        logoUrl={workspace.logoUrl}
                      />
                      <span className="truncate">{workspace.name}</span>
                    </span>
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <span />
        )}
        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="inline-flex cursor-pointer items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                <Settings className="h-4 w-4" />
                Settings
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {(userName || userEmail) && (
                <>
                  <DropdownMenuLabel className="font-normal">
                    {userName && (
                      <p className="text-sm font-medium">{userName}</p>
                    )}
                    {userEmail && (
                      <p className="text-xs text-muted-foreground">
                        {userEmail}
                      </p>
                    )}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem className="cursor-pointer" asChild>
                <Link href="/account" className="flex items-center gap-2">
                  Account
                </Link>
              </DropdownMenuItem>
              {workspaceSettingsHref && (
                <DropdownMenuItem className="cursor-pointer" asChild>
                  <Link href={workspaceSettingsHref}>Workspace</Link>
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
