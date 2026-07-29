import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { W as WRITER_RANK_LABEL, a as WRITER_RANK_COLOR, b as WRITER_RANK_ICON } from "./mehfil-types-okfUX99d.mjs";
function WriterRankBadge({ rank, className = "" }) {
  const r = rank ?? "fresh_writer";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "span",
    {
      className: `inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${className}`,
      style: { backgroundColor: `${WRITER_RANK_COLOR[r]}22`, color: WRITER_RANK_COLOR[r] },
      title: WRITER_RANK_LABEL[r],
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: WRITER_RANK_ICON[r] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: WRITER_RANK_LABEL[r] })
      ]
    }
  );
}
export {
  WriterRankBadge as W
};
