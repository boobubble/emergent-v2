const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function median(arr) {
  const s = [...arr].sort((a, b) => a - b);
  return s[Math.floor((s.length - 1) / 2)];
}

async function once(url, { bypassCache = false } = {}) {
  const t0 = performance.now();
  const res = await fetch(url, bypassCache ? { cache: "no-store" } : {});
  const ttfb = Math.round(performance.now() - t0);
  const buf = Buffer.from(await res.arrayBuffer());
  const total = Math.round(performance.now() - t0);
  let json = null;
  try {
    json = JSON.parse(buf.toString("utf8"));
  } catch {
    /* ignore */
  }
  return {
    status: res.status,
    vercelCache: res.headers.get("x-vercel-cache"),
    age: res.headers.get("age"),
    cacheControl: res.headers.get("cache-control"),
    ttfb,
    total,
    bytes: buf.length,
    source: json?.source ?? null,
    members: json?.stats?.members ?? null,
    online: json?.stats?.online ?? null,
    feedPosts: json?.stats?.feedPosts ?? null,
    feed: json?.feedPost?.text?.slice(0, 48) ?? null,
    signups: json?.newMembers?.length ?? null,
    top: json?.topMembers?.length ?? null,
    featured: json?.featuredMembers?.length ?? null,
    trending: json?.trendingPosts?.length ?? null,
    discussions: json?.discussions?.length ?? null,
    blogs: json?.blogPosts?.length ?? null,
    rooms: json?.chatrooms?.length ?? null,
    poll: json?.poll?.question ? 1 : 0,
    confessions: json?.recentConfessions?.length ?? null,
    activities: json?.activities?.length ?? null,
    demoLeak: json?.config?.demoChatrooms?.length ?? 0,
    demoNames: json?.config?.demoTopMembers?.length ?? 0,
  };
}

const miss = [];
for (let i = 1; i <= 5; i++) {
  const row = await once(`https://yaarzo.com/api/public/landing?p3b=${Date.now()}-${i}-${Math.random()}`, {
    bypassCache: true,
  });
  row.run = i;
  row.kind = "MISS";
  console.log("MISS", JSON.stringify(row));
  miss.push(row);
  await sleep(500);
}

await sleep(400);
const hitUrl = `https://yaarzo.com/api/public/landing?p3b-hit=${Date.now()}`;
const prime = await once(hitUrl, { bypassCache: true });
console.log("PRIME", JSON.stringify(prime));
await sleep(150);
const hit = [];
for (let i = 1; i <= 5; i++) {
  const row = await once(hitUrl, { bypassCache: false });
  row.run = i;
  row.kind = "HIT";
  console.log("HIT", JSON.stringify(row));
  hit.push(row);
  await sleep(200);
}

const missTtfb = miss.map((r) => r.ttfb);
const missTotal = miss.map((r) => r.total);
const hitTtfb = hit.map((r) => r.ttfb);
const hitTotal = hit.map((r) => r.total);

console.log(
  JSON.stringify(
    {
      miss: {
        medianTtfb: median(missTtfb),
        medianTotal: median(missTotal),
        bestTtfb: Math.min(...missTtfb),
        worstTtfb: Math.max(...missTtfb),
        bestTotal: Math.min(...missTotal),
        worstTotal: Math.max(...missTotal),
        rows: miss,
      },
      hit: {
        medianTtfb: median(hitTtfb),
        medianTotal: median(hitTotal),
        bestTtfb: Math.min(...hitTtfb),
        worstTtfb: Math.max(...hitTtfb),
        bestTotal: Math.min(...hitTotal),
        worstTotal: Math.max(...hitTotal),
        rows: hit,
      },
    },
    null,
    2,
  ),
);
