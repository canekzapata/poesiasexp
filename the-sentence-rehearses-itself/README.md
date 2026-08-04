# THE SENTENCE REHEARSES ITSELF

### a grammar that can hear the difference between repeating and returning

One continuous computational poem. It begins with a single short English
sentence and then spends the rest of the session examining its own relations:
a noun starts doing what it is, a verb becomes somewhere to stand, a pronoun
keeps pointing after its referent has gone, a subordinate clause is promoted
to the root of its own tree, a word returns spelled exactly as before and
carrying a different history.

It is not a website containing poems. Sentences become stanzas, parse trees,
functions, graphs, tables, plots and musical scores, and each of those is a
way for the same words to keep being a sentence.

```text
repetition = the visible return of material
insistence = the pressure accumulated by returning
```

Every recurrence modifies a persistent state. Nothing repeats in exactly the
same conditions.

Gertrude Stein is a formal ancestor here — insistence, the continuous
present, grammatical ambiguity, naming as a way of losing a thing — not a
voice being imitated. Nothing is quoted. The English was written for this
piece.

---

## Running it

Open `index.html`. No build step, no server, no network, no dependencies.
The scripts are classic scripts, not ES modules, specifically so the piece
still runs from a `file://` URL on a disk in twenty years.

Sound starts only after you press **start sound**. It is off until then.

---

## Controls

| | |
|---|---|
| stay on a word | its insistence rises; the word gets heavier, not brighter |
| drag one word onto another | a relation is made; both words are altered and a third phrase may appear |
| drag a word into open field | it changes grammatical role and the sentence is regenerated around it |
| click a word, then another | the same as dragging: they are related |
| **Backspace** / **Delete** | sets a word aside. It is not deleted. It becomes residue and can come back |
| **Arrow keys** | move the focused word into another branch |
| **Tab** | move between words (focus is visible) |
| **Enter** | select the focused word |
| **Esc** | deselect |
| **S** | start / stop sound |
| **P** | print an edition of this reading |
| **R** | begin again with the same seed |
| click a table column heading | the column moves first and the grammar it describes changes |
| do nothing | the grammar continues privately; sound withdraws; something old may surface |
| leave the tab and return | this registers as an absence, not a pause. Something was said while you were gone and is now residue |
| resize the window | the syntax is recalculated spatially |

There is no score, no level, no completion. The reader influences the work
without controlling it: every action goes through interpretation and memory
before it becomes a consequence, and some consequences arrive minutes later.

---

## Seeds

The seed is in the URL: `index.html#seed=fernwait`.

The same seed always produces the same latent first sentence, the same
initial grammar and the same spectral identity — the melodic subject is
derived from the seed's hash. What happens after that is the reading's own.
Two people on the same seed begin identically and end up with different
grammatical and musical biographies.

`another seed` mints a new one. `begin again` restarts the current one.

---

## The forms

**Verbal forms.** Nineteen, each with its own rules for line length,
recurrence, syntax, punctuation and stanza shape: lyric, couplet, tercet,
prose poem, litany, dialogue between two grammatical voices, definition,
instruction, catalogue, riddle, refrain, villanelle-like recurrence,
sestina-like rotation of end words, sonnet fragment that may never reach
fourteen lines, ballad with unstable meter, dramatic monologue spoken by an
object or a relation or a verb, epistolary fragment addressed to something
that cannot answer, a poem made only of questions, and a poem made of
corrections of its previous version.

Forms turn into other forms through a stated operation — *the refrain takes
over the poem*, *only the ending survives*, *the entry disagrees with
itself* — and the earlier form leaves a trace. Refrains, end words and sonnet
counts persist in `state.formState`, so returning to a form is never
arriving at it for the first time.

**Computational forms.** Stanza, parse tree, relation graph, executable
function, plot, table, score, residue. These are not pages and there is no
menu. There is one set of words: the same DOM element that was a word in a
line becomes a leaf of a tree, a node of a graph, a cell in a table, an event
in a score. A word that comes back is the same word coming back — identity
is held by token id, not by spelling.

