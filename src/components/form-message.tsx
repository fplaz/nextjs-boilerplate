"use client";

import { useSearchParams } from "next/navigation";

export function FormMessage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const message = searchParams.get("message");

  if (!error && !message) return null;

  return (
    <div
      className={`rounded-md px-4 py-3 text-sm ${
        error
          ? "bg-destructive/10 text-destructive"
          : "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
      }`}
    >
      {error || message}
    </div>
  );
}
