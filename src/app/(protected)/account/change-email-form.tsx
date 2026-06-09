"use client";

import { useState } from "react";
import { changeEmail } from "@/app/actions/profile";
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

export function ChangeEmailForm({ email }: { email: string }) {
  const [currentEmail, setCurrentEmail] = useState(email);

  const hasChanges = currentEmail !== email;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Email Address</CardTitle>
        <CardDescription>
          Change your email address
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">New Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={currentEmail}
              onChange={(e) => setCurrentEmail(e.target.value)}
              placeholder="new@example.com"
              required
            />
          </div>
          <div>
            <SubmitButton
              formAction={changeEmail}
              pendingText="Saving..."
              disabled={!hasChanges}
            >
              Change Email
            </SubmitButton>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
