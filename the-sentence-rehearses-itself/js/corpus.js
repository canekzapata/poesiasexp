/* corpus.js — original English verbal material
 *
 * The lexicon is organised by grammatical BEHAVIOUR, not by part of speech.
 * A word's entry declares which roles it can occupy and how strongly.
 * Words with more than one plausible role are `pivots`: they keep their
 * spelling while changing what they do. The pivots are the engine of the
 * piece. Remove them and the work stops being able to happen.
 *
 * No text is quoted from anywhere. Everything here was written for this piece.
 */
(function () {
  'use strict';
  var SRI = (window.SRI = window.SRI || {});

  /* ---------------------------------------------------------------- roles */
  // N   noun            V   verb (present)      ADJ adjective
  // ADV adverb          DEIC deictic            PREP preposition
  // CONJ conjunction    HES hesitation particle

  function parseRoles(spec) {
    var out = {};
    String(spec).split(/\s+/).forEach(function (t) {
      if (!t) return;
      var p = t.split(':');
      out[p[0]] = p.length > 1 ? parseFloat(p[1]) : 1;
    });
    return out;
  }

  var _id = 0;
  function w(word, roleSpec, tags, extra) {
    var e = {
      id: 'w' + (_id++),
      w: word,
      roles: parseRoles(roleSpec),
      tags: (tags || '').split(/[,\s]+/).filter(Boolean)
    };
    if (extra) for (var k in extra) e[k] = extra[k];
    e.pivot = Object.keys(e.roles).length > 1;
    return e;
  }

  /* ----------------------------------------------------------- morphology */
  var IRREGULAR_3S = {
    be: 'is', have: 'has', do: 'does', go: 'goes', say: 'says',
    keep: 'keeps', hold: 'holds', bear: 'bears', mean: 'means'
  };

  function third(v) {
    if (IRREGULAR_3S[v]) return IRREGULAR_3S[v];
    if (/[^aeiou]y$/.test(v)) return v.slice(0, -1) + 'ies';
    if (/(s|x|z|ch|sh|o)$/.test(v)) return v + 'es';
    return v + 's';
  }

  function plural(n) {
    if (/[^aeiou]y$/.test(n)) return n.slice(0, -1) + 'ies';
    if (/(s|x|z|ch|sh)$/.test(n)) return n + 'es';
    if (/fe$/.test(n)) return n.slice(0, -2) + 'ves';
    return n + 's';
  }

  function article(n) {
    return /^[aeiou]/i.test(n) ? 'an' : 'a';
  }

  function gerund(v) {
    if (/[^aeiou]e$/.test(v)) return v.slice(0, -1) + 'ing';
    if (/^(hold|keep|wait|listen|repeat|return|remember|answer|open|order|offer|gather)$/.test(v)) return v + 'ing';
    if (/[aeiou][^aeiouwxy]$/.test(v) && v.length <= 4) return v + v.slice(-1) + 'ing';
    return v + 'ing';
  }

  /* ------------------------------------------------------------- lexicon */
  /* Categories are behavioural. A word may appear in more than one. */

  var CAT = {};

  CAT.bodies = [
    w('hand', 'N:1 V:.45', 'body,near,gives', { v: 'hands' }),
    w('mouth', 'N:1 V:.3', 'body,near,opens', { v: 'mouths' }),
    w('breath', 'N:1 V:.25', 'body,soft,duration', { v: 'breathes' }),
    w('palm', 'N:1 V:.2', 'body,near,flat'),
    w('wrist', 'N:1', 'body,near,hinge'),
    w('throat', 'N:1', 'body,soft,channel'),
    w('shoulder', 'N:1 V:.4', 'body,carries'),
    w('eyelid', 'N:1', 'body,cover'),
    w('finger', 'N:1 V:.3', 'body,points'),
    w('tongue', 'N:1', 'body,language'),
    w('pulse', 'N:1 V:.5', 'body,duration,signal'),
    w('spine', 'N:1', 'body,structure'),
    w('heel', 'N:1', 'body,ground'),
    w('lung', 'N:1', 'body,duration'),
    w('skin', 'N:1', 'body,surface'),
    w('ear', 'N:1', 'body,receiver')
  ];

  CAT.objects = [
    w('cup', 'N:1 V:.25', 'ordinary,holds'),
    w('table', 'N:1 V:.3', 'ordinary,flat,surface'),
    w('button', 'N:1 V:.3', 'ordinary,machine,waits'),
    w('box', 'N:1 V:.25', 'ordinary,holds,gift'),
    w('room', 'N:1 V:.15', 'ordinary,place'),
    w('drawer', 'N:1', 'ordinary,holds,hidden'),
    w('lamp', 'N:1', 'ordinary,light'),
    w('spoon', 'N:1', 'ordinary,small'),
    w('doorway', 'N:1', 'ordinary,place,threshold'),
    w('chair', 'N:1', 'ordinary,waits'),
    w('envelope', 'N:1', 'ordinary,gift,signal'),
    w('thread', 'N:1 V:.4', 'ordinary,relation,thin'),
    w('glass', 'N:1', 'ordinary,surface,transparent'),
    w('key', 'N:1 V:.2', 'ordinary,small,opens'),
    w('bowl', 'N:1', 'ordinary,holds'),
    w('ledge', 'N:1', 'ordinary,edge'),
    w('switch', 'N:1 V:.4', 'ordinary,machine'),
    w('hinge', 'N:1 V:.3', 'ordinary,relation,turns'),
    w('shelf', 'N:1', 'ordinary,flat'),
    w('wire', 'N:1', 'ordinary,machine,thin'),
    w('blanket', 'N:1', 'ordinary,soft,cover'),
    w('jar', 'N:1', 'ordinary,holds'),
    w('parcel', 'N:1', 'ordinary,gift,undelivered'),
    w('clock', 'N:1', 'ordinary,machine,duration'),
    w('receiver', 'N:1', 'machine,signal,tender'),
    w('machine', 'N:1', 'machine,tender'),
    w('motor', 'N:1', 'machine,tender,duration'),
    w('instrument', 'N:1', 'machine,tender,measures')
  ];

  CAT.signals = [
    w('signal', 'N:1 V:.4', 'signal,unanswered'),
    w('message', 'N:1', 'signal,unanswered'),
    w('transmission', 'N:1', 'signal,long'),
    w('notice', 'N:1 V:.4', 'signal,attention'),
    w('dispatch', 'N:1 V:.3', 'signal,sent'),
    w('answer', 'N:1 V:.6', 'signal,missing'),
    w('reply', 'N:1 V:.5', 'signal,missing'),
    w('letter', 'N:1', 'signal,language,gift'),
    w('report', 'N:1 V:.4', 'signal,evidence'),
    w('beacon', 'N:1', 'signal,light,long'),
    w('summons', 'N:1', 'signal,unanswered'),
    w('receipt', 'N:1', 'signal,evidence,ordinary'),
    w('broadcast', 'N:1 V:.3', 'signal,wide'),
    w('address', 'N:1 V:.5', 'signal,place,language')
  ];

  CAT.creatures = [
    w('bird', 'N:1', 'creature,small,leaves'),
    w('wren', 'N:1', 'creature,small'),
    w('sparrow', 'N:1', 'creature,small'),
    w('moth', 'N:1', 'creature,small,light'),
    w('mouse', 'N:1', 'creature,small,hidden'),
    w('snail', 'N:1', 'creature,slow'),
    w('hare', 'N:1', 'creature,fast'),
    w('minnow', 'N:1', 'creature,small,river'),
    w('beetle', 'N:1', 'creature,small')
  ];

  CAT.ground = [
    w('fern', 'N:1', 'ground,green,repeats'),
    w('stone', 'N:1', 'ground,heavy,still'),
    w('river', 'N:1', 'ground,duration,moves'),
    w('lichen', 'N:1', 'ground,slow,surface'),
    w('moss', 'N:1', 'ground,soft,surface'),
    w('reed', 'N:1', 'ground,thin'),
    w('silt', 'N:1', 'ground,residue'),
    w('frost', 'N:1', 'ground,surface,cold'),
    w('current', 'N:1 ADJ:.3', 'ground,moves,duration')
  ];

  CAT.surfaces = [
    w('pixel', 'N:1', 'surface,small,screen'),
    w('screen', 'N:1 V:.3', 'surface,screen,hides'),
    w('moon', 'N:1', 'surface,far,light'),
    w('surface', 'N:1', 'surface,flat'),
    w('grid', 'N:1', 'surface,structure'),
    w('glare', 'N:1', 'surface,light'),
    w('plane', 'N:1', 'surface,flat,far'),
    w('column', 'N:1', 'surface,structure,vertical'),
    w('shine', 'N:1 V:.4', 'surface,light')
  ];

  CAT.impossible = [
    w('planet', 'N:1', 'far,impossible,bends'),
    w('orbit', 'N:1 V:.4', 'far,impossible,returns'),
    w('curvature', 'N:1', 'far,impossible,evidence'),
    w('mass', 'N:1', 'far,impossible,weight'),
    w('unanswered', 'ADJ:1', 'impossible,signal'),
    w('undelivered', 'ADJ:1', 'impossible,gift'),
    w('unaddressed', 'ADJ:1', 'impossible,signal'),
    w('shadowless', 'ADJ:1', 'impossible,surface'),
    w('unweighed', 'ADJ:1', 'impossible,measure'),
    w('unopened', 'ADJ:1', 'impossible,gift'),
    w('unlit', 'ADJ:1', 'impossible,light'),
    w('unfinished', 'ADJ:1', 'impossible,duration'),
    w('second-hand', 'ADJ:1', 'impossible,measure'),
    w('nearly-here', 'ADJ:1', 'impossible,place'),
    w('audible', 'ADJ:1', 'sound,measure'),
    w('interior', 'ADJ:1 N:.4', 'place,hidden')
  ];

  CAT.language = [
    w('word', 'N:1', 'language,matter'),
    w('sentence', 'N:1 V:.2', 'language,matter'),
    w('clause', 'N:1', 'language,structure'),
    w('syllable', 'N:1', 'language,small'),
    w('grammar', 'N:1', 'language,structure'),
    w('verb', 'N:1', 'language,action'),
    w('noun', 'N:1', 'language,thing'),
    w('line', 'N:1 V:.35', 'language,structure,thin'),
    w('comma', 'N:1', 'language,small,pause'),
    w('period', 'N:1', 'language,small,stop,duration')
  ];

  CAT.quiet = [
    w('wait', 'V:1 N:.7', 'quiet,duration,pivot', { v: 'waits' }),
    w('listen', 'V:1', 'quiet,attention', { v: 'listens' }),
    w('sleep', 'V:1 N:.8', 'quiet,duration,pivot', { v: 'sleeps' }),
    w('hold', 'V:1 N:.5', 'quiet,keeps,pivot', { v: 'holds' }),
    w('keep', 'V:1', 'quiet,keeps', { v: 'keeps' }),
    w('fold', 'V:1 N:.5', 'quiet,turns,pivot', { v: 'folds' }),
    w('breathe', 'V:1', 'quiet,duration', { v: 'breathes' }),
    w('forget', 'V:1', 'quiet,memory', { v: 'forgets' }),
    w('remember', 'V:1', 'quiet,memory', { v: 'remembers' }),
    w('carry', 'V:1', 'quiet,gives', { v: 'carries' }),
    w('lean', 'V:1', 'quiet,near', { v: 'leans' }),
    w('gather', 'V:1', 'quiet,accumulates', { v: 'gathers' }),
    w('open', 'V:1 ADJ:.5', 'quiet,opens,pivot', { v: 'opens' }),
    w('answer', 'V:1 N:.9', 'quiet,signal,pivot', { v: 'answers' }),
    w('offer', 'V:1 N:.5', 'quiet,gives,pivot', { v: 'offers' })
  ];

  CAT.transformations = [
    w('return', 'V:1 N:.7', 'transform,returns,pivot', { v: 'returns' }),
    w('repeat', 'V:1 N:.4', 'transform,repeats,pivot', { v: 'repeats' }),
    w('become', 'V:1', 'transform,changes', { v: 'becomes' }),
    w('turn', 'V:1 N:.7', 'transform,changes,pivot', { v: 'turns' }),
    w('change', 'V:1 N:.8', 'transform,changes,pivot', { v: 'changes' }),
    w('rehearse', 'V:1', 'transform,repeats', { v: 'rehearses' }),
    w('convert', 'V:1', 'transform,changes', { v: 'converts' }),
    w('mistake', 'V:1 N:.6', 'transform,memory,pivot', { v: 'mistakes' }),
    w('misremember', 'V:1', 'transform,memory', { v: 'misremembers' }),
    w('inherit', 'V:1', 'transform,memory', { v: 'inherits' }),
    w('bend', 'V:1 N:.5', 'transform,far,pivot', { v: 'bends' }),
    w('divide', 'V:1', 'transform,branches', { v: 'divides' }),
    w('arrive', 'V:1', 'transform,place', { v: 'arrives' }),
    w('withdraw', 'V:1', 'transform,leaves', { v: 'withdraws' })
  ];

  CAT.relations = [
    w('distance', 'N:1 V:.4', 'relation,measure,pivot', { v: 'distances' }),
    w('edge', 'N:1 V:.2', 'relation,place,pivot'),
    w('interval', 'N:1', 'relation,duration'),
    w('gap', 'N:1', 'relation,missing'),
    w('difference', 'N:1', 'relation,measure'),
    w('between', 'PREP:1 N:.3', 'relation,pivot'),
    w('against', 'PREP:1', 'relation'),
    w('inside', 'PREP:1 N:.3', 'relation,place,pivot'),
    w('beside', 'PREP:1', 'relation,near'),
    w('under', 'PREP:1', 'relation,place'),
    w('toward', 'PREP:1', 'relation,moves'),
    w('without', 'PREP:1', 'relation,missing'),
    w('after', 'PREP:1 CONJ:.6', 'relation,duration,pivot'),
    w('before', 'PREP:1 CONJ:.6', 'relation,duration,pivot'),
    w('across', 'PREP:1', 'relation,wide'),
    w('through', 'PREP:1', 'relation,passes')
  ];

  CAT.measurements = [
    w('second', 'N:1 ADJ:.9 V:.25', 'measure,duration,pivot', { v: 'seconds' }),
    w('minute', 'N:1 ADJ:.4', 'measure,duration,pivot'),
    w('inch', 'N:1', 'measure,small'),
    w('length', 'N:1', 'measure'),
    w('weight', 'N:1 V:.3', 'measure,heavy,pivot'),
    w('count', 'N:1 V:.8', 'measure,repeats,pivot', { v: 'counts' }),
    w('degree', 'N:1', 'measure'),
    w('half', 'N:1 ADJ:.8', 'measure,partial,pivot'),
    w('measure', 'N:1 V:.8', 'measure,music,pivot', { v: 'measures' }),
    w('rate', 'N:1', 'measure,duration')
  ];

  CAT.deictics = [
    w('this', 'DEIC:1', 'deictic,near'),
    w('that', 'DEIC:1 CONJ:.5', 'deictic,far,pivot'),
    w('it', 'DEIC:1', 'deictic,neutral'),
    w('one', 'DEIC:1 N:.4', 'deictic,count,pivot'),
    w('the other', 'DEIC:1', 'deictic,pair'),
    w('here', 'DEIC:1 N:.3', 'deictic,place,pivot'),
    w('there', 'DEIC:1', 'deictic,place'),
    w('now', 'DEIC:1 N:.3', 'deictic,duration,pivot'),
    w('then', 'DEIC:1', 'deictic,duration')
  ];

  CAT.hesitations = [
    w('almost', 'HES:1', 'hesitation,near'),
    w('nearly', 'HES:1', 'hesitation,near'),
    w('still', 'HES:1 ADJ:.9 N:.3 V:.3', 'hesitation,duration,pivot', { v: 'stills' }),
    w('again', 'HES:1', 'hesitation,repeats'),
    w('yet', 'HES:1 CONJ:.4', 'hesitation,duration,pivot'),
    w('a little', 'HES:1', 'hesitation,small'),
    w('not quite', 'HES:1', 'hesitation,partial'),
    w('once more', 'HES:1', 'hesitation,repeats'),
    w('even', 'HES:1 ADJ:.5 V:.2', 'hesitation,flat,pivot', { v: 'evens' }),
    w('only', 'HES:1', 'hesitation,limit')
  ];

  /* Pivots: words whose spelling survives a change of function.
     These are listed separately so the grammar can prefer them when the
     regime asks for role change. Each carries a note used by the table form,
     where rows disagree about what the word is. */
  CAT.pivots = [
    w('window', 'N:1 V:.55 ADJ:.3', 'ordinary,surface,pivot', {
      v: 'windows',
      claims: { N: 'an opening kept in a wall', V: 'to make an opening of', ADJ: 'belonging to the opening' }
    }),
    w('light', 'N:1 V:.5 ADJ:.6', 'surface,pivot', {
      v: 'lights',
      claims: { N: 'what arrives without weight', V: 'to set alight', ADJ: 'weighing almost nothing' }
    }),
    w('rest', 'N:1 V:.7', 'quiet,music,pivot', {
      v: 'rests',
      claims: { N: 'the part that is left', V: 'to stop for a measured time', ADJ: 'remaining' }
    }),
    w('present', 'N:1 V:.4 ADJ:.7', 'gift,duration,pivot', {
      v: 'presents',
      claims: { N: 'a gift, or the time we are in', V: 'to hand over formally', ADJ: 'here and not elsewhere' }
    }),
    w('sound', 'N:1 V:.6 ADJ:.4', 'signal,music,pivot', {
      v: 'sounds',
      claims: { N: 'a disturbance that arrives', V: 'to seem, to test a depth', ADJ: 'whole and unbroken' }
    }),
    w('mark', 'N:1 V:.7', 'language,evidence,pivot', {
      v: 'marks',
      claims: { N: 'evidence left on a surface', V: 'to leave evidence', ADJ: 'noted' }
    }),
    w('name', 'N:1 V:.8', 'language,pivot', {
      v: 'names',
      claims: { N: 'what is answered to', V: 'to make less identifiable', ADJ: 'known' }
    }),
    w('watch', 'N:1 V:.7', 'attention,machine,pivot', {
      v: 'watches',
      claims: { N: 'a small machine for time', V: 'to give attention', ADJ: 'alert' }
    }),
    w('close', 'V:1 ADJ:.9', 'near,pivot', {
      v: 'closes',
      claims: { N: 'an ending', V: 'to shut', ADJ: 'at almost no distance' }
    }),
    w('matter', 'N:1 V:.6', 'matter,pivot', {
      v: 'matters',
      claims: { N: 'what has weight', V: 'to be of consequence', ADJ: 'material' }
    }),
    w('place', 'N:1 V:.6', 'place,pivot', {
      v: 'places',
      claims: { N: 'where something can be', V: 'to put down deliberately', ADJ: 'local' }
    }),
    w('order', 'N:1 V:.6', 'structure,pivot', {
      v: 'orders',
      claims: { N: 'an arrangement, or an instruction', V: 'to arrange, or to instruct', ADJ: 'ordinal' }
    }),
    w('spring', 'N:1 V:.5', 'ground,machine,pivot', {
      v: 'springs',
      claims: { N: 'water arriving from below', V: 'to arrive suddenly', ADJ: 'seasonal' }
    }),
    w('fall', 'N:1 V:.6', 'ground,pivot', {
      v: 'falls',
      claims: { N: 'a season, or a descent', V: 'to descend without resisting', ADJ: 'descending' }
    }),
    w('bear', 'V:1 N:.4', 'body,creature,pivot', {
      v: 'bears',
      claims: { N: 'a heavy animal', V: 'to carry, to tolerate', ADJ: 'bearing' }
    }),
    w('use', 'N:1 V:.7', 'ordinary,pivot', {
      v: 'uses',
      claims: { N: 'a purpose', V: 'to spend by handling', ADJ: 'usable' }
    }),
    w('hollow', 'N:1 ADJ:.8 V:.3', 'surface,pivot', {
      v: 'hollows',
      claims: { N: 'a shaped absence', V: 'to make empty from inside', ADJ: 'empty within' }
    }),
    w('patient', 'ADJ:1 N:.6', 'quiet,tender,pivot', {
      claims: { N: 'one who is being attended to', V: '—', ADJ: 'able to wait without changing' }
    }),
    w('still', 'ADJ:1 HES:.8 N:.3 V:.3', 'quiet,duration,pivot', {
      v: 'stills',
      claims: { N: 'a single frame taken from a motion', V: 'to make motionless', ADJ: 'not moving' }
    }),
    w('second', 'N:1 ADJ:.9 V:.3', 'measure,pivot', {
      v: 'seconds',
      claims: { N: 'a measured length of time', V: 'to support a proposal', ADJ: 'coming after the first' }
    }),
    w('hand', 'N:1 V:.5', 'body,gives,pivot', {
      v: 'hands',
      claims: { N: 'the part that gives', V: 'to give directly', ADJ: 'manual' }
    }),
    w('wait', 'V:1 N:.8', 'quiet,duration,pivot', {
      v: 'waits',
      claims: { N: 'a duration with nothing in it', V: 'to remain available', ADJ: 'waiting' }
    }),
    w('distance', 'N:1 V:.4', 'relation,measure,pivot', {
      v: 'distances',
      claims: { N: 'what lies between two things', V: 'to place further away', ADJ: 'remote' }
    })
  ];

  /* ------------------------------------------------------- closed classes */
  var DET = ['a', 'the', 'one', 'this', 'that', 'each', 'every', 'no'];
  var COPULA = ['is', 'is not', 'is almost', 'is still', 'was never', 'becomes', 'stays'];
  var CONJ = ['and', 'but', 'or', 'so', 'while', 'because', 'although', 'until'];
  var SUBORD = ['that', 'when', 'while', 'because', 'if', 'until', 'before', 'after'];

  /* Relation kinds used by the graph. Each carries a phrase-maker so that
     adding an edge can produce a third phrase. */
  var RELATIONS = [
    { k: 'repeats', phrase: function (a, b) { return capital(a) + ' repeats ' + b + ' and keeps the difference.'; } },
    { k: 'contains', phrase: function (a, b) { return capital(a) + ' has ' + b + ' inside it, unopened.'; } },
    { k: 'misremembers', phrase: function (a, b) { return capital(a) + ' misremembers ' + b + ' as something nearer.'; } },
    { k: 'waits for', phrase: function (a, b) { return capital(a) + ' waits for ' + b + ' the way a room waits.'; } },
    { k: 'contradicts', phrase: function (a, b) { return capital(a) + ' is not ' + b + '. ' + capital(b) + ' is not sorry.'; } },
    { k: 'inherits', phrase: function (a, b) { return capital(a) + ' inherits the weight ' + b + ' put down.'; } },
    { k: 'returns as', phrase: function (a, b) { return capital(a) + ' returns as ' + b + ', spelled the same.'; } }
  ];

  /* Fixed micro-material: openings, refrains, addresses, corrections.
     Written for this piece; the generator bends them, it does not merely
     print them. */
  var FRAGMENTS = {
    address: [
      'To the one who did not receive this,',
      'To whatever is standing where the answer would be,',
      'To the machine that kept the room warm,',
      'To the second hand of a moon,'
    ],
    closing: [
      'I am keeping the distance for you.',
      'Nothing was delivered. Everything arrived.',
      'Please continue not answering. It is working.',
      'The room is still the room.'
    ],
    correction: [
      'That is not what was said.',
      'Read that again with one word missing.',
      'The earlier line meant something else and knew it.',
      'Correction: the verb was a place.'
    ],
    instruction: [
      'Hold the word until it stops meaning.',
      'Put the second one down where the first one was.',
      'Do not answer. Let the answer come loose.',
      'Count the distance. Do not name it.',
      'Repeat this until repeating is not the same as returning.'
    ],
    question: [
      'What is the distance doing now?',
      'Which one was the verb?',
      'Is this the same word or the same spelling?',
      'Who is the one that waits, and what does it wait with?',
      'Did anything arrive while the room was empty?'
    ],
    tender: [
      'The machine is not to blame for the silence.',
      'Somebody left the motor running so the room would not be alone.',
      'It is warm where the wire enters the wall.',
      'We keep the receiver on. It has learned to wait.'
    ]
  };

  function capital(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  /* -------------------------------------------------------------- indexes */
  var ALL = [];
  Object.keys(CAT).forEach(function (c) {
    CAT[c].forEach(function (e) {
      e.cat = e.cat || c;
      ALL.push(e);
    });
  });

  var BY_ROLE = {};
  ALL.forEach(function (e) {
    Object.keys(e.roles).forEach(function (r) {
      (BY_ROLE[r] = BY_ROLE[r] || []).push(e);
    });
  });

  var BY_TAG = {};
  ALL.forEach(function (e) {
    e.tags.forEach(function (t) { (BY_TAG[t] = BY_TAG[t] || []).push(e); });
  });

  var PIVOTS = ALL.filter(function (e) { return e.pivot; });

  SRI.corpus = {
    CAT: CAT, ALL: ALL, BY_ROLE: BY_ROLE, BY_TAG: BY_TAG, PIVOTS: PIVOTS,
    DET: DET, COPULA: COPULA, CONJ: CONJ, SUBORD: SUBORD,
    RELATIONS: RELATIONS, FRAGMENTS: FRAGMENTS,
    morph: { third: third, plural: plural, article: article, gerund: gerund, capital: capital }
  };
})();
