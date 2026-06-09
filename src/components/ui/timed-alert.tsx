"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { CircleCheck, CircleAlert } from "lucide-react";
import { Alert, AlertTitle } from "@/components/ui/alert";

interface TimedAlertProps {
  message: string | null;
  onDismiss: () => void;
  duration?: number;
  variant?: "default" | "destructive";
}

export function TimedAlert({
  message,
  onDismiss,
  duration = 5000,
  variant = "default",
}: TimedAlertProps) {
  const onDismissRef = useRef(onDismiss);
  onDismissRef.current = onDismiss;

  useEffect(() => {
    if (!message) return;

    const timer = setTimeout(() => {
      onDismissRef.current();
    }, duration);

    return () => clearTimeout(timer);
  }, [message, duration]);

  if (!message) return null;

  return createPortal(
    <div className="fixed bottom-4 left-4 z-50 w-auto max-w-sm">
      <Alert variant={variant} className="shadow-lg">
        {variant === "destructive" ? (
          <CircleAlert className="h-4 w-4" />
        ) : (
          <CircleCheck className="h-4 w-4" />
        )}
        <AlertTitle>{message}</AlertTitle>
      </Alert>
    </div>,
    document.body
  );
}
