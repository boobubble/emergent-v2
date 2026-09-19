import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  aggregateReactionRows,
  emptyReactionBuckets,
  normalizeMessageIds,
  parseReactionType,
} from "./irc-reactions.cjs";

describe("irc-reactions gateway helpers", () => {
  it("rejects invalid reaction types", () => {
    assert.equal(parseReactionType("heart"), "heart");
    assert.equal(parseReactionType("love"), null);
    assert.equal(parseReactionType(""), null);
  });

  it("normalizes message id batches with dedupe and cap", () => {
    const id = "11111111-1111-4111-8111-111111111111";
    const ids = normalizeMessageIds([id, id, "not-uuid", id]);
    assert.deepEqual(ids, [id]);
  });

  it("aggregates counts and reactedByMe", () => {
    const viewer = "22222222-2222-4222-8222-222222222222";
    const messageId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
    const rows = [
      {
        message_id: messageId,
        user_id: viewer,
        reaction_type: "heart",
      },
      {
        message_id: messageId,
        user_id: "33333333-3333-4333-8333-333333333333",
        reaction_type: "heart",
      },
      {
        message_id: messageId,
        user_id: viewer,
        reaction_type: "laugh",
      },
    ];
    const map = aggregateReactionRows(rows, viewer);
    const bucket = map.get(messageId) ?? emptyReactionBuckets();
    assert.equal(bucket.heart.count, 2);
    assert.equal(bucket.heart.reactedByMe, true);
    assert.equal(bucket.laugh.count, 1);
    assert.equal(bucket.laugh.reactedByMe, true);
  });
});
