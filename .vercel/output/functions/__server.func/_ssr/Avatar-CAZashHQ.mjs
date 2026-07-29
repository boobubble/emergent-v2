import { j as jsxRuntimeExports } from "../_libs/react.mjs";
function borderColor(user) {
  if (user.isGuest) return "oklch(0.6 0 0)";
  if (user.gender === "male") return "oklch(0.65 0.18 250)";
  if (user.gender === "female") return "oklch(0.72 0.18 350)";
  return "oklch(0.6 0 0)";
}
function Avatar({ user, size = 36, square = true }) {
  const initials = user.name.slice(0, 2).toUpperCase();
  const hasImg = !!user.avatarUrl;
  const ring = borderColor(user);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: `relative flex shrink-0 items-center justify-center overflow-hidden font-bold text-background ${square ? "rounded-2xl" : "rounded-full"}`,
      style: {
        width: size,
        height: size,
        background: user.avatarColor,
        fontSize: size * 0.38,
        boxShadow: `0 0 0 2px ${ring}, 0 4px 12px oklch(0 0 0 / 0.4)`
      },
      children: [
        hasImg ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: user.avatarUrl, alt: user.name, className: "h-full w-full object-cover" }) : initials,
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "span",
          {
            className: "absolute -bottom-0.5 -right-0.5 rounded-full border-2 border-card",
            style: {
              width: Math.max(10, size * 0.28),
              height: Math.max(10, size * 0.28),
              background: user.status === "online" ? "oklch(0.72 0.2 145)" : user.status === "away" ? "var(--color-warning)" : "oklch(0.62 0.22 25)",
              // red (offline)
              boxShadow: user.status === "online" ? "0 0 6px oklch(0.72 0.2 145 / 0.7)" : user.status === "offline" ? "0 0 6px oklch(0.62 0.22 25 / 0.5)" : "none"
            }
          }
        )
      ]
    }
  );
}
export {
  Avatar as A
};
