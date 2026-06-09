"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { X } from "lucide-react";

const STORAGE_KEY = "dismiss-trial-banner";

export function TrialBanner({ trialEnd }: { trialEnd: string }) {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    setDismissed(localStorage.getItem(STORAGE_KEY) === "1");
  }, []);

  if (dismissed) return null;

  const daysRemaining = Math.max(
    0,
    Math.ceil(
      (new Date(trialEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    )
  );

  function handleDismiss() {
    localStorage.setItem(STORAGE_KEY, "1");
    setDismissed(true);
  }

  return (
    <div className="bg-blue-50 border-b border-blue-200 px-4 py-3 text-center text-sm text-blue-800">
      <div className="relative flex items-center justify-center">
        <span>
          You&apos;re on a free trial &mdash; {daysRemaining} day
          {daysRemaining !== 1 ? "s" : ""} remaining.{" "}
          <Link
            href="/billing"
            className="underline font-medium hover:text-blue-900"
          >
            Upgrade now
          </Link>
        </span>
        <button
          onClick={handleDismiss}
          className="absolute right-0 p-1 rounded hover:bg-blue-100 cursor-pointer"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
