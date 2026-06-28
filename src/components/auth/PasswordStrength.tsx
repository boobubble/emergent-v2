import { useMemo } from "react";

/**
 * Friendly password strength meter. Never blocks — only guides.
 * Score 0–4 based on length and character variety.
 */
export function PasswordStrength({ value }: { value: string }) {
  const { score, label, hint, color } = useMemo(() => evaluate(value), [value]);

  if (!value) {
    return (
      <p className="mt-1 text-[10px] text-muted-foreground">
        At least 6 characters — any simple password works (e.g. "hello123").
      </p>
    );
  }

  return (
    <div className="mt-1.5 space-y-1">
      <div className="flex gap-1" aria-hidden="true">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full bg-muted transition-colors"
            style={i < score ? { background: color } : undefined}
          />
        ))}
      </div>
      <div className="flex items-center justify-between text-[10px]">
        <span className="font-semibold" style={{ color }}>{label}</span>
        <span className="text-muted-foreground">{hint}</span>
      </div>
    </div>
  );
}

function evaluate(pw: string) {
  const len = pw.length;
  const variety =
    (/[a-z]/.test(pw) ? 1 : 0) +
    (/[A-Z]/.test(pw) ? 1 : 0) +
    (/\d/.test(pw) ? 1 : 0) +
    (/[^A-Za-z0-9]/.test(pw) ? 1 : 0);

  let score = 0;
  if (len >= 6) score = 1;
  if (len >= 8 && variety >= 2) score = 2;
  if (len >= 10 && variety >= 3) score = 3;
  if (len >= 12 && variety >= 3) score = 4;

  if (len < 6) {
    return { score: 0, label: "Too short", color: "#ef4444", hint: `${6 - len} more to go` };
  }

  const tips = [
    { label: "Weak", color: "#f97316", hint: "Good enough — add a number for more safety" },
    { label: "Okay", color: "#eab308", hint: "Try mixing letters and numbers" },
    { label: "Good", color: "#22c55e", hint: "Nice mix" },
    { label: "Strong", color: "#16a34a", hint: "Excellent password" },
  ];
  const t = tips[score - 1] ?? tips[0];
  return { score, ...t };
}
