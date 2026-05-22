import type { GameState } from "./chat-types";

interface CmdCtx {
  state: any;
  channelId: string;
}

export interface CmdReply {
  text: string;
  from?: string;
}

export interface CmdResult {
  replies: CmdReply[];
  gameUpdate?: GameState;
}

const TRIVIA: { q: string; a: string; choices: string[] }[] = [
  { q: "Capital of Japan?", a: "tokyo", choices: ["Kyoto", "Tokyo", "Osaka", "Seoul"] },
  { q: "How many continents are there?", a: "7", choices: ["5", "6", "7", "8"] },
  { q: "Largest planet in our solar system?", a: "jupiter", choices: ["Earth", "Mars", "Saturn", "Jupiter"] },
  { q: "Year humans first landed on the Moon?", a: "1969", choices: ["1965", "1969", "1972", "1958"] },
  { q: "Chemical symbol for Gold?", a: "au", choices: ["Au", "Gd", "Go", "Ag"] },
  { q: "Who wrote 'Hamlet'?", a: "shakespeare", choices: ["Dickens", "Shakespeare", "Tolkien", "Wilde"] },
];

const HANGMAN_WORDS = ["palringo", "javascript", "tangerine", "lighthouse", "keyboard", "elephant", "midnight"];

const HELP = `**Commands**
!help — show this
!roll [NdM] — dice roll (e.g. !roll 2d6)
!flip — coin flip
!slots — spin the slot machine
!fish — cast a line and catch a fish
!dig — dig for gold and diamonds
!trivia — start a trivia question (answer with !a <choice>)
!hangman — start hangman (guess with !g <letter>)
!blackjack — quick blackjack hand
!me <action> — roleplay action
!nick <name> — change your display name
!stats — show your level/xp`;

function roll(spec: string): string {
  const m = spec.match(/^(\d+)d(\d+)$/i);
  if (!m) return "Invalid roll. Try !roll 2d6";
  const n = Math.min(parseInt(m[1]), 20);
  const d = Math.min(parseInt(m[2]), 1000);
  const rolls = Array.from({ length: n }, () => 1 + Math.floor(Math.random() * d));
  const total = rolls.reduce((a, b) => a + b, 0);
  return `🎲 ${spec} → [${rolls.join(", ")}] = **${total}**`;
}

function drawCard(): { c: string; v: number } {
  const suits = ["♠", "♥", "♦", "♣"];
  const ranks = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];
  const vals =   [11, 2, 3, 4, 5, 6, 7, 8, 9, 10,10,10,10];
  const i = Math.floor(Math.random() * 13);
  return { c: `${ranks[i]}${suits[Math.floor(Math.random()*4)]}`, v: vals[i] };
}

export function runCommand(input: string, ctx: CmdCtx): CmdResult {
  const [rawCmd, ...rest] = input.slice(1).split(/\s+/);
  const cmd = rawCmd.toLowerCase();
  const arg = rest.join(" ");
  const game: GameState | undefined = ctx.state.games[ctx.channelId];

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
      return { replies: [{ text: `⛏️ You dig deep and unearth ${find.emoji} **${find.name}**${xpStr} — ${tag}` }] };
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
        return { replies: [{ text: `🎣 You cast your line... and reeled in ${j}. No XP.` }] };
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
      return { replies: [{ text: `🎣 You caught a ${fish.emoji} **${fish.name}** — ${fish.weight}kg (+${fish.xp} XP) — ${tag}` }] };
    }

    case "trivia": {
      const q = TRIVIA[Math.floor(Math.random() * TRIVIA.length)];
      return {
        replies: [{ text: `📚 **Trivia:** ${q.q}\n${q.choices.map((c,i)=>`  ${i+1}. ${c}`).join("\n")}\nAnswer with **!a <number or text>**` }],
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
      return {
        replies: [{ text: correct ? `✅ Correct! The answer was **${q.choices.find((c:string)=>c.toLowerCase()===q.a.toLowerCase())}**` : `❌ Wrong. The answer was **${q.choices.find((c:string)=>c.toLowerCase()===q.a.toLowerCase())}**` }],
        gameUpdate: { channelId: ctx.channelId, type: null, data: null },
      };
    }

    case "hangman": {
      const word = HANGMAN_WORDS[Math.floor(Math.random() * HANGMAN_WORDS.length)];
      return {
        replies: [{ text: `🪢 **Hangman started!** Word: \`${"_ ".repeat(word.length).trim()}\` (${word.length} letters)\nGuess with **!g <letter>**` }],
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
      if (done) return { replies: [{ text: `🎉 You got it! **${data.word}**` }], gameUpdate: { channelId: ctx.channelId, type: null, data: null } };
      if (dead) return { replies: [{ text: `💀 You lose. The word was **${data.word}**` }], gameUpdate: { channelId: ctx.channelId, type: null, data: null } };
      return {
        replies: [{ text: `\`${mask}\` — wrong: ${data.wrong}/6, used: ${data.guessed.join(" ")}` }],
        gameUpdate: { channelId: ctx.channelId, type: "hangman", data },
      };
    }

    case "blackjack": {
      const player = [drawCard(), drawCard()];
      const dealer = [drawCard(), drawCard()];
      let pTotal = player.reduce((a, c) => a + c.v, 0);
      while (pTotal < 17) { const c = drawCard(); player.push(c); pTotal += c.v; }
      let dTotal = dealer.reduce((a, c) => a + c.v, 0);
      while (dTotal < 17) { const c = drawCard(); dealer.push(c); dTotal += c.v; }
      let outcome = "Push 🤝";
      if (pTotal > 21) outcome = "Bust 💥 — Dealer wins";
      else if (dTotal > 21 || pTotal > dTotal) outcome = "You win! 🏆";
      else if (pTotal < dTotal) outcome = "Dealer wins 🪦";
      return { replies: [{ text: `♠️ **Blackjack**\nYou: ${player.map(c=>c.c).join(" ")} = ${pTotal}\nDealer: ${dealer.map(c=>c.c).join(" ")} = ${dTotal}\n${outcome}` }] };
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
  }

  return { replies: [{ text: `Unknown command: !${cmd}. Try !help` }] };
}