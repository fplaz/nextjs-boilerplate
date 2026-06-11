"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { TimedAlert } from "@/components/ui/timed-alert";

export function SettingsToast() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [variant, setVariant] = useState<"default" | "destructive">("default");

  useEffect(() => {
    const msg = searchParams.get("message");
    const error = searchParams.get("error");

    if (!msg && !error) return;

    setMessage(error ?? msg);
    setVariant(error ? "destructive" : "default");

    // Clear the feedback params while preserving the active tab.
    const params = new URLSearchParams(searchParams.toString());
    params.delete("message");
    params.delete("error");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [searchParams, pathname, router]);

  return (
    <TimedAlert
      message={message}
      variant={variant}
      onDismiss={() => setMessage(null)}
    />
  );
}
