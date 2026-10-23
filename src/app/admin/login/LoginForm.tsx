"use client";

import { useState } from "react";
import { api } from "../_components/api";
import { Button, Field, inputClass } from "../_components/ui";

export function LoginForm({ next }: { next: string }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api("/login", { method: "POST", body: { username, password } });
      window.location.href = next;
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4 rounded-2xl bg-panel p-6 shadow-panel ring-1 ring-line">
      <Field label="Username">
        <input value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" autoFocus required className={inputClass} />
      </Field>
      <Field label="Password">
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required className={inputClass} />
      </Field>
      {error && (
        <p role="alert" className="rounded-lg bg-danger/10 px-3 py-2 text-sm font-medium text-danger">
          {error}
        </p>
      )}
      <Button variant="primary" type="submit" busy={busy} className="w-full">
        Sign in
      </Button>
    </form>
  );
}
