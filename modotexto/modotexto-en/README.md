# TEXT MODE

**A character labyrinth traversed in first person.**  
poesiasexp · canekzapata.net · 2026

Open `index.html`. There is no build process, package manager, network call,
account, or telemetry. Everything happens inside the browser.

This is the expanded English-language edition of `../modotexto/`. Internal
Spanish identifiers remain unchanged so both editions share the same engine,
tests, memory format, and relative dependencies. Everything the visitor can
read—the building's voice, interface, accessibility mirror, logs, print record,
core dumps, materials, palettes, and architectural names—is in English.

## What it is

One character grid behaves as constructed space. The document does not
represent a terminal: the terminal **is** the building, viewed from within.

The person moving through it is someone, not a camera. They entered on their
own feet and now look for a way out. The building does not hate them: it
contains them, which is worse. At the upper level, language still believes in
doors. Farther down, *door* becomes a word learned outside.

The work is seen much more than read. At least 85% of the characters on screen
must remain non-lexical matter: blocks, semigraphics, patterns, frames, and
illegible alphabets. A complete sentence is not given away. It is earned by
stillness.

## Stillness condenses

The central rule is simple: **noise becomes language when the visitor stops
moving.**

- After four seconds without input, cells on a nearby wall begin migrating
  character by character toward a sentence.
- After eight seconds, the sentence becomes complete and legible.
- The first movement dissolves it faster than it formed.
- A sentence that was fully read enters the LOG. This is the only way to
  accumulate language.

The same phrase is not offered twice in one session. When the local lexicon is
exhausted, phrases begin to splice into each other. That degradation is part of
the poem.

This English edition delays that stage. It contains:

| register | Spanish edition | English edition |
|---|---:|---:|
| depth phrases | 57 | 100 |
| material phrases | 32 | 64 |
| false-exit signs | 10 | 20 |
| warden clues | 12 | 24 |
| **total authored phrases** | **111** | **208** |

The additions are not padding or synonyms. Each depth acquires a broader
psychological grammar: arrival, unreliable memory, machinic enclosure, and the
bottom where escape has become preservation. Each material also receives a
more distinct voice.

## One plane

Everything occurs in a matrix between roughly 80×25 and 160×50 cells,
calculated from the window and the seeded font metrics. Every cell stores a
character, ink, paper, attribute, and the system that wrote it. The world is
painted on one canvas. Glyphs stretch or contract to occupy their exact cell,
so blocks join without seams and wide scripts remain inside the grid.

Resizing does not regenerate the labyrinth. It reframes it.

## Text camera

Each column of the CAMERA panel casts a ray through the labyrinth. Distance
becomes column height and character density: `█ ▓ ▒ ░ · space`. Fog is not a
gradient but a character ramp. North/south faces use a pattern different from
east/west faces, so corners read without conventional shading.

Movement occurs one cell at a time. Turns advance in 15° or 30° steps with a
short interpolation. The camera runs at the cadence of a slow machine.

## A habitable TUI

Panels are organs, not decoration:

| panel | faculty |
|---|---|
| CAMERA | sight; it cannot be closed |
| MAP | cartographic memory |
| LOG | narration of events |
| INSPECTOR | the names of cells |
| DEPTH | the measure of the bottom; it lies |

Closing a panel costs something. Without MAP, no map is written. Without LOG,
events do not become narration. Without INSPECTOR, cells lose their names. A
one-cell residue remains at the edge so the panel can return, but what happened
during its absence is not restored.

## Seven architectures

The seed chooses one architectural procedure: excavated, woven, skewed,
cavern, districts, concentric, or damaged. All worlds are connected and contain
real loops. One to three thresholds descend to another level. Descending is not
progress: it is a change of grammar.

**There is no exit. There is depth.**

## Materials and erosion

Eight materials—limewash, brick, sextant, shard, soot, paper, bone, and
quadrant—have restricted signs, a joint, a color register, and their own
cellular automaton. Erosion proceeds slowly and cannot disconnect the world.

Rubbing a wall accelerates its local automaton. Rubbing long enough opens a
passage the generator did not plan. The MAP marks it with `¤`, because the
architect did not make it.

## Written bodies

The sculptures borrowed from `../lasletras/` already contain depth and glyph
information. TEXT MODE stops flattening them. They are broken into fragments
and distributed along sight lines and dead ends. They can be seen and crossed
but not touched. Some rise above the ceiling line: the only place in the work
where there is something to look up at.

The MAP marks them with `♦`.

## Wardens

Wardens are impossible glyphs built from several writing systems occupying one
cell. They roam but do not pursue the visitor. When approached, they flee.
Their path consumes remembered cells from the MAP.

Catching one returns what it consumed and releases a phrase from the exit
lexicon—the only voice in the work that speaks of an opening in the present
tense. This is the closest the piece comes to a game, and its reward is
language.

## Memory and forgetting

The MAP begins empty. Remembered cells decay from material-specific marks to
`░`, then to a dot, then to nothing. Returning does not recover the previous
memory; it writes a new one that may contradict it.

`localStorage`, keyed by seed, preserves visited cells, read phrases, opened
walls, closed panels, corrupt regions, and elapsed time. The `O` key forgets
the current seed immediately. Forgetting is a gesture in the work, not a
settings option.

## Core dump

Rarely, and always after something the visitor did, a region corrupts. For a
few seconds it displays internal state: approximate addresses, hexadecimal
columns, variable names, seed fragments, and pieces of the lexicon. It is not
an error screen but a change in the regime of space. When it ends, the region
remains another material. The damage persists for that seed.

## Controls

Press `?` inside the work for the complete sheet. The main controls are arrow
keys or WASD to move, Space to touch a wall, Enter to descend at a threshold,
Tab to move among panels, `R` for seed traits, `M` for sound, `O` to forget,
and `P` to print a traversal record.

Exports remain grid-native: PNG, ANSI, plain text, JSON state, and core-dump
text.

## Tests

Run:

```sh
node tests/smoke.js
```

The suite checks determinism, connectivity, architectural coverage, the 85%
non-lexical rule, palette distribution, anomalies, wall perforation,
condensation, monument visibility, wardens, and phrase wrapping at 61 widths.
No complete phrase may lose a character.
