import type { GameState, User } from "./chat-types";
import { TRIVIA_QUESTIONS } from "./trivia-questions";

interface CmdCtx {
  state: any;
  channelId: string;
  actor?: string;
}

export interface CmdReply {
  text: string;
  from?: string;
}

export interface ModerationUpdate {
  targetId: string;
  targetName: string;
  action: "mute" | "kick";
  actorBadges: number;
  targetBadges: number;
}

export interface CmdResult {
  replies: CmdReply[];
  gameUpdate?: GameState;
  buzz?: { actor?: string; reason: string };
  moderation?: ModerationUpdate;
}

const TRIVIA = TRIVIA_QUESTIONS;


const HANGMAN_WORDS = ["palringo", "javascript", "tangerine", "lighthouse", "keyboard", "elephant", "midnight"];

const HELP = `**Commands**
!help — show this
!roll [NdM] — dice roll (e.g. !roll 2d6)
!flip — coin flip
!slots — spin the slot machine
!fish — cast a line and catch a fish
!dig — dig for gold and diamonds
!wine — order wine & beer by the round 🍷🍺
!trivia — start a trivia question (answer with !a <choice>)
!hangman — start hangman (guess with !g <letter>)

!me <action> — roleplay action
!nick <name> — change your display name
!stats — show your level/xp
/mute @user — vote-mute a lower-rank user (5 votes → 5 min mute)
/kick @user — vote-kick a lower-rank user (8 votes → 5 min kick)`;

function roll(spec: string): string {
  const m = spec.match(/^(\d+)d(\d+)$/i);
  if (!m) return "Invalid roll. Try !roll 2d6";
  const n = Math.min(parseInt(m[1]), 20);
  const d = Math.min(parseInt(m[2]), 1000);
  const rolls = Array.from({ length: n }, () => 1 + Math.floor(Math.random() * d));
  const total = rolls.reduce((a, b) => a + b, 0);
  return `🎲 ${spec} → [${rolls.join(", ")}] = **${total}**`;
}


