import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  PLATFORM_CHANNEL_BOT_SEEDS,
  PLATFORM_BOT_KEYS,
  isPlatformBotKey,
} from "@/lib/platform-channel-bots";
import {
  slugifyPlatformChannelSlug,
  validatePlatformChannelSlug,
} from "@/lib/platform-channel-slugs";
import { RESERVED_SLUGS } from "@/lib/reserved-routes";

const testDir = dirname(fileURLToPath(import.meta.url));
const REGISTRY_MIGRATION = resolve(
  testDir,
  "../../supabase/migrations/20260923120000_platform_chat_channels_registry.sql",
);
const registrySql = readFileSync(REGISTRY_MIGRATION, "utf8");

describe("platform-channel-slugs", () => {
  it("slugifies to lowercase canonical slugs", () => {
    expect(slugifyPlatformChannelSlug("India Chat")).toBe("india-chat");
    expect(slugifyPlatformChannelSlug("Music_Room")).toBe("music-room");
  });

  it("rejects reserved route collisions", () => {
    expect(validatePlatformChannelSlug("admin")).toMatch(/reserved|conflicts/i);
    expect(validatePlatformChannelSlug("chatroom")).toMatch(/reserved|conflicts/i);
  });

  it("rejects namespace prefixes and uuid-shaped slugs", () => {
    expect(validatePlatformChannelSlug("dm:abc")).toMatch(/reserved/i);
    expect(validatePlatformChannelSlug("trio:room")).toMatch(/reserved/i);
    expect(validatePlatformChannelSlug("gdm:room")).toMatch(/reserved/i);
    expect(validatePlatformChannelSlug("lobby")).toMatch(/reserved/i);
    expect(validatePlatformChannelSlug("550e8400-e29b-41d4-a716-446655440000")).toMatch(/UUID/i);
  });

  it("rejects system slugs for new admin channels", () => {
    expect(validatePlatformChannelSlug("games")).toMatch(/reserved/i);
    expect(validatePlatformChannelSlug("yaarzo-global")).toMatch(/reserved/i);
  });

  it("accepts normal platform slugs", () => {
    expect(validatePlatformChannelSlug("music")).toBeNull();
    expect(validatePlatformChannelSlug("india-chat")).toBeNull();
  });
});

describe("platform-channel-bots", () => {
  it("catalog includes only known bot keys", () => {
    for (const seed of PLATFORM_CHANNEL_BOT_SEEDS) {
      expect(isPlatformBotKey(seed.botKey)).toBe(true);
    }
    expect(PLATFORM_BOT_KEYS).toContain("bot-gamebot");
    expect(PLATFORM_BOT_KEYS).toContain("bot-echo");
  });

  it("seeds global and games assignments separately", () => {
    const globalBots = PLATFORM_CHANNEL_BOT_SEEDS.filter((s) => s.channelSlug === "yaarzo-global");
    const gameBots = PLATFORM_CHANNEL_BOT_SEEDS.filter((s) => s.channelSlug === "games");
    expect(globalBots.map((b) => b.botKey)).toEqual(["bot-spam", "bot-echo"]);
    expect(gameBots.length).toBe(7);
  });
});

