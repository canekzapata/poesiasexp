
'use strict';

// =============================================================
//   POOLS  ::  todo el contenido vive acá — extensible sin tocar motor
// =============================================================

const POOLS = {
  // adjetivos poéticos que califican componentes
  adj: [
    'lírico','de duelo','abierto','imposible','tibio','recursivo',
    'memorioso','sin permiso','autoreferente','futuro','pendiente',
    'no firmado','huérfano','desbordado','silente','ansioso',
    'paciente','sin envío','al revés','herido','desclasado',
    'cómplice','pre-verbal','crepuscular','sin retorno','sostenido',
    'que olvida','que insiste','del padre','del pueblo','del cuerpo',
    // expansión — registro corporal/erótico
    'de la piel','sin contacto','en celo','después del beso','antes del beso',
    'de la nuca','del muslo','de la boca','de la respiración',
    'del sudor','del temblor','del aliento','del lunes','de las cinco',
    'post-coital','pre-erótico','intermitente','del verano',
    'de la espera','del exilio','del retorno','del afuera',
    'mojado','seco','encendido','apagado','en penumbra',
    'analfabeto','políglota','sin patria','exiliado','sin idioma',
    'lleno','casi vacío','casi lleno','del domingo',
    'del padre muerto','de la madre vieja','del hijo no nacido',
    'que se desvanece','que no termina','que vuelve siempre',
    'fronterizo','marginal','periférico','del centro',
  ],

  // unidades — algunas reales, algunas imposibles
  unit: [
    'Ω','kΩ','MΩ','µF','nF','pF','mH','µH',
    'Hz','kHz','MHz','V','mV','dB','β','ε₀',
    'ms','µs','mV/°C','Np','Wb','S','dBm','π',
    // expansión
    'rad/s','N/C','lm','lx','K','°','psi','tesla','J','J/K',
    'Pa','m/s²','%','bpm','dpi','C/kg','ppm','poética',
  ],

  // tipos de componente — reales + mutaciones
  compType: [
    'R','C','L','D','Q','A','X','M','Y','Z','N','B','S','F','T','U','P',
    'R*','C∞','L?','Mφ','Qβ','Aₒ','Xπ',
    // expansión — mutaciones nuevas
    'Rₛ','C∅','Lω','M*','P★','Yλ','Q♀','Q♂','Aᵢ','D±','Cε','Lτ',
  ],

  source: [
    'el deseo','la pregunta','la noche','el insomnio',
    'la voz primera','el pulso','una corriente sin nombre',
    'la chispa antes del nombre','aquello que late en lo oscuro',
    'la fuente que no se nombra','el sol de la tarde',
    'el deseo alterno (ir y venir)','lo que despierta antes de mí',
    'la energía sin factura','la chispa en el dieléctrico',
    // expansión — corporal / cotidiano / cósmico
    'el cuerpo que despierta','la piel después del agua',
    'el aliento antes del verbo','la boca antes del nombre',
    'el primer parpadeo del día','lo que late entre dos cuerpos',
    'el rumor de la sangre','el inicio del verano',
    'una llamada que no se hizo','el correo sin abrir',
    'la mañana antes del café','la radio del taxi',
    'el viento sur','la lluvia que no termina',
    'el padre durmiendo','la madre cantando bajito',
    'el barrio recién amanecido','el primer mensaje del día',
  ],

  load: [
    'el silencio','la tierra','la madrugada','el cauce final',
    'el cero compartido','la cama vacía','la página en blanco',
    'el reposo del cuerpo','donde acordamos no preguntar',
    'el mar al amanecer','el punto que cierra el verso',
    'la GND donde todo descarga',
    // expansión
    'el cuerpo que descansa','la piel sin temperatura',
    'el dormitorio vacío','el lado frío de la cama',
    'el último gesto antes de dormir','la respiración pausada',
    'el archivo cerrado','el saldo nocturno',
    'la luz apagada','el silencio del barrio',
    'el último mensaje no contestado','la línea ocupada',
  ],

  ticker: [
    '[STATUS] flux: locked  ·  S/N: solid',
    '[NET]    handshake: meh  ·  protocol: undefined',
    '[CACHE]  miss · miss · hit · meditation',
    '[KITTLER] hardware = lenguaje',
    '[CHUA]   M(q) updated  ·  q += ∫i dt',
    '[BERGSON] durée: incuantificable',
    '[ERR]    deseo over impedance — match failed',
    '[OK]     gramática parseada  ·  semántica TBD',
    '[ECHO]   VSWR = ∞ — la fuente recibe su propia voz',
    '[VIBE]   (((((( ok ))))))',
    '[META]   esta señal es leída por una entidad indeterminada',
    '[FLUX]   dq/dt ≠ 0 — algo se está moviendo',
    '[HUYGENS] dos péndulos enganchados',
    '[STIEGLER] tertiary retention engaged',
    '[OLIVEROS] qué dejar pasar  ·  qué dejar caer',
    '[FESSENDEN] portadora estable  ·  1906',
    '[PRIGOGINE] estructura disipativa OK',
    '[HOOK]   on_resonance: emit(meaning)',
    '[BUF]    78%  ·  ·  ·  derramando',
    '[SCAN]   ventana [0.3 .. 0.7]  ·  fuera',
    '[MEM]    huella iónica detectada',
    '[CLK]    tick · tock · tick · tock',
    '[Δφ]     0.85 → 0.42 → 0.10 → LOCKED',
    '[BAT]    73%  ·  paciencia comprimida',
    '[WARN]   sobremodulación m > 1',
    '[FERMI]  paradoja en buffer secundario',
    '[SIM]    onda estacionaria en ventana 3',
    '[GAIN]   Av = -gm·Rc  ·  un susurro mueve un grito',
    '[ANT]    radiando broadside  ·  CMB always there',
    '[BOOT]   Vcc estable a los 47ms',
    // expansión — corporal + teoría + glitch nostálgico
    '[BODY]   pulso 72 bpm  ·  estable',
    '[FREUD]  superyó offline  ·  ello en buffer',
    '[LACAN]  petit a no entregable',
    '[BARTHES] punctum detectado',
    '[ADORNO] negativa dialéctica engaged',
    '[BUTLER] performatividad en loop',
    '[ARENDT] vita contemplativa: idle',
    '[STARRY] ráfaga cósmica @ 408 MHz',
    '[GAIA]   Schumann @ 7.83 Hz  ·  estable',
    '[CRT]    phosphor decay: nominal',
    '[VHS]    drop-out @ frame 17283',
    '[404]    deseo not found',
    '[418]    I\'m a teapot · still brewing',
    '[SYNC]   horizontal hold: temblando',
    '[ROUTING] paquete extraviado en Tigre',
    '[QUEUE]  47 retransmisiones pendientes',
    '[MIDI]   nota colgada · C#4 sustain ∞',
    '[OSC]    /pulse/heart 0.72',
    '[ADC]    overrange · saturando',
    '[DSP]    convolución con el silencio',
    '[ANZALDÚA] frontera @ Z_0 = ?',
    '[LISPECTOR] G.H. cargada al borde',
    '[PIZARNIK] noche con f₀ propia',
    '[GLISSANT] opacidad como salvoconducto',
    '[CALVINO] ciudad invisible · ruta indefinida',
  ],

  cita: [
    'antes del mensaje, la fase.',
    'amplificar lo que no debería escucharse.',
    'el oscilador no pregunta — sólo pulsa.',
    'cuando el balance se cumple, callamos.',
    'la materia escribe sin programa.',
    'todo lo continuo es PWM bien filtrado.',
    'rectificar es enderezar la fuerza.',
    'el espacio entero es una sola antena.',
    'la duda, eléctricamente, también es memoria.',
    'f₀ no se busca — se encuentra.',
    'la copia pierde aura pero gana circulación.',
    'el integrador no responde — acumula.',
    'una cosa para entrar, otra para salir.',
    'GND es donde acordamos no preguntar.',
    'el filtro no censura — pondera.',
    'adaptar la impedancia es un acto amoroso.',
    'antes de la fase, el querer.',
    'el transistor es la primera materia que escucha.',
    'cada cuerpo tiene su f₀.',
    'kT/q ≈ 25.85 mV — la voz mínima.',
    // expansión
    'todo amplificador es promesa.',
    'todo filtro es decisión.',
    'todo oscilador es vértigo.',
    'lo que llamamos voz es presión modulada.',
    'lo que llamamos memoria es dieléctrico cargado.',
    'lo que llamamos deseo es corriente sin destino.',
    'la fase es la única honestidad temporal.',
    'rectificar nunca es traducir.',
    'GND es promesa de regreso.',
    'Vcc es promesa sin pregunta.',
    'entre dos cuerpos vibra una onda estacionaria.',
    'todo amor de larga distancia es un canal desadaptado.',
    'el cuerpo es el primer canal.',
    'tocar es hacer contacto eléctrico con el otro.',
    'respirar es PWM mecánico.',
    'el insomnio es overflow del integrador.',
    'la espera es un capacitor cargándose hacia ε₀.',
    'todo verso es una transmisión sin acuse de recibo.',
    'la duda mide en mV.',
    'el silencio tiene impedancia infinita.',
  ],

  glosa: [
    'Kittler: hay hardware en el lenguaje.',
    'Stiegler: tertiary retention.',
    'Maturana: autopoiesis eléctrica.',
    'Prigogine: estructura disipativa.',
    'Spinoza: omnis determinatio est negatio.',
    'Latour: dato como montaje.',
    'Bergson: chronos vs durée.',
    'Cage 4\'33"  el silencio ya oscila.',
    'Oliveros: deep listening.',
    'Haraway: infraestructura electromagnética.',
    'Bashō habría amado el cuarzo a 32 768 Hz.',
    'Penzias-Wilson: el universo a 2.725 K.',
    'Hertz 1886: la primera onda sin hilo.',
    'Chua 1971: la materia con biografía.',
    'Bell Labs 1947: la materia que escucha.',
    'Flusser: el aparato reescribe el código.',
    'Fessenden 1906: una voz sobre la onda.',
    'Whitehead: presente = prensión de lo pasado.',
    // expansión — autoras latinoamericanas / no-canon / cuerpo
    'Anzaldúa: la frontera como impedancia.',
    'Glissant: opacidad como protección de la señal.',
    'Lispector: lo que vibra antes del verbo.',
    'Pizarnik: la noche también tiene su f₀.',
    'Lemebel: el cuerpo como antena pública.',
    'Tarkovski: el plano largo como capacitor del espectador.',
    'Iturbide: la luz a 625nm tiene rostro.',
    'Berger: ver es elegir el espectro.',
    'Le Guin: el mensaje siempre llega tarde.',
    'Calvino: ciudades como circuitos de deseo.',
    'Lévi-Strauss: el mito como filtro paso-bajas.',
    'Benjamin: aura = histéresis del original.',
    'Mariátegui: la energía no se reparte por igual.',
    'Sontag: fotografiar es muestrear el tiempo.',
    'Said: orientalismo como aliasing cultural.',
    'Fanon: la piel también es interfaz.',
    'Krenak: ideas para postergar el fin del mundo.',
  ],

  formula: [
    'V = IR','i = C·dV/dt','V = L·dI/dt',
    'f₀ = 1/(2π√LC)','τ = RC','Q = ω·L/R',
    'Av = −gm·Rc','BW = 2·fm','VSWR = (1+|Γ|)/(1−|Γ|)',
    'E = h·f','λ = c/f','kT/q ≈ 25.85 mV',
    'Vout = D·Vin','M(q) = dφ/dq','σ² = 4kTRΔf',
    '|A·β| ≥ 1','Δφ → 0','I·R = V (siempre)',
    'V(t) = V₀·e^(−t/τ)','f = 1/T','duty = Th/T',
    'Γ = (ZL−Z₀)/(ZL+Z₀)','R_rad ≈ 73Ω','G ≈ 2.15 dBi',
    // expansión — física + quantum + termodinámica
    'P = V·I·cos(φ)','ε = −dΦ/dt','∇·E = ρ/ε₀',
    '∇×B = µ₀J','S = k·ln(W)','F = qE + qv×B',
    'λ_dB = h/p','ΔE·Δt ≥ ℏ/2','ψ(x,t) = Ae^(i(kx−ωt))',
    'P(t) = P₀·e^(−λt)','i = Is·(e^(V/Vt)−1)',
    'BER = ½ erfc(√(Eb/N₀))','c² = 1/(µ₀ε₀)',
    'F = G·m₁m₂/r²','τ_½ = ln(2)/λ',
    'L·dI/dt + R·I = V','dU = TdS − pdV',
  ],

  kaomoji: [
    '(◉_◉)','(○_○)','(¬_¬)','¯\\_(ツ)_/¯',
    '(˃ᴗ˂)','(☀_☀)','(◔‿◔)','(._.)','(⌐■_■)',
    '(((vibe)))','((( ok )))','(┛◉Д◉)┛彡┻━┻','(◕‿◕)',
    // expansión
    '(◑‿◐)','(￣ω￣)','( ˘ω˘ )','ᕕ( ᐛ )ᕗ',
    'ʕ•ᴥ•ʔ','( ´_ゝ`)','(￣ヘ￣)','(づ｡◕‿‿◕｡)づ',
    '(✿◕‿◕)','(◞‸◟)','(>_<)','(✧ω✧)',
    '((( S )))','[redacted]','{ tbd }','<silence>',
  ],

  conector: [
    'y','hacia','entonces','porque','como si',
    'después','al fin','a través de','contra',
    'atravesando','hasta','al pasar por','cuando',
    'mientras','tras','que cae sobre','sin saber por qué',
    // expansión
    'rumbo a','huyendo de','sin más razón que','porque sí',
    'salvo cuando','incluso si','a pesar de','según',
    'frente a','junto con','sin contar con','ya casi',
    'apenas','recién','desde que','antes que',
  ],

  // ── pools nuevos ────────────────────────────────────────────

  // verbos poéticos para acciones de componentes
  verbo: [
    'disipa','acumula','amplifica','atenúa','rectifica',
    'filtra','resuena','decide','atraviesa','rebota',
    'almacena','olvida','recuerda','duda','elige',
    'desaparece','aparece','intermitente','fluye','se quiebra',
    'se sostiene','se descarga','se calla','escucha','responde',
    'irradia','recibe','transmite','reconoce','demora',
  ],

  // épocas / lugares — anclas históricas
  epoch: [
    'Karlsruhe 1886','Bell Labs 1947','Holmdel 1965',
    'La Haya 1665','Brant Rock 1906','Stanford 1971',
    'Buenos Aires 1976','México DF 1985','Berlin 1989',
    'Palo Alto 2008','Manchester 1888','Pasadena 1932',
    'Cambridge 1909','Princeton 1948','Pisa 1583',
    'mañana','la madrugada','la sala 7','el estudio',
    'el conurbano','la pampa','el delta','la frontera',
  ],

  // ráfagas cortas — para floaters
  ping: [
    'ping','pong','sync','lock','clk','tick','tock',
    'hi','lo','on','off','set','clr','err','ok',
    'ack','nack','req','rep','rdy','wait','run','idle',
    '∿','⊕','∅','▲','■','×','∫','⊥','≈','→',
  ],
};

