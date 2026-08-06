# EDITION AND HASH MODEL

## What a collector owns when the work contains every chamber but no complete reading

**Status:** governing edition document · version 0.1  
**Architecture:** fixed generative artwork, deterministic editions, route-level variation  
**Server requirement:** none

---

## 1. Proposition

The artwork is one fixed system containing:

- the authored corpus;
- the case facts;
- the 256 chamber coordinates;
- the economic rules;
- the hyperstitional transformations;
- the visual and musical grammars;
- the deterministic generator.

An edition does not own one page or one linear story. It owns a particular **epistemic arrangement** of the entire system: which evidence is abundant, which is expensive, which claim is closest to becoming historical and which route through the case initially appears reasonable.

> The edition does not contain a different crime.  
> It contains a different distribution of the means by which the crime can be known.

---

## 2. Proposed edition structure

The preferred model is a finite set of **256 editions**.

Each edition contains the same 256 conceptual chamber positions, but its hash determines a distinct topology, economy, musical subject and documentary emphasis.

```text
WORK
└── 256 EDITIONS
    └── 256 CHAMBER POSITIONS PER EDITION
        └── many reader routes
```

This does not mean 65,536 separately authored pages. The chambers are positions in a shared authored system. Edition variation changes access, relation, state and emphasis.

The supply of 256 editions is a strong proposal, not yet an irreversible production decision. If platform or curatorial conditions require another supply, the model remains valid.

---

## 3. What the collector acquires

The collector acquires:

- a token or certificate identifying one edition;
- a fixed edition seed derived from its immutable token data;
- a reproducible epistemic temperament;
- a particular initial arrangement of the 256 chambers;
- a distinctive musical and visual identity;
- the capacity to share reproducible routes through that edition.

The collector does **not** acquire:

- exclusive access to the authored language;
- the power to rewrite the corpus;
- a private server state;
- control over other readers' routes;
- the authority to declare one hypothesis true;
- a dynamically changing contract;
- the artist's source materials or intellectual property unless separately stated.

The token is provenance for an edition of a work about the instability of provenance. That contradiction should remain visible.

---

## 4. What distinguishes one edition from another

An edition differs along eight coordinated dimensions.

### 4.1 Gravitational evidence

One evidence family becomes the edition's apparent center:

- signature;
- photograph;
- catalog;
- collector;
- file;
- sale;
- artist/witnesses;
- investigator/route.

This evidence receives more links and earlier visibility. It is not necessarily more truthful.

### 4.2 Hyperstitional lead

One claim begins closer to canonization.

Examples:

- the photograph depicts the work;
- the exhibition occurred in 1998;
- Elias Orr was a person;
- Version D preserves Version A;
- the artist intended failure;
- the sale represented independent demand;
- the investigator authored the notes;
- the visitor's route is independent research.

### 4.3 Economic temperament

The edition is archival, speculative, litigious, amnesiac, canonical or forensic. This changes exchange rates and kinds of sacrifice.

### 4.4 Documentary scarcity

Three evidence families are abundant, three expensive, one unstable and one nearly absent.

### 4.5 Grammatical carrier

One mobile word or grammatical class dominates its transformations:

- `preserved`;
- `original`;
- `independent`;
- `recognized`;
- the pronoun `I`;
- question marks;
- quotation marks;
- dates.

### 4.6 Musical subject

A bass contour, metric fault and timbral relationship identify the edition. The visitor alters their state but not their underlying identity.

### 4.7 Visual disposition

The hash determines grid gravity, margin behavior, density range, typographic tension and restrained palette variation.

### 4.8 Unavailable item

One desired object cannot be purchased in that edition. Its absence shapes the investigation.

---

## 5. What remains invariant

All editions must preserve:

- the central crime: retrospective manufacture of origin;
- the valid signature and uncertain signer;
- the unstable relation between token and file;
- the missing catalog pages;
- the first collector's uncertain personhood;
- the circular economic relation;
- the artist's unavailable confirmation;
- the possible fabrication of the investigator;
- the visitor's conversion into evidence;
- all 256 coordinate meanings;
- the authored voice rules;
- the final absence of a definitive culprit;
- the possibility of care, refusal and unresolved contradiction;
- the rule that every transaction changes language or authority.

An edition may hide or recontextualize an invariant. It may not contradict it merely for variation.

---

## 6. Four levels of state

The system separates four kinds of identity.

### Level 1 — Work state

Fixed across all editions.

Contains corpus, rules, coordinate system and code version.

### Level 2 — Edition state

Fixed for one token.

Derived from edition seed and reproducible by anyone viewing that edition.

### Level 3 — Route state

Produced by a reader's decisions.

Stored in or reconstructed from the URL fragment. Shareable without a database.

### Level 4 — Session state

Temporary experience:

- current scroll;
- time spent attending;
- an unsaved hover relation;
- an audio decay;
- ephemeral words not committed to the route.

Session state may disappear when the tab closes.

This distinction is conceptually essential:

> The edition can be reproduced.  
> The route can be inherited.  
> The session cannot be proven to have been experienced.

---

## 7. Seed hierarchy

The generator uses a hierarchy of deterministic seeds.

```text
workSeed
└── editionSeed
    ├── topologySeed
    ├── economySeed
    ├── languageSeed
    ├── visualSeed
    └── musicSeed
        └── route-derived state
```

The work seed identifies the release. The edition seed is derived from immutable token information. Domain-separated sub-seeds ensure that changing a musical function does not accidentally reshuffle literature or prices.

Conceptual rule:

> One origin can produce several systems without allowing those systems to impersonate one another.

---

## 8. Seed source

The preferred edition seed is derived from stable on-chain information available at mint or reveal, such as:

- token hash supplied by the platform;
- token ID combined with contract address and a fixed work salt;
- immutable mint transaction data if reliably exposed by the platform.

The exact source depends on the final platform contract. It must satisfy:

- immutable after reveal;
- reproducible without a private API;
- unique enough across editions;
- available to the artwork at runtime or embedded in its edition URL;
- documented for preservation.

Avoid deriving essential traits from mutable owner address, current price, live block height or external API data.

---

## 9. Why ownership does not change the work

The edition remains the same when transferred.

A new owner receives the same:

- gravitational evidence;
- economic temperament;
- base chamber topology;
- musical subject;
- visual disposition;
- unavailable item.

Transfer changes the token's external provenance, not its internal generative constitution.

This is conceptually cleaner than granting the owner privileged narrative access. The work investigates the authority of ownership without automatically reproducing it.

If ownership is ever displayed, it should appear as optional contextual data and not determine core access.

---

## 10. Public and owner experience

Preferred rule:

> Everyone can read an edition. Ownership identifies custody of the certificate, not custody of the first person.

The owner may receive platform-level presentation or collection status, but the artwork itself does not need a private version.

Reasons:

- no wallet connection is required;
- exhibition visitors can encounter the full literary system;
- preservation does not depend on authentication infrastructure;
- resale does not erase or rewrite prior routes;
- ownership remains an object of inquiry rather than a supernatural permission.

A future optional owner gesture could allow public dedication of one route, but it should not alter the edition seed or corpus.

---

## 11. Edition reveal

At first opening, the edition can present a short diagnostic rather than a rarity chart.

Example:

```text
EDITION 083
DOCUMENTARY TEMPERAMENT: FORENSIC
GRAVITATIONAL EVIDENCE: PHOTOGRAPH
INITIAL CLAIM: EXHIBITION PROBABLE
UNAVAILABLE ITEM: ORIGINAL VOICE NOTE
GRAMMATICAL CARRIER: QUESTION MARK
```

Some properties may remain unnamed until experienced. The collector should be able to discover what distinguishes the edition through reading, not only metadata.

Avoid rarity language such as “legendary” or percentage rankings unless the work is explicitly quoting the Market.

