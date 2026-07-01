# Nadlanistim — V6 Design System

Reference for building **internal pages** that match the V6 homepage
([app/v6/page.tsx](page.tsx) + [app/v6/v6.css](v6.css)).
Dark, glassy, RTL, Hebrew-first. Everything is scoped under `.v6-root`.

---

## 0. Ground rules

- **Scope:** every page wraps its content in `<div className="v6-root">`. All tokens,
  resets and `direction: rtl` live there. Class prefix is always `v6-`.
- **Direction:** RTL. Use **logical** properties (`margin-inline-start`,
  `padding-inline`, `inset-inline-start`) so things mirror correctly. Use physical
  `left`/`right` only for true visual corners (e.g. badge pinned bottom-left).
- **Font:** `"Google Sans"` (self-hosted woff2, weights 400/500/600/700 + 600 italic),
  fallback `"Heebo", system-ui`. Mono accents: `--font-mono` (Roboto Mono).
- **Component CSS lives in `v6.css`**, grouped by section with `/* ===== Name ===== */`
  banners. Keep that convention.
- **No Tailwind / CSS modules.** Plain BEM-ish classes: `v6-block`, `v6-block__el`,
  `v6-block--modifier`.

---

## 1. Design tokens (CSS variables on `.v6-root`)

### Color
| Token | Value | Use |
|---|---|---|
| `--bg` | `#07080F` | page background |
| `--bg-2` | `#0C0E1A` | select dropdowns, deep panels |
| `--ink` | `#F5F7FB` | primary text |
| `--ink-2` | `#C4CADC` | secondary text |
| `--muted` | `rgba(255,255,255,.55)` | muted text |
| `--muted-2` | `rgba(255,255,255,.35)` | meta / fine print |
| `--line` | `rgba(255,255,255,.08)` | hairline dividers |
| `--line-2` | `rgba(255,255,255,.14)` | stronger dividers |

### Accent
| Token | Value |
|---|---|
| `--violet` | `#8B5CF6` |
| `--blue` | `#4F8DFB` |
| `--cyan` | `#22D3EE` (primary accent — dots, links hover, tags) |
| `--pink` | `#F472B6` |

`--cyan` is the signature accent (eyebrow dot, link hover, "Members Only" / tag pills).

### Gradients
- `--grad-1` — `135deg violet→blue→cyan` (primary buttons, progress bars, dot).
- `--grad-text` — white→soft-blue, for big light headings via background-clip.
- `--grad-accent-text` — `#C4B5FD→#93C5FD→#67E8F9`, for `<em>` accent words in headings.

**Accent-word heading pattern** (used in almost every `<h2>`):
```jsx
<h2>חיבורים שהופכים <em>לעסקאות</em></h2>
```
`em` is styled to receive `--grad-accent-text` (background-clip: text) + italic 600.

### Glass
| Token | Value |
|---|---|
| `--glass-bg` | `rgba(255,255,255,.045)` |
| `--glass-bg-strong` | `rgba(255,255,255,.08)` |
| `--glass-border` | `rgba(255,255,255,.12)` |
| `--glass-border-strong` | `rgba(255,255,255,.22)` |
| `--glass-blur` | `blur(28px) saturate(160%)` |
| `--glass-blur-strong` | `blur(40px) saturate(180%)` |

### Layout / shape / motion
| Token | Value | Use |
|---|---|---|
| `--container` | `1360px` | max content width |
| `--gutter` | `clamp(20px,4vw,56px)` | side padding (via `.v6-container`) |
| `--r-sm` | `10px` | small radius |
| `--r` | `18px` | default card radius |
| `--r-lg` | `28px` | large cards / banners |
| `--r-xl` | `36px` | hero-scale surfaces |
| `--section-y` | `clamp(16px,2.25vw,28px)` | vertical section padding (intentionally tight) |
| `--t` | `cubic-bezier(.22,.61,.36,1)` | standard ease |
| `--t-out` | `cubic-bezier(.16,1,.3,1)` | entrance/exit ease |

