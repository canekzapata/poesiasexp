# AGENTS.md — the sentence rehearses itself

One continuous computational poem. A single English sentence spends the session
examining its own relations via grammar operations (in `js/grammar.js` under
`ops`), nineteen verbal forms, eight computational forms, nine decaying memories,
and a melody derived from the seed. Read `README.md` for the full design; this
file is only what an agent would otherwise get wrong.

## Running it

- Static, no build, no server, no network, no dependencies, no `package.json`,
  no tests. Open `index.html` directly; it is designed for `file://`.
- Scripts are **classic scripts**, not ES modules, sharing a `window.SRI`
  namespace so the piece survives in twenty years. Do not convert to modules —
  that breaks the `file://` guarantee.
- Script load order matters: `corpus → grammar → memory → forms → diagrams →
  sound → reader → print → main`. `main.js` is the entrypoint and wires the rest.
- The reproducibility unit is the seed in the URL, e.g. `index.html#seed=fernwait`.
  Same seed ⇒ same first sentence, grammar, and melodic subject. Session state is
  **not persisted** (no `localStorage`); close the tab and it's gone by design.

## State and identity

- State lives in one shared object set up in `main.js` (registry / surfaces /
  `state.formState`, `state.mem`, `state.reduced`).
- **Word identity is held by token id, not spelling.** A returning word is the
  same word; never key things by surface text.
- Repetition increments pressure; nothing is ever copied for reuse. "Deleting"
  (Backspace) sets a word aside as residue that can surface later — it is not
  removed.

## Randomness

- Composing runs only through the seeded generator. `Math.random()` is permitted
  ONLY in: `fingerprint()`/seed mint and `phraseMemory` pick in `main.js`, initial
  graph scatter in `diagrams.js`, and pink-noise/filter jitter in `sound.js`.
  If you add generative behaviour, route it through the seeded generator, not
  `Math.random()`.

## Sound

- One `AudioContext`, started **only** by the explicit gesture; audio is off until
  "start sound" is pressed. No Tone.js — a 25 ms lookahead scheduler reads
  `AudioContext.currentTime` (see `sound.js`). The visual clock never schedules
  audio. Keep the master bus / per-family gains / limiter intact.

## Interactions are interpreted

- Drag/drop, click-select, Backspace, arrows, Tab, Enter, Esc, S (sound),
  P (print), R (begin again) — all go through `js/reader.js` interpretation and
  memory before becoming consequences. `reduced-motion` stops the sliding without
  stopping transformation; `pagehide` cancels rAF, clears timers/listeners, closes
  audio. Preserve these when adding interactions.

## Preserved invariants

- Composing, visual layout/colour, form choice, and music are all biased by the same
  six regimes (NAMING, RELATING, REPEATING, BRANCHING, MISREMEMBERING, RETURNING).
  Don't make them independent scenes.
- Prints (P) are non-reproducible editions of one reading — not documentation of the
  work.
- No network requests, no external fonts (system families with fallbacks), no
  analytics. No `ScriptProcessorNode`/deprecated APIs.

## Deliberately incomplete (README § "What is founded and what is not")

- False-return and recognition melodic conditions; real stretto; the "sung"
  register; calligram/concrete spatial forms separate from stanza; footnotes as a
  principal voice. These are named as future passes — treat them as open work, not
  bugs.