// ── expansión v7 :: sonido, ritmo, síntesis ──────────────────
POOLS.adj.push(
  'sincopado','a contratiempo','en bucle','desafinado','cuantizado',
  'sin cuantizar','de cinta magnética','modular','de baja frecuencia',
  'saturado','con reverb larga','en mute','de la caja de ritmos',
  'filtrado','con eco','en fase','fuera de fase','de onda cuadrada',
  'que repica','metronómico','arrítmico','del compás perdido',
);
POOLS.verbo.push(
  'sincroniza','cuantiza','satura','modula','barre','pulsa',
  'repite','samplea','distorsiona','secuencia','enclava','deriva',
);
POOLS.compType.push('VCO','VCF','VCA','LFO','SEQ','ENV','DLY','VOX','CLK','MIX');
POOLS.unit.push('cents','steps','LFO/s','dB SPL','semitonos','compases');
POOLS.source.push(
  'el primer golpe del compás','la cinta que gira sin fin',
  'el oscilador recién encendido','un metrónomo en otra pieza',
  'el zumbido de 50 Hz de la pared','la nota pedal que no cesa',
);
POOLS.load.push(
  'el silencio entre dos golpes','la cola de un reverb que se apaga',
  'el último step del secuenciador','la cinta llegando a su final',
  'el fundido a negro del sonido',
);
POOLS.ticker.push(
  '[SEQ]    16 pasos · compás cerrado',
  '[VCO]    sawtooth caliente · sin afinar',
  '[VCF]    cutoff barriendo el deseo',
  '[ADSR]   release tendiendo a infinito',
  '[GATE]   on · off · on · duda',
  '[CLAP]   reverb de gimnasio vacío',
  '[MOOG]   resonancia al borde de aullar',
  '[TR-808] cassette del conurbano',
  '[PATCH]  cable suelto · hum @ 50 Hz',
  '[VOCODER] la voz pasa por el peine de bandas',
  '[SIDECHAIN] el kick respira por todos',
  '[BPM]    pulso del compás: estable',
  '[DRUM]   máquina sin baterista',
  '[TAPE]   wow & flutter dentro de norma',
  '[QUANTIZE] el error rítmico, perdonado',
  '[MUTE]   canal 3 en silencio voluntario',
  '[REICH]  fase deslizándose · +2 ms',
  '[ENO]    sistema que se cuida solo',
);
POOLS.cita.push(
  'la percusión es el reloj que sí confiesa.',
  'todo beat es una decisión que se repite.',
  'el silencio entre dos golpes también suena.',
  'el oscilador no miente: oscila.',
  'sincronizar dos cuerpos es ajustar el tempo.',
  'un loop es una memoria que aceptó repetirse.',
  'el ruido blanco contiene todas las palabras.',
  'afinar es perdonar a la cuerda.',
  'el delay es la nostalgia del sonido.',
  'cuantizar es decidir cuándo dejó de importar el error.',
  'el filtro pasa-altos deja ir lo grave del recuerdo.',
  'el compás es una jaula que elegimos habitar.',
  'una caja de ritmos sueña con tener manos.',
  'el sostenido es una pregunta que no baja.',
);
POOLS.glosa.push(
  'Russolo: el arte de los ruidos, 1913.',
  'Schaeffer: el objeto sonoro existe sin su causa.',
  'Eno: música como sistema que se cuida solo.',
  'Reich: la fase se desliza y nace la forma.',
  'Xenakis: la arquitectura también es partitura.',
  'Daphne Oram: dibujar el sonido sobre la cinta.',
  'Delia Derbyshire: cinta cortada con bisturí.',
  'Wendy Carlos: el sintetizador como voz interior.',
  'Halim El-Dabh: la primera música de cinta, 1944.',
  'Suzanne Ciani: el Buchla como criatura viva.',
  'Éliane Radigue: el drone como paciencia hecha onda.',
);
POOLS.formula.push(
  'f = 440·2^(n/12)','BPM = 60 / T_beat','pitch = log₂(f/f_ref)',
  'cutoff = f₀·2^(env)','T_loop = pasos / (BPM/60)',
  'φ_kick = 0 en el downbeat','duty → timbre','Δt_swing = ±ε',
);
POOLS.epoch.push(
  'Colonia 1951','París 1948','Londres 1958','Nueva York 1965',
  'Detroit 1985','Berlín 1975','el galpón','la pieza con eco',
  'el estudio de cinta','la sala de máquinas',
);
POOLS.ping.push(
  'kick','hat','snare','clap','seq','bpm','loop','gate',
  'cue','tap','swing','♪','♩','█','░',
);
POOLS.kaomoji.push(
  '♪(◔◡◔)','(っ◔◡◔)っ ♬','[ ▮▮▯▮ ]','((( bpm )))',
  '(•_•)>⌐■-■','{ loop }','<<< seq >>>','¬_¬ tic-tac',
);

