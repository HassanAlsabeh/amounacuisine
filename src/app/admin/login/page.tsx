import { redirect } from "next/navigation";
import { getSettings } from "@/lib/catalog";
import { currentAdmin } from "@/server/auth";
import { LoginForm } from "./LoginForm";

export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  if (await currentAdmin()) redirect("/admin");
  const [{ next }, settings] = await Promise.all([searchParams, getSettings()]);
  // only ever send people back inside the admin
  const target = next?.startsWith("/admin") ? next : "/admin";

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          {/* eslint-disable-next-line @next/next/no-img-element -- logo may be any uploaded URL */}
          <img src={settings.logo} alt="" className="h-20 w-20 rounded-full object-cover shadow-panel ring-4 ring-panel" />
          <h1 className="mt-4 text-xl font-bold">{settings.brandLatin}</h1>
          <p className="text-sm text-muted">Admin panel</p>
        </div>
        <LoginForm next={target} />
      </div>
    </main>
  );
}
