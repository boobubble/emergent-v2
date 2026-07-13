# Chatroom Theme Header — Regression Checklist

Purpose: ensure the legacy `ChatHeader` never re-appears above the Gaming
Arena hero, and continues to appear for every other chat theme and for DMs.

Owner file: `src/components/chat/ChatApp.tsx`
Guard condition: `!(chatTheme === "gaming_arena" && !activeIsDM)`

## When to run
- Editing `ChatApp.tsx` render tree (hero/header/message-list area)
- Editing `ChatHeader.tsx` or `GamingArenaHero.tsx`
- Adding / renaming a chat theme in `src/lib/chat-themes.ts`
- Touching `chat-store` `chatTheme` / `activeIsDM` selectors

## Manual checklist

Switch themes via Palette icon > Chatroom Themes.

### Gaming Arena theme, public room
- [ ] Old `ChatHeader` (room name + palette + members chip) is NOT rendered
- [ ] `GamingArenaHero` banner is the top-most element in the chat pane
- [ ] Palette / members / bot toggles still reachable (hero controls or sidebar)
- [ ] No duplicate room title stacked above the hero

### Gaming Arena theme, DM
- [ ] Old `ChatHeader` (DM peer avatar + name + close) IS rendered
- [ ] `GamingArenaHero` is NOT rendered for DMs
- [ ] Wallpaper/minimize/close controls work

### Every other theme (default, neon, minimal, etc.), public room
- [ ] Old `ChatHeader` IS rendered
- [ ] `GamingArenaHero` is NOT rendered

### Theme switching flow
- [ ] Switch: default -> gaming_arena -> default. Header returns; no leftover hero.
- [ ] Switch: gaming_arena on room -> open a DM. Header appears for DM.
- [ ] Reload `/chatroom` while `chatTheme === "gaming_arena"`: no error, no old header.

## Automated smoke (optional)

Grep guard — should return exactly one match, wrapped in the theme guard:

```bash
rg -n "<ChatHeader" src/components/chat/ChatApp.tsx
```

Expect the surrounding line to contain
`chatTheme === "gaming_arena" && !activeIsDM`. If `<ChatHeader` appears
unguarded, the regression is back.