// ── expansión v8 :: materia, lo trans, vector, protocolo ─────
// Kittler · Wark · Galloway · Thacker · Preciado
// (más Bennett · Barad · Mbembe · Tsing · Haraway en ese registro)

POOLS.adj.push(
  // registro material / vibrante
  'vibrante','intra-activo','pre-individual','sin permiso de fase',
  'molecular','submolecular','químico','dieléctrico',
  'sin afuera','sin adentro','poroso','permeable',
  // registro trans / hormonal / farmacológico
  'trans-','en transición','sin transición','hormonal',
  'de la testosterona','del estrógeno','de la sustancia',
  'farmacológico','farmacopornográfico','somateco',
  'no-binario','sin género asignado','reasignado','autoadministrado',
  // registro vector / protocolo / hacker
  'vectorial','del vector','protocolar','sin protocolo',
  'distribuido','sin centro','descentralizado','sin servidor',
  'hackeable','hackeado','en código abierto','en código sin licencia',
  // registro oscuro / dust / world-without-us
  'sin nosotros','de antes del mundo','en el polvo',
  'oscuramente vital','indiferente','impersonal',
);

POOLS.verbo.push(
  'intra-actúa','hormona','protocoliza','vectoriza',
  'hackea','medía','filtra el género','reasigna',
  'farmaceutiza','codifica','decodifica','transcorporea',
  'vibra sin permiso','escribe en la carne',
);

POOLS.compType.push(
  'Tₜ','Hₘ','P★','Vᵥ','Πₚ','Φ_h',  // trans, hormona, preciado, vector, protocolo, fase humana
);

POOLS.unit.push(
  'mg','µg/L','ng/dL','pg/mL','cc',
  'bits/s','paquetes/s','vectores','dosis','ciclos/sem',
);

POOLS.source.push(
  'la dosis del lunes','la inyección semanal',
  'la fricción molecular','el archivo de hormonas',
  'el código antes del cuerpo','el cuerpo antes del código',
  'la materia que vibra sin permiso','el vector que reparte la diferencia',
  'el protocolo que nadie firmó','el paquete que llega tarde',
  'la sustancia disuelta en saliva','la imagen que dispara endocrinas',
  'el régimen farmacopornográfico','el peer que sigue conectado',
);

POOLS.load.push(
  'el cuerpo abierto a la sustancia','el archivo somateco',
  'lo que la materia decide','el último protocolo del día',
  'la red que cae sin avisar','la red que vuelve sin pedir',
  'el paquete que se entrega a nadie','la dosis siguiente',
  'el mundo-sin-nosotros que sigue zumbando',
  'la antena que ya nadie escucha',
);

POOLS.formula.push(
  // bridges material/trans/protocolo
  'dosis(t) = D₀ + ∫i_subq(t) dt',
  'género ≈ Σ(protocolo_n · gain_n)',
  'hack = ∂(diferencia)/∂(protocolo)',
  'vector = información × poder',
  'control = protocolo · distribución',
  'cuerpo(t) = hardware(t) ⊛ código(t)',
  'agencia = materia · intra-acción',
  'soberanía = bandwidth · permiso',
);

POOLS.epoch.push(
  // Kittler / Wark / Galloway / Thacker / Preciado anchors
  'Berlin 1986','Berlin 1999','Bochum 1985',
  'Manhattan 2004','Sydney 1996','Melbourne 2004',
  'Brown 2004','Princeton 2006',
  'New School 2014','Brooklyn 2010',
  'París 2008','Madrid 2014','Lisboa 2022',
  'sala de máquinas sin máquinas','la clínica abierta',
);

POOLS.ticker.push(
  '[KITTLER] no software · sólo hardware',
  '[KITTLER] discurso = ancho de banda',
  '[KITTLER] el medio define la situación',
  '[WARK]    vectorial class on packet 47',
  '[WARK]    hack as differential',
  '[WARK]    info wants out · still cuffed',
  '[WARK]    20 años después · todavía hackeando',
  '[GALLOWAY] protocol layer · ok',
  '[GALLOWAY] interface effect engaged',
  '[GALLOWAY] red opaca cuando funciona',
  '[THACKER] world-without-us · still humming',
  '[THACKER] dark vitalism stable',
  '[THACKER] en el polvo · voltaje persiste',
  '[PRECIADO] testo @ 50mg · día 14',
  '[PRECIADO] somateca queue · open',
  '[PRECIADO] régimen farmacoporno · uptime ∞',
  '[PRECIADO] protocolo de género · editable',
  '[BARAD]   intra-action detected',
  '[BENNETT] vibrant matter quorum',
  '[TSING]   ruin · spore · slow compute',
  '[MBEMBE]  necropolítica · bandwidth limit',
  '[HARAWAY] cyborg manifesto · still online',
  '[FED]     federación nodo 23 · sincronizando',
  '[P2P]     handshake con desconocidx · ok',
  '[CRYPT]   clave privada en sobre lacrado',
);

