import { Badge } from "@/components/ui/badge";
import { Sparkles, Smartphone, Zap, ShieldCheck } from "lucide-react";

type Variant = "recommended" | "new-communities" | "mobile" | "advanced";

const CONFIG: Record<Variant, { label: string; icon: React.ComponentType<{ className?: string }>; className: string }> = {
  recommended:        { label: "Recommended",            icon: Sparkles,    className: "border-primary/40 bg-primary/10 text-primary" },
  "new-communities":  { label: "Best for new communities", icon: Zap,       className: "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
  mobile:             { label: "Optimized for mobile",   icon: Smartphone,  className: "border-sky-500/40 bg-sky-500/10 text-sky-600 dark:text-sky-400" },
  advanced:           { label: "Advanced",               icon: ShieldCheck, className: "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400" },
};

export function RecommendedBadge({ variant }: { variant: Variant }) {
  const c = CONFIG[variant];
  const Icon = c.icon;
  return (
    <Badge variant="outline" className={`h-5 gap-1 px-1.5 text-[10px] font-medium ${c.className}`}>
      <Icon className="h-3 w-3" />
      {c.label}
    </Badge>
  );
}