A figure is only offered when there is material for it. An empty graph is
not a poem about emptiness.

---

## The operations are real

The function poems display operations that the generator actually performs
on the current tree. They are in `js/grammar.js` under `ops`:

```text
remember(x)        → x returns with one relation missing
repeat(x, n)       → x accumulates pressure, not copies
name(x)            → x becomes less identifiable
give(x, y)         → the distance between x and y becomes the gift
misremember(x)     → x is replaced by what shares a tag with it, or by a residue
returnAs(x, role)  → the spelling survives; the function does not
promote(clause)    → the dependent becomes the root
unbind(pronoun)    → the pointing continues without a target
scale(adjective)   → the modifier detaches and attaches to the whole figure
place(verb)        → an action becomes somewhere to stand
act(noun)          → a thing begins doing what it is
```

`give` computes a real tree distance and hands that number over instead of
the noun. `name` walks a word down `window → the one that was window → the
one → one → it` and raises ambiguity as it goes. `repeat` never copies
anything; it increments pressure.

---

## Plotted history is not decoration

`memory.js` samples insistence, ambiguity, silence debt, novelty, clause
length, syntactic distance and return probability. Those series are read
back. `Memory.returnProbability()` is plotted *and* is the number
`main.js` rolls against when deciding whether something comes back — and it
includes the slope of the insistence curve, so a rising history makes
returning more likely than a flat one. The plot is a picture of a decision
being made.

---

## Memory

Nine memories, each decaying at its own rate (`memory.js`, `HALF`):

```text
immediateAttention   3.5 s      is anyone looking
novelty              40 s       difference between now and the history
ambiguity            210 s      unresolved role pressure
word fatigue         95 s       resistance to repeating a response
word insistence      480 s      accumulated pressure
edge weight          900 s      the session's syntax
residue              2400 s     what was set aside
```

Nothing is kept forever and nothing is forgotten at the same moment. A word
can be fatigued and still insistent. A relation can outlive both words it
connects. A residue can outlive the sentence that discarded it.

Six regimes coexist as weights rather than scenes — NAMING, RELATING,
REPEATING, BRANCHING, MISREMEMBERING, RETURNING — and they bias frame
choice, form choice, layout, colour and music simultaneously.

---

## The music

Not background and not sonification. One `AudioContext`, started only by an
explicit gesture, with a master bus, family gains, soft saturation and a
limiter. Scheduling is a 25 ms lookahead loop reading `currentTime`; the
visual clock never schedules audio.

**Matter** — additive partial banks with a harmonicity-driven stretch
(`f_n = f · n^(1+s)`), pink-noise breath bands, resonant impulses through
high-Q filter triples, and pairs of close sines that beat.

**Melody.** Each seed generates a subject of five to nine pitches from a
bounded field: a region of the harmonic series, a small modal collection, or
an inharmonically stretched scale. It is simple enough to remember and
distinctive enough to recognise when transformed. It is not assigned
syllable by syllable to the text; it represents the sentence's accumulated
grammatical identity.

Transformations are caused, never random: a word changing role turns one
defining interval around; a refrain returning spawns a second voice in canon;
an abandoned stanza leaves its melody unfinished as a residue; revisiting
brings the subject back in augmentation or another register; accumulated
repetition makes structurally important tones disappear; sustained attention
makes the timbre converge and the tune more singable. Each transformation is
written into a genealogy that the printed edition can show.

The melody passes through perceptible conditions — intimation, statement,
learning, counterpoint, forgetting, a false return, recognition, residue —
and there are between one and three voices, never permanently dense.

**Silence has consequences.** When `silenceDebt` rises, phrases are replaced
by rests, texture withdraws, and the grammar clock itself slows down: the
piece stops changing as well as stops sounding. Afterwards an old fragment
may surface alone.

