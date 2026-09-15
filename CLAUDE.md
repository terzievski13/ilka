# Ilka — подарък-сайт за г-жа Неделева

A small single-purpose gift site: five screens of puzzles ending in a personal
letter. Bulgarian language throughout. No build step, no framework, no
dependencies — plain HTML/CSS/JS served statically.

## Layout

```
site/                 <- the deployed site (Vercel outputDirectory)
  index.html          <- Landing ("Сега е мой ред.")
  zadacha-1.html      <- Puzzle 1: three sons (answer 2, 2, 9)
  zadacha-2.html      <- Puzzle 2: snail in the well (answer 8)
  zadacha-3.html      <- Puzzle 3: Klotski sliding puzzle
  ocenki.html         <- Report card, reads grades from localStorage
  final.html          <- Envelope opens into the letter
  assets/
    style.css         <- the whole design system
    app.js            <- progress dots, floating symbols, localStorage helper
    quiz.js           <- shared logic for zadacha-1 and zadacha-2
    puzzle.js         <- responsive Klotski
design-canvas/        <- the ORIGINAL .dc.html artboards, kept for reference only
```

`design-canvas/` is **not deployed and not runnable in a browser**. Those files
are Design Canvas artboards using `<x-dc>`, `DCLogic`, `{{ }}` templating and
`style-hover` attributes, none of which are real web platform features. The
site in `site/` is the working conversion. Edit `site/`, never `design-canvas/`.

## Conventions

**Everything scales with `clamp()`.** The original artboards used fixed pixel
sizes (a 144px heading, 36px body text) that were unreadable on a phone. Type
and spacing now come from custom properties in `:root` — `--fs-hero`,
`--fs-body`, `--gut` and friends. When adding anything, reach for an existing
token rather than a hard pixel value, so it stays correct from 375px to 1920px.

**No horizontal scroll, ever.** `.screen` is `overflow:hidden` and decorative
layers (`.aurora`, `.grain`, `.symbols`) deliberately extend past the viewport
and get clipped. They are `aria-hidden="true"` and `pointer-events:none`.

**Use `100svh`, not `100vh`** for full-height screens — `vh` is wrong on mobile
Safari because of the collapsing address bar.

**Tap targets are at least 44px tall** (`.linkbtn` has `min-height:44px`).

**Shared chrome is injected by `app.js`, not written into each page.** The page
switcher (`nav()`), the progress dots (`progress()`) and the floating symbols
(`symbols()`) are all built in JS and inserted into `main.screen`. Add shared
UI there rather than pasting markup into six files.

**All localStorage goes through `window.ilka.store`** (`get`/`set`/`del`). It
swallows exceptions, because Safari private mode throws on access and an
unhandled throw would break the page.

## Progress state

Keys: `ilka_stage1..3` = `"solved"`, `ilka_grade1..3` = the grade string,
`ilka_final` = `"opened"`. The report card falls back to the default grades if
nothing is stored, so `ocenki.html` looks right even when opened directly.
Grades are tuned so the average is **5.81 — never 6.00** (that's the joke).

To replay from scratch: `localStorage.clear()` in the console, or use the
"реши отново" / "↺ Отначало" buttons.

## The Klotski puzzle

`assets/puzzle.js`. Classic Huarong Dao layout: a 2x2 red block plus 9 others on
a 4x5 grid, escaping through the 2-cell gap at the bottom centre. The board is
**verified solvable** (24,098 reachable states; minimum 116 single-cell moves).
If you change the `INITIAL` layout, re-verify solvability with a BFS before
shipping — an unsolvable board would silently ruin the gift.

Cell size is recomputed from the viewport (`computeCell`) on load, resize and
orientation change, so the board always fits. Pieces are positioned with
`transform: translate()` in pixels, so anything that changes `cell` must call
`layoutBoard()`. Dragging uses pointer events with an axis lock and
`touch-action:none`, which is what makes it work under a finger.

## The top row is crowded on small phones

The page switcher (fixed top-left) and the progress dots (fixed top-centre)
nearly collide at 375px — they overlapped by 6px until a `max-width:400px`
media query tightened the padding and letter-spacing on both. If you make
either one wider, re-check iPhone SE (375px) first.

## Still to personalise

In `site/final.html`:
- `[ имената на учениците Ви ]` — replace with the students' actual names.
- The dashed `.photo` box — drop a class photo at `site/assets/class.jpg` and
  uncomment the `<img>` inside it.

## Deploying

Pushing to `main` on GitHub triggers Vercel. Manually: `npx vercel deploy --prod`.
`vercel.json` sets `outputDirectory: site` and `cleanUrls`.

The project has SSO deployment protection **disabled on purpose** — the whole
point is that a teacher with no Vercel account can open the link. Don't re-enable it.

## Testing

There is no test runner in the repo; tests were written ad hoc against a local
static server. What's worth re-checking after a change:
- no horizontal scroll at 375 / 390 / 412 / 768 / 1440 / 1920 px
- both answers accept messy input (`"9 2 2"`, `"8 дни"`) and reject wrong ones
- puzzle board fits the viewport and a piece actually slides under a drag
- the envelope opens and the letter fits on screen without clipping
