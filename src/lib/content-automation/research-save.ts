import { loadInventoryForCannibalization, recordCannibalizationWarnings } from "@/lib/content-automation/cannibalization";
import {
  insertKeywordImportBatch,
  listKeywordImportBatches,
  updateKeywordImportBatch,
  updateKeywordTarget,
  upsertKeywordTargets,
  listKeywordTargets,
  type ParsedKeywordRow,
} from "@/lib/content-automation/keyword-targets";
import { analyzeResearchPaste, type ParsedResearchKeyword } from "@/lib/content-automation/parse-research-paste";
import {
  buildResearchOpportunities,
  opportunityKeywords,
  type PendingIdeaRef,
} from "@/lib/content-automation/research-opportunities";
import {
  getTopicIdeaById,
  listTopicIdeas,
  markIdeaGenerationReady,
  updateIdeaKeywords,
  type IdeaType,
} from "@/lib/content-automation/topic-ideas";
import { normalizeKeyword } from "@/lib/content-automation/cannibalization";

export type ResearchPasteInput = {
  clusterText?: string;
  ideasText?: string;
  extraText?: string;
};

export type IdeaResearchInput = ResearchPasteInput & {
  ideaType: IdeaType;
  ideaId: number;
};

export { analyzeResearchPaste };

function ideaToPendingRef(idea: {
  id: number;
  type: IdeaType;
  identifier: string;
  baseName: string | null;
  keywords: string | null;
  status: "pending" | "published";
}): PendingIdeaRef {
  return {
    id: idea.id,
    type: idea.type,
    identifier: idea.identifier,
    title: idea.baseName || idea.identifier,
    keywords: idea.keywords,
    status: idea.status,
  };
}

function buildKeywordsForIdea(
  mainKeyword: string,
  keywords: ParsedResearchKeyword[],
): string {
  const primary =
    keywords.find((k) => k.keyword_type === "primary")?.keyword
    || keywords.find((k) => normalizeKeyword(k.keyword) === normalizeKeyword(mainKeyword))?.keyword
    || mainKeyword;
  const rest = keywords
    .map((k) => k.keyword)
    .filter((k) => normalizeKeyword(k) !== normalizeKeyword(primary));
  const unique = [primary, ...rest].filter((k, i, all) =>
    all.findIndex((x) => normalizeKeyword(x) === normalizeKeyword(k)) === i,
  );
  return unique.join(", ");
}

export async function previewResearchPaste(input: ResearchPasteInput) {
  const analyzed = analyzeResearchPaste(input);
  const [inventory, ideas] = await Promise.all([
    loadInventoryForCannibalization(),
    listTopicIdeas({}),
  ]);
  const pending: PendingIdeaRef[] = ideas.map(ideaToPendingRef);
  const opportunities = buildResearchOpportunities({
    keywords: analyzed.merged.keywords,
    clusters: analyzed.merged.clusters,
    inventory,
    pending,
  });
  return {
    source: analyzed.merged.sources.join(", ") || "none",
    sources: analyzed.merged.sources,
    clustersFound: analyzed.merged.clusters.length,
    keywordsFound: analyzed.merged.keywords.length,
    duplicatesRemoved: analyzed.merged.duplicatesRemoved,
    primary: analyzed.summary.primary,
    secondary: analyzed.summary.secondary,
    longTail: analyzed.summary.longTail,
    keywords: analyzed.merged.keywords,
    clusters: analyzed.merged.clusters,
    opportunities,
    errors: analyzed.parsed.flatMap((p) => p.errors),
  };
}

