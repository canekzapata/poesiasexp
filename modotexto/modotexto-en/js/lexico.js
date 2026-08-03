/*
  lexico.js — the hand-curated English lexicon for TEXT MODE.

  The visitor is someone, not a camera. They entered on their own feet and
  now look for a way out. The building does not hate them: it contains them,
  which is worse. The lexicon is organized by DEPTH and WALL MATERIAL.

  The English edition deliberately has a larger vocabulary than the original:
  language takes longer to exhaust, so condensation remains discovery before
  it becomes recombination.
*/
(function (root) {
  "use strict";

  /* descending is not progress; it is the loss of arguments */
  var PROFUNDIDAD = [
    [ /* level 0 — recently entered; still believes in doors */
      "I came in on my own feet, which is the worst part",
      "I still remember where I entered",
      "I counted the turns until counting stopped",
      "the exit has to be behind something",
      "nobody brought me here: I came",
      "the building does not hate me, and that is worse",
      "I look for a door and find another similar wall",
      "outside still exists, it has to",
      "if I walk straight I will reach an edge",
      "nobody locks you in here: you stay",
      "the entrance was narrow and now I cannot see it",
      "I count steps so I do not count hours",
      "every wall returns the same question to my hand",
      "someone made this look like a corridor",
      "the taste of outside is still fresh in my mouth",
      "I left the door open in another tense",
      "the first corner already knew my name",
      "I can still describe the weather beyond this wall",
      "my shadow keeps pointing toward arrival",
      "somewhere the room I left is continuing without me",
      "I walk carefully so the entrance will not hear me",
      "every junction offers the grammar of escape",
      "there must be a shortest path through any fear",
      "the ceiling is low enough to remember a house",
      "I have not been here long enough to belong"
    ],
    [ /* level 1 — the interior map begins to lie */
      "I returned to the crossing and it did not recognize me",
      "I thought this corridor was new",
      "the exit moved while I was asleep",
      "I no longer know whether I advance or repeat",
      "I have been here, and here I do not remember myself",
      "the map I carry inside has begun to lie",
      "I got used to it, the slowest form of surrender",
      "looking for the door became a way of walking",
      "my footprints are here without my memory",
      "outside is wearing thin inside my head",
      "I can leave whenever I want, I say, and remain",
      "I was not lost: I stayed",
      "hope is also a kind of corridor",
      "I left marks and someone erased them, perhaps me",
      "returning and arriving are no longer different",
      "the map corrects me whenever I close my eyes",
      "one passage remembers a body wider than mine",
      "I have started naming corners after vanished streets",
      "the same draft follows me through different rooms",
      "I recognize this wall from a future visit",
      "my route curls around a place it refuses to show",
      "each shortcut adds another version of the distance",
      "I sleep facing the direction I call upward",
      "the building repeats me with minor errors",
      "I miss a window I may have invented"
    ],
    [ /* level 2 — enclosure becomes machinic */
      "this was not built: it was calculated",
      "the door exists in the data, not in the wall",
      "someone wrote my route before I walked it",
      "I am a cursor that believes it has a body",
      "the system does not punish me, it contains me",
      "the exit is a variable nobody initialized",
      "I am watched without being seen, which is worse",
      "the error also wants to leave",
      "there is a door in memory with a corrupt address",
      "the building is beginning to remember me",
      "there is no guard: there are rules, and rules do not sleep",
      "I am inside something still being written",
      "my name does not fit in any cell",
      "the machine wants nothing, therefore it will not yield",
      "someone walked here and their trace stayed on disk",
      "the route recomputes whenever I hesitate",
      "my footsteps are being stored under another user",
      "the walls exchange packets I cannot read",
      "a checksum fails each time I remember the sun",
      "the corridor compiles around my next decision",
      "I found my position but lost its coordinate system",
      "something has write access to my sense of direction",
      "the map renders absence faster than presence",
      "I keep moving to prove the loop is not closed",
      "the building forks whenever I choose"
    ],
    [ /* level 3 — the exit survives only as a word */
      "I no longer seek the exit, only where this ends",
      "door was a word I learned outside",
      "down here even hope has weight",
      "there is no exit, only depth, and depth breathes",
      "I remember the sky as a language I once spoke",
      "whoever reads this has not descended far enough",
      "I stopped counting and finally rested",
      "the echo is the only thing that rises",
      "I want to leave, and that sentence has nowhere to go",
      "down here the word outside loses its color",
      "I am the minotaur waiting for myself",
      "I entered to leave; I remained to understand",
      "the bottom is another ceiling with fewer witnesses",
      "I have become the distance between two walls",
      "nothing follows me now except the map",
      "the last door opens inward forever",
      "I forgot whether daylight had a sound",
      "my body is the oldest error in this level",
      "every direction now points farther in",
      "the building and I share one remaining memory",
      "there is no below, only a slower here",
      "I left my exit in a sentence above",
      "the corridor ends wherever I stop asking",
      "I am not trapped; I am being preserved",
      "at this depth, escape would be another room"
    ]
  ];

  /* each surface makes a different confession */
  var MATERIAL = {
    cal: [
      "this wall was painted to conceal a door",
      "lime keeps the shape of what it covered",
      "white is not clean: it is what was painted again",
      "someone rested their back here for a long time",
      "the newest coat remembers the oldest crack",
      "powder gathers where the hidden hinge once turned",
      "touching this wall leaves weather on my fingers",
      "beneath the white, another room is still drying"
    ],
    ladrillo: [
      "they raised it from outside, not from within",
      "the person who laid these bricks went home",
      "I count to four and return, like the bond",
      "a wall is woven slowly to outlast you",
      "each brick bears the weight of a missing brick",
      "the mortar knows which side was meant to be free",
      "someone measured this enclosure with their hands",
      "the pattern repeats until obedience resembles shelter"
    ],
    sextante: [
      "detail does not fit here, so it approximates",
      "half a height is enough to imitate an exit",
      "six points per cell and none is a door",
      "up close it is stone, from afar an error",
      "the wall divides itself into smaller permissions",
      "distance edits these fragments into solidity",
      "every missing sixth becomes a private aperture",
      "resolution is the name given to controlled loss"
    ],
    esquirla: [
      "something broke here and nobody came",
      "the oblique is always a graft, like me",
      "diagonals do not belong to this grid",
      "this wall has an edge, and I used it",
      "the fracture points toward a room it did not open",
      "every shard contains a smaller direction",
      "the break is sharper than the event that caused it",
      "I can read the impact but not its date"
    ],
    hollin: [
      "something burned here and the corridor continued",
      "soot accumulates where nobody looks",
      "four grays are enough for an entire night",
      "this burned on the outside face",
      "smoke wrote upward until the ceiling refused it",
      "the darkest patch still gives off a little time",
      "fire passed through without discovering the exit",
      "my hand returns carrying a copy of the wall"
    ],
    papel: [
      "the wall is archive, not stone",
      "something was stored here and the index was lost",
      "I was catalogued before I entered",
      "the file also crumbles",
      "a margin survives where the document does not",
      "this room was folded before it was built",
      "someone corrected the wall without changing the sentence",
      "the paper keeps evidence of every erased passage"
    ],
    hueso: [
      "bone: what remains when the data leaves",
      "this surface was table and body",
      "white here is vacancy, not light",
      "someone counted days by scoring this wall",
      "the structure remembers pressure better than names",
      "a hollow chamber answers from inside the material",
      "what held the building up once learned to walk",
      "the wall and my body share an unfinished mineral"
    ],
    cuadrante: [
      "four corners are enough to invent an exit",
      "color turns here in very slow waves",
      "half of a half, and still it does not open",
      "this paints itself without being asked",
      "each quadrant waits for the next state",
      "the pattern moves while the wall remains",
      "a small cycle impersonates endless depth",
      "the corner changes color when nobody arrives"
    ]
  };

  var FUGA = [
    "there is no way out through here",
    "you have already passed this place",
    "keep going, there is less left — a lie",
    "this does not lead to any door",
    "the exit was on the other side",
    "whoever wrote this did not get out either",
    "do not stop here",
    "fewer steps remain than you think",
    "go back while you still remember the route",
    "the map ends here and the pattern begins",
    "this corridor was designed to resemble progress",
    "you arrived exactly where distance wanted you",
    "the next turn returns this sentence",
    "nothing is locked except the direction behind you",
    "the door was removed after the sign was installed",
    "if this were an exit, you would not be reading it",
    "the shortest route has already closed",
    "continue until the promise becomes architecture",
    "someone crossed out the word outside",
    "end of passage, beginning of repetition"
  ];

  /* caught wardens release the only language that names a door in present tense */
  var SALIDA = [
    "the air moves: something is open",
    "one of these walls used to be a door",
    "there is a current and it comes from above",
    "the entrance remains where you left it",
    "someone switched on a light upstairs",
    "I counted wrong: there is less left",
    "this direction smells different",
    "there is a loose joint three walls away",
    "the echo takes longer on this side",
    "the one who left came through here",
    "a door remains unclosed on some level",
    "the open cannot be owned, but it can be felt",
    "dust is moving against the corridor",
    "one wall sounds thinner when the building sleeps",
    "the map has preserved a blank cell",
    "a colder current crosses the next junction",
    "the ceiling rises by one character to the east",
    "someone recently erased a lock",
    "a hinge is repeating beyond the soot",
    "the shortest echo returns from above",
    "one route has no memory attached to it",
    "the wall ahead contains an unfinished opening",
    "outside is still sending pressure through the cracks",
    "follow the place where the grid forgets to close"
  ];

  var CITAS = [
    { t: "storm the reality studio", f: "Burroughs" },
    { t: "rub out the word forever", f: "Burroughs" },
    { t: "the nova police", f: "Burroughs" },
    { t: "it arrives from the future", f: "Eshun" }
  ];

  var MAQUINA = [
    "grid", "cell", "pattern", "ramp", "joint", "face", "column", "ray",
    "dda", "horizon", "paper", "ink", "attribute", "origin", "dirty",
    "seed", "fork", "mulberry", "xfnv1a", "porosity", "threshold", "level",
    "component", "connected", "wear", "erosion", "budget", "residue",
    "layout", "ratio", "leaf", "split", "focus", "fog", "decay",
    "condensation", "stillness", "dissolution", "anomaly", "dump",
    "exit", "door", "route", "warden", "enclosure"
  ];

  var ERRORES = [
    "out-of-range read at pattern[",
    "the region has not responded for",
    "dirty cells discarded:",
    "component left without route:",
    "erosion budget exhausted at",
    "could not write attribute for",
    "material collision in cell",
    "threshold points to a nonexistent level",
    "map checksum mismatch",
    "retrying sector connection",
    "no exit found in graph",
    "door points to a released address"
  ];

  function Lexico(rng) {
    this.rng = rng;
    this.usadas = {};
    this.mezcla = 0;
  }

  Lexico.prototype.bolsa = function (nivel, materialClave) {
    var lista = (PROFUNDIDAD[Math.min(nivel, PROFUNDIDAD.length - 1)] || []).slice();
    if (materialClave && MATERIAL[materialClave]) lista = lista.concat(MATERIAL[materialClave]);
    return lista;
  };
  Lexico.prototype.disponibles = function (nivel, materialClave) {
    var self = this;
    return this.bolsa(nivel, materialClave).filter(function (f) { return !self.usadas[f]; });
  };
  Lexico.prototype.tomar = function (nivel, materialClave) {
    var libres = this.disponibles(nivel, materialClave);
    if (libres.length > 2) {
      var f = this.rng.pick(libres);
      this.usadas[f] = true;
      return { texto: f, mezclada: false };
    }
    if (this.rng.chance(0.18)) {
      var sinUsar = CITAS.filter(function (c) { return !this.usadas[c.t]; }, this);
      var cita = sinUsar.length ? this.rng.pick(sinUsar) : null;
      if (cita) { this.usadas[cita.t] = true; return { texto: cita.t, mezclada: false, cita: cita.f }; }
    }
    var todas = this.bolsa(nivel, materialClave);
    if (!todas.length) return { texto: "the cell was left speechless", mezclada: true };
    var a = String(this.rng.pick(todas)).split(" ");
    var b = String(this.rng.pick(todas)).split(" ");
    var corte = Math.max(1, Math.floor(a.length * this.rng.float(0.3, 0.7)));
    var mezcla = a.slice(0, corte).concat(b.slice(Math.floor(b.length * 0.4)));
    this.mezcla += 1;
    return { texto: mezcla.join(" ").slice(0, 74), mezclada: true };
  };
  Lexico.prototype.salida = function () {
    var self = this;
    var libres = SALIDA.filter(function (f) { return !self.usadas[f]; });
    var f = libres.length ? this.rng.pick(libres) : this.rng.pick(SALIDA);
    this.usadas[f] = true;
    return f;
  };
  Lexico.prototype.fuga = function () { return this.rng.pick(FUGA); };
  Lexico.prototype.leidas = function () { return Object.keys(this.usadas); };
  Lexico.prototype.restantes = function (nivel, materialClave) { return this.disponibles(nivel, materialClave).length; };
  Lexico.prototype.marcarLeidas = function (lista) {
    (lista || []).forEach(function (f) { this.usadas[f] = true; }, this);
  };

  var api = {
    PROFUNDIDAD: PROFUNDIDAD, MATERIAL: MATERIAL, FUGA: FUGA, SALIDA: SALIDA,
    CITAS: CITAS, MAQUINA: MAQUINA, ERRORES: ERRORES, Lexico: Lexico
  };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.MT_LEXICO = api;
})(typeof window !== "undefined" ? window : globalThis);