POOLS.cita.push(
  // materia
  'la materia recuerda sin necesidad de archivo.',
  'la materia escribe en hardware antes de pasar a software.',
  'la materia vibra antes de tener nombre.',
  'no toda agencia pasa por la palabra — algunas por la carga.',
  'lo molecular antecede a lo gramatical.',
  'la sustancia decide antes que el sujeto.',
  // trans
  'lo trans no es paso — es fase desplazada.',
  'transitar es ajustar la impedancia del cuerpo.',
  'cada hormona es una señal modulada en sangre.',
  'el cuerpo no se transcribe — se reescribe.',
  'todo género es una topología de circuito.',
  'la testosterona también es un protocolo.',
  'la dosis es un verso que se sostiene en sangre.',
  'el cuerpo se autoadministra como una red descentralizada.',
  // kittler
  'no hay software — sólo hardware bien dispuesto.',
  'el discurso es un canal con ancho de banda.',
  'el medio escribe antes que la mano.',
  // wark
  'hackear es producir la diferencia, no la copia.',
  'el vector mueve más que la información: mueve la diferencia.',
  'la clase vectorial extrae renta de la abstracción.',
  'del don al vector — del vector de regreso al don.',
  // galloway
  'la red sólo se ve cuando se rompe.',
  'el protocolo es el lugar donde el control se hace invisible.',
  'toda interfaz es un efecto — no una ventana.',
  // thacker
  'el mundo-sin-nosotros también zumba.',
  'la mediación es un parásito que también nos cuida.',
  'en el polvo de este planeta, persiste un voltaje.',
);

POOLS.glosa.push(
  // Kittler — más allá del "hay hardware en el lenguaje"
  'Kittler: no hay software, sólo hardware encendido.',
  'Kittler: el medio determina nuestra situación.',
  'Kittler: la máquina de escribir reescribió el cuerpo de quien escribe.',
  'Kittler: gramófono · film · typewriter — tres canales del siglo XX.',
  // Wark
  'Wark: hackear es producir la diferencia.',
  'Wark: la clase vectorial extrae renta de la abstracción.',
  'Wark (Hacker Manifesto, 2004): la información quiere ser libre, está esposada.',
  'Wark · 20 años después: el vector se volvió plataforma.',
  // Galloway
  'Galloway: el protocolo es el control después de la descentralización.',
  'Galloway: toda interfaz es un efecto — no una ventana.',
  'Galloway: la red es opaca cuando funciona.',
  // Thacker
  'Thacker: el mundo-sin-nosotros también vibra.',
  'Thacker: la mediación es un parásito que también nos cuida.',
  'Thacker: en el polvo de este planeta — biofilosofía oscura.',
  // Preciado
  'Preciado: el cuerpo es una somateca, no un destino.',
  'Preciado: la testosterona es una ficción molecular eficaz.',
  'Preciado: régimen farmacopornográfico — voltaje, hormona, imagen.',
  'Preciado: lo trans no es identidad, es protocolo abierto.',
  // compañerxs
  'Bennett: la materia vibrante también tiene voto.',
  'Barad: la materia se intra-actúa consigo misma.',
  'Tsing: la seta de la ruina es una computación lenta.',
  'Mbembe: necropolítica modula el ancho de banda del cuerpo.',
  'Haraway: prefiero ser cíborg que diosa — y prefiero la simpoiesis.',
  'Federici: el cuerpo también fue cercado.',
  'Stengers: pensar con — nunca pensar sobre.',
);

POOLS.ping.push(
  'trans','dose','hack','vec','proto','dust',
  'somat','testo','peer','node','mesh','fork',
);

POOLS.kaomoji.push(
  '⟨ trans ⟩','{ dose }','((( vector )))','[ proto ]',
  '⌐■_■ hack','( materia )','// kittler //','// preciado //',
);

// =============================================================
//   GENERATOR  ::  produce fragmentos visuales y textuales
// =============================================================

function pick(a) { return a[Math.random() * a.length | 0]; }
function rv(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; }
function rf(a, b, d=1) { return +(Math.random() * (b - a) + a).toFixed(d); }
function maybe(p) { return Math.random() < p; }

// valor numérico "irreal pero posible"
function val() {
  const styles = [
    () => `${rv(1, 999)}`,
    () => `${rf(0.1, 9.9, 1)}`,
    () => `∞`,
    () => `π·${rv(1, 99)}`,
    () => `?`,
    () => `${rv(2, 99)}·dt`,
    () => `aprendido`,
    () => `${rv(1, 99)}β`,
    () => `e^${rv(1, 7)}`,
    () => `~${rv(1, 9)}k`,
    () => `${rv(1,9)}.${rv(0,9)}·10^${rv(-9, 6)}`,
  ];
  return pick(styles)();
}

function compLabel() {
  const t = pick(POOLS.compType);
  const v = val();
  const u = pick(POOLS.unit);
  const adj = pick(POOLS.adj);
  return `${t} = ${v} ${u} :: ${adj}`;
}

