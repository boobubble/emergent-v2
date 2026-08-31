const htmlRes = await fetch("https://yaarzo.com/");
const html = await htmlRes.text();
const css = [...html.matchAll(/\/assets\/[^"']+\.css/g)].map((m) => m[0]);
console.log(JSON.stringify({
  http: htmlRes.status,
  title: (html.match(/<title>([^<]+)<\/title>/i) || [])[1],
  canon: (html.match(/rel="canonical"[^>]*href="([^"]+)"/i) || html.match(/href="([^"]+)"[^>]*rel="canonical"/i) || [])[1],
  h1: (html.match(/<h1[\s\S]*?<\/h1>/i) || [""])[0].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(),
  h1Count: (html.match(/<h1[\s>]/gi) || []).length,
  loadingOnly: /Loading[…\.]/.test(html) && !(html.match(/<h1[\s>]/gi) || []).length,
  critical: html.includes("welcome-root{min-height:100vh"),
  preloadCss: /rel="preload"[^>]*as="style"|as="style"[^>]*rel="preload"/.test(html),
  blockingStylesheet: /rel="stylesheet"[^>]*styles-/.test(html) && !/rel="preload"/.test(html),
  appSurfacesInHtml: html.includes("app-surfaces"),
  googleFonts: /fonts\.googleapis|fonts\.gstatic/.test(html),
  css,
}, null, 2));
