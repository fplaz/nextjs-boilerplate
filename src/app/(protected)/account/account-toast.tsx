"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { TimedAlert } from "@/components/ui/timed-alert";

export function AccountToast() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [variant, setVariant] = useState<"default" | "destructive">("default");

  useEffect(() => {
    const msg = searchParams.get("message");
    const error = searchParams.get("error");

    if (error) {
      setMessage(error);
      setVariant("destructive");
      router.replace("/account", { scroll: false });
    } else if (msg) {
      setMessage(msg);
      setVariant("default");
      router.replace("/account", { scroll: false });
    }
  }, [searchParams, router]);

  return (
    <TimedAlert
      message={message}
      variant={variant}
      onDismiss={() => setMessage(null)}
    />
  );
}