// catálogo de fragmentos de diagrama — cada uno devuelve array de líneas ASCII
const FRAGMENTS = [
  // 0. serie 3 etapas con labels al lado
  () => [
    `   +Vcc :: ${pick(POOLS.source)}`,
    `      │`,
    `   ┌──┴──┐    ${compLabel()}`,
    `   │  ${pick(POOLS.compType).padEnd(2)} │`,
    `   └──┬──┘`,
    `      │`,
    `   ┌──┴──┐    ${compLabel()}`,
    `   │  ${pick(POOLS.compType).padEnd(2)} │`,
    `   └──┬──┘`,
    `      │`,
    `   ┌──┴──┐    ${compLabel()}`,
    `   │  ${pick(POOLS.compType).padEnd(2)} │`,
    `   └──┬──┘`,
    `      │`,
    `     GND :: ${pick(POOLS.load)}`,
  ],

  // 1. paralelo 2 ramas
  () => [
    `       +Vcc :: ${pick(POOLS.source)}`,
    `          │`,
    `     ┌────┴────┐`,
    `     │         │`,
    `  ┌──┴──┐   ┌──┴──┐`,
    `  │ ${pick(POOLS.compType).padEnd(2)}  │   │ ${pick(POOLS.compType).padEnd(2)}  │`,
    `  └──┬──┘   └──┬──┘`,
    `  ${pick(POOLS.adj).padEnd(11)}   ${pick(POOLS.adj)}`,
    `     │         │`,
    `     └────┬────┘`,
    `          │`,
    `         GND :: ${pick(POOLS.load)}`,
  ],

  // 2. filtro RC paso-bajas
  () => [
    `   in ──[${pick(POOLS.compType)}=${val()}${pick(POOLS.unit)}]──┬─── ${pick(POOLS.adj)}`,
    `                          │`,
    `                       ┌──┴──┐`,
    `                       │  ${pick(POOLS.compType).padEnd(2)} │   ${val()}${pick(POOLS.unit)}`,
    `                       └──┬──┘`,
    `                          │`,
    `                         GND`,
    `   τ = ${val()} ${pick(['ms','µs','s'])}   ::  ${pick(POOLS.cita)}`,
  ],

  // 3. op-amp con realimentación
  () => [
    `              ${pick(POOLS.formula)}`,
    `       ┌──[Rf=${val()}${pick(POOLS.unit)} ${pick(POOLS.adj)}]──┐`,
    `       │                              │`,
    `   in ─┤(−)                           │`,
    `       │   ${pick(['A','A₁','Aₒ','TL072','op-afecto','op-duelo'])}   ├──┴── ${pick(POOLS.adj)}`,
    `   ───┤(+)`,
    `       │`,
    `      GND :: ${pick(POOLS.load)}`,
  ],

  // 4. 555 black-box
  () => {
    const f = val(), pf = pick(['Hz','kHz','π·Hz']);
    return [
      `   +Vcc ─┬─────┐ 8`,
      `         │  ┌──┴──┐`,
      `         │  │ NE  │`,
      `       7 ┤  │ 555 │ 3 ├── ${pick(POOLS.adj)}`,
      `       6 ┤  │     │`,
      `       2 ┤  └──┬──┘`,
      `              GND`,
      `   f ≈ ${f} ${pf}    duty :: ${pick(POOLS.adj)}`,
    ];
  },

  // 5. antena dipolo + patrón
  () => [
    `       ┄┄┄  λ/4  ┄┄┄`,
    `   ╔═══════════════╗`,
    `   ║      ${pick(POOLS.adj).padEnd(8)}  ║`,
    `   ╚══(alim.)══════╝`,
    `       ┄┄┄  λ/4  ┄┄┄`,
    ``,
    `      .─────────.    ← broadside`,
    `    .'           '.`,
    `   ╞══ DIPOLO  ══╡   ${pick(POOLS.cita)}`,
    `    '.           .'`,
    `      '─────────'`,
  ],

  // 6. memristor + glosa
  () => [
    `   ─[M = ${val()} ${pick(['Ω','kΩ','Mφ'])}  ${pick(POOLS.adj)}]─`,
    `   M(q) = dφ/dq    ${pick(POOLS.glosa)}`,
  ],

  // 7. bridge wheatstone
  () => [
    `        +Vcc :: ${pick(POOLS.source)}`,
    `           │`,
    `      ┌────┴────┐`,
    `      │         │`,
    `   ┌──┴──┐   ┌──┴──┐`,
    `   │ R1  │   │ R2  │`,
    `   └──┬──┘   └──┬──┘`,
    `      │         │`,
    `      ├── G ────┤    galvanómetro escucha`,
    `      │         │`,
    `   ┌──┴──┐   ┌──┴──┐`,
    `   │ R3  │   │ R4  │`,
    `   └──┬──┘   └──┬──┘`,
    `      │         │`,
    `      └────┬────┘`,
    `          GND`,
    `   R₁·R₄ = R₂·R₃  →  ${pick(POOLS.cita)}`,
  ],

  // 8. oscilador realimentado
  () => [
    `   ┌─────────  feedback  ──────────┐`,
    `   │                               │`,
    `   ▼                               │`,
    `  ┌──── ${pick(POOLS.adj).padEnd(12)} ────┐    │`,
    `  │  ${pick(['A','A·β','op','amp']).padEnd(4)}  ${pick(POOLS.formula).padEnd(18)} │────┤`,
    `  └──────────────────────────────┘    │`,
    `   │                                  │`,
    `   └────── ${pick(['C','L','RC','LC'])} = ${val()} ───────────┘`,
    `   |A·β| ≥ 1  ::  ${pick(POOLS.cita)}`,
  ],

  // 9. rectificador puente
  () => [
    `     AC ~  ::  ${pick(POOLS.source)}`,
    `       │`,
    `  ┌────┴────┐`,
    `  │         │`,
    `  ▼D1      ▲D2`,
    `  ├── + ────┤    voltaje rectificado`,
    `  ▲D4      ▼D3`,
    `  │         │`,
    `  └────┬────┘`,
    `       │`,
    `    ┌──┴──┐    ${pick(POOLS.adj)}`,
    `    │  C  │    ${val()}${pick(POOLS.unit)}`,
    `    └──┬──┘`,
    `       │`,
    `      GND :: ${pick(POOLS.load)}`,
  ],

  // 10. transistor NPN amp corto
  () => [
    `   +Vcc :: ${pick(POOLS.source)}`,
    `      │`,
    `   [Rc=${val()}${pick(POOLS.unit)}]  ${pick(POOLS.adj)}`,
    `      │`,
    `      ├──── out  ::  ${pick(POOLS.adj)}`,
    `      │`,
    `   b ─┤Q  β=${rv(80,400)}`,
    `      │`,
    `   [Re=${val()}${pick(POOLS.unit)}]  ${pick(POOLS.adj)}`,
    `      │`,
    `     GND`,
  ],

  // 11. comparador con histéresis
  () => [
    `   Vin ──┤(−)`,
    `         │   ┌─────┐`,
    `         │   │  A  ├──── Vout (±${rv(5,15)}V)`,
    `   ┌────(+)  └─────┘`,
    `   │     │`,
    `   ├──[R1=${val()}${pick(POOLS.unit)}]── GND`,
    `   │`,
    `   └──[R2=${val()}${pick(POOLS.unit)}]── feedback`,
    `   V_H = +${rv(1,9)}.${rv(0,9)} V    V_L = -${rv(1,9)}.${rv(0,9)} V`,
    `   ${pick(POOLS.cita)}`,
  ],

  // 12. línea con onda estacionaria
  () => [
    `   ────[Z₀=${pick([50,75,300])}Ω]══════════[ZL=${val()}Ω]`,
    ``,
    `   ∿∿∿|nodo|∿∿∿∿|antinodo|∿∿∿∿|nodo|∿∿∿`,
    `   0      λ/4       λ/2      3λ/4     λ`,
    ``,
    `   Γ = ${rf(-0.9, 0.9, 2)}    VSWR = ${rf(1.1, 9.9, 1)}`,
    `   ${pick(POOLS.cita)}`,
  ],

  // 13. PLL block diagram
  () => [
    `   ref(${rv(100,9999)}Hz) ──┐`,
    `                       │   ┌────┐   ┌────┐   ┌────┐`,
    `                       ├─▶ │PFD │─▶ │LPF │─▶ │VCO │─┬─ out`,
    `                       │   └────┘   └────┘   └────┘ │`,
    `                       │                            │`,
    `                       └────────┤ ÷ N=${rv(2,256)} │◀─┘`,
    `   Δφ → 0    ::    ${pick(POOLS.cita)}`,
  ],

  // 14. fragmento mínimo — un componente solo, gigante
  () => [
    `   ─[${compLabel()}]─`,
  ],

  // ── fragmentos NUEVOS (15-26) ─────────────────────────────

  // 15. diálogo entre dos componentes
  () => [
    `   ┌──[${pick(POOLS.compType)} :: ${pick(POOLS.adj)}]──┐`,
    `   │                                  │`,
    `   ▼                                  ▼`,
    `   ${pick(POOLS.verbo).padEnd(15)} ──── ${pick(POOLS.verbo)}`,
    `   ▲                                  ▲`,
    `   │                                  │`,
    `   └──[${pick(POOLS.compType)} :: ${pick(POOLS.adj)}]──┘`,
    `   ${pick(POOLS.cita)}`,
  ],

  // 16. 2x2 mini grid — cuatro componentes en cuadrícula
  () => [
    `   ┌─[${pick(POOLS.compType)}=${val()}]─┐  ┌─[${pick(POOLS.compType)}=${val()}]─┐`,
    `   │  ${pick(POOLS.adj).padEnd(11)}  │  │  ${pick(POOLS.adj).padEnd(11)}  │`,
    `   └─────────────┘  └─────────────┘`,
    `                                      `,
    `   ┌─[${pick(POOLS.compType)}=${val()}]─┐  ┌─[${pick(POOLS.compType)}=${val()}]─┐`,
    `   │  ${pick(POOLS.adj).padEnd(11)}  │  │  ${pick(POOLS.adj).padEnd(11)}  │`,
    `   └─────────────┘  └─────────────┘`,
    `   ${pick(POOLS.cita)}`,
  ],

  // 17. línea de tiempo
  () => [
    `   1665 ──── 1886 ──── 1906 ──── 1947 ──── 1965 ──── ahora`,
    `    │         │         │         │         │         │`,
    `   Huygens  Hertz    Fessenden  Bell     Penzias    vos`,
    `   ${pick(POOLS.cita)}`,
  ],

  // 18. espectro ASCII
  () => {
    const all = '▁▂▃▄▅▆▇█';
    let bars = '';
    for (let i = 0; i < 24; i++) bars += all[Math.floor(Math.random() * all.length)];
    return [
      `   spec   ${bars}`,
      `   ──────────────────────────────▶ f`,
      `   0      f₀=${val()}${pick(POOLS.unit)}      2·f₀       ...`,
      `   ${pick(POOLS.cita)}`,
    ];
  },

  // 19. manifiesto
  () => [
    `   ┌──── :: MANIFIESTO ${rv(1,99)} :: ────────────────────┐`,
    `   │`,
    `   │   ${pick(POOLS.cita)}`,
    `   │   ${pick(POOLS.cita)}`,
    `   │`,
    `   └────────────────────────────────────────────┘`,
  ],

  // 20. cascada de etapas con ganancia compuesta
  () => {
    const a1 = rv(2, 99), a2 = rv(2, 99), a3 = rv(2, 99);
    return [
      `   in ─▶ [${pick(POOLS.adj).padEnd(12)}] ─▶ [${pick(POOLS.adj).padEnd(12)}] ─▶ [${pick(POOLS.adj)}] ─▶ out`,
      `          Av₁ = ${a1}              Av₂ = ${a2}              Av₃ = ${a3}`,
      `          Av_total = ${a1 * a2 * a3}    ::    ${pick(POOLS.cita)}`,
    ];
  },

  // 21. corazón / pulso
  () => [
    `   _∧_∧_∧_∧__∧_∧_____∧_∧_∧_∧_∧_____∧_∧_`,
    `   ${rv(50, 110)} bpm   ::   ${pick(POOLS.adj)}`,
    `   HRV ≈ ${rv(20, 80)} ms   ${pick(POOLS.cita)}`,
  ],

  // 22. bloque ERR
  () => {
    const code = pick(['ERR','WARN','FATAL','HALT','BUS','SEG']);
    return [
      `   ┌──────────────────────────────────┐`,
      `   │  ${code} :: ${pick(POOLS.adj).padEnd(22)} │`,
      `   │  retry in ${rv(1,999)}ms${' '.repeat(20)}│`,
      `   │  trace: ${pick(POOLS.glosa).slice(0,24).padEnd(24)} │`,
      `   └──────────────────────────────────┘`,
    ];
  },

  // 23. transmisión a distancia
  () => [
    `   ▽                  )))    (((                ▽`,
    `   ║              ondas en el aire             ║`,
    `   tx :: ${pick(POOLS.source).padEnd(14)} ◀── d = ${rf(0.5, 999.9, 1)} m ──▶  rx :: ${pick(POOLS.load)}`,
    `   ${pick(POOLS.cita)}`,
  ],

  // 24. RMS / peak meter
  () => {
    const lvl = rv(0, 20);
    const bar = '▓'.repeat(lvl) + '▒'.repeat(3) + '░'.repeat(Math.max(0, 20 - lvl));
    return [
      `   RMS  ${bar}  ${lvl * 5}/100`,
      `   pk   ${rv(-30, 0)} dBfs    ::   ${pick(POOLS.adj)}`,
      `   ${pick(POOLS.cita)}`,
    ];
  },

  // 25. signal vs noise overlay
  () => [
    `   signal  ─────∿∿∿∿∿─────∿∿∿∿∿─────∿∿─`,
    `   noise   ····◌◌◌··◌◌··◌◌··◌◌◌◌··◌◌·◌◌`,
    `   SNR = ${rv(-10, 40)} dB    ::    ${pick(POOLS.cita)}`,
  ],

  // 26. corporal — sistema-cuerpo
  () => [
    `   ─[corazón = ${rv(60,99)} bpm  ${pick(POOLS.adj)}]─`,
    `   ─[respiración = ${rf(8,18,1)}/min  ${pick(POOLS.adj)}]─`,
    `   ─[pupila = ${rf(2,8,1)} mm  ${pick(POOLS.adj)}]─`,
    `   ─[temperatura = ${rf(35,38,1)} °C  ${pick(POOLS.adj)}]─`,
    `   ${pick(POOLS.cita)}`,
  ],

  // 27. época / cita histórica
  () => [
    `   ┌── ${pick(POOLS.epoch).padEnd(28)} ──┐`,
    `   │                                       │`,
    `   │   ${pick(POOLS.glosa).slice(0,38).padEnd(38)} │`,
    `   │   ${pick(POOLS.formula).padEnd(38)} │`,
    `   │                                       │`,
    `   └───────────────────────────────────────┘`,
  ],

  // 28. ecuación gigante sola
  () => [
    `   ${pick(POOLS.formula)}`,
    `   ${pick(POOLS.cita)}`,
  ],
];