Radii are pill (`999px`) for buttons/tags, `--r`/`--r-lg` for cards.

---

## 2. Layout primitives

**Section + container** — the standard page rhythm:
```jsx
<section className="v6-section">         {/* padding: var(--section-y) 0 */}
  <div className="v6-container">          {/* max 1360px, centered, gutter padding */}
    ...
  </div>
</section>
```
- Add `id="..."` to sections that nav links target. `scroll-margin-top: 100px` is
  already applied to `.v6-root section[id]` so anchors land below the fixed nav.
- Full-bleed banners (image background) skip `.v6-container` on the bg layer but keep
  it for the content (see Hero / Featured / youth banner).

---

## 3. Surfaces — `.v6-glass`

The core surface. Translucent fill + blur + 1px gradient border (`::before`) +
soft inner glow (`::after`). Children get `position:relative; z-index:2` automatically.
```jsx
<article className="v6-glass" style={{ borderRadius: 'var(--r-lg)' }}>…</article>
```
- `border-radius: inherit` on the pseudo-elements, so set radius on the element.
- Hover convention: `transform: translateY(-4px..-6px)` and/or
  `background: var(--glass-bg-strong)`, transition `.5s var(--t)`.

---

## 4. Buttons — `.v6-btn`

```jsx
<a className="v6-btn v6-btn--primary v6-btn--lg" data-magnetic=""><span>טקסט</span><ArrowIcon/></a>
<a className="v6-btn v6-btn--glass">טקסט</a>
```
- Base: pill, `padding 14px 26px`, weight 500, gap 10, overflow hidden.
- `--primary` — `--grad-1` fill, glow shadow, gradient shifts on hover + lift.
- `--glass` — glass-strong fill, light border, lift on hover.
- Modifiers: `--lg` (bigger), `--block` (full width).
- SVG inside auto-animates `translateX(-4px)` on hover (RTL-correct: arrow points left).
- Icon used: `ArrowIcon` (chevron-left). Carousels use `ChevronRight`/`ChevronLeft`.

---

## 5. Headings & labels

**Eyebrow** (kicker above a heading) — cyan pulsing dot + label:
```jsx
<span className="v6-eyebrow"><span className="v6-dot" />מי אנחנו</span>
```

**Section head** — wrapper for eyebrow + h2 (+ optional sub):
```jsx
<header className="v6-section-head" data-reveal>
  <span className="v6-eyebrow"><span className="v6-dot" />איזור</span>
  <h2>כותרת <em>מודגשת.</em></h2>
  <p className="v6-section-head__sub">תת־כותרת.</p>
</header>
```
Modifiers:
- `--center` — centered, `margin-inline:auto`.
- `--row` — flex space-between, heading on one side + a `.v6-link-arrow` on the other.
- `--nowrap` — `max-width:none` + `h2 { white-space:nowrap }` (one-line title on desktop;
  reverts to wrap ≤760px).

h2 scale: `clamp(40px, 5.5vw, 76px)`, line-height 1.02, letter-spacing -0.03em.

**Link-arrow** ("see all" style): `.v6-link-arrow` — underlined inline link + chevron,
hover turns cyan and widens gap. Wrap in `<span>` + `<ArrowIcon/>`.

**Tag / "Members Only" pill** — cyan pill: `.v6-tag-members`. Generic pattern for any
status pill: `padding 5px 12px; border-radius 999px; font 11px/700; letter-spacing .1em;
color var(--cyan); background rgba(34,211,238,.12); border 1px rgba(34,211,238,.32)`.

---

## 6. Card patterns (reusable shapes)

All cards are `v6-glass`, radius `--r`/`--r-lg`, hover-lift. Common anatomy:

- **Image-top card** (project / podcast): `padding:0; overflow:hidden`, image flush at
  top (`figure` with `aspect-ratio` + `object-fit:cover`, image scales 1.05 on hover),
  then a padded `__body` with h3 + p + meta/CTA. Pin a CTA to the bottom with
  `margin-top:auto`.
