"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateWorkspaceNameAction } from "@/app/actions/workspaces";
import { SubmitButton } from "@/components/submit-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TimedAlert } from "@/components/ui/timed-alert";

export function BasicInfoSection({
  name,
  slug,
  role,
}: {
  name: string;
  slug: string;
  role: string;
}) {
  const router = useRouter();
  const [savedName, setSavedName] = useState(name);
  const [currentName, setCurrentName] = useState(name);
  const [toast, setToast] = useState<{
    message: string;
    variant: "default" | "destructive";
  } | null>(null);

  const canEdit = role === "owner" || role === "admin";
  const hasChanges =
    currentName.trim() !== savedName && currentName.trim().length > 0;

  async function handleSave(formData: FormData) {
    const result = await updateWorkspaceNameAction(formData);

    if (result.error) {
      setToast({ message: result.error, variant: "destructive" });
      return;
    }

    const newName = result.name ?? currentName.trim();
    setSavedName(newName);
    setCurrentName(newName);
    setToast({ message: "Workspace name updated", variant: "default" });
    // Refresh server components (e.g. the nav bar) to reflect the new name.
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Workspace name</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {canEdit ? (
          <form action={handleSave} className="grid gap-2">
            <input type="hidden" name="workspace_slug" value={slug} />
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              value={currentName}
              onChange={(e) => setCurrentName(e.target.value)}
              placeholder="Workspace name"
              required
            />
            <div className="mt-2">
              <SubmitButton pendingText="Saving..." disabled={!hasChanges}>
                Save
              </SubmitButton>
            </div>
          </form>
        ) : (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Name</span>
            <span className="font-medium">{savedName}</span>
          </div>
        )}
      </CardContent>

      <TimedAlert
        message={toast?.message ?? null}
        variant={toast?.variant ?? "default"}
        onDismiss={() => setToast(null)}
      />
    </Card>
  );
}
