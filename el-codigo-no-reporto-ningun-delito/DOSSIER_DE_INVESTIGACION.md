# DOSSIER DE INVESTIGACIÓN

## Fundamentos técnicos, museológicos, económicos y teóricos de *THE CODE REPORTED NO CRIME*

**Estado:** primera investigación documentada  
**Fecha de consulta:** 6 de agosto de 2026  
**Función:** impedir que la erudición de la obra sea ornamental o técnicamente falsa

---

## 1. Método

Este dossier distingue tres estatutos.

### HECHO DOCUMENTADO

Una fuente técnica, institucional o académica sostiene directamente la afirmación.

### INFERENCIA DE LA OBRA

La afirmación no está contenida literalmente en la fuente, pero se deriva razonablemente de combinar hechos documentados.

### LICENCIA FICTICIA

Elemento inventado para la novela. Debe ser técnicamente posible o declarar con claridad su carácter especulativo.

La pieza nunca debe utilizar una licencia ficticia como si fuera un caso histórico real.

---

# I. PROCEDENCIA

## 2. Qué significa provenance

### Hecho documentado

Getty define la procedencia o historial de propiedad como la historia de un objeto desde su creación hasta el presente. Puede incluir propietarios, medios de transferencia, ventas públicas, agentes, comerciantes, ubicaciones, estado legal, costo y valoración. También debe indicar periodos en los que la obra estuvo perdida, destruida o fuera de la vista pública.

Fuentes:

- [Getty CDWA — Ownership/Collecting History](https://www.getty.edu/publications/categories-description-works-art/categories/object-architecture-group/23/)
- [Getty Museum — Research on Museum Collection Provenance](https://www.getty.edu/museum/provenance/)
- [Getty Provenance Index Initiative](https://www.getty.edu/projects/getty-provenance-index-initiative/)

### Consecuencia para la obra

La procedencia no es un solo dato ni una simple lista de wallets. Es una narración estructurada compuesta por:

- agentes;
- fechas;
- transferencias;
- lugares;
- fuentes;
- grados de certeza;
- ausencias;
- interpretación legal e histórica.

Esto sostiene nuestra tesis:

> Provenance is literature with enforcement mechanisms.

La frase es una formulación conceptual de la obra, no una definición del Getty.

---

## 3. Los huecos son normales

### Hecho documentado

Getty reconoce que muchos objetos conservan lagunas en su historia y que la investigación futura puede completarlas. Sus directrices también contemplan incertidumbre, ambigüedad, información desconocida y opiniones divergentes.

Fuentes:

- [Getty Museum — Provenance research](https://www.getty.edu/museum/provenance/)
- [Getty CDWA — General Guidelines](https://www.getty.edu/publications/categories-description-works-art/general-guidelines/)

### Consecuencia para la obra

Un hueco no prueba fraude. Tampoco es neutral: la forma en que una institución lo representa puede aumentar o reducir la apariencia de certeza.

La secuencia ficticia:

```text
1998?
ca. 1998
1998
```

es plausible como demostración de pérdida progresiva de calificación, pero no debe atribuirse a una institución real sin evidencia.

---

## 4. La autoridad del repositorio

### Hecho documentado

Las directrices generales de CDWA señalan que, cuando una obra pertenece a un repositorio, la opinión del repositorio puede tener precedencia operativa en el registro, aunque el debate académico debe representarse cuando sea posible.

Fuente:

- [Getty CDWA — General Guidelines](https://www.getty.edu/publications/categories-description-works-art/general-guidelines/)

### Inferencia de la obra

Custodiar un objeto concede capacidad práctica para estabilizar su descripción. Esa capacidad no demuestra que la descripción sea falsa, pero vuelve pertinente preguntar quién controla el campo visible, la nota interna y el historial de revisión.

Esto justifica a **The Archive** y **The Continuity Office** como operaciones conceptuales, no como caricaturas de instituciones concretas.

---

# II. FIRMA, WALLET E IDENTIDAD

## 5. Qué demuestra una firma digital

### Hecho documentado

NIST describe una firma digital como un mecanismo que permite verificar la integridad de la información firmada y autenticar al signatario dentro de un sistema de claves. La firma se genera con una clave privada y se verifica con la clave pública correspondiente.

Fuentes:

- [NIST — Digital Signatures](https://csrc.nist.gov/projects/digital-signatures)
- [NIST — Private key glossary](https://csrc.nist.gov/glossary/term/private_key)

### Precisión necesaria

La frase simplificada “una firma sólo prueba una clave, nunca una identidad” es demasiado absoluta.

Formulación correcta para la obra:

> A signature can verify that a message corresponds to a key. Connecting that key to a particular human being requires an identity claim, a custody history or another trusted process.

NIST habla de signatario e identidad porque sus modelos presuponen procedimientos de asociación y control de claves. En una wallet seudónima, la verificación criptográfica y la atribución civil o biográfica deben tratarse como capas distintas.

---

## 6. Ethereum: control de cuenta y contexto del mensaje

### Hecho documentado

ERC-4361, Sign-In with Ethereum, utiliza firmas de cuentas Ethereum para autenticación. El mensaje incluye dominio, dirección, URI, chain ID, nonce y fecha. El estándar enfatiza seguridad del origen, prevención de replay y dificultad de la gestión de claves. Para cuentas de contrato, la verificación puede depender del estado y no tiene que ser una función pura.

Fuente:

- [ERC-4361 — Sign-In with Ethereum](https://eips.ethereum.org/EIPS/eip-4361)

### Consecuencias para la ficción

- La validez de una firma depende del mensaje exacto y del método de verificación.
- Una firma extraída de contexto puede seguir siendo criptográficamente válida y semánticamente ambigua.
- Reutilizar una firma o un mensaje sin nonce/contexto adecuado puede abrir problemas de replay en sistemas de autenticación.
- Una dirección puede funcionar como identificador persistente sin probar por sí sola una biografía.
- La cuenta puede ser individual, contractual, multisig o parte de una custodia más compleja.

### Ajuste pendiente del corpus

El mensaje ficticio:

```text
recognized: AF-0-17
for continuity
not the blue one
```

debe definir en producción:

- esquema de firma usado;
- bytes exactos del mensaje;
- cadena o dominio si corresponde;
- dirección verificadora;
- fecha del registro;
- por qué el texto permite una recontextualización posterior.

No hace falta mostrar todo al lector de inmediato, pero la obra debe saberlo.

---

## 7. Compromiso y sucesión de claves

### Hecho documentado

La gestión de claves es un problema distinto de la matemática de la firma. NIST recomienda controles de ciclo de vida y considera el daño posible cuando una clave se compromete. ERC-4361 señala que el control mediante claves impone responsabilidades especiales y que no existe necesariamente un equivalente sencillo a “forgot password.”

Fuentes:

- [NIST SP 800-57 — Key Management](https://csrc.nist.gov/pubs/sp/800/57/pt1/r5/final)
- [ERC-4361 — Key Management considerations](https://eips.ethereum.org/EIPS/eip-4361#key-management)

### Inferencia de la obra

Una firma histórica válida no permite distinguir por sí sola entre:

- continuidad de la artista;
- uso compartido de una wallet de estudio;
- acceso por un asistente;
- herencia;
- recuperación de seed phrase;
- compromiso;
- custodia institucional.

Éste es el fundamento real de **the signature without a signer**.

---

# III. TOKEN, METADATA Y ARCHIVO

## 8. Qué identifica ERC-721

### Hecho documentado

ERC-721 define cada NFT mediante la combinación de dirección de contrato y `tokenId`. Su extensión de metadata permite que `tokenURI` apunte a un recurso externo. El propio estándar contempla que esa URI pueda ser mutable.

Fuente:

- [ERC-721 — Non-Fungible Token Standard](https://eips.ethereum.org/EIPS/eip-721)

### Consecuencia para la obra

Un identificador estable puede conservar continuidad del token sin garantizar por sí mismo:

- que la URI permanezca igual;
- que el archivo siga disponible;
- que el contenido de una URL HTTP no cambie;
- que un recurso ejecutable se vea igual en navegadores futuros;
- que el archivo apuntado corresponda a la intención de la artista.

Frase técnicamente sostenible:

> The token remained identifiable. The conditions under which its referent could be rendered did not.

---

## 9. Content addressing y punteros mutables

### Hecho documentado

En IPFS, cambiar el contenido cambia su CID. IPNS y otros sistemas pueden ofrecer nombres o punteros mutables que se actualizan para señalar nuevos CIDs.

Fuente:

- [IPFS Docs — IPNS and mutability](https://docs.ipfs.tech/concepts/ipns/)

### Consecuencia para la obra

Debemos distinguir al menos:

- URI HTTP mutable;
- URI IPNS mutable;
- CID IPFS inmutable respecto a sus bytes;
- metadata que apunta a otro recurso;
- programa generativo estable que produce una salida desde un hash;
- interfaz futura que interpreta ese programa.

No sería correcto decir que “un CID cambió de contenido conservando el mismo CID.” La ficción debe cambiar el puntero, la metadata, la disponibilidad, el renderer o el archivo designado como original.

---

## 10. Dirección no significa disponibilidad

### Hecho documentado

IPFS distingue content addressing de persistencia. Que un contenido tenga CID no garantiza que una copia permanezca disponible; para sostener disponibilidad se necesita pinning u otra estrategia de almacenamiento.

Fuente:

- [IPFS Docs — Persistence, permanence and pinning](https://docs.ipfs.tech/concepts/persistence/)

### Consecuencia para la obra

La versión más sólida del crimen no necesita alterar bytes detrás de un CID. Puede consistir en:

- perder el contenido original;
- conservar sólo una captura;
- actualizar un puntero mutable;
- reconstruir la obra desde testimonios;
- designar la reconstrucción como preservation master;
- mantener un token verificable cuyo referente original ya no está disponible.

Esto es más exacto que la frase genérica “el archivo on-chain cambió.”

---

## 11. Blockchain: resistente a alteración, no omnisciente

### Hecho documentado

NIST caracteriza las blockchains como ledgers distribuidos resistentes y evidentes frente a manipulación. También advierte que “immutable” no debe entenderse de manera absoluta y documenta límites y malentendidos.

Fuentes:

- [NISTIR 8202 — Blockchain Technology Overview](https://www.nist.gov/publications/blockchain-technology-overview)
- [NISTIR 8202 — Limitations and misconceptions](https://nvlpubs.nist.gov/nistpubs/ir/2018/NIST.IR.8202.pdf)

### Consecuencia para la obra

La cadena puede registrar:

- transacción;
- dirección emisora y receptora;
- llamada a contrato;
- ordenamiento;
- estado resultante;
- timestamp del bloque según el protocolo.

No registra automáticamente:

- intención;
- beneficiario real;
- identidad civil;
- valor afectivo;
- autoría artística;
- contenido de una conversación externa;
- interpretación legal o histórica.

La obra debe decir “tamper-resistant” o “recorded on-chain” cuando la precisión importe, no utilizar “immutable” como magia.

---

## 12. Timestamp de bloque versus fecha de creación

### Hecho documentado

La interfaz JSON-RPC de Ethereum expone el `timestamp` de un bloque como la hora Unix en la que el bloque fue compuesto. Ese campo pertenece al bloque, no a la historia creativa de un archivo externo.

Fuente:

- [Ethereum.org — JSON-RPC block object](https://ethereum.org/developers/docs/apis/json-rpc/)

### Inferencia de la obra

Un timestamp puede demostrar que cierta transacción o dato estaba incluido para determinado momento de la cadena. No demuestra por sí mismo cuándo:

- se concibió una obra;
- se creó un archivo fuera de la cadena;
- se tomó una fotografía;
- una artista adoptó un título;
- se produjo una exposición material.

La frase “minted in 1998” sería imposible en Ethereum y debe aparecer solamente como error institucional dentro de la ficción, no como hecho técnico.

---

# IV. VERSE Y LA EDICIÓN GENERATIVA

## 13. Modelo generativo de Verse

### Hecho documentado

La documentación de Verse para proyectos generativos JavaScript describe una obra como la combinación de un hash único y código de artista desplegado en IPFS. El hash se genera al realizar la venta y se usa para inicializar un generador seudoaleatorio. Verse captura además una imagen previa y genera metadata con campos como `hash`, `generator_url`, `image` y `animation_url`.

Fuente:

- [Verse Docs — Random Generative JS](https://docs.verse.works/projects/generative-verse/)

### Consecuencia para nuestra edición

Nuestro modelo de edición es técnicamente compatible en principio:

- un código fijo;
- un corpus fijo;
- un hash único por edición;
- PRNG determinista;
- salida interactiva en HTML/JavaScript;
- archivos desplegados en IPFS.

Debe verificarse con Verse antes de producción:

- acceso exacto al hash dentro del runtime;
- restricciones del iframe;
- límites de tamaño;
- audio y políticas de autoplay;
- persistencia de fragmentos URL;
- captura de preview;
- archivos admitidos;
- comportamiento offline;
- formato final de traits.

---

## 14. Artwork, edition y token

### Hecho documentado

Verse distingue Collection, Artwork y Edition. Una edición suele ser el activo individual que el coleccionista recibe; `editionNumber` y `tokenId` pueden no coincidir, y el mint on-chain puede ocurrir de manera asíncrona después de la compra.

Fuente:

- [Verse Docs — Entity Model](https://docs.verse.works/core-concepts/entity-model/)

### Consecuencia para la obra

En producción debemos evitar usar indistintamente:

- edition number;
- token ID;
- unique hash;
- route ID;
- chamber ID.

Nomenclatura propuesta:

```text
EDITION 083       identificador curatorial/Verse
TOKEN 0x… / 123   identificador on-chain
HASH 0x…          semilla generativa
CHAMBER 137       posición literaria
ROUTE 7F2A–19C0   estado de lectura
```

---

## 15. Qué afirma Verse sobre propiedad y procedencia

### Hecho documentado

Verse presenta NFTs como activos digitales asegurados mediante criptografía y afirma que permiten probar propiedad y procedencia de ítems digitales. También ofrece custodia para usuarios sin wallet y mercado secundario.

Fuente:

- [Verse — About](https://verse.works/about)

### Posición crítica de nuestra obra

La pieza no necesita negar que un token tenga historial de propiedad. Interroga la transición desde:

```text
ownership history of token
```

hacia:

```text
authorship, identity and historical continuity of artwork
```

La diferencia entre ambas frases es el espacio conceptual de la obra.

---

## 16. Regalías

### Hecho documentado

ERC-2981 estandariza cómo un contrato comunica información de regalías, pero el pago depende de que marketplaces o participantes respeten esa información. El estándar señala además que no toda transferencia es una venta.

Fuente:

- [ERC-2981 — NFT Royalty Standard](https://eips.ethereum.org/EIPS/eip-2981)

### Consecuencia para la obra

Si las regalías aparecen en el expediente, debemos distinguir:

- transferencia de token;
- venta;
- precio declarado;
- pago efectivo;
- royalty information;
- royalty received.

No debemos afirmar que “el contrato garantiza regalías universales” salvo que una implementación específica lo demuestre.

---

# V. CONSERVACIÓN DE ARTE DIGITAL

## 17. Obra versus comportamiento

### Hecho documentado

El Variable Media Network desarrolló un cuestionario para identificar cómo preservar obras que dependen de medios cambiantes. Entre las estrategias discutidas están almacenamiento, migración, emulación y reinterpretación. La reinterpretación puede ser necesaria para ciertas obras, pero también es una estrategia radical y riesgosa si no está autorizada por el artista.

Fuente:

- [Variable Media Network — Questionnaire and preservation strategies](https://www.variablemedia.net/e/welcome.html)

### Consecuencia para la ficción

La frase del informe ficticio:

> What has been preserved is the work's capacity to be recognized as the work.

debe funcionar como posición institucional discutible, no como consenso profesional.

El conservador puede haber elegido preservar:

- comportamiento;
- apariencia;
- código;
- interacción;
- ambiente;
- concepto;
- posibilidad de exhibición.

Esas propiedades pueden entrar en conflicto.

---

## 18. Propiedades significativas

### Hecho documentado

La Library of Congress define una “significant property” como una característica cuya importancia para preservación es determinada subjetivamente. También observa que renderizar un objeto digital depende de software, sistema operativo, recursos informáticos y conectividad, y que separar contenido de contexto puede volverlo inutilizable.

Fuente:

- [Library of Congress — Digital Collections Management Glossary](https://www.loc.gov/programs/digital-collections-management/about-this-program/glossary/)

### Consecuencia para la obra

La conservación nunca es una copia puramente mecánica cuando el ambiente desaparece. Alguien debe decidir qué propiedades cuentan como identidad.

Ésta es la base informada de Versions A–F y del conflicto:

```text
behavior preserved
appearance non-binding
source unavailable
```

---

## 19. Conservación de software y time-based media

### Hecho documentado

El Metropolitan Museum mantiene un departamento de Time-Based Media Conservation para obras basadas en video, sonido, computadoras y software. Sus materiales públicos describen problemas de corrupción de archivos, obsolescencia de formatos, hardware y software cambiante, documentación e instalación.

Fuentes:

- [The Met — Time-Based Media Conservation](https://www.metmuseum.org/departments/time-based-media-conservation)
- [The Met — Immaterial: Time](https://www.metmuseum.org/perspectives/immaterial-time)

### Consecuencia para la obra

El informe de conservación ficticio debe sonar como una negociación informada entre propiedades, no como si el museo simplemente hubiera reemplazado un JPG.

La segunda expansión del corpus deberá incluir:

- dependencies;
- runtime;
- browser version;
- display behavior;
- acceptable variation;
- artist consultation unavailable;
- rationale for migration;
- documentation of intervention;
- distinction between preservation master and exhibition copy.

---

# VI. ARCHIVO, AUTENTICIDAD Y CONTEXTO

## 20. Un registro confiable necesita contexto

### Hecho documentado

National Archives señala que para sostener confiabilidad, autenticidad, integridad y usabilidad de un registro electrónico puede ser necesario preservar contenido, contexto y estructura. También recomienda conservar vínculos entre registros que documenten una secuencia de actividades.

Fuente:

- [National Archives — Implementing Electronic Signature Technologies](https://www.archives.gov/records-mgmt/policy/electronic-signature-technology.html)

### Consecuencia para la economía de evidencia

Nuestra mecánica de comprar un dato entregando contexto no es sólo metáfora. Demuestra cómo un elemento puede seguir siendo íntegro como fragmento y volverse menos confiable como registro de una actividad.

> The visitor receives a cleaner fact and a poorer record.

---

## 21. Receipt no equivale a prueba completa

### Inferencia de fuentes archivísticas

Un receipt de la obra puede documentar que una operación ocurrió sin conservar:

- contenido completo;
- intención;
- fuente original;
- estructura;
- alternativas descartadas.

Por eso los receipts forman una versión verificable pero empobrecida de la novela.

La obra no debe llamar “authentic” a ese resumen sin especificar: authentic as transaction record, incomplete as evidence.

---

# VII. MERCADO Y WASH TRADING

## 22. Definición regulatoria general

### Hecho documentado

La CFTC define wash trading como transacciones reales o aparentes que producen apariencia de compras y ventas sin asumir riesgo de mercado ni cambiar efectivamente la posición del trader. En contextos regulatorios, intención y beneficial ownership importan.

Fuente:

- [CFTC Glossary — Wash Trading](https://www.cftc.gov/LearnAndProtect/AdvisoriesAndArticles/CFTCGlossary/index.htm)

### Precaución

La jurisdicción y definición jurídica aplicable a NFTs depende de hechos y legislación concretos. La obra no debe acusar a una entidad real ni presentar su ficción como asesoría legal.

---

## 23. Detección en mercados NFT

### Hecho documentado

Estudios académicos han utilizado patrones de red, transferencias entre direcciones y análisis conductual para detectar actividad NFT sospechosa. Las cifras varían mucho según periodo, plataformas, incentivos y metodología. Los estudios hablan de detección, heurísticas, actividad señalada o posibles abusos; una relación on-chain por sí sola no identifica necesariamente al beneficiario real.

Fuentes:

- [La Morgia et al. — A Game of NFTs](https://arxiv.org/abs/2212.01225)
- [von Wachter et al. — NFT Wash Trading](https://arxiv.org/abs/2202.03866)
- [Niu et al. — Unveiling Wash Trading in Popular NFT Markets](https://arxiv.org/abs/2403.10361)

### Consecuencia para el caso ficticio

La venta circular debe presentarse como una constelación de indicios:

- fondos relacionados;
- infraestructura compartida;
- temporalidad;
- retorno económico;
- posibles incentivos;
- falta de independencia.

No como una detección automática infalible.

Frase adecuada:

> The transaction occurred. Its independence could not be established.

Frase que debemos evitar:

> The blockchain proves that the seller bought the work from themself.

salvo que la ficción construya evidencia explícita de beneficial ownership.

---

## 24. Precio como productor de historia

### Inferencia de la obra

Las fuentes documentan que provenance incluye ventas, valores y agentes, y que mercados pueden mostrar actividad artificial. De ello no se sigue automáticamente que un precio fabrique importancia histórica.

Ésta es nuestra hipótesis literaria:

> A public price creates incentives for conservation, scholarship, exhibition and memory; those consequences can later be narrated as causes of the price.

Debe dramatizarse mediante documentos ficticios, no presentarse como una ley económica universal.

---

# VIII. HIPERSTICIÓN Y CUT-UP

## 25. Genealogía mínima de hyperstition

### Hecho documentado

El archivo de la Cybernetic Culture Research Unit conserva materiales que mezclan teoría, ficción, mercados, tecnología, temporalidad y “hyperstition.” No ofrece una definición académica única y estable que debamos tratar como estándar técnico.

Fuente primaria de contexto:

- [CCRU Archive](https://www.ccru.net/archive.htm)

### Decisión conceptual de la obra

Usaremos una definición operacional propia:

> A claim becomes historical when its circulation produces institutions and material consequences that are later cited as evidence for the claim.

Esta definición es nuestra herramienta dramatúrgica, no una cita literal ni una atribución exhaustiva de la tradición de hyperstition.

---

## 26. Burroughs: language, recording and control

### Hecho documentado

En *The Electronic Revolution*, William S. Burroughs desarrolla la imagen del lenguaje como virus y vincula grabación, reproducción, cut-up y control. El texto circula en un archivo autorizado por el editor que declara los derechos correspondientes.

Fuente primaria:

- [William S. Burroughs — Electronic Revolution, RealityStudio](https://realitystudio.org/texts/electronic-revolution/)

Fuente académica de apoyo:

- [Alan Carmody — The Evolution of the Cut-Up Technique as a Political Weapon](https://mural.maynoothuniversity.ie/id/eprint/10828/)

### Decisión de la obra

No imitaremos la prosa de Burroughs ni usaremos cut-up como generador aleatorio de frases.

Tomaremos operaciones generales:

- grabación que altera lo registrado;
- fragmento que cambia de huésped;
- repetición como reproducción;
- sintaxis como tecnología de control;
- recombinación que puede revelar o fabricar relaciones.

Nuestro cut-up conserva custodia, causa y consecuencia.

---

## 27. Diferencia entre contagio y difusión

### Definición de trabajo

Una frase simplemente difundida aparece en muchos lugares. Una frase contagiosa cambia el comportamiento del sistema que la recibe.

Ejemplo:

```text
I think the screen went blue.
→ Witness recalls a blue screen.
→ Blue-screen event documented.
→ Establish blue-screen behavior.
```

La última versión ya no describe: permite una acción.

Ésta es una construcción original de la pieza basada en su protocolo de voces.

---

# IX. CLAIMS: QUÉ PODEMOS DECIR

## 28. Tabla de precisión

| Tema | Formulación sostenible | Formulación a evitar |
|---|---|---|
| firma | verifies relation between message and key/address | proves the artist signed |
| wallet | address controlled by a key or account logic | person living on-chain |
| token | stable token identifier and transfer record | the artwork itself is permanently on-chain |
| URI | may point to external metadata/media | guarantees permanent content |
| IPFS CID | content change produces different CID | same CID silently contains new bytes |
| IPNS/HTTP | pointer may change destination | all decentralized links are immutable |
| timestamp | records block collation/inclusion time | proves date of artistic creation |
| transfer | records change of token ownership/custody state | proves a bona fide sale |
| price | recorded amount or marketplace event | proves independent demand |
| provenance | researched history with sources and gaps | automatic truth emitted by ledger |
| conservation | chooses and documents significant properties | perfectly preserves an unambiguous original |
| route | reproducible state derived from choices | proof that a named human experienced it |

---

## 29. Frases aprobadas para el corpus

> The signature is valid. The identity attached to it is a separate claim.

> The token preserved an identifier. The file required someone to preserve its availability.

> The timestamp belongs to the record, not to the act of creation later assigned to it.

> The transaction occurred. Its independence could not be established.

> The earliest available version is not necessarily the earliest version.

> A reconstruction can preserve behavior by changing the thing that performs it.

> The route can be reproduced. The reading cannot.

> TRACE records that one claim followed another. It does not prove that following is descent.

---

## 30. Frases que deben revisarse en documentos existentes

### “The blockchain is immutable”

Cambiar por:

> The relevant transaction remains tamper-resistant and publicly reproducible under the chain's current history.

o, en lenguaje literario menos técnico:

> The record resisted alteration. It did not resist interpretation.

### “The hash proves the artwork”

Cambiar por:

> The hash verifies a particular input or content state. The artwork's identity still depends on what the system claims that input represents.

### “Every transfer is a sale”

Cambiar por:

> Transfers and sales must be modeled separately.

### “Owner equals signer”

Cambiar por:

> Current ownership, historical control and human authorship are separate relations.

---

# X. FICTITIOUS CASE PARAMETERS

## 31. Safe fictionalization

The case remains fictional.

Use:

- invented artist;
- invented artwork;
- invented wallet and address;
- invented institutions;
- invented sale graph;
- invented conservation dispute;
- invented exhibition;
- technically plausible messages and metadata.

Avoid:

- reusing a real compromised address;
- implying criminal conduct by Verse, a museum, gallery or named person;
- copying the particulars of one unresolved real fraud;
- presenting generated transactions as real;
- linking fictional allegations to live wallets;
- using real witness names;
- claiming legal conclusions.

Real standards and institutional practices may be cited as context without making institutions characters in the crime.

---

## 32. Technical skeleton of the fictional case

Recommended plausible structure:

1. A historical Ethereum address has documented earlier association with the artist or studio.
2. A message is validly signed by that address years later.
3. The message contains an ambiguous internal identifier, not a content hash sufficient to identify the present file.
4. An ERC-721 edition is minted with metadata referring to an artwork record.
5. The generator or metadata is content-addressed, but the claimed historical source file is unavailable.
6. A reconstruction is produced from photograph, partial code, witnesses and later materials.
7. The edition hash reproducibly renders the current work.
8. A related-party transaction establishes a public price without conclusively proving unlawful wash trading.
9. Institutions treat price, signature and reconstruction as mutually reinforcing.
10. The investigation itself becomes new provenance.

This preserves the distinction between a stable released edition and an unstable alleged prehistory.

---

## 33. Important correction to our plot

The present artwork on Verse can be technically stable and fully reproducible.

The instability belongs to the fictional object's alleged origin:

- What did the historical identifier mean?
- Did an earlier file exist?
- Does the reconstruction preserve it?
- Who controlled the key?
- Did the exhibition occur?

This prevents a contradiction in which our own fixed generative work depends on the same mutable-media trick it criticizes without acknowledging it.

---

# XI. RESEARCH TASKS STILL OPEN

## 34. Before final corpus revision

Research and choose:

- a real historical browser, codec or graphics behavior for the blue anachronism;
- plausible dates for the artist's early practice and later mint;
- exact signing scheme for the fictional message;
- whether the historical wallet is EOA, multisig or contract account;
- realistic metadata layout;
- precise preservation workflow and terminology;
- fictional jurisdiction structure for the related-party sale;
- evidence standards for photograph dating;
- museum catalog conventions for uncertainty;
- vocabulary of conservation reports;
- what TRACE records and explicitly cannot record.

These choices require targeted second-round research, not more general browsing.

---

## 35. Before implementation

Confirm with current Verse documentation or team:

- project file structure;
- hash injection;
- supported JavaScript features;
- sandbox/iframe permissions;
- URL fragment persistence;
- audio policy;
- total bundle size;
- preview generation timing;
- responsive preview requirements;
- deterministic rendering expectations;
- traits pipeline;
- edition count and sale mechanics;
- long-term IPFS packaging;
- accessibility expectations.

Documentation can change; this checklist must be reverified immediately before build.

---

# XII. SOURCE REGISTER

## 36. Primary technical and institutional sources

- [ERC-721 — Non-Fungible Token Standard](https://eips.ethereum.org/EIPS/eip-721)
- [ERC-4361 — Sign-In with Ethereum](https://eips.ethereum.org/EIPS/eip-4361)
- [ERC-2981 — NFT Royalty Standard](https://eips.ethereum.org/EIPS/eip-2981)
- [Ethereum.org — JSON-RPC API](https://ethereum.org/developers/docs/apis/json-rpc/)
- [NIST — Digital Signatures](https://csrc.nist.gov/projects/digital-signatures)
- [NISTIR 8202 — Blockchain Technology Overview](https://www.nist.gov/publications/blockchain-technology-overview)
- [IPFS — IPNS and mutability](https://docs.ipfs.tech/concepts/ipns/)
- [IPFS — Persistence, permanence and pinning](https://docs.ipfs.tech/concepts/persistence/)
- [Verse — Random Generative JS](https://docs.verse.works/projects/generative-verse/)
- [Verse — Entity Model](https://docs.verse.works/core-concepts/entity-model/)
- [Verse — About](https://verse.works/about)
- [Getty CDWA — Ownership/Collecting History](https://www.getty.edu/publications/categories-description-works-art/categories/object-architecture-group/23/)
- [Getty CDWA — General Guidelines](https://www.getty.edu/publications/categories-description-works-art/general-guidelines/)
- [Getty Museum — Provenance](https://www.getty.edu/museum/provenance/)
- [National Archives — Electronic Signature Technologies](https://www.archives.gov/records-mgmt/policy/electronic-signature-technology.html)
- [Library of Congress — Digital Collections Glossary](https://www.loc.gov/programs/digital-collections-management/about-this-program/glossary/)
- [Variable Media Network](https://www.variablemedia.net/e/welcome.html)
- [The Met — Time-Based Media Conservation](https://www.metmuseum.org/departments/time-based-media-conservation)
- [CFTC Glossary — Wash Trading](https://www.cftc.gov/LearnAndProtect/AdvisoriesAndArticles/CFTCGlossary/index.htm)
- [CCRU Archive](https://www.ccru.net/archive.htm)
- [William S. Burroughs — Electronic Revolution](https://realitystudio.org/texts/electronic-revolution/)

## 37. Academic studies used cautiously

- [La Morgia et al. — A Game of NFTs: Characterizing NFT Wash Trading](https://arxiv.org/abs/2212.01225)
- [von Wachter et al. — NFT Wash Trading: Quantifying Suspicious Behaviour](https://arxiv.org/abs/2202.03866)
- [Niu et al. — Unveiling Wash Trading in Popular NFT Markets](https://arxiv.org/abs/2403.10361)
- [Alan Carmody — William Burroughs's Electronic Revolution and the Cut-Up](https://mural.maynoothuniversity.ie/id/eprint/10828/)

Numerical estimates from wash-trading studies should not be inserted casually into the novel. Different samples and heuristics produce different results.

---

## 38. Final research rule

For every technical sentence in the finished work, ask:

1. Is this a fact, an inference or a fictional claim?
2. What exactly does the underlying system verify?
3. Which human or institutional relation remains external?
4. Could the sentence mislead a technically informed reader?
5. Does the inaccuracy belong intentionally to a character, or accidentally to us?

> The work may contain unreliable institutions.  
> Its authors must know exactly where they become unreliable.