- **Overlay badge on image:** absolute pill, top-right = category tag
  (`top:14px; right:14px`), bottom-left = "Members Only"
  (`bottom:14px; left:14px`, physical corners), `z-index:4`, glass dark bg + blur.
- **Stat card:** big gradient number (`--grad-text`, background-clip) + label + a thin
  progress bar that animates `scaleX` from 0→1 when revealed.
- **List row** (events): grid `auto 1fr auto` = date / body / CTA. `--nodate` variant →
  `1fr auto` (drop the date column).
- **Side-by-side feature card** (`--lg` story / job rotator / meet): `flex-direction:row`,
  image `flex:1` one side, padded body the other, fixed `height` so rotating content
  keeps a uniform image size.

Tag pill on cards (purple variant): `background rgba(139,92,246,.15); color #C4B5FD;
border rgba(139,92,246,.25)`.

---

## 7. Navigation

- **Fixed pill nav** `.v6-nav` → `.v6-nav__inner` (`v6-glass`-like, dark `rgba(7,8,15,.4)`
  fill, `border-radius:999px`, centered at `--container`). Logo shrinks 56→36px on scroll
  (`.is-scrolled`, toggled past 40px). Links `.v6-nav__links` (hidden ≤1100, hamburger
  shown). Primary CTA at the end.
- **Mobile drawer** `.v6-drawer` slides from the right (`translateX(100%)→0`), dark blur
  panel, big `.v6-drawer__link` items. Nav links are driven by the shared `NAV_LINKS`
  array — order in the array = right-to-left order in RTL.

---

## 8. Hero / full-bleed banner pattern

```jsx
<section className="v6-hero">
  <div className="v6-hero__media" data-parallax="0.3"><img/><div className="v6-hero__veil"/></div>
  <div className="v6-hero__glow" aria-hidden />
  <div className="v6-hero__content">…title / sub / CTAs…</div>
</section>
```
- Background image: `filter: brightness(.45) contrast(1.05) saturate(.85)`, plus a
  multi-radial + bottom-fade `__veil` so text stays readable.
- Title uses line-mask reveal (`.v6-line > span` translateY in on `.is-loaded`).
- Reusable **content banner** (e.g. youth banner): glass/full-width box, image bg with a
  side gradient `linear-gradient(to left, rgba(7,8,15,.9), transparent)` so RTL text on
  the right stays legible.

---

## 9. Motion system (JS-driven hooks in page.tsx)

Apply via data-attributes; the hooks live in [page.tsx](page.tsx):

| Attribute | Effect |
|---|---|
| `data-reveal` | fade-up on scroll-in (IntersectionObserver adds `.is-visible`); auto-staggers siblings by index. **Don't** put on elements that are recreated/looped (they won't re-observe). |
| `data-parallax="0.3"` | subtle vertical parallax (desktop, respects reduced-motion). |
| `data-magnetic=""` | button follows cursor slightly (hover devices, desktop). |
| `data-count` / `data-suffix` | animated number count-up when revealed. |

- Entrances that must **not** reuse the `transition` channel (so hover stays snappy) use a
  dedicated `@keyframes` + `animation` instead (see `v6-fade`, `v6-fade-up`, feature-row
  stagger).
- **Always** guard motion with `@media (prefers-reduced-motion: reduce)` (there's a block
  that neutralizes reveals, animations and bar transforms).

---

## 10. Carousels (3 working patterns)

1. **Infinite transform loop** (members, communities): render items ×3, ride the middle
   copy, snap back by one set on `transitionEnd` (invisible because copies are identical).
   Arrows reuse `.v6-members__arrow`; autoplay + pause-on-hover; native horizontal scroll
   on mobile.
2. **Single rotating card** (meet-the-nadlanist, job rotator): one card, content swaps
   every 7s with a `key`-triggered fade; fixed card height for uniform image size; dots +
   prev/next via shared `.v6-cardfoot` / `.v6-cardnav` / `.v6-cardarrow` / `.v6-carddot`.
