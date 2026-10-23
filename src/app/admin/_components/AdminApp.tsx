"use client";

import { useEffect, useMemo, useState } from "react";
import { AccountView } from "./AccountView";
import { api, type Category, type Product, type Settings, type TextEntry } from "./api";
import { CategoriesView } from "./CategoriesView";
import { ProductsView } from "./ProductsView";
import { SettingsView } from "./SettingsView";
import { TextsView } from "./TextsView";
import { ConfirmProvider, Icon, type IconName, ToastProvider } from "./ui";

const TABS = [
  { id: "products", label: "Products", icon: "box" },
  { id: "categories", label: "Categories", icon: "tag" },
  { id: "settings", label: "Site settings", icon: "settings" },
  { id: "texts", label: "Website texts", icon: "text" },
  { id: "account", label: "Account", icon: "user" },
] as const satisfies readonly { id: string; label: string; icon: IconName }[];

type Tab = (typeof TABS)[number]["id"];

export type AdminData = {
  username: string;
  settings: Settings;
  categories: Category[];
  products: Product[];
  texts: TextEntry[];
};

export function AdminApp(initial: AdminData) {
  const [tab, setTab] = useState<Tab>("products");
  const [username, setUsername] = useState(initial.username);
  const [settings, setSettings] = useState(initial.settings);
  const [categoryRows, setCategories] = useState(initial.categories);
  const [products, setProducts] = useState(initial.products);
  const [texts, setTexts] = useState(initial.texts);

  // product counts follow the product list as it's edited
  const categories = useMemo(
    () => categoryRows.map((c) => ({ ...c, productCount: products.filter((p) => p.categoryId === c.id).length })),
    [categoryRows, products],
  );

  // the tab lives in the URL hash so a refresh stays put
  useEffect(() => {
    const fromHash = () => {
      const h = window.location.hash.slice(1);
      if (TABS.some((t) => t.id === h)) setTab(h as Tab);
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, []);
  const go = (t: Tab) => {
    window.location.hash = t;
    setTab(t);
    window.scrollTo({ top: 0 });
  };

  const logout = async () => {
    await api("/logout", { method: "POST" }).catch(() => {});
    window.location.href = "/admin/login";
  };

  return (
    <ToastProvider>
      <ConfirmProvider>
        <div className="min-h-screen md:ps-64">
          {/* sidebar on desktop */}
          <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-line bg-panel md:flex">
            <Brand logo={settings.logo} name={settings.brandLatin} />
            <nav className="flex-1 space-y-1 px-3">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => go(t.id)}
                  aria-current={tab === t.id ? "page" : undefined}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                    tab === t.id ? "bg-accent-soft text-accent-dark" : "text-muted hover:bg-bg hover:text-ink"
                  }`}
                >
                  <Icon name={t.icon} className="h-5 w-5" />
                  {t.label}
                </button>
              ))}
            </nav>
            <div className="space-y-1 border-t border-line p-3">
              <SiteLinks />
              <button type="button" onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-muted hover:bg-bg hover:text-ink">
                <Icon name="logout" /> Sign out
              </button>
              <p className="px-3 pt-2 text-xs text-muted">Signed in as {username}</p>
            </div>
          </aside>

          {/* top bar + tabs on phones */}
          <header className="sticky top-0 z-30 border-b border-line bg-panel md:hidden">
            <div className="flex items-center justify-between px-4 py-2">
              <Brand logo={settings.logo} name={settings.brandLatin} compact />
              <div className="flex items-center gap-1">
                <a href="/ar" target="_blank" rel="noopener" className="rounded-lg p-2 text-muted hover:bg-bg" aria-label="Open website">
                  <Icon name="external" />
                </a>
                <button type="button" onClick={logout} className="rounded-lg p-2 text-muted hover:bg-bg" aria-label="Sign out">
                  <Icon name="logout" />
                </button>
              </div>
            </div>
            <nav className="no-scrollbar flex gap-1 overflow-x-auto px-3 pb-2">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => go(t.id)}
                  className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold ${
                    tab === t.id ? "bg-accent-soft text-accent-dark" : "text-muted"
                  }`}
                >
                  <Icon name={t.icon} className="h-4 w-4" />
                  {t.label}
                </button>
              ))}
            </nav>
          </header>

          <main className="mx-auto max-w-4xl px-4 py-6 md:py-10">
            {tab === "products" && (
              <ProductsView
                products={products}
                setProducts={setProducts}
                categories={categories}
                currency={settings.currency}
                defaultTravelFee={settings.travelPackaging.enabled ? settings.travelPackaging.pricePerUnit : null}
              />
            )}
            {tab === "categories" && <CategoriesView categories={categories} setCategories={setCategories} />}
            {tab === "settings" && <SettingsView settings={settings} setSettings={setSettings} products={products} />}
            {tab === "texts" && <TextsView entries={texts} setEntries={setTexts} />}
            {tab === "account" && <AccountView username={username} setUsername={setUsername} />}
          </main>
        </div>
      </ConfirmProvider>
    </ToastProvider>
  );
}

function Brand({ logo, name, compact }: { logo: string; name: string; compact?: boolean }) {
  return (
    <div className={`flex items-center gap-3 ${compact ? "" : "px-6 py-6"}`}>
      {/* eslint-disable-next-line @next/next/no-img-element -- logo may be any uploaded URL */}
      <img src={logo} alt="" className="h-10 w-10 rounded-full object-cover ring-2 ring-accent/30" />
      <div className="leading-tight">
        <p className="text-sm font-bold">{name}</p>
        <p className="text-xs text-muted">Admin</p>
      </div>
    </div>
  );
}

function SiteLinks() {
  return (
    <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-muted">
      <Icon name="external" />
      View site
      <a href="/ar" target="_blank" rel="noopener" className="ms-auto rounded-md px-2 py-0.5 text-xs ring-1 ring-line hover:bg-bg hover:text-ink">
        عربي
      </a>
      <a href="/en" target="_blank" rel="noopener" className="rounded-md px-2 py-0.5 text-xs ring-1 ring-line hover:bg-bg hover:text-ink">
        EN
      </a>
    </div>
  );
}
