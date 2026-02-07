"use client";

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
  return (
    <Card>
      <CardHeader>
        <CardTitle>Email Address</CardTitle>
        <CardDescription>
          Change your email address. A confirmation link will be sent to your
          new email.
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
              defaultValue={email}
              placeholder="new@example.com"
              required
            />
          </div>
          <div>
            <SubmitButton formAction={changeEmail} pendingText="Saving...">
              Change Email
            </SubmitButton>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
