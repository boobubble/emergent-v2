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
import { analyzeResearchPaste } from "@/lib/content-automation/parse-research-paste";
import {
  buildResearchOpportunities,
  opportunityKeywords,
  planResearchSave,
  type PendingIdeaRef,
} from "@/lib/content-automation/research-opportunities";
import { listTopicIdeas, updateIdeaKeywords, upsertTopicIdeas } from "@/lib/content-automation/topic-ideas";

export type ResearchPasteInput = {
  clusterText?: string;
  ideasText?: string;
  extraText?: string;
};

export { analyzeResearchPaste };

export async function previewResearchPaste(input: ResearchPasteInput) {
  const analyzed = analyzeResearchPaste(input);
  const [inventory, ideas] = await Promise.all([
    loadInventoryForCannibalization(),
    listTopicIdeas({}),
  ]);
  const pending: PendingIdeaRef[] = ideas.map((idea) => ({
    id: idea.id,
    type: idea.type,
    identifier: idea.identifier,
    title: idea.baseName || idea.identifier,
    keywords: idea.keywords,
    status: idea.status,
  }));
  const opportunities = buildResearchOpportunities({
    keywords: analyzed.merged.keywords,
    clusters: analyzed.merged.clusters,
    inventory,
    pending,
  });
  const plan = planResearchSave(opportunities);
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
    newOpportunities: plan.newCount,
    mergedOpportunities: plan.mergeCount,
    cannibalizationRisks: plan.skipCount,
    errors: analyzed.parsed.flatMap((p) => p.errors),
  };
}

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
    payload: { sources: preview.sources },
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
  const plan = planResearchSave(preview.opportunities);

  const ideaItems = plan.createIdeas.map((opp) => {
    const keywords = opportunityKeywords(opp);
    if (opp.contentType === "blog") {
      return {
        type: "blog" as const,
        title: opp.proposedTitle,
        categorySlug: opp.categorySlug || "chatrooms",
        metaDescription: `Practical guidance around ${opp.primaryKeyword} for the Yaarzo community.`,
        keywords,
      };
    }
    return {
      type: "page" as const,
      slug: opp.slug || "",
      section: opp.section || "other",
      baseName: opp.baseName || opp.primaryKeyword,
      lookupCity: opp.baseName,
      lookupCountryHint: opp.lookupCountryHint,
      keywords,
    };
  });
  const queued = ideaItems.length
    ? await upsertTopicIdeas(ideaItems)
    : { blogUpserted: 0, pageUpserted: 0, skipped: 0 };

  for (const row of plan.appendToPending) {
    await updateIdeaKeywords({
      type: row.type,
      id: row.id,
      keywords: row.keywords,
      mode: "append",
    });
  }

  const existingTargets = await listKeywordTargets(500);
  for (const assign of plan.assignKeywords) {
    const hit = existingTargets.find((t) => t.keyword.toLowerCase() === assign.keyword.toLowerCase());
    if (!hit) continue;
    await updateKeywordTarget(hit.id, {
      status: assign.status,
      target_url: assign.url,
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
      type: opp.contentType,
      url: `pending:${opp.primaryKeyword}`,
      intent: opp.searchIntent,
    });
  }

  if (batchId) {
    await updateKeywordImportBatch(batchId, {
      new_count: upserted.created,
      merged_count: upserted.merged,
      opportunities_created: queued.blogUpserted + queued.pageUpserted + plan.appendToPending.length,
    });
  }

  return {
    ...preview,
    saved: true,
    keywordUpsert: upserted,
    queued,
    batchId,
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

export { listKeywordImportBatches };
