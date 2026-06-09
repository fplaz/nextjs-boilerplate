"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { TimedAlert } from "@/components/ui/timed-alert";

export function DashboardToast() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const msg = searchParams.get("message");
    if (msg) {
      setMessage(msg);
      router.replace("/dashboard", { scroll: false });
    }
  }, [searchParams, router]);

  return <TimedAlert message={message} onDismiss={() => setMessage(null)} />;
}
