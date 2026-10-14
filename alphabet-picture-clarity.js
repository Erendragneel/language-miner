/* Language-specific alphabet examples. These pictures illustrate words, not letter meanings. */
(()=>{'use strict';
const languages=['en','ja','zh','ko','es','fr','de','ru','it','pt','vi','th','tr','id','pl','el','uk'];
const leading=['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
const vowels=['ㅏ','ㅐ','ㅑ','ㅒ','ㅓ','ㅔ','ㅕ','ㅖ','ㅗ','ㅘ','ㅙ','ㅚ','ㅛ','ㅜ','ㅝ','ㅞ','ㅟ','ㅠ','ㅡ','ㅢ','ㅣ'];
const finals=['','ㄱ','ㄲ','ㄳ','ㄴ','ㄵ','ㄶ','ㄷ','ㄹ','ㄺ','ㄻ','ㄼ','ㄽ','ㄾ','ㄿ','ㅀ','ㅁ','ㅂ','ㅄ','ㅅ','ㅆ','ㅇ','ㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
const normalize=(text,language)=>String(text??'').normalize('NFC').toLocaleLowerCase(language||'en');
const unmarked=text=>String(text).normalize('NFD').replace(/[\u0300\u0301\u0304\u030c]/g,'').normalize('NFC');
const hasEntry=(symbol,language)=>Boolean(languages.includes(language)&&((language==='ja'&&vowelExamples[symbol])||window.LanguageMinerPictureCatalog?.symbols?.[language]?.[symbol]));
function decompose(syllable){const chars=Array.from(String(syllable||''));if(chars.length!==1)return null;const n=chars[0].codePointAt(0)-0xac00;if(n<0||n>=11172)return null;return [leading[Math.floor(n/588)],vowels[Math.floor(n%588/28)],finals[n%28]].filter(Boolean);}
const vowelExamples={};
for(const [hira,kata,word,file,alt,label]of [
 ['あ','ア','あり','ant-a.webp','An ant with antennae and six legs.','ant'],
 ['い','イ','いぬ','dog-i.webp','A tan dog with a curled tail.','dog'],
 ['う','ウ','うさぎ','rabbit-u.webp','A white rabbit with long ears.','rabbit'],
 ['え','エ','えんぴつ','pencil-storybook-v1.png','A sharpened wooden pencil with a graphite tip.','pencil'],
 ['お','オ','おにぎり','onigiri-o.webp','Japanese rice balls with nori seaweed.','onigiri']
])for(const symbol of[hira,kata])vowelExamples[symbol]={file,alt,label,kind:'sound',concept:`sound:ja:${symbol}`,clueSpeech:word,clueText:'□'+word.slice(1),exampleText:word,sourceExample:word,firstSound:hira};
// Corrections are restricted to picture examples; course forms, IDs, and mastery remain intact.
const corrections={
 'de:J':{file:'diagram-flag-japan.svg',label:'Japan',alt:'Japan’s white national flag with a red disc.',clueSpeech:'Japan',clueText:'□apan',reason:'Replace an editorial usage note with the German country name and its flag.'},
 'pl:F':{file:'vocab-0271.webp',label:'cup',alt:'A decorated drinking cup with a handle on a saucer.',clueSpeech:'filiżanka',clueText:'□iliżanka',reason:'Use a clearly pictured cup instead of relying on the chair in a quiet-room scene.'},
 'th:ฒ':{file:'vocab-0215.webp',label:'elderly man',alt:'An elderly man with gray hair spends time with two children.',clueSpeech:'ผู้เฒ่า',clueText:'ผู้เ□่า',reason:'The previous teacher scene did not illustrate an elder.'},
 'fr:I':{clueSpeech:'œil',clueText:'œ□l',label:'eye',reason:'Use the French œ ligature in the standalone noun.'},
 'el:Ο':{clueSpeech:'ορυζώνας',clueText:'□ρυζώνας',label:'rice field',reason:'Use the dictionary nominative form rather than an isolated accusative.'},
 'el:Ζ':{clueSpeech:'ορυζώνας',clueText:'ορυ□ώνας',label:'rice field',reason:'Use the dictionary nominative form rather than an isolated accusative.'},
 'uk:Х':{file:'vocab-0631.webp',clueSpeech:'хліб',clueText:'□ліб',label:'bread',reason:'A concrete loaf illustrates bread more directly than a plate of food illustrates nutrition.'},
 'ja:か':{file:'vocab-0208.webp',clueSpeech:'おかね',clueText:'お□ね',label:'money',reason:'The reading かね here means money; use the separate currency picture rather than gold bars.'},
 'ja:カ':{file:'vocab-0208.webp',clueSpeech:'オカネ',clueText:'オ□ネ',sourceExample:'おかね',label:'money',reason:'Katakana transcription of the money example; use the separate currency picture.'}
};
const sources=Object.freeze({
 hangul:'https://www.unicode.org/faq/korean.html',
 thai:'https://seasite.niu.edu/Thai/basic/alpha_cons_table.htm',
 greekRiceField:'https://www.greek-language.gr/greekLang/modern_greek/tools/lexica/triantafyllides/search.html?lq=%CE%BF%CF%81%CF%85%CE%B6%CF%8E%CE%BD%CE%B1%CF%82',
 polishCup:'https://dictionary.cambridge.org/pl/dictionary/polish-english/filizanka',
 germanJapan:'https://www.duden.de/deklination/substantive/Japan'
});
function inspect(art,symbol,language){
 const fail=reason=>({valid:false,reason});
 if(!languages.includes(language))return fail('unsupported-example-language');
 if(!art)return fail('no-reviewed-picture-example');
 if(!/^[a-z0-9][a-z0-9_-]*\.(?:webp|png|svg)$/i.test(art.file||''))return fail('missing-or-invalid-local-image');
 if(!art.clueSpeech||!art.clueText)return fail('missing-example-or-written-clue');
 if((art.clueText.match(/□/g)||[]).length!==1)return fail('clue-must-have-one-target');
 if(language==='th'&&['ฃ','ฅ'].includes(symbol)){
  const modern=symbol==='ฃ'?'ขวด':'คน';
  return art.clueSpeech===modern&&art.clueText===`□ · ${modern}`?{valid:true,type:'traditional',modernWord:modern}:{...fail('invalid-traditional-association')};
 }
 if(language==='ko'){
  const match=art.clueText.match(/^(.+) · (.) → (.+)$/u);if(!match||match[1]!==art.clueSpeech||!Array.from(art.clueSpeech).includes(match[2]))return fail('syllable-not-in-example-word');
  const parts=decompose(match[2]),shown=match[3].split(' + ');if(!parts||shown.join('|').replace('□',symbol)!==parts.join('|'))return fail('incorrect-hangul-component');
  const blankIndex=shown.indexOf('□');return {valid:true,type:'hangul',syllable:match[2],parts,component:['leading','vowel','final'][blankIndex]};
 }
 if(language==='zh'){
  const match=String(art.exampleText||'').match(/^(.+) · (.+)$/u);if(!match||match[1]!==art.clueSpeech)return fail('pinyin-word-recording-mismatch');
  const pinyin=match[2],completed=art.clueText.replace('□',symbol);
  if(art.pinyinType==='final')return unmarked(completed)===unmarked(pinyin)&&['a','o','e','i','u','ü'].includes(symbol)?{valid:true,type:'final',pinyin}:{...fail('incorrect-pinyin-vowel')};
  if(completed!==pinyin)return fail('incorrect-pinyin-spelling-or-tone');
  if(art.pinyinType==='initial'&&art.clueText.indexOf('□')!==0)return fail('initial-must-start-example');
  if(art.pinyinType==='tone'&&!/[āáǎà]/.test(symbol))return fail('tone-mark-missing');
  return ['initial','tone'].includes(art.pinyinType)?{valid:true,type:art.pinyinType,pinyin}:fail('unknown-pinyin-task');
 }
 if(art.kind==='sound'&&language==='ja')return art.firstSound===normalize(symbol,'ja').replace(/[ア-ン]/g,c=>String.fromCharCode(c.charCodeAt(0)-0x60))&&art.clueSpeech.startsWith(art.firstSound)?{valid:true,type:'sound'}:fail('first-sound-example-mismatch');
 return normalize(art.clueText.replace('□',symbol),language)===normalize(art.clueSpeech,language)?{valid:true,type:'spelling'}:fail('target-does-not-complete-example');
}
// Order: spelling, first sound, Hangul component, pinyin initial, pinyin vowel,
// pinyin marked vowel, traditional Thai pairing, and the word/letter distinction.
const copy={
 en:['Choose the character or reading that fills the blank.','Choose the first sound of the pictured Japanese word.','Choose the missing part of the Korean syllable.','Choose the starting pinyin letters.','Choose the vowel without its tone mark; keep ü’s dots.','Choose the vowel with the correct tone mark.','Choose the obsolete Thai letter from its traditional picture pairing.','The picture illustrates the example word, not the meaning of the character.'],
 ja:['空欄に入る文字、またはその読みを選びましょう。','絵が表す日本語の最初の音を選びましょう。','韓国語の音節に足りない部分を選びましょう。','ピンインの最初の文字を選びましょう。','声調記号のない母音を選びましょう。ü の二つの点は残します。','正しい声調記号が付いた母音を選びましょう。','伝統的な絵との組み合わせから、現在使われないタイ文字を選びましょう。','絵は例の単語を表しており、文字そのものの意味を表しているわけではありません。'],
 zh:['选择填入空格的字符或读音。','选择图片所示日语单词的第一个音。','选择韩语音节中缺少的部分。','选择拼音开头的字母。','选择不带声调符号的元音；保留 ü 的两点。','选择带正确声调符号的元音。','根据传统图片配对选择已不使用的泰文字母。','图片表示示例词，而不是字符本身的意思。'],
 ko:['빈칸에 들어갈 문자 또는 읽는 법을 고르세요.','그림이 나타내는 일본어 단어의 첫소리를 고르세요.','한글 음절에서 빠진 부분을 고르세요.','병음의 첫 글자를 고르세요.','성조 표시가 없는 모음을 고르세요. ü의 두 점은 유지하세요.','올바른 성조 표시가 있는 모음을 고르세요.','전통적인 그림 짝에서 현재 쓰지 않는 태국 문자를 고르세요.','그림은 예시 단어를 나타내며, 문자 자체의 뜻을 나타내지 않습니다.'],
 es:['Elige el carácter o la lectura que completa el espacio.','Elige el primer sonido de la palabra japonesa ilustrada.','Elige la parte que falta en la sílaba coreana.','Elige las letras iniciales del pinyin.','Elige la vocal sin marca tonal; conserva los puntos de ü.','Elige la vocal con la marca tonal correcta.','Elige la letra tailandesa en desuso según su asociación tradicional con la imagen.','La imagen representa la palabra de ejemplo, no el significado del carácter.'],
 fr:['Choisis le caractère ou la lecture qui complète la case.','Choisis le premier son du mot japonais illustré.','Choisis la partie manquante de la syllabe coréenne.','Choisis les lettres initiales du pinyin.','Choisis la voyelle sans marque de ton ; conserve les points du ü.','Choisis la voyelle portant la bonne marque de ton.','Choisis la lettre thaïe obsolète selon son association traditionnelle avec l’image.','L’image représente le mot donné en exemple, pas le sens du caractère.'],
 de:['Wähle das Zeichen oder die Lesung für die Lücke.','Wähle den ersten Laut des abgebildeten japanischen Wortes.','Wähle den fehlenden Teil der koreanischen Silbe.','Wähle die Anfangsbuchstaben der Pinyin-Schreibung.','Wähle den Vokal ohne Tonzeichen; behalte die Punkte des ü.','Wähle den Vokal mit dem richtigen Tonzeichen.','Wähle den veralteten thailändischen Buchstaben anhand seiner traditionellen Bildzuordnung.','Das Bild zeigt das Beispielwort, nicht die Bedeutung des Zeichens.'],
 ru:['Выберите знак или чтение для пропуска.','Выберите первый звук японского слова на картинке.','Выберите недостающую часть корейского слога.','Выберите начальные буквы пиньиня.','Выберите гласную без знака тона; сохраните точки над ü.','Выберите гласную с правильным знаком тона.','Выберите устаревшую тайскую букву по её традиционному соответствию картинке.','Картинка изображает слово из примера, а не значение самого знака.'],
 it:['Scegli il carattere o la lettura per lo spazio vuoto.','Scegli il primo suono della parola giapponese illustrata.','Scegli la parte mancante della sillaba coreana.','Scegli le lettere iniziali del pinyin.','Scegli la vocale senza segno tonale; conserva i puntini di ü.','Scegli la vocale con il segno tonale corretto.','Scegli la lettera thailandese obsoleta secondo la sua associazione tradizionale con l’immagine.','L’immagine rappresenta la parola di esempio, non il significato del carattere.'],
 pt:['Escolha o caractere ou a leitura que completa a lacuna.','Escolha o primeiro som da palavra japonesa ilustrada.','Escolha a parte que falta na sílaba coreana.','Escolha as letras iniciais do pinyin.','Escolha a vogal sem marca de tom; mantenha os pontos do ü.','Escolha a vogal com a marca de tom correta.','Escolha a letra tailandesa em desuso pela associação tradicional com a imagem.','A imagem representa a palavra de exemplo, não o significado do caractere.'],
 vi:['Chọn ký tự hoặc cách đọc để điền vào chỗ trống.','Chọn âm đầu của từ tiếng Nhật trong hình.','Chọn thành phần còn thiếu của âm tiết tiếng Hàn.','Chọn các chữ cái đầu của phiên âm pinyin.','Chọn nguyên âm không có dấu thanh; giữ hai chấm của ü.','Chọn nguyên âm có dấu thanh đúng.','Chọn chữ cái Thái không còn dùng theo hình minh họa truyền thống.','Hình minh họa từ ví dụ, không phải ý nghĩa của ký tự.'],
 th:['เลือกตัวอักษรหรือคำอ่านที่เติมช่องว่าง','เลือกเสียงแรกของคำภาษาญี่ปุ่นที่ภาพแสดง','เลือกส่วนที่หายไปของพยางค์ภาษาเกาหลี','เลือกตัวอักษรต้นของพินอิน','เลือกสระที่ไม่มีเครื่องหมายวรรณยุกต์ โดยคงจุดสองจุดของ ü','เลือกสระที่มีเครื่องหมายวรรณยุกต์ถูกต้อง','เลือกอักษรไทยที่เลิกใช้แล้วตามภาพประกอบชื่ออักษรแบบดั้งเดิม','ภาพแสดงคำตัวอย่าง ไม่ใช่ความหมายของตัวอักษร'],
 tr:['Boşluğu tamamlayan harfi veya okunuşu seçin.','Resimdeki Japonca kelimenin ilk sesini seçin.','Korece hecenin eksik bileşenini seçin.','Pinyin yazımının ilk harflerini seçin.','Ton işareti olmayan ünlüyü seçin; ü harfinin noktalarını koruyun.','Doğru ton işaretini taşıyan ünlüyü seçin.','Geleneksel resim eşleşmesine göre artık kullanılmayan Tay harfini seçin.','Resim örnek kelimeyi gösterir; harfin anlamını göstermez.'],
 id:['Pilih karakter atau cara baca untuk mengisi bagian kosong.','Pilih bunyi pertama kata bahasa Jepang pada gambar.','Pilih bagian yang hilang dari suku kata Korea.','Pilih huruf awal dalam ejaan pinyin.','Pilih vokal tanpa tanda nada; pertahankan dua titik pada ü.','Pilih vokal dengan tanda nada yang benar.','Pilih huruf Thai yang sudah tidak dipakai berdasarkan pasangan gambar tradisionalnya.','Gambar menunjukkan kata contoh, bukan arti karakter itu sendiri.'],
 pl:['Wybierz znak lub odczyt uzupełniający lukę.','Wybierz pierwszy dźwięk japońskiego słowa z obrazka.','Wybierz brakującą część koreańskiej sylaby.','Wybierz początkowe litery zapisu pinyin.','Wybierz samogłoskę bez oznaczenia tonu; zachowaj kropki nad ü.','Wybierz samogłoskę z prawidłowym oznaczeniem tonu.','Wybierz nieużywaną już tajską literę według jej tradycyjnego powiązania z obrazkiem.','Obrazek przedstawia słowo z przykładu, a nie znaczenie znaku.'],
 el:['Επίλεξε τον χαρακτήρα ή την ανάγνωση που συμπληρώνει το κενό.','Επίλεξε τον πρώτο ήχο της ιαπωνικής λέξης που δείχνει η εικόνα.','Επίλεξε το μέρος που λείπει από την κορεατική συλλαβή.','Επίλεξε τα αρχικά γράμματα του πινγίν.','Επίλεξε το φωνήεν χωρίς τονικό σημάδι· κράτησε τις δύο τελείες του ü.','Επίλεξε το φωνήεν με το σωστό τονικό σημάδι.','Επίλεξε το παρωχημένο ταϊλανδικό γράμμα βάσει της παραδοσιακής αντιστοίχισής του με την εικόνα.','Η εικόνα δείχνει τη λέξη του παραδείγματος, όχι τη σημασία του χαρακτήρα.'],
 uk:['Виберіть знак або читання для пропуску.','Виберіть перший звук японського слова на малюнку.','Виберіть відсутню частину корейського складу.','Виберіть початкові літери піньїня.','Виберіть голосну без позначки тону; збережіть крапки над ü.','Виберіть голосну з правильною позначкою тону.','Виберіть застарілу тайську літеру за її традиційною відповідністю малюнку.','Малюнок зображає слово з прикладу, а не значення самого знака.']
};
const types=['spelling','sound','hangul','initial','final','tone','traditional'];
const transcriptionNotes={en:'Katakana is used here as a reading exercise; the word is not necessarily normally written this way.',ja:'ここではカタカナを読みの練習に使います。通常の表記がカタカナとは限りません。',zh:'这里用片假名练习读音；这不一定是该词通常的写法。',ko:'여기서는 읽기 연습을 위해 가타카나를 사용합니다. 이 단어의 일반적인 표기와 다를 수 있습니다.',es:'Aquí se usa katakana para practicar la lectura; no siempre es la escritura habitual de la palabra.',fr:'Le katakana sert ici à pratiquer la lecture ; ce n’est pas nécessairement l’écriture habituelle du mot.',de:'Katakana dient hier als Leseübung; das Wort wird normalerweise nicht unbedingt so geschrieben.',ru:'Катакана здесь используется для тренировки чтения; это не обязательно обычное написание слова.',it:'Il katakana serve qui per esercitare la lettura; non è necessariamente la grafia abituale della parola.',pt:'O katakana é usado aqui como exercício de leitura; essa pode não ser a escrita habitual da palavra.',vi:'Katakana được dùng ở đây để luyện đọc; đây không nhất thiết là cách viết thông thường của từ.',th:'ใช้คาตาคานะเพื่อฝึกอ่านในแบบฝึกหัดนี้ คำนี้อาจไม่ได้เขียนด้วยคาตาคานะตามปกติ',tr:'Burada katakana okuma alıştırması için kullanılır; kelime normalde böyle yazılmayabilir.',id:'Katakana digunakan di sini untuk latihan membaca; kata ini belum tentu biasanya ditulis seperti ini.',pl:'Katakana służy tu do ćwiczenia czytania; nie musi to być zwykła pisownia tego słowa.',el:'Η κατακάνα χρησιμοποιείται εδώ για εξάσκηση στην ανάγνωση· δεν είναι απαραίτητα η συνήθης γραφή της λέξης.',uk:'Катакана тут використовується для тренування читання; це не обов’язково звичайне написання слова.'};
const modernLabels={en:'Modern spelling',ja:'現在の綴り',zh:'现代拼写',ko:'현대 표기',es:'Ortografía moderna',fr:'Orthographe moderne',de:'Heutige Schreibweise',ru:'Современное написание',it:'Grafia moderna',pt:'Escrita moderna',vi:'Cách viết hiện nay',th:'การสะกดในปัจจุบัน',tr:'Günümüz yazımı',id:'Ejaan modern',pl:'Współczesna pisownia',el:'Σύγχρονη γραφή',uk:'Сучасне написання'};
const scriptNames={en:['Hiragana','Katakana'],ja:['ひらがな','カタカナ'],zh:['平假名','片假名'],ko:['히라가나','가타카나'],es:['Hiragana','Katakana'],fr:['Hiragana','Katakana'],de:['Hiragana','Katakana'],ru:['Хирагана','Катакана'],it:['Hiragana','Katakana'],pt:['Hiragana','Katakana'],vi:['Hiragana','Katakana'],th:['ฮิรางานะ','คาตาคานะ'],tr:['Hiragana','Katakana'],id:['Hiragana','Katakana'],pl:['Hiragana','Katakana'],el:['Χιραγκάνα','Κατακάνα'],uk:['Хіраґана','Катакана']};
const exampleLabels={en:'Pictured example',ja:'絵の例',zh:'图片示例',ko:'그림 예시',es:'Ejemplo ilustrado',fr:'Exemple illustré',de:'Abgebildetes Beispiel',ru:'Пример на картинке',it:'Esempio illustrato',pt:'Exemplo ilustrado',vi:'Ví dụ trong hình',th:'ตัวอย่างในภาพ',tr:'Resimdeki örnek',id:'Contoh pada gambar',pl:'Przykład na obrazku',el:'Παράδειγμα στην εικόνα',uk:'Приклад на малюнку'};
const vowelMeanings=Object.fromEntries(Object.entries({
 ant:'ant|あり|蚂蚁|개미|hormiga|fourmi|Ameise|муравей|formica|formiga|kiến|มด|karınca|semut|mrówka|μυρμήγκι|мураха',
 dog:'dog|いぬ|狗|개|perro|chien|Hund|собака|cane|cachorro|chó|สุนัข|köpek|anjing|pies|σκύλος|собака',
 rabbit:'rabbit|うさぎ|兔子|토끼|conejo|lapin|Kaninchen|кролик|coniglio|coelho|thỏ|กระต่าย|tavşan|kelinci|królik|κουνέλι|кролик',
 pencil:'pencil|えんぴつ|铅笔|연필|lápiz|crayon|Bleistift|карандаш|matita|lápis|bút chì|ดินสอ|kurşun kalem|pensil|ołówek|μολύβι|олівець',
 onigiri:'Japanese rice ball|おにぎり|日式饭团|일본식 주먹밥|bola de arroz japonesa|boulette de riz japonaise|japanischer Reisball|японский рисовый шарик|polpetta di riso giapponese|bolinho de arroz japonês|cơm nắm Nhật Bản|ข้าวปั้นญี่ปุ่น|Japon pirinç topu|nasi kepal Jepang|japońska kulka ryżowa|ιαπωνική μπάλα ρυζιού|японська рисова кулька'
 }).map(([key,value])=>[key,Object.fromEntries(value.split('|').map((meaning,index)=>[languages[index],meaning]))]));
function questionCopy(art,known='en'){const words=copy[known]||copy.en;return words[Math.max(0,types.indexOf(art?.alphabetClueType||'spelling'))]+(art?.clueLanguage==='ja'?' · '+(scriptNames[known]||scriptNames.en)[art.practiceTranscription?1:0]:'');}
function explanation(art,known='en'){if(!art)return '';const word=art.exampleText||art.sourceExample||art.clueSpeech||'';return `${word} → ${art.targetSymbol||''}. ${(copy[known]||copy.en)[7]}${art.practiceTranscription?' '+(transcriptionNotes[known]||transcriptionNotes.en):''}${art.modernSpelling?' '+(modernLabels[known]||modernLabels.en)+': '+art.modernSpelling+'.':''}`;}
function isAlphabetArt(art){return Boolean(art?.alphabetClue&&types.includes(art.alphabetClueType));}
function artFor(item,{language,knownLanguage='en'}={}){
 const symbol=String(item?.symbol||'');if(!symbol||!languages.includes(language))return null;
 const raw=vowelExamples[symbol]&&language==='ja'?vowelExamples[symbol]:window.LanguageMinerPictureCatalog?.symbols?.[language]?.[symbol];
 if(!raw)return null;const key=language+':'+symbol,art={...raw,...corrections[key]},check=inspect(art,symbol,language);if(!check.valid)return null;
 const source=window.LanguageMinerPictureCatalog?.vocabulary?.[String(art.file).match(/^vocab-(\d+)\./)?.[1].replace(/^0+/, '')||''];
 if(source?.alt&&!corrections[key]?.alt)art.alt=source.alt;
 art.alphabetClue=true;art.alphabetClueType=check.type;art.targetSymbol=symbol;art.clueLanguage=language;art.exampleText=art.exampleText||art.clueSpeech;
 art.question=questionCopy(art,knownLanguage);art.explanation=explanation(art,knownLanguage);art.note=(copy[knownLanguage]||copy.en)[7];
 art.clueValidation=check;
 if(language==='th'&&check.type==='traditional'){art.kind='letter-association';art.modernSpelling=check.modernWord;art.exampleText=`${symbol} · ${check.modernWord}`;art.explanation=explanation(art,knownLanguage);}
 if(language==='ja'&&/[ァ-ヶ]/.test(symbol))art.practiceTranscription=true;
 // Standard Listening asks for the target kana. The separate pictured-word
 // control plays clueSpeech; an internal spelling gap cannot be heard by itself.
 if(language==='ja')art.targetSpeech=symbol;
 // These two Vietnamese units have the same unmarked spelling answer.
 if(language==='vi'&&['A','a'].includes(symbol))art.concept='spelling:vi:a';
 art.question=questionCopy(art,knownLanguage);
 if(knownLanguage!=='en'){
  const sourceId=Number(String(art.file).match(/^vocab-(\d+)\./)?.[1]),row=window.LANGUAGE_MINER_MULTILINGUAL_COURSE_DATA?.vocabulary?.find(item=>Number(item.id)===sourceId);
  const preciseSource=row&&!row.contextOnly&&normalize(row.forms?.en,'en')===normalize(source?.label,'en');
  const meaning=vowelMeanings[art.label]?.[knownLanguage]||(preciseSource&&knownLanguage!==language?row.forms?.[knownLanguage]:'');
  art.alt=meaning?`${exampleLabels[knownLanguage]||exampleLabels.en}: ${meaning}.`:questionCopy(art,knownLanguage)+' '+(copy[knownLanguage]||copy.en)[7];
 }
 art.explanation=explanation(art,knownLanguage);
 return art;
}
window.LanguageMinerAlphabetPictures=Object.freeze({version:1,languages:Object.freeze(languages),hasEntry,artFor,isAlphabetArt,questionCopy,explanation,inspect,decompose,sources,corrections:Object.freeze(corrections)});
})();