/** Preview research scoped to one pending idea. Does not create new ideas. */
export async function previewIdeaResearch(input: IdeaResearchInput) {
  const idea = await getTopicIdeaById(input.ideaType, input.ideaId);
  if (!idea) throw new Error("Pending item not found");
  if (idea.status === "published") throw new Error("Published items cannot receive new keyword research here");

  const mainKeyword =
    (idea.keywords || "").split(",")[0]?.trim()
    || idea.baseName
    || idea.identifier;
  const seedCluster = input.clusterText?.trim()
    ? input.clusterText
    : `Cluster: ${mainKeyword}\n- ${mainKeyword}`;
  const preview = await previewResearchPaste({
    clusterText: seedCluster,
    ideasText: input.ideasText,
    extraText: input.extraText,
  });

  const inventory = await loadInventoryForCannibalization();
  const opportunities = buildResearchOpportunities({
    keywords: preview.keywords,
    clusters: preview.clusters,
    inventory,
    pending: [ideaToPendingRef(idea)],
  });
  const forThisIdea = opportunities.filter((o) =>
    normalizeKeyword(o.primaryKeyword) === normalizeKeyword(mainKeyword)
    || o.existingIdeaId === idea.id
    || (o.cluster && normalizeKeyword(o.cluster) === normalizeKeyword(mainKeyword)),
  );
  const related = forThisIdea.length ? forThisIdea : opportunities.slice(0, 3);
  const keywordsText = buildKeywordsForIdea(mainKeyword, preview.keywords);

  return {
    ...preview,
    idea: {
      id: idea.id,
      type: idea.type,
      identifier: idea.identifier,
      title: idea.baseName || idea.identifier,
      mainKeyword,
      status: idea.status,
      generationReady: idea.generationReady,
    },
    keywordsText,
    opportunities: related,
    cannibalizationRisks: related.filter((o) => o.action === "skip_cannibalization").length,
    newOpportunities: 0,
    mergedOpportunities: related.filter((o) => o.action === "merge_existing" || o.action === "use_as_secondary").length,
  };
}

/**
 * Save pasted research onto one pending idea + unified keyword targets.
 * Never publishes and never creates additional pending ideas.
 */
export async function saveIdeaResearch(input: IdeaResearchInput) {
  const preview = await previewIdeaResearch(input);
  if (preview.keywordsFound === 0) {
    return {
      ...preview,
      saved: false,
      keywordUpsert: { upserted: 0, merged: 0, created: 0 },
      batchId: null,
    };
  }

  const batchId = await insertKeywordImportBatch({
    source: preview.sources[0] || "manual",
    sources: preview.sources,
    keywords_found: preview.keywordsFound,
    clusters_found: preview.clustersFound,
    duplicates_removed: preview.duplicatesRemoved,
    new_count: 0,
    merged_count: 0,
    opportunities_created: 0,
    payload: {
      sources: preview.sources,
      ideaType: input.ideaType,
      ideaId: input.ideaId,
      mode: "per_idea",
    },
  });

  const keywordRows: ParsedKeywordRow[] = preview.keywords.map((row) => ({
    keyword: row.keyword,
    keyword_type: row.keyword_type,
    search_volume: row.search_volume,
    seo_difficulty: row.seo_difficulty,
    competition: row.competition,
    cpc: row.cpc,
    search_intent: row.search_intent,
    parent_keyword: row.parent_keyword || preview.idea.mainKeyword,
    related_keywords: row.related_keywords,
    questions: [],
    notes: row.cluster ? `cluster:${row.cluster};idea:${input.ideaType}:${input.ideaId}` : `idea:${input.ideaType}:${input.ideaId}`,
    target_content_type: input.ideaType,
    target_url: null,
    cluster: row.cluster || preview.idea.mainKeyword,
    sources: row.sources,
    paid_difficulty: row.paid_difficulty,
  }));
  const upserted = await upsertKeywordTargets(keywordRows, batchId);

  await updateIdeaKeywords({
    type: input.ideaType,
    id: input.ideaId,
    keywords: preview.keywordsText,
    mode: "replace",
  });

  const existingTargets = await listKeywordTargets(500);
  for (const row of preview.keywords) {
    const hit = existingTargets.find((t) => t.keyword.toLowerCase() === row.keyword.toLowerCase());
    if (!hit) continue;
    await updateKeywordTarget(hit.id, {
      status: "assigned",
      target_content_type: input.ideaType,
      notes: hit.notes || `idea:${input.ideaType}:${input.ideaId}`,
    });
  }

  const inventory = await loadInventoryForCannibalization();
  for (const opp of preview.opportunities.filter((o) => o.action === "skip_cannibalization")) {
    const hit = inventory.find((row) => row.canonical_url === opp.existingUrl);
    if (!hit) continue;
    await recordCannibalizationWarnings([{
      kind: "exact_primary",
      existing: hit,
      keyword: opp.primaryKeyword,
      similarity: 1,
      recommended_action: "review",
    }], {
      type: input.ideaType,
      id: String(input.ideaId),
      url: `pending:${preview.idea.identifier}`,
      intent: opp.searchIntent,
    });
  }

  if (batchId) {
    await updateKeywordImportBatch(batchId, {
      new_count: upserted.created,
      merged_count: upserted.merged,
      opportunities_created: 0,
    });
  }

  return {
    ...preview,
    saved: true,
    keywordUpsert: upserted,
    batchId,
    queued: { blogUpserted: 0, pageUpserted: 0, skipped: 0 },
  };
}