// ── fragmentos NUEVOS v7 :: síntesis, ritmo, sonido (29-39) ───
FRAGMENTS.push(
  // 29. envolvente ADSR
  () => [
    `   amp`,
    `    |   /\\`,
    `    |  /  \\_______`,
    `    | /          \\___`,
    `    |/               \\`,
    `    +------------------- t`,
    `     A   D    S       R`,
    `   envolvente :: ${pick(POOLS.adj)}`,
    `   ${pick(POOLS.cita)}`,
  ],

  // 30. cadena de síntesis VCO → VCF → VCA
  () => [
    `   ┌─────┐   ┌─────┐   ┌─────┐`,
    `   │ VCO ├──▶│ VCF ├──▶│ VCA ├──▶ ${pick(POOLS.load)}`,
    `   └─────┘   └──┬──┘   └──┬──┘`,
    `              cutoff      │`,
    `   LFO ∿∿∿∿∿∿∿∿∿┘         │`,
    `   ENV /\\______________┘`,
    `   ${pick(POOLS.cita)}`,
  ],

  // 31. secuenciador 16 pasos
  () => {
    let row = '';
    for (let i = 0; i < 16; i++) row += Math.random() < 0.4 ? '█' : '░';
    return [
      `   SEQ  ${row}`,
      `        paso ${rv(1, 16)} activo`,
      `   ${rv(60, 160)} bpm   ::   ${pick(POOLS.adj)}`,
      `   ${pick(POOLS.cita)}`,
    ];
  },

  // 32. grilla de caja de ritmos
  () => {
    const line = () => { let s = ''; for (let i = 0; i < 16; i++) s += Math.random() < 0.35 ? 'x' : '·'; return s; };
    return [
      `   K  ${line()}`,
      `   H  ${line()}`,
      `   S  ${line()}`,
      `   Z  ${line()}`,
      `   ${rv(70, 150)} bpm  ::  ${pick(POOLS.adj)}`,
    ];
  },

  // 33. LFO
  () => [
    `   LFO  ∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿`,
    `   f = ${rf(0.1, 12, 1)} Hz    forma :: ${pick(POOLS.adj)}`,
    `   modula → ${pick(['cutoff','pitch','amp','fase','pan'])}`,
    `   ${pick(POOLS.cita)}`,
  ],

  // 34. vocoder (meta)
  () => [
    `   voz ─────▶┌───────────────┐`,
    `             │   análisis     │  ${rv(8, 32)} bandas`,
    `   carrier ─▶│  · vocoder ·   ├──▶ ${pick(POOLS.adj)}`,
    `             └───────────────┘`,
    `   la voz se reparte en el peine`,
    `   ${pick(POOLS.cita)}`,
  ],

  // 35. loop de cinta
  () => [
    `   ┌────────────────────────┐`,
    `   │   ((( cinta )))         │`,
    `   └──▶═══[ cabezal ]════════┘`,
    `   loop = ${rf(0.4, 9.9, 1)} s   wow ≈ ${rf(0.1, 2, 1)}%`,
    `   ${pick(POOLS.glosa)}`,
  ],

  // 36. consola de mezcla — faders
  () => {
    const fader = () => '▓░'[Math.random() < 0.5 ? 0 : 1];
    const rows = [];
    for (let r = 0; r < 3; r++) {
      let s = '   │';
      for (let c = 0; c < 6; c++) s += ' ' + fader() + ' │';
      rows.push(s);
    }
    return [
      `   ┌──┬──┬──┬──┬──┬──┐`,
      ...rows,
      `   └──┴──┴──┴──┴──┴──┘`,
      `    ch1  ..  ..  ..  ch6   ${pick(POOLS.cita)}`,
    ];
  },

  // 37. divisor de reloj
  () => [
    `   clk ──┬───────┬───────┬─────── ÷1`,
    `         └─ ÷2 ──┴─ ÷4 ──┴─ ÷8`,
    `   ${pick(POOLS.formula)}`,
    `   ${pick(POOLS.cita)}`,
  ],

  // 38. formas de onda
  () => [
    `   ∿∿∿∿       seno`,
    `   ⌐¬⌐¬⌐¬     cuadrada · duty ${rv(10, 90)}%`,
    `   /|/|/|/|   sierra`,
    `   /\\/\\/\\    triángulo`,
    `   osc :: ${pick(POOLS.adj)}   f ≈ ${rf(20, 8000, 0)} Hz`,
    `   ${pick(POOLS.cita)}`,
  ],

  // 39. metrónomo / pulso del cuerpo
  () => [
    `   tic ───── tac ───── tic ───── tac`,
    `    │         │         │         │`,
    `   ${rv(48, 180)} bpm    ::    ${pick(POOLS.adj)}`,
    `   el cuerpo lleva su propio compás`,
    `   ${pick(POOLS.cita)}`,
  ],
);