export function runCommand(input: string, ctx: CmdCtx): CmdResult {
  const [rawCmd, ...rest] = input.slice(1).split(/\s+/);
  const cmd = rawCmd.toLowerCase();
  const arg = rest.join(" ");
  const game: GameState | undefined = ctx.state.games[ctx.channelId];

  const who = ctx.actor ? `@${ctx.actor}` : "You";

  switch (cmd) {
    case "help":
      return { replies: [{ text: HELP }] };

    case "roll":
      return { replies: [{ text: roll(arg || "1d6") }] };

    case "flip":
      return { replies: [{ text: `🪙 ${Math.random() < 0.5 ? "Heads" : "Tails"}` }] };

    case "dig": {
      const finds = [
        { name: "nothing but dirt", emoji: "🪨", xp: 0, rarity: "nothing" },
        { name: "a few pebbles", emoji: "🪨", xp: 1, rarity: "nothing" },
        { name: "Coal", emoji: "⬛", xp: 2, rarity: "common" },
        { name: "Iron ore", emoji: "⛓️", xp: 4, rarity: "common" },
        { name: "Copper nugget", emoji: "🟫", xp: 5, rarity: "common" },
        { name: "Silver vein", emoji: "🥈", xp: 10, rarity: "uncommon" },
        { name: "Gold nugget", emoji: "🪙", xp: 20, rarity: "rare" },
        { name: "Gold bar", emoji: "🏆", xp: 35, rarity: "rare" },
        { name: "Diamond", emoji: "💎", xp: 60, rarity: "epic" },
        { name: "Flawless Diamond", emoji: "💠", xp: 100, rarity: "legendary" },
      ];
      const weights: Record<string, number> = { nothing: 30, common: 40, uncommon: 18, rare: 8, epic: 3, legendary: 1 };
      const pool: typeof finds = [];
      finds.forEach(f => { for (let i = 0; i < weights[f.rarity]; i++) pool.push(f); });
      const find = pool[Math.floor(Math.random() * pool.length)];
      const tag =
        find.rarity === "legendary" ? "🌟 **LEGENDARY!**" :
        find.rarity === "epic" ? "💜 *Epic find*" :
        find.rarity === "rare" ? "✨ Rare" :
        find.rarity === "uncommon" ? "Uncommon" :
        find.rarity === "common" ? "Common" : "—";
      const xpStr = find.xp > 0 ? ` (+${find.xp} XP)` : "";
      const rare = find.rarity === "rare" || find.rarity === "epic" || find.rarity === "legendary";
      return {
        replies: [{ text: `⛏️ ${who} digs deep and unearths ${find.emoji} **${find.name}**${xpStr} — ${tag}`, from: "bot-dig" }],
        ...(rare ? { buzz: { reason: `${find.emoji} ${find.name}` } } : {}),
      };
    }

    case "slots": {
      const sym = ["🍒","🍋","🔔","⭐","💎","7️⃣"];
      const r = [0,0,0].map(() => sym[Math.floor(Math.random() * sym.length)]);
      const win = r[0] === r[1] && r[1] === r[2];
      return { replies: [{ text: `🎰 [ ${r.join(" | ")} ] ${win ? "**JACKPOT!**" : ""}` }] };
    }

    case "fish": {
      const catches = [
        { name: "Tiny Minnow", emoji: "🐟", weight: 0.2, xp: 1, rarity: "common" },
        { name: "Mackerel", emoji: "🐟", weight: 1.4, xp: 3, rarity: "common" },
        { name: "Salmon", emoji: "🐠", weight: 3.2, xp: 5, rarity: "uncommon" },
        { name: "Pufferfish", emoji: "🐡", weight: 1.1, xp: 6, rarity: "uncommon" },
        { name: "Tropical Fish", emoji: "🐠", weight: 0.8, xp: 7, rarity: "rare" },
        { name: "Squid", emoji: "🦑", weight: 4.5, xp: 9, rarity: "rare" },
        { name: "Octopus", emoji: "🐙", weight: 6.7, xp: 12, rarity: "rare" },
        { name: "Lobster", emoji: "🦞", weight: 2.9, xp: 14, rarity: "epic" },
        { name: "Shark", emoji: "🦈", weight: 142.0, xp: 25, rarity: "epic" },
        { name: "Whale", emoji: "🐋", weight: 8200.0, xp: 50, rarity: "legendary" },
        { name: "Golden Koi", emoji: "✨🐠", weight: 4.1, xp: 75, rarity: "legendary" },
      ];
      const junk = [
        "🥾 an old boot", "🪣 a rusty bucket", "🌿 a clump of seaweed",
        "🥫 a tin can", "🦴 a strange bone", "🫧 just bubbles",
      ];
      // 25% chance of junk
      if (Math.random() < 0.25) {
        const j = junk[Math.floor(Math.random() * junk.length)];
        return { replies: [{ text: `🎣 ${who} cast a line... and reeled in ${j}. No XP.`, from: "bot-fish" }] };
      }
      // Weighted by rarity: common > uncommon > rare > epic > legendary
      const weights: Record<string, number> = { common: 50, uncommon: 28, rare: 14, epic: 6, legendary: 2 };
      const pool: typeof catches = [];
      catches.forEach(c => { for (let i = 0; i < weights[c.rarity]; i++) pool.push(c); });
      const fish = pool[Math.floor(Math.random() * pool.length)];
      const tag =
        fish.rarity === "legendary" ? "🌟 **LEGENDARY!**" :
        fish.rarity === "epic" ? "💜 *Epic catch*" :
        fish.rarity === "rare" ? "💎 Rare" :
        fish.rarity === "uncommon" ? "Uncommon" : "Common";
      const rare = fish.rarity === "rare" || fish.rarity === "epic" || fish.rarity === "legendary";
      return {
        replies: [{ text: `🎣 ${who} caught a ${fish.emoji} **${fish.name}** — ${fish.weight}kg (+${fish.xp} XP) — ${tag}`, from: "bot-fish" }],
        ...(rare ? { buzz: { reason: `${fish.emoji} ${fish.name}` } } : {}),
      };
    }

    case "wine": {
      const wines = [
        { name: "House Red", emoji: "🍷", xp: 2, rarity: "common" },
        { name: "House White", emoji: "🥂", xp: 2, rarity: "common" },
        { name: "Rosé", emoji: "🌸🍷", xp: 3, rarity: "common" },
        { name: "Chardonnay", emoji: "🥂", xp: 4, rarity: "uncommon" },
        { name: "Merlot", emoji: "🍷", xp: 5, rarity: "uncommon" },
        { name: "Cabernet Sauvignon", emoji: "🍷", xp: 7, rarity: "rare" },
        { name: "Champagne", emoji: "🍾", xp: 12, rarity: "rare" },
        { name: "Vintage Bordeaux", emoji: "🍷✨", xp: 25, rarity: "epic" },
        { name: "Romanée-Conti 1945", emoji: "🍷👑", xp: 75, rarity: "legendary" },
      ];
      const beers = [
        { name: "Lager", emoji: "🍺", xp: 1, rarity: "common" },
        { name: "Pilsner", emoji: "🍺", xp: 2, rarity: "common" },
        { name: "Pale Ale", emoji: "🍻", xp: 3, rarity: "common" },
        { name: "IPA", emoji: "🍺", xp: 4, rarity: "uncommon" },
        { name: "Wheat Beer", emoji: "🍺🌾", xp: 4, rarity: "uncommon" },
        { name: "Stout", emoji: "🍺", xp: 6, rarity: "rare" },
        { name: "Belgian Trippel", emoji: "🍻", xp: 10, rarity: "rare" },
        { name: "Barrel-Aged Imperial Stout", emoji: "🛢️🍺", xp: 20, rarity: "epic" },
        { name: "Westvleteren 12", emoji: "🍺👑", xp: 60, rarity: "legendary" },
      ];
      const menu = Math.random() < 0.5 ? wines : beers;
      const kind = menu === wines ? "wine" : "beer";
      const weights: Record<string, number> = { common: 45, uncommon: 30, rare: 15, epic: 8, legendary: 2 };
      const pool: typeof menu = [];
      menu.forEach(d => { for (let i = 0; i < weights[d.rarity]; i++) pool.push(d); });
      const drink = pool[Math.floor(Math.random() * pool.length)];
      const qty = 1 + Math.floor(Math.random() * 6); // 1–6 servings
      const unit = kind === "wine" ? (qty === 1 ? "glass" : "glasses") : (qty === 1 ? "pint" : "pints");
      const totalXp = drink.xp * qty;
      const tag =
        drink.rarity === "legendary" ? "🌟 **LEGENDARY POUR!**" :
        drink.rarity === "epic" ? "💜 *Top shelf*" :
        drink.rarity === "rare" ? "✨ Rare" :
        drink.rarity === "uncommon" ? "Uncommon" : "Common";
      const rare = drink.rarity === "rare" || drink.rarity === "epic" || drink.rarity === "legendary";
      return {
        replies: [{ text: `🍷 **Wine** serves ${who} ${qty} ${unit} of ${drink.emoji} **${drink.name}** — cheers! 🥂 (+${totalXp} XP) — ${tag}` }],
        ...(rare ? { buzz: { reason: `${drink.emoji} ${qty}× ${drink.name}` } } : {}),
      };
    }

    case "trivia": {
      if (game && game.type) {
        return { replies: [{ text: `⏳ A **${game.type}** game is already in progress in this room. Jump in and play!` }] };
      }
      const q = TRIVIA[Math.floor(Math.random() * TRIVIA.length)];
      return {
        replies: [{ text: `📚 **Trivia (everyone can answer!):** ${q.q}\n${q.choices.map((c,i)=>`  ${i+1}. ${c}`).join("\n")}\nAnswer with **!a <number or text>** — first correct wins.` }],
        gameUpdate: { channelId: ctx.channelId, type: "trivia", data: q },
      };
    }

    case "a": {
      if (!game || game.type !== "trivia") return { replies: [{ text: "No active trivia. Start one with !trivia" }] };
      const q = game.data;
      let guess = arg.toLowerCase().trim();
      const n = parseInt(guess);
      if (!isNaN(n) && q.choices[n - 1]) guess = q.choices[n - 1].toLowerCase();
      const correct = guess === q.a.toLowerCase();
      const answerLabel = q.choices.find((c: string) => c.toLowerCase() === q.a.toLowerCase());
      if (correct) {
        // Auto-advance to next question
        let nextQ = TRIVIA[Math.floor(Math.random() * TRIVIA.length)];
        if (nextQ.q === q.q && TRIVIA.length > 1) {
          nextQ = TRIVIA[(TRIVIA.indexOf(q) + 1) % TRIVIA.length];
        }
        return {
          replies: [
            { text: `🏆 **WINNER: ${who}!** 🎉\nCorrect answer: **${answerLabel}**\nQuestion: _${q.q}_  (+5 XP)` },
            { text: `📚 **Next trivia:** ${nextQ.q}\n${nextQ.choices.map((c: string, i: number)=>`  ${i+1}. ${c}`).join("\n")}\nAnswer with **!a <number or text>**` },
          ],
          gameUpdate: { channelId: ctx.channelId, type: "trivia", data: nextQ },
        };
      }
      return {
        replies: [{ text: `❌ ${who} guessed wrong — try again! (hint: it's not "${arg}")` }],
        gameUpdate: { channelId: ctx.channelId, type: "trivia", data: q },
      };
    }

    case "hangman": {
      if (game && game.type) {
        return { replies: [{ text: `⏳ A **${game.type}** game is already in progress in this room. Jump in and play!` }] };
      }
      const word = HANGMAN_WORDS[Math.floor(Math.random() * HANGMAN_WORDS.length)];
      return {
        replies: [{ text: `🪢 **Hangman (everyone can guess!):** \`${"_ ".repeat(word.length).trim()}\` (${word.length} letters)\nGuess a letter with **!g <letter>**` }],
        gameUpdate: { channelId: ctx.channelId, type: "hangman", data: { word, guessed: [], wrong: 0 } },
      };
    }

    case "g": {
      if (!game || game.type !== "hangman") return { replies: [{ text: "No active hangman. Start one with !hangman" }] };
      const letter = arg.toLowerCase()[0];
      if (!letter || !/[a-z]/.test(letter)) return { replies: [{ text: "Guess a letter: !g e" }] };
      const data = { ...game.data };
      if (data.guessed.includes(letter)) return { replies: [{ text: `Already guessed **${letter}**` }] };
      data.guessed = [...data.guessed, letter];
      if (!data.word.includes(letter)) data.wrong += 1;
      const mask = data.word.split("").map((c: string) => data.guessed.includes(c) ? c : "_").join(" ");
      const done = !mask.includes("_");
      const dead = data.wrong >= 6;
      if (done) return { replies: [{ text: `🏆 **WINNER: ${who}!** 🎉\nSolved the word: **${data.word}**` }], gameUpdate: { channelId: ctx.channelId, type: null, data: null } };
      if (dead) return { replies: [{ text: `💀 Hangman over — too many wrong guesses. The word was **${data.word}**` }], gameUpdate: { channelId: ctx.channelId, type: null, data: null } };
      return {
        replies: [{ text: `\`${mask}\` — wrong: ${data.wrong}/6, used: ${data.guessed.join(" ")}` }],
        gameUpdate: { channelId: ctx.channelId, type: "hangman", data },
      };
    }


    case "stats": {
      const me = ctx.state.me;
      return { replies: [{ text: `📊 **${me.name}** — Level ${me.level}, XP ${me.xp}` }] };
    }

    case "nick": {
      if (!arg) return { replies: [{ text: "Usage: !nick <new name>" }] };
      return { replies: [{ text: `Use the profile menu to rename. Suggested: **${arg}**` }] };
    }

    case "me": {
      if (!arg) return { replies: [{ text: "Usage: !me <action>" }] };
      return { replies: [{ text: `_* ${ctx.state.me.name} ${arg} *_` }] };
    }

    case "mute":
    case "kick": {
      const targetName = arg.replace(/^@/, "").trim().split(/\s+/)[0];
      if (!targetName) return { replies: [{ text: `Usage: /${cmd} @username` }] };
      const users = ctx.state.users as Record<string, User>;
      const me = ctx.state.me as User;
      const target = Object.values(users).find(
        u => u.id !== "me" && u.name.toLowerCase() === targetName.toLowerCase()
      );
      if (!target) return { replies: [{ text: `❓ User **@${targetName}** not found here.` }] };
      const meBadges = (me.badges ?? []).length;
      const targetBadges = (target.badges ?? []).length;
      if (meBadges <= targetBadges) {
        return { replies: [{ text: `🛡️ ${who} can't /${cmd} **@${target.name}** — your rank (${meBadges} 🏅) must be higher than theirs (${targetBadges} 🏅).` }] };
      }
      return {
        replies: [],
        moderation: { targetId: target.id, targetName: target.name, action: cmd as "mute" | "kick", actorBadges: meBadges, targetBadges },
      };
    }
  }

  return { replies: [{ text: `Unknown command: !${cmd}. Try !help` }] };
}