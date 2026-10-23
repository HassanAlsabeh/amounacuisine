"use client";

import { useState } from "react";
import { api } from "./api";
import { Button, Card, Field, inputClass, PageHeader, useToast } from "./ui";

export function AccountView({ username, setUsername }: { username: string; setUsername: (u: string) => void }) {
  const toast = useToast();
  const [form, setForm] = useState({ username, currentPassword: "", newPassword: "", confirm: "" });
  const [busy, setBusy] = useState(false);

  const mismatch = form.newPassword !== "" && form.confirm !== "" && form.newPassword !== form.confirm;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.newPassword !== form.confirm) return toast("The new passwords don't match.", "error");
    setBusy(true);
    try {
      const res = await api<{ username: string }>("/account", {
        method: "PUT",
        body: { username: form.username, currentPassword: form.currentPassword, newPassword: form.newPassword },
      });
      setUsername(res.username);
      setForm({ username: res.username, currentPassword: "", newPassword: "", confirm: "" });
      toast(form.newPassword ? "Password changed. Other devices were signed out." : "Account saved");
    } catch (err) {
      toast((err as Error).message, "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <PageHeader title="Account" description="The super admin's sign-in details." />
      <form onSubmit={submit} className="max-w-xl">
        <Card>
          <Field label="Username">
            <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} autoComplete="username" className={inputClass} />
          </Field>
          <Field label="New password" hint="Leave empty to keep the current one. At least 8 characters.">
            <input
              type="password"
              value={form.newPassword}
              onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
              autoComplete="new-password"
              className={inputClass}
            />
          </Field>
          {form.newPassword && (
            <Field label="Repeat new password" hint={mismatch ? "Doesn't match" : undefined}>
              <input
                type="password"
                value={form.confirm}
                onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                autoComplete="new-password"
                className={`${inputClass} ${mismatch ? "border-danger" : ""}`}
              />
            </Field>
          )}
          <div className="border-t border-line pt-5">
            <Field label="Current password" hint="Required to save any change here.">
              <input
                type="password"
                required
                value={form.currentPassword}
                onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
                autoComplete="current-password"
                className={inputClass}
              />
            </Field>
          </div>
          <div className="flex justify-end">
            <Button variant="primary" type="submit" busy={busy} disabled={mismatch}>
              Save account
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}