The piece is designed to be compelling with audio disabled. If you never
press start, the melody is still generated, still transformed by your
reading, and the printed edition will say so: *This reading was silent. The
melody was generated and never heard.*

---

## Print

**P** assembles an edition: the sentence it began with, its major
transformations, one parse tree, one relation graph, one function, one
history plot, selected residues, the spectral genealogy, and its current
provisional form. This is not documentation of the work — it is one edition
produced by one reading, and it cannot be produced again.

---

## Accessibility and limits

Keyboard access to every action, visible focus, a live region for
announcements, a clear audio start/stop, safe levels behind a limiter, and a
reduced-motion mode that stops the sliding without stopping the
transformation — under `prefers-reduced-motion` positions are taken directly
and change arrives as a cut.

Dark and light are both designed; the piece follows the reader's system.
Narrow screens get a translation rather than a shrink: the marginal evidence
moves to a band beneath the figure and most of it is not shown, because a
phone reading has less peripheral memory than a desktop reading.

Explicit caps: 130 words on stage, 240 word-ledger entries, 90 relation
edges, 40 residues, 320 samples per series, 8 voices, 11 partials per voice,
46 partials total, 260 score events, 14 canvas traces per rearrangement.
`requestAnimationFrame` is cancelled, timers cleared, listeners removed and
the audio context closed on `pagehide`. No visual work is done while the tab
is hidden.

---

## Files

```text
index.html      the continuous field
style.css       typographic and spatial grammar
js/corpus.js    original English verbal material, organised by behaviour
js/grammar.js   seeded generation, the parse tree, the real operations
js/memory.js    attention, relations, fatigue, residues, decay, regimes
js/forms.js     the nineteen verbal forms and their transformations
js/diagrams.js  stanza, tree, graph, function, plot, table, score, residue
js/sound.js     the spectral organism and its melody
js/reader.js    interpreted interactions
js/print.js     the edition produced by one reading
js/main.js      lifecycle, three unequal clocks, shared state
```

`forms.js` is a deliberate split out of `grammar.js`: sentence construction
and poetic form are different problems and were becoming entangled.

---

## Preservation notes

- No network requests, no external assets, no analytics, no fonts to fetch.
  Typography resolves from system families (a text serif, a mono for
  evidence) with declared fallbacks.
- Classic scripts on a `window.SRI` namespace so the piece runs from
  `file://`. Do not convert to ES modules without accepting that cost.
- Tone.js is not used. A 25 ms lookahead scheduler over raw Web Audio does
  what this piece needs and removes a dependency from its future.
- No `ScriptProcessorNode`, no deprecated APIs.
- The seed is the reproducibility unit. To reconstruct a starting state,
  keep the seed. To reconstruct a *reading*, keep the printed edition; the
  reading itself is not reconstructible, and that is intended.
- `Math.random()` appears only for minting a new seed and for the initial
  scatter of a word before it is placed. Everything that composes runs
  through the seeded generator.

---

## What is founded and what is not

This is a working first edition, complete end to end: all nineteen verbal
forms, all eight computational forms, all eleven operations, the nine
memories with distinct decay, the melodic subject with sixteen caused
transformations and eight dramaturgical conditions, the printed edition,
keyboard access and the limits above.

Deliberately left for the next pass, and named here rather than hidden:

- the melodic **false return** and **recognition** conditions only occur in
  sessions past roughly four minutes, and have had far less listening than
  the early conditions;
- **canon and stretto** exist as a second voice at an offset; real stretto
  with overlapping entries of the same subject is sketched, not developed;
- the **sung** register — vowels and filtered formants — is described in the
  design and not yet implemented; the organism is instrumental so far;
- the **calligram** and **concrete poem** spatial forms are not yet distinct
  from the stanza layout;
- **footnotes as principal voice** exists only as residue, not as its own
  arrangement.