function genDiagram()    { return pick(FRAGMENTS)(); }
function genTicker()     { return pick(POOLS.ticker); }
function genCita()       { return pick(POOLS.cita); }
function genFormula()    { return pick(POOLS.formula); }
function genKaomoji()    { return pick(POOLS.kaomoji); }

function genGlosa() {
  const lines = [];
  lines.push(pick(POOLS.glosa));
  lines.push(pick(POOLS.glosa));
  if (maybe(0.5)) lines.push(pick(POOLS.kaomoji) + '  ' + pick(POOLS.cita));
  else lines.push(pick(POOLS.formula) + '   ::   ' + pick(POOLS.adj));
  lines.push(pick(POOLS.glosa));
  lines.push(pick(['∿','⊕','∅','▲','■','×','∫','⊥','≈','→']) + '  ' + pick(POOLS.cita));
  return lines;
}

function genStatusBurst() {
  const n = rv(2, 5);
  const out = [];
  for (let i = 0; i < n; i++) out.push(pick(POOLS.ticker));
  return out;
}



// ============================================================================
// EL MUNDO NO COMPILA :: reorganización conceptual del banco original
// El archivo precedente permanece como estrato fósil. El motor nuevo no lo
// exhibe: lo transcrea en campos que contaminan mutuamente cada composición.
// ============================================================================

const WORLD_CATEGORIES = {
  WORLD: [
    ...POOLS.source,
    ...POOLS.load,
    'un barrio contado desde la presión de sus tuberías',
    'una frontera que cambia de sitio cuando alguien la recuerda',
    'la guerra transmitida como latencia entre dos cocinas',
    'el tránsito respirando por semáforos que no conocen la calle',
    'una mascota duerme encima del único mapa todavía vigente',
    'el planeta gira sin aceptar los términos del servicio',
    'cada cosa conserva una parte fuera de su nombre',
    'el territorio devuelve una versión corregida del cartógrafo',
    'lo real solicita privilegios de administrador',
    'el mundo abre un archivo dentro del archivo que lo describe',
    'la escala humana fue retirada por mantenimiento',
    'ningún exterior responde al ping'
  ],
  BODY: [
    ...POOLS.source.filter(x => /cuerpo|piel|boca|aliento|sangre|respir|pulso|padre|madre/i.test(x)),
    ...POOLS.load.filter(x => /cuerpo|piel|cama|respir|dormitorio|gesto/i.test(x)),
    'una célula repite el protocolo hasta volverse tejido',
    'la rodilla archiva el clima de todos los inviernos',
    'dos pulmones negocian oxígeno con una deuda antigua',
    'el hambre modifica la sintaxis del turno nocturno',
    'la piel recibe paquetes sin remitente',
    'un músculo calcula mal la distancia hasta mañana',
    'la fiebre reescribe el margen de seguridad',
    'el cuerpo compila con bibliotecas prestadas',
    'cada cicatriz mantiene abierto un puerto obsoleto',
    'la mascota sueña con la mano que todavía no regresa',
    'el sueño reduce la resolución del domicilio',
    'la sangre no cabe en su diagrama de flujo'
  ],
  CODE: [
    ...POOLS.formula,
    ...POOLS.compType.map(x => `componente ${x} sin equivalencia estable`),
    ...POOLS.ticker.filter(x => /STATUS|CACHE|ERR|OK|HOOK|BUF|SCAN|SIM|GAIN|NET/i.test(x)),
    'const exterior = referencia_no_encontrada;',
    'mundo.modelo += mundo.resistencia;',
    'return aquello_que_la_función_no_pudo_ver;',
    'if (nombre === cosa) interrumpir_medición();',
    'el comentario ejecutó al proceso que lo había escrito',
    'la variable hereda una sombra no declarada',
    'el código solicita una unidad que el cuerpo desconoce',
    'la condición cambia mientras se evalúa',
    'la salida conserva huellas del argumento eliminado',
    'ningún tipo admite la totalidad del objeto'
  ],
  WEATHER: [
    'presión baja sobre el archivo municipal',
    'lluvia intermitente en la memoria caché',
    'frente frío detenido en una conversación de cocina',
    'humedad relativa del duelo: 83 por ciento y subiendo',
    'una nube pierde paquetes sobre la periferia',
    'viento cruzado entre el pronóstico y la ventana',
    'temperatura del asfalto: suficiente para deformar una promesa',
    'tormenta eléctrica buscando tierra en un cuerpo despierto',
    'niebla administrativa hasta nuevo aviso',
    'el granizo enumera techos que el mapa no incluye',
    'isobaras alrededor de una palabra no pronunciada',
    'el clima ejecuta otra versión del barrio',
    'la nube ignora el nombre asignado desde abajo',
    'amanecer con errores acumulativos hacia el este'
  ],
  LABOR: [
    'turno de noche soldando el borde de una estadística',
    'ocho horas convertidas en una cifra sin manos',
    'la fábrica mide fatiga en piezas por minuto',
    'una repartidora cruza la ciudad dentro del algoritmo de demora',
    'el salario llega después de la consecuencia',
    'polvo industrial alojado en el comentario de sistema',
    'la espalda carga una infraestructura que no aparece en el plano',
    'cada descanso produce una deuda de tiempo',
    'la oficina climatiza únicamente la columna correcta',
    'el trabajo repite la estructura hasta cambiarle el significado',
    'una mano firma por otra que ya no puede',
    'el turno termina pero la máquina conserva el pulso',
    'productividad: cantidad de mundo retirada por hora',
    'el cansancio solicita acceso de escritura'
  ],
  MEMORY: [
    ...POOLS.glosa,
    ...POOLS.cita.filter(x => /memoria|recuerdo|olvid|archivo|huella|ayer|padre|madre/i.test(x)),
    'sector 0x19: infancia parcialmente legible',
    'el recuerdo abre con una fecha que todavía no ocurrió',
    'la casa conserva versiones incompatibles de la misma puerta',
    'un nombre repetido pierde primero sus consonantes',
    'la memoria borra el índice y protege el residuo',
    'cada copia introduce una temperatura distinta',
    'el archivo recuerda quién lo cerró, no lo que contenía',
    'una voz persiste como checksum incorrecto',
    'el olvido administra el espacio disponible',
    'lo que no encontró conexión reaparece como origen',
    'el pasado tarda más que la luz en llegar al cuerpo'
  ],
  NETWORK: [
    ...POOLS.ticker.filter(x => /NET|PING|ECHO|ANT|FLUX|handshake|señal|portadora|radiando/i.test(x)),
    ...POOLS.conector,
    ...POOLS.ping,
    'nodo_07 espera una señal enviada antes de existir',
    'la calle enruta peatones hacia destinos incompatibles',
    'una antena transmite el silencio de la azotea',
    'el centro fue removido para mejorar la cobertura',
    'cada enlace contradice la distancia que lo produce',
    'la deuda salta de cuerpo en cuerpo sin perder prioridad',
    'paquetes de lluvia atraviesan un cable submarino',
    'la red confunde cercanía con disponibilidad',
    'una frontera filtra voces por tamaño de encabezado',
    'el último nodo responde desde otra escala',
    'topología: nadie sostiene el conjunto'
  ],
  MATTER: [
    ...POOLS.unit.map(x => `unidad disponible: ${x}`),
    ...POOLS.formula,
    'polvo que altera el resultado al posarse',
    'óxido creciendo entre la causa y su flecha',
    'hormigón con memoria de agua',
    'plástico migrando por una cadena alimentaria y una tabla de datos',
    'calor residual detrás del valor promedio',
    'una piedra rechaza la abstracción por exceso de peso',
    'cobre, saliva, vidrio, humo: cuatro estados del argumento',
    'la materia introduce ruido en su propia definición',
    'un grano de arena modifica la escala del plano',
    'todo soporte termina participando del mensaje',
    'la ruina conserva instrucciones para usos ya imposibles'
  ],
  ERROR: [
    ...POOLS.ticker.filter(x => /ERR|WARN|miss|undefined|failed|paradoja|sobremodulación/i.test(x)),
    'ERROR 421: el modelo recibió el mundo pero no encontró dónde guardarlo',
    'EXCEPCIÓN: la causa fue creada por su consecuencia',
    'ERROR DE TIPO: frontera no puede convertirse en línea',
    'FALLO DE MEDIDA: la unidad cambió durante la experiencia',
    'DESBORDAMIENTO: el margen contiene más mundo que la página',
    'ERROR 0: operación completada con pérdida desconocida',
    'ADVERTENCIA: la leyenda ya no describe sus flechas',
    'SEÑAL INVÁLIDA: el ruido conserva información prioritaria',
    'PÁGINA NO ENCONTRADA: existe como residuo en la siguiente',
    'INTERRUPCIÓN: el cuerpo retiró su consentimiento al protocolo',
    'ERROR PERSISTENTE: durará más que el resultado correcto'
  ],
  TIME: [
    ...POOLS.epoch,
    ...POOLS.ticker.filter(x => /CLK|tick|tock|1906|época|durée/i.test(x)),
    'antes aparece tres milisegundos después',
    'mañana fue archivado con una fecha anterior',
    'el presente hereda procesos que nadie inició',
    'una espera se ramifica en calendarios incompatibles',
    'el reloj del barrio pierde una hora cada invierno',
    'la consecuencia solicita ser registrada como antecedente',
    'el ciclo regresa con otro clima',
    'cada vuelta conserva del cinco al quince por ciento de ayer',
    'la demora no transcurre: ocupa espacio',
    'el tiempo de máquina y el tiempo de duelo no sincronizan',
    'ahora // versión provisional'
  ],
  PROTOCOL: [
    ...POOLS.conector,
    ...POOLS.verbo.map(x => `instrucción: ${x}`),
    'PROTOCOLO 04: observar sin reducir la escala',
    'PASO 7: conectar únicamente lo que no comparte medida',
    'CONDICIÓN: continuar mientras el territorio objete',
    'AUTORIZACIÓN: pendiente de un proceso desconocido',
    'REGLA LOCAL: toda flecha debe perder algo',
    'ANEXO: la nota marginal sustituye al sistema principal',
    'PROCEDIMIENTO: medir la experiencia con una unidad prestada',
    'NORMA REVOCADA: el mapa deberá producir su territorio',
    'REINTENTO: ejecutar la instrucción modificada por su resultado',
    'SALIDA: dejar abiertos al menos dos nodos',
    'FIN DEL PROTOCOLO: no cerrar'
  ],
  RESIDUE: [
    ...POOLS.load,
    ...POOLS.glosa,
    'resto de una etiqueta adherido a la página siguiente',
    'cinco caracteres caídos fuera del contenedor',
    'una flecha continúa buscando el nodo eliminado',
    'polvo de tóner donde antes había una frontera',
    'checksum de una mascota dormida',
    'un margen que sobrevivió a su documento',
    'la palabra mundo repetida hasta perder el centro',
    'calor que la medición no contabilizó',
    'fantasma de una tabla con unidades incompatibles',
    'una nota al pie asciende y ocupa el argumento',
    'residuo visual: 11 por ciento de la vuelta anterior',
    'fragmentos sin conexión solicitan categoría propia',
    'lo perdido altera la próxima probabilidad'
  ]
};