---

## 12. Trait model

Public token metadata may expose a restrained set of traits:

- `Temperament`;
- `Primary Evidence`;
- `Carrier`;
- `Metric Fault`;
- `Unavailable Record`;
- `Initial Historical Position`;
- `Dominant Hypothesis`.

Traits should describe epistemic conditions, not aesthetic collectibles.

Metadata example:

```json
{
  "Temperament": "Forensic",
  "Primary Evidence": "Photograph",
  "Carrier": "Question Mark",
  "Metric Fault": "3+3+2",
  "Unavailable Record": "Original Voice Note",
  "Initial Historical Position": "Active Inquiry",
  "Dominant Hypothesis": "Early Exhibition"
}
```

The final schema must follow platform requirements without reducing the work to traits.

---

## 13. Distribution without rankings

Traits may have unequal frequencies, but the project should not declare a rarity hierarchy.

An absent photograph is not “rarer and therefore better” than an abundant photograph. It creates a different epistemic situation.

Distribution goals:

- every evidence family serves as gravitational center across the set;
- every temperament appears meaningfully;
- unavailable items are distributed without one becoming a jackpot;
- no edition receives universally superior access or resources;
- combinations are checked for literary viability;
- extreme editions remain readable.

Marketplaces may still calculate rarity. The artwork does not endorse their ranking.

---

## 14. Edition balance

Every edition receives equivalent total investigative capacity distributed differently.

For example:

```text
Edition A
high context / low custody / forensic comparison

Edition B
low context / high authority / canonical pressure

Edition C
high attention / inherited liability / unstable files
```

Balance does not mean identical difficulty. It means each edition supports a compelling route and a distinctive form of ignorance.

---

## 15. Deterministic selection

Random-looking choices are made through a seeded pseudorandom generator.

Requirements:

- same edition seed yields the same base edition everywhere;
- choices use stable ordering of source arrays;
- no reliance on runtime `Math.random()` for edition traits;
- sub-seeds are domain-separated;
- algorithm and version are documented;
- test vectors preserve known outputs;
- updates do not silently reroll prior editions.

The precise algorithm will be chosen during technical design. Conceptually, determinism is non-negotiable.

---

## 16. Curated generativity

Pure random combination can create incoherent editions. The generator therefore uses constraints and authored compatibility tables.

Examples:

- an amnesiac edition cannot make every witness unavailable;
- a canonical temperament must retain at least one expensive dissent route;
- a photograph-centered edition cannot expose both image and caption freely;
- a voice-note carrier requires accessible text alternatives;
- a route-centered edition cannot reveal the investigator anomaly in the opening;
- musical tempo range must remain compatible with reading density;
- rare combinations receive authored bridge passages.

The hash chooses within a curated space. It does not excuse weak combinations.

---

## 17. Topology generation

All chambers retain their fixed semantic coordinates. The edition seed determines:

- entry chamber among valid appointment positions;
- which 2–5 links each reachable chamber exposes;
- which temporal links are visible early;
- where market links enter;
- which routes require custody or credibility;
- placement of calm chambers;
- location of investigator anomalies;
- the path toward chamber 255.

The topology generator must obey dramaturgical constraints from the loop document.

It cannot:

- sell testimony before the reader encounters it;
- canonize a claim before some version is proposed;
- reveal the investigator mystery before the artwork case has weight;
- place high-density sequences without clearings;
- make the final report reachable without meaningful sacrifice.

---

## 18. Language variation

The edition seed may choose among authored variants and transformation paths.

It may determine:

- which mobile phrase recurs;
- which voice first carries it;
- which qualification becomes expensive;
- which long passage anchors the case;
- which institutional summary dominates;
- where a pronoun transfer occurs;
- which residual sentence survives the run.

It may not:

- generate unreviewed prose word by word;
- freely substitute technical terminology;
- change core facts;
- imitate a named author's recognizable style;
- combine fragments whose referents no longer make sense.

---