describe("platform registry migration (source assertions — not live PostgreSQL)", () => {
  it("seeds system channels 1 and 2 without touching messages", () => {
    expect(registrySql).toContain("(1, 'yaarzo-global', 'Global'");
    expect(registrySql).toContain("(2, 'games', 'Games'");
    expect(registrySql).not.toContain("UPDATE public.messages");
    expect(registrySql).not.toContain("ALTER TABLE public.messages");
  });

  it("uses allocator sequence and immutable guards", () => {
    expect(registrySql).toContain("platform_chat_channel_number_alloc");
    expect(registrySql).toContain("channel_number is immutable");
    expect(registrySql).toContain("channel slug is immutable");
    expect(registrySql).toContain("channel_kind is immutable");
    expect(registrySql).toContain("allocate_platform_channel_number");
  });

  it("enforces channel_kind immutability in update trigger (DB layer)", () => {
    expect(registrySql).toMatch(
      /IF OLD\.channel_kind IS DISTINCT FROM NEW\.channel_kind[\s\S]*channel_kind is immutable/,
    );
  });

  it("rejects system→admin and admin→system via channel_kind immutability (source)", () => {
    expect(registrySql).toContain("channel_kind is immutable");
    expect(registrySql).not.toMatch(/UPDATE[\s\S]*channel_kind\s*=\s*'admin'/i);
  });

  it("wires slug validation to INSERT trigger", () => {
    expect(registrySql).toContain("platform_chat_channels_guard_insert");
    expect(registrySql).toContain("trg_platform_chat_channels_guard_insert");
    expect(registrySql).toMatch(
      /IF NOT public\.is_valid_platform_channel_slug\(NEW\.slug, NEW\.channel_kind\)/,
    );
    expect(registrySql).toContain("invalid platform channel slug");
  });

  it("defines DB slug rules for reserved namespaces and lobby", () => {
    expect(registrySql).toMatch(/s = 'dm' OR s LIKE 'dm:%' OR s LIKE 'dm-%'/);
    expect(registrySql).toMatch(/s = 'trio' OR s LIKE 'trio:%' OR s LIKE 'trio-%'/);
    expect(registrySql).toMatch(/s = 'gdm' OR s LIKE 'gdm:%' OR s LIKE 'gdm-%'/);
    expect(registrySql).toMatch(/OR s = 'lobby'/);
    expect(registrySql).toContain("is_uuid_text(s)");
  });

  it("allows system slugs only for system channel_kind in validator", () => {
    expect(registrySql).toMatch(
      /IF s IN \('yaarzo-global', 'games'\)[\s\S]*RETURN kind = 'system'/,
    );
  });

  it("seeds bot config as empty json default (no secrets stored)", () => {
    expect(registrySql).toContain("config      jsonb NOT NULL DEFAULT '{}'::jsonb");
    expect(registrySql).not.toMatch(/INSERT INTO public\.platform_channel_bots[\s\S]*config\s*,/);
  });

  it("does not modify messages RLS", () => {
    expect(registrySql).not.toMatch(/CREATE POLICY[\s\S]*ON public\.messages/);
  });
});

describe("platform slug validation parity (TS runtime vs SQL source)", () => {
  const sqlReservedMatch = registrySql.match(
    /reserved_routes text\[\] := ARRAY\[([\s\S]*?)\];/,
  );
  const sqlReserved = (sqlReservedMatch?.[1] ?? "")
    .split(",")
    .map((s) => s.trim().replace(/^'|'$/g, ""))
    .filter(Boolean);

  it("TS rejects the same reserved namespaces as SQL source", () => {
    for (const slug of ["dm", "dm:abc", "trio", "trio:room", "gdm", "gdm:team", "lobby"]) {
      expect(validatePlatformChannelSlug(slug)).toMatch(/reserved|UUID/i);
    }
  });

  it("TS accepts valid admin slugs such as music", () => {
    expect(validatePlatformChannelSlug("music")).toBeNull();
  });

  it("TS rejects system slugs for admin channels; SQL seeds accept them as system", () => {
    expect(validatePlatformChannelSlug("yaarzo-global")).toMatch(/reserved/i);
    expect(validatePlatformChannelSlug("games")).toMatch(/reserved/i);
    expect(registrySql).toContain("(1, 'yaarzo-global', 'Global'");
    expect(registrySql).toContain("(2, 'games', 'Games'");
  });

  it("TS rejects UUID-shaped slugs", () => {
    expect(
      validatePlatformChannelSlug("550e8400-e29b-41d4-a716-446655440000"),
    ).toMatch(/UUID/i);
  });

  it("documents intentional SQL vs TS reserved-route differences", () => {
    const tsReserved = [...RESERVED_SLUGS].map((s) => s.split("/")[0].toLowerCase());
    const sqlOnly = sqlReserved.filter((s) => !tsReserved.includes(s));
    const tsOnly = tsReserved.filter((s) => !sqlReserved.includes(s));

    expect(sqlOnly).toEqual(
      expect.arrayContaining(["dm", "trio", "gdm", "lobby", "watch", "adm", "live-arena"]),
    );
    expect(tsOnly).toEqual(
      expect.arrayContaining(["favicon.ico", "robots.txt", "sitemap.xml", "manifest.json", "_root", "__root"]),
    );
  });
});

describe("platform-channels.functions", () => {
  const src = readFileSync(resolve(testDir, "platform-channels.functions.ts"), "utf8");

  it("allocates channel_number server-side on create", () => {
    expect(src).toContain("allocate_platform_channel_number");
    expect(src).not.toMatch(/channel_number:\s*data\./);
  });

  it("requires admin for mutations", () => {
    expect(src).toContain('rpc("is_admin"');
    expect(src).toContain("archivePlatformChannel");
    expect(src).toContain("System channels cannot be archived");
  });
});