3. **Marquee** (hero terms): duplicated track, CSS translate loop.

RTL note: "next" advances visually leftward; arrow icons are `ChevronRight` (prev) /
`ChevronLeft` (next). Dots: active dot widens to a 22px pill in `--cyan`.

---

## 11. Responsive breakpoints

- **Tablet `@media (max-width:1100px)`** — nav collapses to hamburger; multi-col grids
  drop to 2; side-by-side `--lg` cards stack full-width.
- **Mobile `@media (max-width:760px)`** — most card grids become horizontal
  scroll-snap rows (`display:flex; overflow-x:auto; scroll-snap-type:x mandatory;`
  hidden scrollbar; cards `flex: 0 0 ~76-86%`); fixed-height cards go `height:auto`;
  one-line headings revert to wrapping; gutters shrink.

Pattern for new responsive sections: desktop grid → tablet 2-col → mobile 1-col **or**
horizontal scroll-snap (match the closest existing section).

---

## 12. Ambient background

`.v6-ambient` (fixed, behind everything): three blurred drifting orbs
(violet / blue / cyan, `filter: blur(120px)`, `mix-blend-mode:screen`) + a faint SVG
grain overlay. Already global on the homepage; internal pages under `.v6-root` inherit it
if you include the same `<div className="v6-ambient">…</div>` block.

---

## 12b. Site chrome (shared header/footer) — the standard

The canonical, site-standard header & footer are shared components:
[app/v6/SiteHeader.tsx](SiteHeader.tsx) (`v6-nav` + drawer) and
[app/v6/SiteFooter.tsx](SiteFooter.tsx) (`v6-footer`). **Use these on every new page** —
do not re-build a nav/footer.

Which routes use the V6 chrome is configured centrally in
[lib/site-chrome.ts](../../lib/site-chrome.ts) → `V6_CHROME_ROUTES`. On those routes the
**legacy** global chrome (`components/Header`, `components/Footer`, `Background`) is hidden,
so the page renders V6 chrome instead. Legacy pages (`/`, `/v2`–`/v4`, `/posts/*`,
`/jobs/*`) keep the old global chrome.

**To add a new internal page:**
1. Add its route prefix to `V6_CHROME_ROUTES` in `lib/site-chrome.ts`.
2. In the page: `import SiteHeader from "../v6/SiteHeader"` + `SiteFooter`, wrap content in
   `.v6-root`, render `<SiteHeader />`, then `<main style={{ paddingTop: 140 }}>…</main>`
   (clearance for the fixed nav), then `<SiteFooter />`. See
   [app/post-archive/page.tsx](../post-archive/page.tsx).

The `/v6` and `/v5` homepages render their own inline nav/footer (kept as-is) and are also
in `V6_CHROME_ROUTES` so the legacy chrome stays hidden.

## 13. Checklist for a new internal page

1. Wrap in `.v6-root`; render the shared `<SiteHeader />` / `<SiteFooter />` (§12b) and
   include `.v6-ambient`. Add the route to `V6_CHROME_ROUTES`.
2. Build content as `<section className="v6-section"><div className="v6-container">…`.
3. Lead each section with a `.v6-section-head` (eyebrow + accent-word h2).
4. Use `.v6-glass` cards with the anatomy in §6; pill tags from §5/§6.
5. Buttons from §4; "see all" links via `.v6-link-arrow`.
6. Add `data-reveal` to headers/cards (not to looped/rotating children); `data-parallax`
   to hero/banner media; `data-magnetic` to primary CTAs.
7. Respect RTL (logical props) and add the reduced-motion guard for any new animation.
8. Provide tablet (≤1100) and mobile (≤760) rules mirroring the closest existing section.
9. Keep new CSS in `v6.css` under a `/* ===== Name ===== */` banner (or a dedicated
   `<page>.css` imported by the page, scoped under `.v6-root`).
