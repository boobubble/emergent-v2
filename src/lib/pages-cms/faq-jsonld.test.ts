import { describe, expect, it } from "vitest";
import { buildCmsPageJsonLd, extractFaqItems, faqItemsFromStored } from "./faq-jsonld";

const ISLAMABAD_FAQ = `
<h2>Frequently Asked Questions</h2>
<p></p>
<p><strong>Q1: Kya Islamabad chat room sirf students ke liye hai?</strong></p>
<p></p>
<p>Nahi, ye sab ke liye hai — students, professionals, aur koi bhi jo Islamabad ke logon se connect hona chahta hai.</p>
<p></p>
<p><strong>Q2: Kya ye video chat wala platform hai?</strong></p>
<p></p>
<p>Nahi, Yaarzo text-based public chat rooms aur community features offer karta hai — video chat available nahi hai.</p>
<p></p>
<p><strong>Q3: Kya ye anonymous random matching wala app hai?</strong></p>
<p></p>
<p>Nahi, ye random anonymous stranger-matching wala platform nahi hai.</p>
`;

describe("extractFaqItems", () => {
  it("parses Q1/strong FAQ blocks used on city pages", () => {
    const faqs = extractFaqItems(ISLAMABAD_FAQ);
    expect(faqs.length).toBeGreaterThanOrEqual(3);
    expect(faqs[0]?.question).toMatch(/students/i);
    expect(faqs[1]?.answer).toMatch(/text-based/i);
  });

  it("falls back to stored faq_content rows", () => {
    expect(
      faqItemsFromStored([
        { q: "How do I join Islamabad chat rooms on Yaarzo?", a: "Open Yaarzo and choose a room related to Islamabad." },
        { question: "Is it free to join?", answer: "Yes, joining public rooms on Yaarzo is free." },
      ]),
    ).toHaveLength(2);
  });
});

describe("buildCmsPageJsonLd", () => {
  it("emits WebPage plus FAQPage when two or more FAQs exist", () => {
    const json = buildCmsPageJsonLd({
      title: "Islamabad Chat Room | Free Online Chat on Yaarzo",
      description: "Chat with people in Islamabad.",
      url: "https://yaarzo.com/islamabad-chat-room",
      faqs: extractFaqItems(ISLAMABAD_FAQ),
    });
    expect(json["@context"]).toBe("https://schema.org");
    const graph = json["@graph"] as Array<Record<string, unknown>>;
    expect(graph[0]?.["@type"]).toBe("WebPage");
    expect(graph[1]?.["@type"]).toBe("FAQPage");
    const main = graph[1]?.mainEntity as unknown[];
    expect(main.length).toBeGreaterThanOrEqual(2);
  });
});
