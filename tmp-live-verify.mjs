const htmlRes = await fetch("https://yaarzo.com/");
const html = await htmlRes.text();
const land = await (await fetch("https://yaarzo.com/api/public/landing")).json();
const h1s = [...html.matchAll(/<h1[\s>]/gi)];
const title = (html.match(/<title>([^<]+)<\/title>/i) || [])[1] || null;
const canon = (html.match(/rel="canonical"[^>]*href="([^"]+)"/i) || html.match(/href="([^"]+)"[^>]*rel="canonical"/i) || [])[1] || null;
const og = (html.match(/property="og:title"[^>]*content="([^"]+)"/i) || html.match(/content="([^"]+)"[^>]*property="og:title"/i) || [])[1] || null;
const scripts = [...html.matchAll(/(?:src|href)="(\/assets\/[^"]+\.js)"/g)].map((m) => m[1]);
const uniqueScripts = [...new Set(scripts)];
const sizes = {};
for (const s of uniqueScripts) {
  const r = await fetch("https://yaarzo.com" + s, { method: "HEAD" });
  sizes[s] = Number(r.headers.get("content-length") || 0);
}
const members = land.newMembers || [];
console.log(JSON.stringify({
  http: htmlRes.status,
  h1Count: h1s.length,
  title,
  canon,
  og,
  source: land.source,
  newMembers: members.length,
  newMemberSample: members.slice(0, 4).map((m) => ({
    u: m.username,
    avatar: Boolean(m.avatar_url || m.avatarUrl),
  })),
  featured: (land.featuredMembers || []).length,
  footer: {
    famous: html.includes("Famous Chat Rooms") || html.includes("famous_chat_rooms"),
    popular: html.includes("Popular Chat Rooms") || html.includes("popular_chat_rooms"),
    quick: html.includes("Quick Links") || html.includes("quick_links"),
    cmsChunk: html.includes("CmsFooterLinks"),
  },
  uniqueScripts,
  sizes,
  googleFonts: /fonts\.googleapis|fonts\.gstatic/.test(html),
  i18next: /i18next/.test(html),
  clientEager: /client-eager/.test(html),
  supabaseJs: /supabase-js|auth-js/.test(html),
  chatApp: /ChatApp/.test(html),
  ads: /adsbygoogle|googletagmanager|gtag\(/.test(html),
  interInHtml: /inter-latin|fonts.googleapis/.test(html),
}, null, 2));
