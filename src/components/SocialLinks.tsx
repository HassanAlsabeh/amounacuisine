import type { Dict } from "@/lib/i18n";
import type { Settings } from "@/lib/types";

type IconProps = { className?: string };

function InstagramIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" />
      <circle cx="12" cy="12" r="4.3" />
      <circle cx="17.6" cy="6.4" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function TikTokIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M16.6 2h-3.4v13.4a2.9 2.9 0 1 1-2.9-2.9c.3 0 .6 0 .9.1V9.1a6.4 6.4 0 1 0 5.4 6.3V8.6a8.3 8.3 0 0 0 4.9 1.6V6.8a4.9 4.9 0 0 1-4.9-4.8Z" />
    </svg>
  );
}

function FacebookIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M13.5 21.9v-7.7h2.6l.4-3h-3V9.3c0-.9.3-1.5 1.5-1.5h1.6V5.1a21 21 0 0 0-2.3-.1c-2.3 0-3.9 1.4-3.9 4v2.2H7.8v3h2.6v7.7A10 10 0 1 1 13.5 21.9Z" />
    </svg>
  );
}

/** The shop's social accounts that have a link set in the admin, in display order. */
export function socialLinks(settings: Settings, t: Dict) {
  return [
    { key: "instagram", href: settings.instagramUrl, label: t.instagram, Icon: InstagramIcon },
    { key: "tiktok", href: settings.tiktokUrl, label: t.tiktok, Icon: TikTokIcon },
    { key: "facebook", href: settings.facebookUrl, label: t.facebook, Icon: FacebookIcon },
  ].filter((l): l is typeof l & { href: string } => !!l.href);
}
