# Strata that think

**Poetic, pixelated generator of landscapes, living systems and mineral consciousness.**

`Strata that think` is a generative JavaScript sketch that produces vertical plates where landscape, diagram, poem and interface appear as the same system. Each composition mixes clouds, mountains, trees, coast, sea, fossils, cables, roots, circuits, cracks and abyssal voids with textual fragments in English.

The text does not work as a caption: it behaves like another species of the drawing. It is embedded among symbols, roots, waves, organisms and technical structures.

---

## Project files

| File | Function |
|---|---|
| `index.html` | Page structure and controls panel |
| `styles.css` | Interface styles |
| `lexicon.js` | Poetic lexicon: the phrases, organized by zone (edit it freely) |
| `estratos.js` | Generative engine (drawing, palettes, series, layers, animation) |

`lexicon.js` loads before `estratos.js` (as declared in `index.html`); if you add new files, keep that order.

No installation, server, build or external dependencies required. Open `index.html` directly in Chrome, Firefox, Edge or any modern browser.

---

## How to use it

1. Open `index.html` in a browser.
2. Type a word or phrase into the **seed** field.
3. Press **Enter** or **reorder world**.
4. Choose a **territory** and a **palette**.
5. Export the resulting image as a PNG.

The same seed, territory and palette produce the same composition. Changing any of the three generates another world.

---

## Controls

| Action | Control |
|---|---|
| Generate a new seed | `R` |
| Show / hide text | `T` |
| Start / stop animation | `A` |
| Change palette | `P` |
| Export PNG | `S` |
| Mutate a seed with one click | click on the map |
| Load a plate from the series | click on its thumbnail |
| Regenerate with the current seed | **reorder world** button |

---

## Territory modes

### Full continuum
Runs the landscape from the air down to the tectonic region: clouds, mountain, forest, coast, sea, abyss, sediment, root, archive and fault.

### Air / mountain / forest
Favors clouds, air spirals, birds, relief (including the odd smoking volcano), trees, ferns, flowers, mushrooms, grass, rocks, deer and critters (snails, beetles), with phrases about perception, height, stone and growth.

### Coast / sea / abyss
Focuses on shores, waves, fish, jellyfish, whales, seahorses, turtles, corals, algae, crabs, starfish, octopuses, bottom rocks, currents and submarine memory.

### Underground / fault / core
Generates fossils, cable-roots, circuits, molecules, cracks, buried archives and dark voids.

### Desert / dune / heat
Sun, birds, dunes, cacti (saguaro, barrel, spiny), palms, rocks (angular, boulder, stacked cairn), vipers, lizards and dry grass over the tectonic substrate.

### Swamp / reed / fog
Fog, still water, reeds, water lilies, frogs, herons, dragonflies and fish; the murky in-between of water and land.

### Ice / crevasse / crystal
Flakes, ice peaks, floes, crystals, cracks and scattered snow. It looks splendid with the dark-background palettes.

---

## Color palettes

The drawing code never uses literal colors: it asks for semantic "slots" (`blue`, `red`, `green`, `yellow`, `ink`, `paper`, `white`), so switching palettes reorders the whole color world without touching the engine.

Default mode: **auto (surprise)**. For each plate it picks a concrete palette at random, **weighted and derived from the seed** (reproducible): the **colorful riso** is the majority (~55%), the **night-background** ones (abyss, neon) appear ~21%, **monochrome** is rare (5%) and the per-element **random** ~5%.

Selectable fixed palettes: **classic riso**, **earth**, **cold mineral**, **dark abyss** (dark background), **night neon** (dark background), **monochrome** and **random (scattered color)**. In the fixed palettes the shapes use vivid colors; the text always stays legible.

The auto-mode weights live in `PALETTE_WEIGHTS`, and the fixed palettes in `PALETTES` (`estratos.js`).

---

## Series

Generates several plates that share the same **ecology** (territory + palette) but **mutate from seed** to seed. Set the amount (2–12) and press **generate series**: a strip of thumbnails appears. Clicking any of them loads it into the main canvas; **export series** downloads them all as PNG.

---

## Layers by territory

**Export layers** downloads several PNGs with a transparent background, ready to compose in another program:

- One layer per active territory (`air`, `sea`, `tectonic`), or only the chosen territory.
- One **text** layer: the graphic species are computed to anchor the phrases, but not painted; only the words remain.

---

## Slow animation

The `A` key (or the button) sets the ecosystem in motion, on two planes:

**The printed landscape breathes.** The waves flow, the clouds and spirals drift, the fish swim back and forth, the jellyfish pulse (and the long-tentacled ones sway them), the birds glide, butterflies and dragonflies flit, algae and reeds sway with the current, the sun's rays spin and the snowflakes rotate. At rest everything returns exactly to its place: the static plate does not change.