## 19. Musical edition identity

Each edition receives a fixed musical genotype:

- bass interval contour;
- base tempo band;
- metric grouping;
- drum articulation family;
- synth spectrum;
- orchestral absence or color;
- one missing or withheld pitch;
- mapping between evidence families and motifs.

Reader actions produce phenotype:

- selling testimony removes timbral detail;
- canonizing a claim aligns its motif to the grid;
- burning a source leaves resonance;
- liability adds displaced accents;
- route sequence becomes the loop's ostinato.

The edition remains recognizable after different readings.

---

## 20. Visual edition identity

The seed controls a constrained system:

- grid orientation and gravitational direction;
- proportion of dense to open cells;
- typography scale within accessibility bounds;
- rule-line weight;
- one accent hue or material tint;
- speed and curvature of word transfer;
- behavior of canonical cells;
- geometry of the unavailable item.

Avoid superficial palette rarity. Visual traits must correspond to epistemic temperament.

Examples:

- canonical editions have clean fields and expensive hidden dissent;
- amnesiac editions leave large residues and breathing empty cells;
- forensic editions emphasize comparison lines and marginal notation;
- speculative editions allow prices and buttons to crowd the grid.

---

## 21. Route identity

Different readers of the same edition produce different routes.

A route is defined by:

- chamber sequence;
- choices;
- resources gained and spent;
- evidence retained and surrendered;
- mobile words and punctuation;
- accepted hypotheses;
- liability;
- loop count.

The route does not modify the token. It creates a reproducible reading state encoded in the URL.

> The edition owns all its possible futures.  
> A route is one future rewritten as a past.

---

## 22. Route signatures

The browser can derive a short route fingerprint from serialized state.

Example:

```text
EDITION 083
ROUTE 7F2A–19C0
CHAMBERS VISITED 24
CONTEXT SURRENDERED 37
LIABILITY 4
STATUS INHERITED / UNSIGNED
```

This fingerprint is not cryptographic proof of human experience. It identifies a reproducible state.

The work must state the distinction plainly.

---

## 23. Shareable routes

When a route URL is shared, another reader receives:

- the edition;
- the consequences of prior choices;
- the existing portfolio;
- receipts;
- route classification;
- inherited liability.

They do not receive:

- proof of who made the choices;
- time previously spent;
- lost session-only language;
- subjective attention;
- ownership of the token.

The receiving screen may say:

> You have inherited a sequence of consequences.  
> No evidence establishes that you caused them.

---

## 24. Canonical routes

The artwork should not declare one correct route. However, the artist, collector or gallery may publish selected route links as readings.

These are not superior states. They are curated paths with declared provenance.

Possible labels:

- artist route;
- exhibition route;
- collector route;
- witness-preserving route;
- maximum-liability route;
- route in which no original is established.

Publishing a route demonstrates how curation turns navigation into authority.

---

## 25. The collector and public routes

The owner may optionally designate one shared route as the edition's currently exhibited reading.

Safeguards:

- designation does not alter edition seed;
- prior designations remain citeable if preserved externally;
- the public can restart from base edition;
- designation is clearly distinguished from truth;
- core experience remains accessible without wallet verification;
- a static fallback can encode the designated route in an ordinary link.

This feature is optional and may require platform support. The artwork does not depend on it.

---

## 26. Transfer of token

Upon resale:

- token provenance records a new owner externally;
- edition traits remain unchanged;
- public routes remain valid if their hosting remains stable;
- local session histories do not transfer automatically;
- owner-designated route may be reconsidered only if such a feature exists;
- no pronoun or core text changes merely because ownership changed.

The work refuses the equation:

```text
new owner = new narrator
```

Ownership grants custody of the certificate, not exclusive custody of the case.

---

## 27. Contract stability

The preferred contract is fixed after deployment apart from platform-standard transfer mechanics.

The generative artwork should not require:

- mutable narrative storage;
- an administrator changing traits;
- oracle updates;
- live price feeds;
- server-side route databases;
- centralized reveal substitutions after finalization.

