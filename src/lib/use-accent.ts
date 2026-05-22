import { useEffect, useState } from "react";

export type Accent = "green" | "blue" | "purple" | "orange" | "rose" | "beige";

export const ACCENTS: { id: Accent; label: string; swatch: string; gradient: string }[] = [
  { id: "green",  label: "Lime Green",       swatch: "oklch(0.82 0.2 130)",  gradient: "linear-gradient(135deg, oklch(0.82 0.2 130), oklch(0.7 0.18 150))" },
  { id: "blue",   label: "Modern Blue",      swatch: "oklch(0.62 0.18 252)", gradient: "linear-gradient(135deg, oklch(0.62 0.18 252), oklch(0.55 0.2 270))" },
  { id: "purple", label: "Purple + Indigo",  swatch: "oklch(0.58 0.22 290)", gradient: "linear-gradient(135deg, oklch(0.58 0.22 290), oklch(0.5 0.22 270))" },
  { id: "orange", label: "Orange + Coral",   swatch: "oklch(0.7 0.19 45)",   gradient: "linear-gradient(135deg, oklch(0.72 0.2 55), oklch(0.65 0.22 20))" },
  { id: "rose",   label: "Rose Pink + Violet", swatch: "oklch(0.66 0.23 10)", gradient: "linear-gradient(135deg, oklch(0.7 0.23 5), oklch(0.55 0.22 305))" },
  { id: "beige",  label: "Beige + Brown",    swatch: "oklch(0.52 0.09 55)",  gradient: "linear-gradient(135deg, oklch(0.78 0.06 75), oklch(0.45 0.07 50))" },
];

const KEY = "palrgo-accent";

export function applyAccent(a: Accent) {
  if (typeof document === "undefined") return;
  if (a === "green") document.documentElement.removeAttribute("data-accent");
  else document.documentElement.setAttribute("data-accent", a);
}

export function getStoredAccent(): Accent {
  if (typeof window === "undefined") return "green";
  return ((localStorage.getItem(KEY) as Accent) || "green");
}

export function useAccent() {
  const [accent, setAccent] = useState<Accent>("green");

  useEffect(() => {
    const a = getStoredAccent();
    setAccent(a);
    applyAccent(a);
  }, []);

  const choose = (a: Accent) => {
    setAccent(a);
    localStorage.setItem(KEY, a);
    applyAccent(a);
  };

  return { accent, setAccent: choose };
}