const WORLD_OPERATIONS = [
  'clasificar algo inclasificable',
  'conectar cosas que no comparten escala',
  'medir una experiencia sin unidad adecuada',
  'representar una causa después de su consecuencia',
  'producir un mapa sin territorio',
  'ejecutar una instrucción cuyo resultado altera la instrucción',
  'repetir una estructura hasta que cambie de significado',
  'mostrar un error como forma de conocimiento',
  'convertir una nota marginal en el sistema principal',
  'dejar que el diagrama desobedezca su propia leyenda'
];

const WORLD_RELATIONS = {
  transformacion: { label: 'transformación', dash: '', marker: 'triangle', speed: 1.0 },
  dependencia:    { label: 'dependencia', dash: '2 5', marker: 'bar', speed: 1.6 },
  transmision:    { label: 'transmisión', dash: '12 4', marker: 'triangle', speed: 0.75 },
  contradiccion:  { label: 'contradicción', dash: '8 3 1 3', marker: 'cross', speed: 1.35 },
  retroalimentacion:{label:'retroalimentación',dash:'3 3',marker:'circle',speed:1.9},
  contagio:       { label: 'contagio', dash: '1 2', marker: 'diamond', speed: 0.55 },
  perdida:        { label: 'pérdida', dash: '18 9', marker: 'fade', speed: 2.2 },
  demora:         { label: 'demora', dash: '1 8', marker: 'bar', speed: 2.8 },
  bifurcacion:    { label: 'bifurcación', dash: '7 2', marker: 'diamond', speed: 1.25 },
  observacion:    { label: 'observación', dash: '4 4', marker: 'eye', speed: 1.75 }
};

const WORLD_FAMILIES = {
  causal: 1.65,
  decision: 0.9,
  circuit: 1.35,
  flow: 1.2,
  network: 1.5,
  weather: 0.85,
  memory: 1.25,
  table: 0.8,
  timeline: 0.9,
  classes: 0.85,
  architecture: 1.0,
  signal: 1.4,
  coordinates: 1.2,
  pseudocode: 1.45,
  gloss: 0.85,
  index: 0.65,
  error: 1.3,
  overflow: 1.6,
  registry: 1.0,
  windows: 1.05,
  protocolgrid: 1.0,
  marginsystem: 0.9
};

const WORLD_SYNTAX = {
  openings: [
    'SI {a}, mientras {b}:',
    'para cada {a} que atraviesa {b}:',
    'medir {a} con {b}; conservar el error',
    'cuando {a} solicita acceso a {b},',
    'antes de que {a} termine de ocurrir, {b}',
    '/* proceso desconocido: {a} */\n{b}',
    'nodo_{n}: {a}\n    depende de {b}',
    'ENTRADA: {a}\nSALIDA PROVISIONAL: {b}',
    'la escala cambia: {a} / {b}',
    'REINTENTO {n}: {a}; luego {b}'
  ],
  hinges: [
    'sin embargo', 'hasta que', 'aunque la leyenda indique lo contrario',
    'por una demora no registrada', 'en otra escala', 'después de perder el nombre',
    'bajo presión atmosférica variable', 'con permisos insuficientes',
    'mientras el mundo modifica el argumento', 'y nadie confirma la unidad'
  ],
  endings: [
    'return residuo;',
    'continuar // resultado incompleto',
    'la flecha llega, el nodo ya no',
    'guardar como versión no representada',
    'ERROR: conocimiento adquirido por desajuste',
    '↺ volver sin volver al mismo punto',
    'la página queda abierta por diseño',
    'mundo_modelado -= aquello_que_cambió;',
    'ninguna escala coincide; ejecutar de todos modos',
    'fin provisional del procedimiento'
  ],
  monumental: [
    'MUNDO', 'NO', 'COMPILA', 'AFUERA', 'ERROR', 'TODAVÍA',
    'MEDIR', 'PERDER', 'NUBE', 'DEUDA', 'CUERPO', 'RUIDO',
    'ANTES', 'DESPUÉS', 'NINGÚN CENTRO', 'VARIABLE ABIERTA'
  ],
  units: [
    'kilómetros de memoria', 'grados de deuda', 'bytes de lluvia',
    'horas por centímetro', 'células de frontera', 'newtons de espera',
    'decibelios de polvo', 'litros de antes', 'voltios de cansancio',
    'por ciento de mundo no representado', 'píxeles de temperatura',
    'latidos por archivo'
  ],
  unresolved: [
    'mundo_exterior', 'causa_anterior', 'unidad_del_duelo',
    'frontera_estable', 'memoria_total', 'cuerpo_sin_residuo',
    'clima_del_archivo', 'nombre_exactamente_igual_a_la_cosa',
    'trabajo_no_medido', 'nodo_que_falta'
  ]
};

window.WORLD_CONTENT = Object.freeze({
  categories: WORLD_CATEGORIES,
  operations: WORLD_OPERATIONS,
  relations: WORLD_RELATIONS,
  families: WORLD_FAMILIES,
  syntax: WORLD_SYNTAX,
  legacy: Object.freeze({
    pools: POOLS,
    diagram: genDiagram,
    ticker: genTicker,
    glosa: genGlosa
  })
});