If metadata hosting is external, preservation strategy must ensure that edition seeds and essential files remain recoverable.

---

## 28. Artwork package

The preserved package should contain:

- HTML entry point;
- CSS;
- JavaScript generator;
- authored corpus data;
- optional local audio samples;
- deterministic synthesis rules;
- edition configuration method;
- version manifest;
- hash algorithm documentation;
- test vectors;
- accessibility settings;
- plain-text fallback or reading archive.

The work should remain inspectable as files. Its conceptual dependence on links does not justify technical obscurity.

---

## 29. Versioning

The artwork code may need bug fixes. Versioning must distinguish repair from reroll.

Allowed preservation updates:

- accessibility improvements;
- browser compatibility fixes;
- performance corrections;
- repairs that preserve deterministic outputs;
- clearly documented audio fallback changes.

Changes requiring a new version or release:

- different seed algorithm;
- changed edition traits;
- rewritten chamber coordinates;
- altered case facts;
- new economic outcomes;
- corpus changes that modify existing route meaning.

Known-edition test vectors should detect accidental drift.

---

## 30. Test vectors

Before release, record expected outputs for selected edition IDs.

Example conceptual fixture:

```text
EDITION 000
center: signature
temperament: archival
carrier: preserved
unavailable: first collector outside ownership
entry: 184

EDITION 083
center: photograph
temperament: forensic
carrier: question mark
unavailable: original voice note
entry: 184

EDITION 255
center: investigator-route
temperament: canonical
carrier: I
unavailable: investigator body
entry: 248
```

Final values will be produced by the implemented generator, not manually promised now.

---

## 31. Exhibition mode

A gallery presentation may choose one edition or cycle among a small declared set.

Preferred behaviors:

- kiosk begins from an edition's base state after inactivity;
- visitors can generate a QR code or short link for their route;
- headphones or focused directional sound protect reading;
- ownership is not required for participation;
- wall text distinguishes edition from route;
- no claim is made that local interactions modify the blockchain;
- reset is described as loss of session relation, not destruction of on-chain data.

The gallery can exhibit the current collector's edition without restricting online reading of it.

---

## 32. Marketplace presentation

The thumbnail or preview should not reduce the work to one attractive generative image.

Possible representation:

- 16 × 16 chamber grid in its edition disposition;
- primary evidence visible as gravitational distortion;
- one moving word demonstrating custody;
- short diagnostic traits;
- a silent or optional musical preview;
- direct entry into the reading.

The listing description should explain:

> Each token fixes one epistemic arrangement of a shared literary system. Reader decisions produce routes but do not alter the token.

---

## 33. Conceptual paradoxes to preserve

- The token certifies an edition of a work skeptical of certification.
- The hash guarantees reproducibility of a case about unstable origins.
- All chambers exist, but no reader can possess them simultaneously.
- The owner owns an edition whose central literature remains publicly readable.
- A shared route reproduces consequences without proving experience.
- Transfer changes external provenance without changing internal truth.
- Determinism produces different pasts from the same fixed system.

Do not resolve these paradoxes with marketing language. They are the work.

---

## 34. Acceptance tests

The model succeeds if:

- a collector can understand what distinguishes their edition;
- the distinction affects knowledge, language, sound and navigation;
- all editions remain recognizably the same artwork;
- no edition is ranked as objectively superior;
- the hash deterministically reproduces traits;
- ownership is not required for core reading;
- resale does not reroll or rewrite the edition;
- route URLs preserve consequences without a server;
- session experience remains meaningfully ephemeral;
- authored prose is never replaced by random text generation;
- platform failure does not make the conceptual files unintelligible;
- the contract can remain fixed.

---

## 35. Final edition rule

The hash does not decide what happened.

It decides which forms of evidence will be easiest to mistake for what happened.

> Every edition contains the same unresolved crime.  
> What differs is the architecture of persuasion.

