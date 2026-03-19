
/*consulta https://github.com/galaxykate/tracery/issues/31
*/



var grammars = {


    e : {


         "letter": ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P"],

         "bracetypes": ["[bloqueq:🮎][partb:🮒,🭾,🮘]","[bloqueq:🬈][partb:🬍,🬗,🮖,🬂]","[pared:🮕][prd:🮀]","[pared:𝧝][prd:𝧞]","[pared:🬗][prd:🮖,🬰]","[pared:🬗][prd:🮖,🬰]","[pared:🮛][prd:🬅,🬈,🬇]","[bloqueq:🮘][partb:#phai#]"],



         "brace": [ "#cemento#","#cemento##cemento#","#cemento##cemento##cemento#","#cemento##cemento##cemento##cemento#", "#cemento##cemento##cemento##cemento##cemento#", "#cemento##cemento##cemento##cemento##cemento##cemento#", "#cemento##cemento##cemento##cemento##cemento##cemento##cemento##cemento##cemento##cemento##cemento##cemento#"],
/*carita*/
       "bloqrand":["#bloqueq##bloqueq##bloqueq##bloqueq##bloqueq##bloqueq#<br>#bloqueq##bloqueq##bloqueq#<h5>#ojitos#</h5>#bloqueq##bloqueq##bloqueq#<h5>#ojitos#</h5>#bloqueq##bloqueq##bloque##bloqueq##bloque##phai##bloque##bloque##bloqueq##bloqueq##bloqueq##bloque##bloque##bloque##bloqueq##bloqueq##bloqueq##bloqueq##bloqueq##bloqueq##bloqueq##bloqueq#"],

         "brace2": ["#[bloqueq2:#bloqueq#][partb2:#partb#]brace#"],

         "bloque": [ "🬀", "🬁", "🬂", "🬃", "🬄", "🬅", "🬆", "🬇", "🬈", "🬉", "🬊", "🬋", "🬌", "🬍", "🬎", "🬏", "🬐", "🬑", "🬒", "🬓", "🬔", "🬕", "🬖", "🬗", "🬘", "🬙", "🬚", "🬛", "🬜", "🬝", "🬞", "🬟", "🬠", "🬡", "🬢", "🬣", "🬤", "🬥", "🬦", "🬧", "🬨", "🬩", "🬪", "🬫", "🬬", "🬭", "🬮", "🬯", "🬰", "🬱", "🬲", "🬳", "🬴", "🬵", "🬶", "🬷", "🬸", "🬹", "🬺", "🬻","🬀", "🬁", "🬂", "🬃", "🬄", "🬅", "🬆", "🬇", "🬈", "🬉", "🬊", "🬋", "🬌", "🬍", "🬎", "🬏", "🬐", "🬑", "🬒", "🬓", "🬔", "🬕", "🬖", "🬗", "🬘", "🬙", "🬚", "🬛", "🬜", "🬝", "🬞", "🬟", "🬠", "🬡", "🬢", "🬣", "🬤", "🬥", "🬦", "🬧", "🬨", "🬩", "🬪", "🬫", "🬬", "🬭", "🬮", "🬯", "🬰", "🬱", "🬲", "🬳", "🬴", "🬵", "🬶", "🬷", "🬸", "🬹", "🬺", "🬻", "🬼", "🬽", "🬾", "🬿", "🭀", "🭁", "🭂", "🭃", "🭄", "🭅", "🭆", "🭇", "🭈", "🭉", "🭊", "🭋", "🭌", "🭍", "🭎", "🭏", "🭐", "🭑", "🭒", "🭓", "🭔", "🭕", "🭖", "🭗", "🭘", "🭙", "🭚", "🭛", "🭜", "🭝", "🭞", "🭟", "🭠", "🭡", "🭢", "🭣", "🭤", "🭥", "🭦", "🭧", "🭨", "🭩", "🭪", "🭫", "🭬", "🭭", "🭮", "🭯", "🭰", "🭱", "🭲", "🭳", "🭴", "🭵", "🭶", "🭷", "🭸", "🭹", "🭺", "🭻", "🭼", "🭽", "🭾", "🭿", "🮀", "🮁", "🮂", "🮃", "🮄", "🮅", "🮆", "🮇", "🮈", "🮉", "🮊", "🮋", "🮌", "🮍", "🮎", "🮏", "🮐", "🮑", "🮒", "", "🮔", "🮕", "🮖", "🮗", "🮘", "🮙","🮌", "🮍", "🮎", "🮏", "🮐", "🮑", "🮒", "", "🮔", "🮕", "🮖", "🮗", "🮘", "🮙","🮌", "🮍", "🮎", "🮏", "🮐", "🮑", "🮒", "", "🮔", "🮕", "🮖", "🮗", "🮘", "🮙","🮌", "🮍", "🮎", "🮏", "🮐", "🮑", "🮒", "", "🮔", "🮕", "🮖", "🮗", "🮘", "🮙","🮂", "🮃", "🮄", "🮅", "🮆", "🮇", "🮈", "🮉", "🮊", "🮋", "🮌", "🮍", "🮎", "🮏", "🮐", "🮑", "🮒", "", "🮔", "🮕", "🮖", "🮗", "🮘", "🮙", "🮚", "🮛", "🮜", "🮝", "🮞", "🮟","⨀","⨁","⨂","⨃","⨄","⨅","⨆","⌸","⌹","⌺","⌻","⌼","⌽","⌾"],




         "gg":["🬀", "🬁", "🬂", "🬃", "🬄", "🬅", "🬆", "🬇", "🬈", "🬉", "🬊", "🬋", "🬌", "🬍", "🬎", "🬏", "🬐", "🬑", "🬒", "🬓", "🬔", "🬕", "🬖", "🬗", "🬘", "🬙", "🬚", "🬛", "🬜", "🬝", "🬞", "🬟", "🬠", "🬡", "🬢", "🬣", "🬤", "🬥", "🬦", "🬧", "🬨", "🬩", "🬪", "🬫", "🬬", "🬭", "🬮", "🬯", "🬰", "🬱", "🬲", "🬳", "🬴", "🬵", "🬶", "🬷", "🬸", "🬹", "🬺", "🬻", "🭰", "🭱", "🭲", "🭳", "🭴", "🭵", "🭶", "🭷", "🭸", "🭹", "🭺", "🭻", "🭼", "🭽", "🭾", "🭿", "🮀", "🮁", "🮂", "🮃", "🮄", "🮅", "🮆", "🮇", "🮈", "🮉", "🮊", "🮋", "🮌", "🮍", "🮎", "🮏", "🮐", "🮑", "🮒", "", "🮔", "🮕", "🮖", "🮗", "🮘", "🮙", "🮚", "🮛", "🮜", "🮝", "🮞", "🮟","🮌", "🮍", "🮎", "🮏", "🮐", "🮑", "🮒", "", "🮔", "🮕", "🮖", "🮗", "🮘", "🮙","🮌", "🮍", "🮎", "🮏", "🮐", "🮑", "🮒", "", "🮔", "🮕", "🮖", "🮗", "🮘", "🮙","🮌", "🮍", "🮎", "🮏", "🮐", "🮑", "🮒", "", "🮔", "🮕", "🮖", "🮗", "🮘", "🮙","🮌", "🮍", "🮎", "🮏", "🮐", "🮑", "🮒", "", "🮔", "🮕", "🮖", "🮗", "🮘", "🮙","🮌", "🮍", "🮎", "🮏", "🮐", "🮑", "🮒", "", "🮔", "🮕", "🮖", "🮗", "🮘", "🮙","🮌", "🮍", "🮎", "🮏", "🮐", "🮑", "🮒", "", "🮔", "🮕", "🮖", "🮗", "🮘", "🮙","🮌", "🮍", "🮎", "🮏", "🮐", "🮑", "🮒", "", "🮔", "🮕", "🮖", "🮗", "🮘", "🮙","🮌", "🮍", "🮎", "🮏", "🮐", "🮑", "🮒", "", "🮔", "🮕", "🮖", "🮗", "🮘", "🮙","🮌", "🮍", "🮎", "🮏", "🮐", "🮑", "🮒", "", "🮔", "🮕", "🮖", "🮗", "🮘", "🮙"],

         "cemento":["<h4>#tabiquemezcla#</h4>","<h5>#tabique#</h5><span>#tabiquemezcla#</span>","<h5>#tabique#</h5>","#tabiquemezcla#<span>#tabique#</span>","<span>#tabiquemezcla#</span><h4>#tabique#</h4>#tabiquemezcla#","<h5>#tabique#</h5><span>#tabiquemezcla#</span><h4>#tabique#</h4>#tabiquemezcla#", "<h4>#tabiquemezcla#</h4><h4>#tabiquemezcla#</h4><h5>#tabique#</h5>","<font>#tabique#</font>","<font>#tabique#</font><font>#tabique#</font>","<h4>#tabiquemezcla#</h4><font>#tabique#</font>","<h5>#tabique#</h5><font>#tabique#</font><span>#tabiquemezcla#</span>","<h5>#tabique#</h5>","<font>#tabique#</font>#tabiquemezcla#<span>#tabique#</span>","<span>#tabiquemezcla#</span><font>#tabique#</font><h4>#tabique#</h4><font>#tabique#</font>#tabiquemezcla#","<h5>#tabique#</h5><span>#tabiquemezcla#</span><font>#tabique#</font><font>#tabique#</font><h4>#tabique#</h4>#tabiquemezcla#", "<h4>#tabiquemezcla#</h4><h4>#tabiquemezcla#</h4><h5>#tabique#</h5>","<font>#tabique#</font>"],


         "tabiquemezcla":["<h4>#tabique#</h4>", "<h5>#tabique#</h5>", "<span>#tabique#</span>", "<h6>#tabique#</h6>"],

         "tabmod":["#bloqueq##modsml##modsml##black##modsml#","#modsml##modsml##modsml#","#bloqueq##modsml##modsml##modsml#","<span>#cubos#</span>","<span>#cubos#</span><span>#cubos#</span>","#black#","#bloqrand#"],

         "espacio":["  ", " "],

         "tabique":["#piedra#","<span>#piedra#</span>","#piedra##piedra##piedra#","#piedra#<h5>#piedra#</h5>#piedra#","<h4>#piedra#</h4><h5>#piedra#</h5><h4>#piedra#</h4>","#piedra#<span>#piedra#</span>#piedra##piedra##piedra#","#piedra#<span>#piedra#</span>#piedra#<h5>#piedra#</h5>#piedra#"],

         "piedra":["#bloqueq#","#imposiblesq#","#bloqueq#","#bloqueq#","#bloqueq#","#bloqueq#","<span>#bloqueq#</span>", "<span>#bloqueq#</span><span>#bloqueq#</span>","<h5>#bloqueq#</h5>","<h5>#bloqueq#</h5><h5>#bloqueq#</h5>","<font>#bloqueq#</font>","<h6>#bloqueq#<h6>","<h6>#bloqueq#<h6><h6>#bloqueq#<h6>","<br>","#bloqueq#","#bloqueq#","#prd#","#prd#","#prd#","#prd#","#tabmod#","","#oghmd#", "#runir#","<h5>#runir#</h5>","<span>#runir#</span>", "#bloquemayor#","#tabmod#", "<span>#cubos#</span>", "#partbloc#","#partblocq#","#partblocd#","#partblocq##partblocd##black##partblocq#","#partbloc#","#partblocq#","#partblocd#","#partblocq##partblocd##partblocq#","#bloqueq2#","#partb2#","#bbox#","#kawa#","#vid#","#black#","#black#","#black#","#tibetan#","#ti#","<span>#cubo#</span>", "#espacio#", "#espacio#","#partblocd#","#partblocd#", "#partblocd#","<h2>#animal#</h2>"],

         "ideographicdescriptioncharacters":["⿰","⿱","⿲","⿳","⿴","⿵","⿶","⿷","⿸","⿹","⿺","⿻"],

         "cubos":["#cubo#<span>#cubo#</span>#cubo#","#cubo#","#cubo#<span>#cubo#</span>","#cubo##cubo##cubo#<span>#cubo#</span>","#cubo#<span>#cubo#</span><span>#cubo#</span>#ideographicdescriptioncharacters##cubo#<span>#cubo#</span>#cubo##cubo##cubo#<span>#cubo#</span>#ideographicdescriptioncharacters#<span>#cubo#</span>#cubo##cubo#", "#cubo##ideographicdescriptioncharacters##cubo#","#ideographicdescriptioncharacters#","#ideographicdescriptioncharacters##ideographicdescriptioncharacters#","#ideographicdescriptioncharacters##cubo##ideographicdescriptioncharacters#"],

         "bloquemayor":["#bloqueq##bloque#<h5>#cmdoc#</h5>#cmdoc##bloque##black#<h5>#cmdoc#</h5>#cmdoc##bloque##bloque##bloque##bloque#<h5>#cmdoc#</h5>#cmdoc##prd##bloqueq##bloque#","#bloqueq##bloque##black##bloqueq#<h5>#cmdoc#</h5>#cmdoc#<h5>#cmdoc#</h5>#cmdoc##bloqueq##bloqueq##bloqueq##bloque#"],
         "oghmd":["#ogh##ogh##ogh##ogh#","#ogh##ogh#","<h5>#ogh#</h5>","#ogh#<h5>#ogh#</h5><h5>#ogh#</h5>#ogh#","#ogh#<h5>#ogh#</h5>","<h5>#ogh#</h5>",],
         "runir":["#runi##runi#","#runi#","#runi##runi#<h5>#runi#</h5>#runi#","#runi##runi#<h5>#runi#</h5>#runi#<span>#runi#</span><h5>#runi#</h5><h5>#runi#</h5>#runi#" ],

         "runic": ["ᨀ","ᨁ","ᨂ","ᨃ","ᨄ","ᨅ","ᨆ","ᨇ","ᨈ","ᨉ","ᨊ","ᨋ","ᨌ","ᨍ","ᨎ","ᨏ","ᨐ","ᨑ","ᨒ","ᨓ","ᨔ","ᨕ","ᨖ"," ","ᨗ"," ","ᨘ"," ","ᨙ"," ","ᨚ"," ","ᨛ","᨞","᨟"],
         "partbloc":["#partb##partb##black##partb##partb#","#partb##partb##partb##partb#","#partb##partb#","#partb##partb##bloqueq##partb##partb#","#partb##partb##bloque##partb##black##partb#"],

         "prd":["#prde##prde##prde#","#prde#<h5>#partblocq#</h5>#prde#","#prde##partblocq##prde#<h5>#partblocq#</h5>#prde##prde#","#prde##partblocq##prde##black#<h5>#partblocq#</h5>#prde##prde#"],
         "ogham":[" ","ᚁ","ᚂ","ᚃ","ᚄ","ᚅ","ᚆ","ᚇ","ᚈ","ᚉ","ᚊ","ᚋ","ᚌ","ᚍ","ᚎ","ᚏ","ᚐ","ᚑ","ᚒ","ᚓ","ᚔ","ᚕ","ᚖ","ᚗ","ᚘ","ᚙ","ᚚ","᚛","᚜"],


/* cdme son cuadrados, cmdoc y cmdec son los repetidos */


         "mixbloc": ["#cmdec#","#cmdoc#"],

                  "partblocq": ["#cmdoc#<h5>#cmdoc#</h5>#cmdoc##cmdoc#<h5>#cmdoc#</h5>#cmdoc#","#cmdoc##cmdoc##cmdoc##cmdoc##cmdoc#<h5>#cmdoc#</h5>#cmdoc##cmdoc##cmdoc#<h5>#cmdoc#</h5>#cmdoc##cmdoc#","#mixbloc##mixbloc##mixbloc##mixbloc##mixbloc#","#cmdoc##cmdoc#<h5>#cmdoc#</h5>#mixbloc##mixbloc##mixbloc##mixbloc##mixbloc##mixbloc##mixbloc##mixbloc##cmdoc#<h5>#cmdoc#</h5>#cmdoc##cmdoc##cmdoc#"],
"partblocd":["#partblocdec#", "#partblocq#"],

         "partblocdec": ["#cmdec##cmdec##cmdec##cmdec##cmdec##cmdec#","#cmdec##cmdec##cmdec##cmdec##cmdec##cmdec##cmdec##cmdec##cmdec##cmdec##cmdec##cmdec##cmdec##cmdec##cmdec##cmdec##cmdec##cmdec#","#cmdec##cmdec##mixbloc##cmdec##cmdec#","#mixbloc##mixbloc##mixbloc##cmdec##cmdec##cmdec##cmdec##mixbloc##mixbloc##mixbloc##mixbloc#"],

         "cdme":[" ","᪰"," ","᪱"," ","᪲"," ","᪳"," ","᪴"," ","᪵"," ","᪶"," ","᪷"," ","᪸"," ","᪹"," ","᪺"," ","᪻"," ","᪼"," ","᪽"," ","᪾"," ","᷀"," ","᷁"," ","᷂"," ","᷃"," ","᷄"," ","᷅"," ","᷆"," ","᷇"," ","᷈"," ","᷉"," ","᷊"," ","᷋"," ","᷌"," ","᷍"," ","᷎"," ","᷏"," ","᷐"," ","᷑"," ","᷒"," ","ᷓ"," ","ᷔ"," ","ᷕ"," ","ᷖ"," ","ᷗ"," ","ᷘ"," ","ᷙ"," ","ᷚ"," ","ᷛ"," ","ᷜ"," ","ᷝ"," ","ᷞ"," ","ᷟ"," ","ᷠ"," ","ᷡ"," ","ᷢ"," ","ᷣ"," ","ᷤ"," ","ᷥ"," ","ᷦ"," ","ᷧ"," ","ᷨ"," ","ᷩ"," ","ᷪ"," ","ᷫ"," ","ᷬ"," ","ᷭ"," ","ᷮ"," ","ᷯ"," ","ᷰ"," ","ᷱ"," ","ᷲ"," ","ᷳ"," ","ᷴ"," ","᷵"," ","᷶"," ","᷷"," ","᷸"," ","᷹"," ","᷻"," ","᷼"," ","᷽"," ","᷾"," ","᷿"],

         "kayahli":["꤀","꤁","꤂","꤃","꤄","꤅","꤆","꤇","꤈","꤉","ꤊ","ꤋ","ꤌ","ꤍ","ꤎ","ꤏ","ꤐ","ꤑ","ꤒ","ꤓ","ꤔ","ꤕ","ꤖ","ꤗ","ꤘ","ꤙ","ꤚ","ꤛ","ꤜ","ꤝ","ꤞ","ꤟ","ꤠ","ꤡ","ꤢ","ꤣ","ꤤ","ꤥ"," ","ꤦ"," ","ꤧ"," ","ꤨ"," ","ꤩ"," ","ꤪ"," ","꤫"," ","꤬"," ","꤭","꤮","꤯"],



         "kawa":["#kaya##kaya#","#kaya##kaya##kaya##kaya##kaya##kaya##kaya##kaya#","#kaya##kaya##kaya##kaya#","#kaya##kaya##kaya#","#kaya##kayahli##kaya#"],

         "bbox":["<span>#box#</span>#box##boxx#<span>#box#</span>#box#","#box#<span>#box#</span><span>#box#</span><span>#box#</span><span>#box#</span>#box#<span>#box#</span>#box##box#","#boxx#","#boxx##boxx##boxx#","<span>#box#</span>#boxx#<span>#box#</span>#boxx#","#box##box#<span>#box#</span>#box#<span>#box#</span>","#box##box##boxx##box#<span>#box#</span>#box##boxx##box##box##box#","#dbox#","#dbox##dbox##dbox#","#dbox##dbox#","#dbox##dbox##dbox##dbox##dbox#","#dbox##dbox##dbox##dbox##dbox##dbox##dbox#"],
         "dbox":["#boxx#","#box#"],

         "black":["#bloqw##bloqw##bloqw##bloqw#","#bloqw##bloqw##bloqw##bloqw##bloqw##bloqw##bloqw##bloqw#","#bloqw##bloqw##bloqw##bloqw##bloqw##bloqw##bloqw##bloqw##bloqw##bloqw##bloqw#","#bloqw##bloqw##bloqw#","#bloqw##bloqw##bloqw##bloqw##bloqw##bloqw##bloqw##bloqw##bloqw##bloqw##bloqw##bloqw#","#bloqw##bloqw##bloqw##bloqw##bloqw#"],
         "bloqw":["#gaga#","#gigi#"],

          "tibetan":["ༀ","༁","༂","༃","༄","༅","༆","༇","༈","༉","༊","་","༌","།","༎","༏","༐","༑","༒","༓","༔","༕","༖","༗"," ","༘"," ","༙","༚","༛","༜","༝","༞","༟","༠","༡","༢","༣","༤","༥","༦","༧","༨","༩","༪","༫","༬","༭","༮","༯","༰","༱","༲","༳","༴"," ","༵","༶"," ","༷","༸"," ","༹","༺","༻","༼","༽"," ","༾"," ","༿","ཀ","ཁ","ག","གྷ","ང","ཅ","ཆ","ཇ","ཉ","ཊ","ཋ","ཌ","ཌྷ","ཎ","ཏ","ཐ","ད","དྷ","ན","པ","ཕ","བ","བྷ","མ","ཙ","ཚ","ཛ","ཛྷ","ཝ","ཞ","ཟ","འ","ཡ","ར","ལ","ཤ","ཥ","ས","ཧ","ཨ","ཀྵ","ཪ","ཫ","ཬ"," ","ཱ"," ","ི"," ","ཱི"," ","ུ"," ","ཱུ"," ","ྲྀ"," ","ཷ"," ","ླྀ"," ","ཹ"," ","ེ"," ","ཻ"," ","ོ"," ","ཽ"," ","ཾ"," ","ཿ"," ","ྀ"," ","ཱྀ"," ","ྂ"," ","ྃ"," ","྄","྅"," ","྆"," ","྇","ྈ","ྉ","ྊ","ྋ","ྌ"," ","ྍ"," ","ྎ"," ","ྏ"," ","ྐ"," ","ྑ"," ","ྒ"," ","ྒྷ"," ","ྔ"," ","ྕ"," ","ྖ"," ","ྗ"," ","ྙ"," ","ྚ"," ","ྛ"," ","ྜ"," ","ྜྷ"," ","ྞ"," ","ྟ"," ","ྠ"," ","ྡ"," ","ྡྷ"," ","ྣ"," ","ྤ"," ","ྥ"," ","ྦ"," ","ྦྷ"," ","ྨ"," ","ྩ"," ","ྪ"," ","ྫ"," ","ྫྷ"," ","ྭ"," ","ྮ"," ","ྯ"," ","ྰ"," ","ྱ"," ","ྲ"," ","ླ"," ","ྴ"," ","ྵ"," ","ྶ"," ","ྷ"," ","ྸ"," ","ྐྵ"," ","ྺ"," ","ྻ"," ","ྼ","྾","྿","࿀","࿁","࿂","࿃","࿄","࿅"," ","࿆","࿇","࿈","࿉","࿊","࿋","࿌","࿎","࿏","࿐","࿑","࿒","࿓","࿔","࿙","࿚"],
          "ti":["#tibee#"],


         "boxdrawning": ["─","━","│","┃","┄","┅","┆","┇","┈","┉","┊","┋","┌","┍","┎","┏","┐","┑","┒","┓","└","┕","┖","┗","┘","┙","┚","┛","├","┝","┞","┟","┠","┡","┢","┣","┤","┥","┦","┧","┨","┩","┪","┫","┬","┭","┮","┯","┰","┱","┲","┳","┴","┵","┶","┷","┸","┹","┺","┻","┼","┽","┾","┿","╀","╁","╂","╃","╄","╅","╆","╇","╈","╉","╊","╋","╌","╍","╎","╏","═","║","╒","╓","╔","╕","╖","╗","╘","╙","╚","╛","╜","╝","╞","╟","╠","╡","╢","╣","╤","╥","╦","╧","╨","╩","╪","╫","╬","╭","╮","╯","╰","╱","╲","╳","╴","╵","╶","╷","╸","╹","╺","╻","╼","╽","╾","╿"],

         "sml":["ᝀ","ᝁ","ᝂ","ᝃ","ᝄ","ᝅ","ᝆ","ᝇ","ᝈ","ᝉ","ᝊ","ᝋ","ᝌ","ᝍ","ᝎ","ᝏ","ᝐ","ᝑ"," ","ᝒ"," ","ᝓ"],


         "animalem":["🐂","🐑","🐒","🐀","🐌","🐌","🐕","🐕","🐕","🐕","🐕","🐕","🐕","🐕","🐕","🐕","🐕","🐕","🐓","🐐","🐏","🐄","🐢","🐈","🐈","🐈","🐈","🐈","🐈","🐈","🐈","🐈","🐩","💐","🐖","🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯", "🦁",  "🐮",  "🐷", "🐽", "🐸", "🐵", "🙊", "🙉", "🙊", "🐒", "🐔", "🐧", "🐦", "🐤", "🐣", "🐥", "🦆", "🦅", "🦉", "🦇", "🐺", "🐗", "🐴", "🦄", "🐝", "🐛", "🦋", "🐌", "🐚", "🐞", "🐜", "🕷", "🕸", "🐢", "🐍", "🦎", "🦂", "🦀", "🦑", "🐙", "🦐", "🐠", "🐟", "🐡", "🐬", "🦈", "🐳 ", "🐋", "🐊", "🐆", "🐅", "🐃", "🐂", "🐄", "🦌", "🐪", "🐫 ", "🐘", "🦏", "🦍", "🐎", "🐖", "🐐", "🐏", "🐑 ", "🐕", "🐩", "🐈 ", "🐓", "🦃", "🕊", "🐇", "🐁", "🐀", "🐿", "🐾", "🐾", "🐉", "🐲","🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯", "🦁",  "🐮",  "🐷", "🐽", "🐸", "🐵", "🙊", "🙉", "🙊", "🐒", "🐔", "🐧", "🐦", "🐤", "🐣", "🐥", "🦆", "🦅", "🦉", "🦇", "🐺", "🐗", "🐴", "🦄", "🐝", "🐛", "🦋", "🐌", "🐚", "🐞", "🐜", "🕷", "🕸", "🐢", "🐍", "🦎", "🦂", "🦀", "🦑", "🐙", "🦐", "🐠", "🐟", "🐡", "🐬", "🦈", "🐳 ", "🐋", "🐊", "🐆", "🐅", "🐃", "🐂", "🐄", "🦌", "🐪", "🐫 ", "🐘", "🦏", "🦍", "🐎", "🐖", "🐐", "🐏", "🐑 ", "🐕", "🐩", "🐈 ", "🐓", "🦃", "🕊", "🐇", "🐁", "🐀", "🐿", "🐾", "🐾", "🐉", "🐲"],
         "phaistosdisc":["𐇐","𐇑","𐇒","𐇓","𐇔","𐇕","𐇖","𐇗","𐇘","𐇙","𐇚","𐇛","𐇜","𐇝","𐇞","𐇟","𐇠","𐇡","𐇢","v","𐇣","𐇤","𐇥","𐇦","𐇧","𐇨","𐇩","𐇪","𐇫","𐇬","𐇭","𐇮","𐇯","𐇰","𐇱","𐇲","𐇳","𐇴","𐇵","𐇶","𐇷","𐇸","𐇹","𐇺","𐇻","𐇼"],


         "phai":["<h4>#phaisto#</h4>"],
         "anim":["#animal##animal##animal##animal#","#animal##animal#","#animal##animal##animal##planta##animal##animal##animal#","#animal#","#animal#","#animal#","#animal#","#animal#","#animal#","#animal#","#animal#","#animal#","#animal#"],
         "pla":["#planta##planta##planta##animal##planta##planta##planta##planta#","#planta##planta##planta##planta#","#planta##planta#","#planta#","#planta#","#planta#","#planta#","#planta#","#planta#","#planta#","#planta#"],

         "plantem":["🍁","🍃","🍂","🌰","🍁","🍃","🍂","🌰","🌴", "🌈", "☁","🌵", "🎄", "🌲", "🌳", "🌴", "🌱", "🌿", "☘️", "🍀", "🎍", "🎋", "🍃", "🍂", "🍁", "🍄", "🌾", "💐", "🌷", "🌹", "🥀", "🌻", "🌼", "🌸", "🌺"],
         "vid":["#anim#","#pla#","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","",""],

           "imposible": ["𝦃", "𝦄", "𝦅", "𝦆", "𝦇", "𝦈", "𝦉", "𝦊", "𝦋", "𝦌", "𝦍", "𝦎", "𝦏", "𝦐", "𝦑", "𝦒", "𝦓", "𝦔", "𝦕", "𝦖", "𝦗", "𝦘", "𝦙", "𝦚", "𝦛", "𝦜", "𝦝", "𝦞", "𝦟", "𝦠", "𝦡", "𝦢", "𝦣", "𝦤", "𝦥", "𝦦", "𝦧", "𝦨", "𝦩", "𝦪", "𝦫", "𝦬", "𝦭", "𝦮", "𝦯", "𝦰", "𝦱", "𝦲", "𝦳", "𝦴", "𝦵", "𝦶", "𝦷", "𝦸", "𝦹", "𝦺", "𝦻", "𝦼", "𝦽", "𝦾", "𝦿", "𝧀", "𝧁", "𝧂", "𝧃", "𝧄", "𝧅", "𝧆", "𝧇", "𝧈", "𝧉", "𝧊", "𝧋", "𝧌", "𝧍", "𝧎", "𝧏", "𝧐", "𝧑", "𝧒", "𝧓", "𝧔", "𝧕", "𝧖", "𝧗", "𝧘", "𝧙", "𝧚", "𝧛", "𝧜", "𝧝", "𝧞", "𝧟", "𝧠", "𝧡", "𝧢", "𝧣", "𝧤", "𝧥", "𝧦", "𝧧", "𝧨", "𝧩", "𝧪", "𝧫", "𝧬", "𝧭", "𝧮", "𝧯", "𝧰", "𝧱", "𝧲", "𝧳", "𝧴", "𝧵", "𝧶", "𝧷", "𝧸", "𝧹", "𝧺", "𝧻", "𝧼", "𝧽", "𝧾", "𝧿𝩬", "𝩭", "𝩮", "𝩯", "𝩰", "𝩱", "𝩲", "𝩳", "𝩶", "𝩷", "𝩸", "𝩹", "𝩺", "𝩻", "𝩼", "𝩽", "𝩾", "𝩿", "𝪀", "𝪁", "𝪂", "𝪃", "𝪅", "𝪆", "𝪇", "𝪈", "𝪉", "𝪊", "𝪋", "Ⴀ", "Ⴁ", "Ⴂ", "Ⴃ", "Ⴄ", "Ⴅ", "Ⴆ", "Ⴇ", "Ⴈ", "Ⴉ", "Ⴊ", "Ⴋ", "Ⴌ", "Ⴍ", "Ⴎ", "Ⴏ", "Ⴐ", "Ⴑ", "Ⴒ", "Ⴓ", "Ⴔ", "Ⴕ", "Ⴖ", "Ⴗ", "Ⴘ", "Ⴙ", "Ⴚ", "Ⴛ", "Ⴜ", "Ⴝ", "Ⴞ", "Ⴟ", "Ⴠ", "Ⴡ", "Ⴢ", "Ⴣ", "Ⴤ", "Ⴥ", "Ⴧ", "Ⴭ", "ა", "ბ", "გ", "დ", "ე", "ვ", "ზ"],

           "ojos":["⩟","⩠","⨞","⨭","⨮","⨳","⨴","⨵","⨶","⨷","⨸","⩄","⩅","⩆","⩇","⩈","⩉","⪻","⪼","⪽","⪾","⪿","⫀","⫁","⫂","⫃","⫄","⫅","⫆","⫇","⫈","⫉","⫊","⫋","⫌","⫍","⫎","⫏","⫐","⫑","⫒","⫓","⫔","⫕","⫖","⫗","⫘","⫙","⫚","⫛","꤀","꤁","꤃","꤄","꤅","꤆","꤇","꤉","ꤊ","ꤋ","ꤌ","ꤍ","ꤎ","ꤏ","ꤐ","ꤑ","ꤒ","ꤓ","ꤔ","ꤕ","ꤖ","ꤗ","ꤘ","ꤙ","ꤚ","ꤛ","ꤜ","ꤝ","ꤞ","ꤟ","ꤠ","ꤡ","ꤢ","ꤣ","ꤤ","ꤥ","྿","࿀","࿁","࿂","࿃","࿉","࿊","࿋","࿌","ᝎ","ᝏ","𐇵","ꜩ","҉","Ҩ", "ҩ","ऀ"," ","ँ"," ","ं"," ","ः","କ","ଖ","ଗ","ଘ","ଙ","ଚ","ଛ","ଜ","ଝ","ଞ","ଟ","ଠ","ଡ","ଢ","⌀","⌁","⌸","⌹","⌺","⌻","⌼","⌽","⌾"],

           "ojitos":["#oji#"],
         "origin": ["#[symbol:#letter#][phaisto:#phaistosdisc#][bloqueq:#bloque#][imposiblesq:#imposible#][pared:#cemento#][prde:#gg#][cmdoc:#cdme#][cubo:#ideographicdescriptioncharacters#][cmdec:#cdme#][box:#boxdrawning#][boxx:#boxdrawning#][animal:#animalem#][planta:#plantem#][kaya:#kayahli#][gaga:#gg#][gigi:#gg#][partb:#bloque#][modsml:#sml#][oji:#ojos#][tibee:#tibetan#][runi:#runic#][ogh:#ogham#][#bracetypes#]brace2#"]
    }


}
