"use client";

import { useState } from "react";
import { changePassword, createPassword } from "@/app/actions/profile";
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
import { PASSWORD_RULES, isPasswordValid } from "@/lib/validation";
import { Check, X } from "lucide-react";

interface ChangePasswordFormProps {
  hasPassword: boolean;
}

export function ChangePasswordForm({ hasPassword }: ChangePasswordFormProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const passwordValid = isPasswordValid(password);
  const passwordsMatch = confirmPassword === password;

  const formValid = hasPassword
    ? currentPassword.length > 0 &&
      passwordValid &&
      passwordsMatch &&
      confirmPassword.length > 0
    : passwordValid && passwordsMatch && confirmPassword.length > 0;

  return (
    <Card id="password">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Password
          {!hasPassword && (
            <span className="h-2 w-2 rounded-full bg-red-500" />
          )}
        </CardTitle>
        <CardDescription>
          {hasPassword
            ? "Change your password"
            : "Create a password for easier signing"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4">
          {hasPassword && (
            <div className="grid gap-2">
              <Label htmlFor="current_password">Current Password</Label>
              <Input
                id="current_password"
                name="current_password"
                type="password"
                placeholder="Enter your current password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
          )}
          <div className="grid gap-2">
            <Label htmlFor="password">
              {hasPassword ? "New Password" : "Password"}
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Min 8 chars, A-z, 0-9, special"
              minLength={8}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {password.length > 0 && (
              <ul className="mt-1 space-y-1">
                {PASSWORD_RULES.map((rule) => {
                  const passed = rule.test(password);
                  return (
                    <li
                      key={rule.label}
                      className={`flex items-center gap-1.5 text-xs ${
                        passed ? "text-green-600" : "text-muted-foreground"
                      }`}
                    >
                      {passed ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <X className="h-3 w-3" />
                      )}
                      {rule.label}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="confirm_password">
              {hasPassword ? "Confirm New Password" : "Confirm Password"}
            </Label>
            <Input
              id="confirm_password"
              name="confirm_password"
              type="password"
              placeholder={
                hasPassword
                  ? "Confirm your new password"
                  : "Confirm your password"
              }
              minLength={8}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            {confirmPassword.length > 0 && !passwordsMatch && (
              <p className="text-xs text-destructive">
                Passwords do not match.
              </p>
            )}
          </div>
          <div>
            <SubmitButton
              formAction={hasPassword ? changePassword : createPassword}
              pendingText={hasPassword ? "Updating..." : "Creating..."}
              disabled={!formValid}
            >
              {hasPassword ? "Change Password" : "Create Password"}
            </SubmitButton>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
