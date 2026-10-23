/** The box's compartment colours, handed out to categories in menu order. */
export const TONES = [
  { bg: "bg-apri", deep: "text-apri-deep", swatch: "bg-apri-deep" },
  { bg: "bg-butter", deep: "text-butter-deep", swatch: "bg-butter-deep" },
  { bg: "bg-pista", deep: "text-pista-deep", swatch: "bg-pista-deep" },
  { bg: "bg-lav", deep: "text-lav-deep", swatch: "bg-lav-deep" },
] as const;

export type Tone = (typeof TONES)[number];

export const toneAt = (i: number): Tone => TONES[((i % TONES.length) + TONES.length) % TONES.length];
