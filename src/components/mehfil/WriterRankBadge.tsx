import { WRITER_RANK_COLOR, WRITER_RANK_ICON, WRITER_RANK_LABEL, type WriterRank } from "@/lib/mehfil-types";

export function WriterRankBadge({ rank, className = "" }: { rank: WriterRank | null | undefined; className?: string }) {
  const r: WriterRank = rank ?? "fresh_writer";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${className}`}
      style={{ backgroundColor: `${WRITER_RANK_COLOR[r]}22`, color: WRITER_RANK_COLOR[r] }}
      title={WRITER_RANK_LABEL[r]}
    >
      <span>{WRITER_RANK_ICON[r]}</span>
      <span>{WRITER_RANK_LABEL[r]}</span>
    </span>
  );
}
