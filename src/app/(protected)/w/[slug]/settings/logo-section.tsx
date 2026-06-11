"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ImageIcon } from "lucide-react";
import {
  removeWorkspaceLogoAction,
  updateWorkspaceLogoAction,
} from "@/app/actions/workspaces";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TimedAlert } from "@/components/ui/timed-alert";
import {
  WORKSPACE_LOGO_ALLOWED_TYPES,
  WORKSPACE_LOGO_MAX_BYTES,
} from "@/domain/workspaces/workspace.schema";

const ACCEPT = WORKSPACE_LOGO_ALLOWED_TYPES.join(",");

export function LogoSection({
  slug,
  role,
  name,
  logoUrl,
}: {
  slug: string;
  role: string;
  name: string;
  logoUrl: string | null;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [savedLogoUrl, setSavedLogoUrl] = useState(logoUrl);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    variant: "default" | "destructive";
  } | null>(null);

  const canEdit = role === "owner" || role === "admin";
  const displayedUrl = previewUrl ?? savedLogoUrl;

  function resetSelection() {
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!(WORKSPACE_LOGO_ALLOWED_TYPES as readonly string[]).includes(file.type)) {
      setToast({
        message: "Logo must be a PNG or JPEG image",
        variant: "destructive",
      });
      resetSelection();
      return;
    }
    if (file.size > WORKSPACE_LOGO_MAX_BYTES) {
      setToast({ message: "Logo must be 2 MB or smaller", variant: "destructive" });
      resetSelection();
      return;
    }

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  }

  async function handleUpload() {
    if (!selectedFile) return;
    setIsUploading(true);

    const formData = new FormData();
    formData.set("workspace_slug", slug);
    formData.set("logo", selectedFile);

    const result = await updateWorkspaceLogoAction(formData);
    setIsUploading(false);

    if (result.error) {
      setToast({ message: result.error, variant: "destructive" });
      return;
    }

    setSavedLogoUrl(result.logoUrl ?? null);
    resetSelection();
    setToast({ message: "Workspace logo updated", variant: "default" });
    router.refresh();
  }

  async function handleRemove() {
    setIsRemoving(true);

    const formData = new FormData();
    formData.set("workspace_slug", slug);

    const result = await removeWorkspaceLogoAction(formData);
    setIsRemoving(false);

    if (result.error) {
      setToast({ message: result.error, variant: "destructive" });
      return;
    }

    setSavedLogoUrl(null);
    resetSelection();
    setToast({ message: "Workspace logo removed", variant: "default" });
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Workspace logo</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted">
            {displayedUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={displayedUrl}
                alt={`${name} logo`}
                className="h-full w-full object-cover"
              />
            ) : (
              <ImageIcon className="h-8 w-8 text-muted-foreground" />
            )}
          </div>

          {canEdit ? (
            <div className="space-y-1">
              <p className="text-sm font-medium">
                {selectedFile ? selectedFile.name : "Upload a logo"}
              </p>
              <p className="text-xs text-muted-foreground">
                PNG or JPEG, up to 2 MB.
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              {savedLogoUrl ? "Workspace logo" : "No logo set"}
            </p>
          )}
        </div>

        {canEdit && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPT}
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading || isRemoving}
              >
                Choose file
              </Button>
              {selectedFile && (
                <Button
                  type="button"
                  onClick={handleUpload}
                  disabled={isUploading}
                >
                  {isUploading ? "Uploading..." : "Save logo"}
                </Button>
              )}
              {savedLogoUrl && !selectedFile && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleRemove}
                  disabled={isRemoving}
                >
                  {isRemoving ? "Removing..." : "Remove"}
                </Button>
              )}
              {selectedFile && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={resetSelection}
                  disabled={isUploading}
                >
                  Cancel
                </Button>
              )}
            </div>
          </>
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