/** Mark a pending idea ready for the existing automation/generation pipeline. Does not publish. */
export async function sendIdeaToGeneration(input: { ideaType: IdeaType; ideaId: number }) {
  const idea = await getTopicIdeaById(input.ideaType, input.ideaId);
  if (!idea) throw new Error("Pending item not found");
  if (idea.status === "published") {
    return { ok: false as const, reason: "already_published", idea };
  }
  if (!idea.keywords?.trim()) {
    throw new Error("Add a main keyword and save Keyword Research before sending to content generation.");
  }
  const updated = await markIdeaGenerationReady(input.ideaType, input.ideaId);
  return {
    ok: true as const,
    reason: "queued",
    idea: updated,
    message: "Marked ready for content generation. Cron / Run Now will pick it up within daily quotas. Nothing was published.",
  };
}

/** @deprecated Prefer saveIdeaResearch for the pending-row workflow. Kept for CSV/admin tooling. */
export async function saveResearchPaste(input: ResearchPasteInput) {
  const preview = await previewResearchPaste(input);
  if (preview.keywordsFound === 0) {
    return { ...preview, saved: false, keywordUpsert: { upserted: 0, merged: 0, created: 0 }, queued: { blogUpserted: 0, pageUpserted: 0, skipped: 0 }, batchId: null };
  }
  const batchId = await insertKeywordImportBatch({
    source: preview.sources[0] || "manual",
    sources: preview.sources,
    keywords_found: preview.keywordsFound,
    clusters_found: preview.clustersFound,
    duplicates_removed: preview.duplicatesRemoved,
    new_count: 0,
    merged_count: 0,
    opportunities_created: 0,
    payload: { sources: preview.sources, mode: "bulk_targets_only" },
  });
  const keywordRows: ParsedKeywordRow[] = preview.keywords.map((row) => ({
    keyword: row.keyword,
    keyword_type: row.keyword_type,
    search_volume: row.search_volume,
    seo_difficulty: row.seo_difficulty,
    competition: row.competition,
    cpc: row.cpc,
    search_intent: row.search_intent,
    parent_keyword: row.parent_keyword,
    related_keywords: row.related_keywords,
    questions: [],
    notes: row.cluster ? `cluster:${row.cluster}` : null,
    target_content_type: null,
    target_url: null,
    cluster: row.cluster,
    sources: row.sources,
    paid_difficulty: row.paid_difficulty,
  }));
  const upserted = await upsertKeywordTargets(keywordRows, batchId);
  if (batchId) {
    await updateKeywordImportBatch(batchId, {
      new_count: upserted.created,
      merged_count: upserted.merged,
      opportunities_created: 0,
    });
  }
  return {
    ...preview,
    saved: true,
    keywordUpsert: upserted,
    queued: { blogUpserted: 0, pageUpserted: 0, skipped: 0 },
    batchId,
    newOpportunities: 0,
    mergedOpportunities: 0,
    cannibalizationRisks: 0,
  };
}

export async function researchDashboard() {
  const [keywords, batches, ideas] = await Promise.all([
    listKeywordTargets(400),
    listKeywordImportBatches(12),
    listTopicIdeas({}),
  ]);
  const clusters = new Set(keywords.map((k) => k.cluster).filter(Boolean));
  const used = keywords.filter((k) => k.status === "assigned" || k.status === "published").length;
  const unused = keywords.filter((k) => k.status === "pending").length;
  return {
    batches,
    keywordClusters: clusters.size,
    totalKeywords: keywords.length,
    keywordsUsed: used,
    keywordsUnused: unused,
    pendingContent: ideas.filter((i) => i.status === "pending").length,
    cannibalizationRisks: 0,
  };
}

export { listKeywordImportBatches, opportunityKeywords };