**A transparent overlay** adds currents, signs and fireflies (concentrated in forest and swamp), plus particles specific to each territory: **bubbles** that rise in the sea and the swamp, **snow** that falls on the ice and **sand** in a lateral wind in the desert. It is seeded with the active seed to stay stable. If it is on when exporting a PNG, it is integrated into the image.

**The text is immune to the animation.** The phrases are drawn only once to a frozen layer that each frame stamps as-is: they cannot move, blink or disappear while the world flows. The particles and fireflies, moreover, dodge the phrase zones so as not to muddy the reading.

---

## Visual system

- Vertical canvas of **720 × 1000 px**.
- PNG export at **1440 × 2000 px**.
- Flat colors defined by palette.
- Low-resolution shapes: dots, stepped outlines, spirals, nodes, lines and incomplete diagrams.
- Reproducible seeds via a hash function and a pseudo-random generator.
- Text distributed as part of the graphic ecosystem, avoiding margins, captions or side lists.

### Placement by footprints

Each species automatically registers its **footprint** (the box its strokes occupy). With them the engine regulates coexistence:

- **Species look for lightly occupied spots.** One overlap is allowed (the forest lives at the foot of the mountain, the starfish beneath the coral), but if a place accumulates more, another one is sought.
- **Field-shapes** (waves, shores, dunes, fog) register no footprint: they are thin lines that must cross everything.
- **The phrases never step on one another.** They first look for empty paper near their shape; if only a spot over a drawing is left, they write on top of it **without erasing it**; and if there is no spot without stepping on another phrase, the phrase is dropped from that plate.

---

## Symbol families

The system is made of small graphic “species”. Each one returns an anchor point that lets the phrases appear near the shape that provokes them. Several have **alternative designs** chosen at random per element.

**Sky and air**
- Lenticular clouds and atmospheric spirals
- Birds (V-shaped gull, M-shaped bird, dotted bird) and butterflies

**Mountain and forest**
- Mountains: jagged, triangular with hillside, terraced, dotted and smoking volcano
- Trees: fir, pine, bare (branched), round-crowned and willow
- Plants: ferns, flowers, mushrooms and grass tufts
- Rocks: angular, boulder and stacked cairn
- Critters and fauna: snails, beetles and deer

**Coast, sea and abyss**
- Shores and waves (sine, zigzag, dotted, double)
- Fish (rhombus, round, elongated, arrow) and jellyfish (dome, bell, dotted, tiny, long-tentacled)
- Algae (strand, tuft, kelp) and corals (branch, fan, tubes)
- Crabs, starfish, octopuses, whales, seahorses, turtles and herons

**Desert, swamp and ice**
- Sun, dunes, cacti, palms, rocks, vipers and lizards
- Fog, reeds, water lilies, frogs and dragonflies
- Flakes, ice peaks, floes and crystals

**Underground and tectonic**
- Organic cables and circuits
- Fossils, molecules, cracks and abyssal voids

---

## Poetic lexicon

The phrases are organized by zones of the world: `sky`, `mountain`, `forest`, `shore`, `sea`, `abyss`, `tectonic`, `desierto`, `pantano`, `hielo`.

(The last three zone keys keep their original Spanish names because they are internal identifiers shared with the engine; only the phrases inside them are in English.)

Examples:

> a cloud not yet falling  
> the mountain was once the sea floor  
> the leaf writes with light  
> the current is a syntax  
> memory has no bottom  
> cables like algae  
> mineral consciousness  
> the system dreams with no center

To add new texts, edit the `lexicon` object inside `lexicon.js` — it is a phrases-only file, meant to be edited without touching the engine.

---

## Quick customization

Inside `estratos.js`, look for the `CFG` object:

```js
const CFG = {
  baseTextSize: 16,
  baseLeading: 18,
  textMaxChars: 20,
  extraNoise: 1.3,
  densityBoost: 1.9,
  symbolScale: 1.55,
  exportScale: 2
};
```

You can modify:

- `baseTextSize`: size of the phrases.
- `baseLeading`: distance between the lines of a wrapped phrase.
- `textMaxChars`: maximum number of characters per line.
- `extraNoise`: amount of loose dots and signs.
- `symbolScale`: general size of the graphic species.
- `exportScale`: PNG export resolution.

You can also change the physical size of the canvas in `index.html`:

```html
<canvas id="world" width="720" height="1000"></canvas>
```

---

## Next possibilities

- Sliders for density, text scale, number of phrases and chaos.
- Saving favorite seeds as a JSON file.
- Print mode: A4 format, poster or vertical strip.
- Export the whole series as a single contact sheet.

---

## Idea

The project understands the landscape as a surface of inscription: a cloud can think, a root can work as a cable, a fossil can hesitate, a circuit can grow like algae. The composition does not illustrate a theory of consciousness; it rehearses a system where matter, language, computation and minimal life share the same plane of signs.

---

## Credits

Concept and art direction: **Canek Zapata**  
Generative sketch: HTML Canvas + JavaScript
