"use client";

import { useState } from "react";
import { updateProfile } from "@/app/actions/profile";
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

export function UpdateNameForm({
  firstName,
  lastName,
}: {
  firstName: string;
  lastName: string;
}) {
  const [currentFirstName, setCurrentFirstName] = useState(firstName);
  const [currentLastName, setCurrentLastName] = useState(lastName);

  const hasChanges =
    currentFirstName !== firstName || currentLastName !== lastName;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Display Name</CardTitle>
        <CardDescription>Update your display name</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="first_name">First Name</Label>
            <Input
              id="first_name"
              name="first_name"
              value={currentFirstName}
              onChange={(e) => setCurrentFirstName(e.target.value)}
              placeholder="First name"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="last_name">Last Name</Label>
            <Input
              id="last_name"
              name="last_name"
              value={currentLastName}
              onChange={(e) => setCurrentLastName(e.target.value)}
              placeholder="Last name"
              required
            />
          </div>
          <div>
            <SubmitButton
              formAction={updateProfile}
              pendingText="Saving..."
              disabled={!hasChanges}
            >
              Save
            </SubmitButton>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
