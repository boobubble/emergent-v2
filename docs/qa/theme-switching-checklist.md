# Theme Switching QA Checklist

Use this checklist whenever you change theme tokens, the welcome page, the
hero preview, or any component that overrides colors per theme. The goal is
to make sure the dark hero mockup and connected badge on `/welcome` stay
readable in BOTH light and dark modes.

## When to run
- Editing `src/routes/welcome.tsx`
- Editing `src/styles.css` color tokens or `.welcome-light` overrides
- Editing `src/components/BrandMark.tsx` or any logo theming code
- Adding new elements inside `.hero-dark-preview` containers

## Manual checklist

For each item, toggle the site between light and dark themes and confirm:

### Welcome page header
- [ ] Logo is visible (dark variant should render against the dark header in both themes)
- [ ] Nav links and CTA buttons are readable
- [ ] No invisible text (white-on-white or black-on-black)

### Hero preview (right side mockup)
- [ ] Container background stays dark in light theme (`.hero-dark-preview` preserved)
- [ ] All text inside the mockup remains white / light
- [ ] Borders (`border-white/10`, etc.) are visible
- [ ] Inner cards / chips have visible backgrounds
- [ ] Avatars, icons, and status dots render with correct contrast

### "Connected" badge (below hero)
- [ ] Badge background stays dark in light theme
- [ ] Label text stays white
- [ ] Status indicator dot is visible

### Stats / feature cells
- [ ] `.stat-cell` text adapts correctly (dark text in light, light text in dark)
- [ ] Dividers and borders visible in both themes

### General
- [ ] No element disappears when toggling themes
- [ ] Focus rings visible in both themes
- [ ] Hover states render in both themes

## Automated guard (lint test)

A Vitest check lives at `src/__tests__/welcome-theme.test.tsx` that
asserts the welcome page keeps the `hero-dark-preview` class on the
hero preview and the connected badge, and that the matching
`.welcome-light .hero-dark-preview` overrides still exist. If either
is removed or renamed, the test fails.

Run with:

```bash
bunx vitest run src/__tests__/welcome-theme.test.tsx
```
