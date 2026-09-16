import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { validatePmSendPayload } from "./irc-pm.cjs";

const UUID = "550e8400-e29b-41d4-a716-446655440000";

describe("irc-pm", () => {
  it("validates pm.send payloads", () => {
    const ok = validatePmSendPayload(
      {
        type: "pm.send",
        recipientNick: "JD",
        messageId: UUID,
        text: "hello",
      },
      "max",
    );
    assert.deepEqual(ok, {
      recipientNick: "JD",
      messageId: UUID,
      text: "hello",
    });
  });

  it("blocks self-PM", () => {
    assert.equal(
      validatePmSendPayload(
        {
          type: "pm.send",
          recipientNick: "max",
          messageId: UUID,
          text: "hello",
        },
        "max",
      ),
      null,
    );
  });

  it("rejects CR/LF injection in text", () => {
    const result = validatePmSendPayload(
      {
        type: "pm.send",
        recipientNick: "JD",
        messageId: UUID,
        text: "hello\r\nPRIVMSG",
      },
      "max",
    );
    assert.equal(result?.text, "hello PRIVMSG");
  });
});
