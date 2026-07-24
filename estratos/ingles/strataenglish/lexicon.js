/* ------------------------------------------------------------------ *
 * Strata that think — POETIC LEXICON
 *
 * This file holds only the generator's phrases, organized by zones
 * of the world. Edit, add or remove verses freely: the engine
 * (estratos.js) reads them from here.
 *
 * Soft rules:
 *  - short phrases (they fit better; wrapped over max. 3 lines)
 *  - each phrase in quotes, separated by a comma
 *  - this file must load BEFORE estratos.js (see index.html)
 *
 * Note: the zone keys below (sky, mountain, forest, shore, sea,
 * abyss, tectonic, desierto, pantano, hielo) are internal identifiers
 * shared with estratos.js — do NOT rename them, only edit the phrases.
 * ------------------------------------------------------------------ */

const lexicon = {
  sky: [
    "a sky with no center", "a cloud not yet falling", "light always arrives late",
    "we watch stars long gone dark", "each eye opens its world",
    "the air is a shared lung", "to breathe is to owe the air",
    "the sky has no inside", "the open cannot be owned",
    "the horizon flees as you walk", "wind is inferred, not seen",
    "blue is dust and detour", "height: another kind of far",
    "a bird inscribes and erases", "a flock decides, with no leader",
    "flight that writes", "a bird without a map", "the universe in a drop",
    "'animal' holds a breath", "spirit and respire, one root",
    "you breathe atoms of other centuries", "the atmosphere is an agreement",
    "to consider: to think with the stars", "to desire: to miss a star",
    "my tongue draws my sky", "air enters a stranger, leaves as yours",
    "the wind rehearses its routes", "every wing is a folded map"
  ],
  mountain: [
    "time is read in layers", "the slow is also violent",
    "each stratum is a date", "the mountain was once the sea floor",
    "fossils: letters with no address", "metamorphosis in no hurry",
    "to climb is to read backward", "the summit lasts less than the wind",
    "all relief is a slow wound", "the solid was liquid, will be dust",
    "the patience of the mineral", "stacked time", "the solid flows",
    "the boundless, from which all comes", "one slight swerve and the world begins",
    "far from equilibrium, form is born", "rock is lava with memory",
    "every peak is a permission of time", "what weighs, lasts"
  ],
  forest: [
    "a forest of signals", "life without a model", "to live is to keep making oneself",
    "the leaf writes with light", "the green invents sugar",
    "a tree eats light and time", "to grow is to remember upward",
    "a seed is a hypothesis", "the forest links, it does not add",
    "the root negotiates, it does not conquer", "humus and human, same root",
    "every organ was once a tool", "the fern unfurls",
    "a flower bets on the sun", "the living branches out",
    "the mycelium remembers", "mycorrhizae that negotiate",
    "a mushroom is the edge of the net", "the forest shares through the root",
    "hyphae that calculate", "spores without permission",
    "fungi translate between roots", "make kin with the forest",
    "becoming-with, never alone", "companion species",
    "neither nature nor culture", "symbiosis beneath the soil",
    "the net has no owner", "biology: to give life a word",
    "ecology: the logic of the house", "the beaver is also its dam",
    "the leaf captured a bacterium of light", "to eat is to inherit borrowed sun",
    "no body is one: holobiont", "to grow is to defer form",
    "each thing perseveres in its being", "genes, too, are lent",
    "symbiosis is the plot, not the detail",
    "the deer listens with its skin", "the willow combs the shore"
  ],
  shore: [
    "neither sea nor land: shore", "the edge is where something decides to be",
    "to individuate: never to finish", "between two states, the possible",
    "every limit is porous", "the tide conjugates the water",
    "a sign is born in the margin", "the sand archives what it erases",
    "what the tide forgets", "the shell keeps an echo",
    "the crab hesitates sideways", "individual: the not-yet-divided",
    "symbol: what is thrown together", "the symbolic joins, the diabolic splits",
    "rivals: those who share a river", "the tide is not owned, it is awaited",
    "every threshold takes a toll", "the turtle carries its slow house"
  ],
  sea: [
    "blood remembers the sea", "we were plankton before we were name",
    "to metabolize: to steal order from chaos", "the wave moves form, not water",
    "a cell is a stubborn border", "the current is a syntax",
    "to salt is to keep an origin", "a microbe made the oxygen",
    "pelagic bodies", "water has a memory",
    "a shoal decides with no center", "the octopus thinks with its arms",
    "eight ideas at once", "one arm decides alone",
    "you drink a dinosaur's water", "we are carbon that learned to ask",
    "life chose a single hand", "energy is paid in one coin",
    "to inform is to reduce surprise", "the river stays by changing",
    "the eye was invented many times", "plankton: the world's blue lung",
    "the whale archives songs", "to swim is to think in curves",
    "the seahorse anchors the current"
  ],
  abyss: [
    "self-made light where there is no sun", "to speak with light in the dark",
    "a sign with no witness — does it mean?", "the eye is surplus without light",
    "pressure, too, gives form", "life that never knew the day",
    "the deep needs no above", "no one touches the bottom",
    "life beneath life", "light that never arrives", "ink that writes fear",
    "the universe in a few cells", "thinking is tentacular",
    "tentacles that ask", "kinships in the deep",
    "the Chthulucene entangles", "eight hearts beat", "a jellyfish with no center",
    "a virus is a sentence without a verb", "the virus borrows your voice",
    "everything feels something of everything", "the face asks before it speaks",
    "the dark is not the empty", "what glows below, calls",
    "no depth fully contains itself"
  ],
  tectonic: [
    "there are no things, only events", "being is a slow verb",
    "a single matter, a thousand modes", "four letters are enough for a body",
    "a chain that reads itself", "the copying error was named species",
    "life defers entropy", "to die is to be shared out",
    "we were many before we were one", "the mitochondrion was once a guest",
    "the code does not know it is code", "matter and sign, one same plane",
    "'to read' once meant 'to gather'", "'text' was once 'textile'",
    "the dust keeps instructions", "the soil is a book of hours",
    "what is kept is the difference, not the thing", "roots of signal",
    "cables like algae", "a sunken archive", "the system dreams with no center",
    "everything translates into variation", "an end that continues",
    "memory has no bottom", "a cell contains a sky",
    "the tiniest repeats the immense", "each grain holds a galaxy",
    "dust that was a star", "an atom remembers the sea",
    "scale folds", "a number that blooms", "the inorganic awakens",
    "form doubts itself", "everything is made of the same",
    "the mycelium links the underground", "nothing makes itself alone: sympoiesis",
    "to decompose is also to create", "the rotten feeds the net",
    "we are humus, we are compost", "staying with the trouble",
    "the string figure among species", "the underground net remembers",
    "to respond is to become-with", "living and dying with, on damaged ground",
    "odd kinships, odd alliances", "time is not counted, it is lasted",
    "truth: what stops hiding itself", "a metaphor asleep in every word",
    "the cipher was born from the void", "algebra: to reunite the broken",
    "the effect returns upon its cause", "to die in time is also to live",
    "to age is to lose copies", "more foreign than one's own",
    "the sun gives without receiving", "logos: to gather and to say",
    "to narrate and to know, kin", "matter is slow, not mute",
    "carbon signs all that lives", "to interpret down to the bone"
  ],
  desierto: [
    "scarcity refines form", "the desert edits the superfluous",
    "to last on little water, an ethics", "to live at the minimum is not to live less",
    "the dune is time with a shape", "the sand was rock, will be glass",
    "the mirage does not lie about thirst", "the viper traces a sign",
    "the dry lives too", "a lizard lying in wait",
    "the desert forgives no ornament", "less water, more decision",
    "the cactus rewrote the leaf as a thorn", "thirst teaches geometry",
    "the palm promises shade", "the sand travels without a body"
  ],
  pantano: [
    "the impure is fertile", "to ferment: to think with bacteria",
    "neither solid nor liquid: mud", "the stagnant is not still",
    "to decompose is to redistribute", "the mixture precedes the form",
    "mud that archives", "between water and earth",
    "the heron waits for a datum", "a dragonfly with no fixed course",
    "a root that breathes mud", "the mucosa is a city",
    "bacteria vote by number", "to rot is to share out again",
    "neither water nor earth: a third state", "the viscous, too, has a law",
    "the bubble rises: the bottom speaks"
  ],
  hielo: [
    "cold does not kill: it suspends", "latency: life on pause",
    "the crystal orders without thinking", "ice keeps ancient air",
    "time stopped, not lost", "below zero, metabolism whispers",
    "the frozen waits for another era", "the floe drifts", "silence below zero",
    "the ice core keeps climates", "to sleep a thousand years and go on",
    "the cheap order of cold", "the still accumulates time",
    "under the ice, life waits its turn",
    "each flake archives its hexagon", "snow erases and enumerates"
  ]
};
