// Language Miner v6.4.185 — learning-language cultural calendars with known-language explanations.
(()=>{
'use strict';

const DAY=86400000;
const LOCALES={en:'en-US',es:'es-ES',ru:'ru-RU',ja:'ja-JP',ko:'ko-KR',zh:'zh-CN',it:'it-IT',fr:'fr-FR',de:'de-DE',pt:'pt-BR',vi:'vi-VN',th:'th-TH',tr:'tr-TR',id:'id-ID',pl:'pl-PL',el:'el-GR',uk:'uk-UA'};
const LANGUAGE_NAMES={en:'English',es:'Español',ru:'Русский',ja:'日本語',ko:'한국어',zh:'中文（普通话）',it:'Italiano',fr:'Français',de:'Deutsch',pt:'Português (Brasil)',vi:'Tiếng Việt',th:'ภาษาไทย',tr:'Türkçe',id:'Bahasa Indonesia',pl:'Polski',el:'Ελληνικά',uk:'Українська'};

const UI={
 en:{title:'Cultural Event Calendar',intro:'Your known language selects a respectful cultural calendar. Language does not determine anyone’s identity, and traditions can differ by family and region.',history:'History',meaning:'Why people celebrate',annual:'Annual time',active:'Active now',upcoming:'Upcoming',ended:'Earlier this year',reward:'Temporary event reward',rewardText:'Answer 5 questions correctly during the active event to unlock +15% Player XP until the event ends.',claim:'Claim Culture Explorer boost',claimed:'Culture Explorer boost active',progress:'Correct answers today',none:'No event is active today. You can still explore every event and its history.'},
 es:{title:'Calendario de eventos culturales',intro:'Tu idioma conocido selecciona un calendario cultural respetuoso. El idioma no determina la identidad y las tradiciones varían según la familia y la región.',history:'Historia',meaning:'Por qué se celebra',annual:'Época anual',active:'Activo ahora',upcoming:'Próximo',ended:'Celebrado este año',reward:'Recompensa temporal',rewardText:'Responde correctamente 5 preguntas durante el evento para obtener +15 % de XP de jugador hasta que termine.',claim:'Obtener impulso Explorador Cultural',claimed:'Impulso Explorador Cultural activo',progress:'Respuestas correctas de hoy',none:'Hoy no hay un evento activo. Aun así puedes conocer todos los eventos y su historia.'},
 ru:{title:'Календарь культурных событий',intro:'Известный вам язык определяет культурный календарь. Язык не определяет личность, а традиции могут различаться по семьям и регионам.',history:'История',meaning:'Почему отмечают',annual:'Время проведения',active:'Сейчас проходит',upcoming:'Скоро',ended:'Уже прошло в этом году',reward:'Временная награда',rewardText:'Дайте 5 правильных ответов во время события и получите +15% опыта игрока до его окончания.',claim:'Получить усиление «Исследователь культуры»',claimed:'Усиление «Исследователь культуры» активно',progress:'Правильных ответов сегодня',none:'Сегодня активных событий нет. Истории всех событий доступны круглый год.'},
 ja:{title:'文化イベントカレンダー',intro:'知っている言語に合わせて文化カレンダーを表示します。言語だけで個人のアイデンティティは決まらず、習慣は家庭や地域によって異なります。',history:'歴史',meaning:'お祝いする理由',annual:'毎年の時期',active:'開催中',upcoming:'もうすぐ',ended:'今年は終了',reward:'期間限定イベント報酬',rewardText:'開催中に5問正解すると、イベント終了までプレイヤーXPが15%増加します。',claim:'文化探検家ブーストを受け取る',claimed:'文化探検家ブースト発動中',progress:'今日の正解数',none:'今日は開催中のイベントがありません。すべてのイベントの歴史はいつでも読めます。'},
 ko:{title:'문화 행사 달력',intro:'알고 있는 언어에 맞춘 문화 달력입니다. 언어가 개인의 정체성을 결정하지 않으며 전통은 가정과 지역에 따라 다를 수 있습니다.',history:'역사',meaning:'기념하는 이유',annual:'매년 시기',active:'현재 진행 중',upcoming:'예정',ended:'올해 종료',reward:'기간 한정 보상',rewardText:'행사 기간에 문제 5개를 맞히면 종료 시점까지 플레이어 XP가 15% 증가합니다.',claim:'문화 탐험가 부스트 받기',claimed:'문화 탐험가 부스트 활성화',progress:'오늘의 정답',none:'오늘 진행 중인 행사가 없습니다. 모든 행사의 역사는 언제든 읽을 수 있습니다.'},
 zh:{title:'文化活动日历',intro:'根据你熟悉的语言显示文化日历。语言并不能决定个人身份，不同家庭和地区的传统也会有所不同。',history:'历史',meaning:'庆祝意义',annual:'每年时间',active:'正在进行',upcoming:'即将到来',ended:'今年已结束',reward:'限时活动奖励',rewardText:'活动期间答对5题，即可获得持续到活动结束的玩家经验值+15%增益。',claim:'领取文化探索者增益',claimed:'文化探索者增益已生效',progress:'今日答对',none:'今天没有正在进行的活动，但你仍可阅读所有活动的历史。'},
 it:{title:'Calendario degli eventi culturali',intro:'La lingua che conosci seleziona un calendario culturale rispettoso. La lingua non determina l’identità e le tradizioni variano tra famiglie e regioni.',history:'Storia',meaning:'Perché si celebra',annual:'Periodo annuale',active:'In corso',upcoming:'In arrivo',ended:'Già celebrato quest’anno',reward:'Ricompensa temporanea',rewardText:'Rispondi correttamente a 5 domande durante l’evento per ottenere +15% XP giocatore fino alla fine.',claim:'Ottieni il bonus Esploratore culturale',claimed:'Bonus Esploratore culturale attivo',progress:'Risposte corrette di oggi',none:'Oggi non ci sono eventi attivi. Puoi comunque scoprirne la storia in ogni momento.'},
 fr:{title:'Calendrier des événements culturels',intro:'Votre langue connue sélectionne un calendrier culturel respectueux. Une langue ne définit pas l’identité et les traditions varient selon les familles et les régions.',history:'Histoire',meaning:'Pourquoi on célèbre',annual:'Période annuelle',active:'En cours',upcoming:'À venir',ended:'Déjà célébré cette année',reward:'Récompense temporaire',rewardText:'Répondez correctement à 5 questions pendant l’événement pour obtenir +15 % d’XP joueur jusqu’à sa fin.',claim:'Obtenir le bonus Explorateur culturel',claimed:'Bonus Explorateur culturel actif',progress:'Bonnes réponses aujourd’hui',none:'Aucun événement n’est actif aujourd’hui. Toutes les histoires restent disponibles.'},
 de:{title:'Kultureller Veranstaltungskalender',intro:'Deine bekannte Sprache wählt einen respektvollen Kulturkalender. Sprache bestimmt keine Identität, und Traditionen unterscheiden sich nach Familie und Region.',history:'Geschichte',meaning:'Warum gefeiert wird',annual:'Jährlicher Zeitraum',active:'Jetzt aktiv',upcoming:'Demnächst',ended:'Dieses Jahr bereits vorbei',reward:'Temporäre Event-Belohnung',rewardText:'Beantworte während des Events 5 Fragen richtig, um bis zum Ende +15 % Spieler-XP zu erhalten.',claim:'Kulturentdecker-Bonus erhalten',claimed:'Kulturentdecker-Bonus aktiv',progress:'Richtige Antworten heute',none:'Heute ist kein Event aktiv. Die Geschichte aller Events bleibt verfügbar.'},
 pt:{title:'Calendário de eventos culturais',intro:'O idioma que você conhece seleciona um calendário cultural respeitoso. O idioma não define identidade, e as tradições variam entre famílias e regiões.',history:'História',meaning:'Por que é celebrado',annual:'Época do ano',active:'Ativo agora',upcoming:'Em breve',ended:'Já celebrado neste ano',reward:'Recompensa temporária',rewardText:'Acerte 5 perguntas durante o evento para receber +15% de XP de jogador até o fim dele.',claim:'Receber bônus Explorador Cultural',claimed:'Bônus Explorador Cultural ativo',progress:'Respostas certas hoje',none:'Nenhum evento está ativo hoje. Você ainda pode conhecer a história de todos eles.'},
 vi:{title:'Lịch sự kiện văn hóa',intro:'Ngôn ngữ bạn biết sẽ chọn một lịch văn hóa phù hợp. Ngôn ngữ không quyết định bản sắc và truyền thống có thể khác nhau theo gia đình, vùng miền.',history:'Lịch sử',meaning:'Ý nghĩa kỷ niệm',annual:'Thời gian hằng năm',active:'Đang diễn ra',upcoming:'Sắp tới',ended:'Đã diễn ra trong năm',reward:'Phần thưởng tạm thời',rewardText:'Trả lời đúng 5 câu trong thời gian sự kiện để nhận thêm 15% XP người chơi đến khi sự kiện kết thúc.',claim:'Nhận tăng cường Nhà khám phá văn hóa',claimed:'Tăng cường Nhà khám phá văn hóa đang hoạt động',progress:'Câu đúng hôm nay',none:'Hôm nay không có sự kiện đang diễn ra. Bạn vẫn có thể đọc lịch sử của mọi sự kiện.'},
 th:{title:'ปฏิทินกิจกรรมวัฒนธรรม',intro:'ภาษาที่คุณรู้จะเลือกปฏิทินวัฒนธรรม ภาษาไม่ได้กำหนดอัตลักษณ์ และประเพณีอาจแตกต่างกันตามครอบครัวและภูมิภาค',history:'ประวัติ',meaning:'เหตุผลที่เฉลิมฉลอง',annual:'ช่วงเวลาประจำปี',active:'กำลังจัด',upcoming:'กำลังจะมาถึง',ended:'ผ่านไปแล้วในปีนี้',reward:'รางวัลชั่วคราว',rewardText:'ตอบถูก 5 ข้อระหว่างกิจกรรมเพื่อรับ XP ผู้เล่นเพิ่ม 15% จนกว่ากิจกรรมจะสิ้นสุด',claim:'รับบูสต์นักสำรวจวัฒนธรรม',claimed:'บูสต์นักสำรวจวัฒนธรรมทำงานอยู่',progress:'คำตอบถูกวันนี้',none:'วันนี้ไม่มีกิจกรรมที่กำลังจัด แต่คุณยังอ่านประวัติของทุกกิจกรรมได้'},
 tr:{title:'Kültürel Etkinlik Takvimi',intro:'Bildiğiniz dil, saygılı bir kültür takvimi seçer. Dil kimliği belirlemez; gelenekler aileye ve bölgeye göre değişebilir.',history:'Tarihçe',meaning:'Neden kutlanır',annual:'Her yılki dönem',active:'Şimdi aktif',upcoming:'Yaklaşıyor',ended:'Bu yıl geçti',reward:'Geçici etkinlik ödülü',rewardText:'Etkinlik sırasında 5 soruyu doğru yanıtlayarak bitişine kadar %15 oyuncu XP bonusu kazan.',claim:'Kültür Kâşifi bonusunu al',claimed:'Kültür Kâşifi bonusu aktif',progress:'Bugünkü doğru cevaplar',none:'Bugün aktif etkinlik yok. Tüm etkinliklerin tarihçesini yine de okuyabilirsiniz.'},
 id:{title:'Kalender Acara Budaya',intro:'Bahasa yang Anda ketahui memilih kalender budaya yang penuh hormat. Bahasa tidak menentukan identitas, dan tradisi dapat berbeda menurut keluarga dan wilayah.',history:'Sejarah',meaning:'Alasan diperingati',annual:'Waktu tahunan',active:'Sedang berlangsung',upcoming:'Akan datang',ended:'Sudah berlangsung tahun ini',reward:'Hadiah acara sementara',rewardText:'Jawab 5 soal dengan benar selama acara untuk memperoleh +15% XP pemain hingga acara berakhir.',claim:'Ambil bonus Penjelajah Budaya',claimed:'Bonus Penjelajah Budaya aktif',progress:'Jawaban benar hari ini',none:'Tidak ada acara aktif hari ini. Sejarah semua acara tetap dapat dibaca.'},
 pl:{title:'Kalendarz wydarzeń kulturalnych',intro:'Znany język wybiera odpowiedni kalendarz kulturowy. Język nie określa tożsamości, a tradycje różnią się między rodzinami i regionami.',history:'Historia',meaning:'Dlaczego jest obchodzone',annual:'Coroczny termin',active:'Trwa teraz',upcoming:'Nadchodzi',ended:'Już obchodzone w tym roku',reward:'Tymczasowa nagroda',rewardText:'Odpowiedz poprawnie na 5 pytań podczas wydarzenia, aby otrzymać +15% XP gracza do jego końca.',claim:'Odbierz premię Odkrywcy Kultury',claimed:'Premia Odkrywcy Kultury aktywna',progress:'Poprawne odpowiedzi dzisiaj',none:'Dziś nie trwa żadne wydarzenie. Historie wszystkich wydarzeń są nadal dostępne.'},
 el:{title:'Ημερολόγιο πολιτιστικών εκδηλώσεων',intro:'Η γλώσσα που γνωρίζετε επιλέγει ένα πολιτιστικό ημερολόγιο. Η γλώσσα δεν καθορίζει την ταυτότητα και οι παραδόσεις διαφέρουν ανά οικογένεια και περιοχή.',history:'Ιστορία',meaning:'Γιατί γιορτάζεται',annual:'Ετήσια περίοδος',active:'Σε εξέλιξη',upcoming:'Προσεχώς',ended:'Πραγματοποιήθηκε φέτος',reward:'Προσωρινή ανταμοιβή',rewardText:'Απαντήστε σωστά σε 5 ερωτήσεις κατά την εκδήλωση για +15% XP παίκτη μέχρι να τελειώσει.',claim:'Λήψη ενίσχυσης Εξερευνητή Πολιτισμού',claimed:'Η ενίσχυση Εξερευνητή Πολιτισμού είναι ενεργή',progress:'Σωστές απαντήσεις σήμερα',none:'Δεν υπάρχει ενεργή εκδήλωση σήμερα. Μπορείτε να διαβάσετε όλες τις ιστορίες.'},
 uk:{title:'Календар культурних подій',intro:'Відома вам мова визначає культурний календар. Мова не визначає ідентичність, а традиції можуть відрізнятися між родинами та регіонами.',history:'Історія',meaning:'Чому відзначають',annual:'Щорічний час',active:'Триває зараз',upcoming:'Незабаром',ended:'Уже відбулося цього року',reward:'Тимчасова нагорода',rewardText:'Дайте 5 правильних відповідей під час події та отримайте +15% досвіду гравця до її завершення.',claim:'Отримати підсилення «Дослідник культури»',claimed:'Підсилення «Дослідник культури» активне',progress:'Правильних відповідей сьогодні',none:'Сьогодні активних подій немає. Історії всіх подій доступні протягом року.'}
};

const LEARNING_CULTURE_INTRO={
 en:'Events come from the culture of the language you are learning. Names, history, instructions, and rewards are translated into the language you know. Traditions can differ by family and region.',
 es:'Los eventos provienen de la cultura del idioma que estás aprendiendo. Los nombres, la historia, las instrucciones y las recompensas están traducidos al idioma que conoces. Las tradiciones pueden variar según la familia y la región.',
 ru:'События относятся к культуре изучаемого вами языка. Названия, история, инструкции и награды переведены на знакомый вам язык. Традиции могут различаться в разных семьях и регионах.',
 ja:'イベントは学習中の言語の文化に基づいています。名称、歴史、説明、報酬は、あなたが理解できる言語に翻訳されます。伝統は家庭や地域によって異なる場合があります。',
 ko:'이벤트는 학습 중인 언어의 문화를 바탕으로 합니다. 이름, 역사, 안내 및 보상은 플레이어가 아는 언어로 번역됩니다. 전통은 가정과 지역에 따라 다를 수 있습니다.',
 zh:'活动来自你正在学习的语言所对应的文化。活动名称、历史、说明和奖励会翻译成你熟悉的语言。不同家庭和地区的传统可能有所不同。',
 it:'Gli eventi appartengono alla cultura della lingua che stai imparando. Nomi, storia, istruzioni e ricompense sono tradotti nella lingua che conosci. Le tradizioni possono variare tra famiglie e regioni.',
 fr:'Les événements viennent de la culture de la langue que vous apprenez. Les noms, l’histoire, les instructions et les récompenses sont traduits dans la langue que vous connaissez. Les traditions peuvent varier selon les familles et les régions.',
 de:'Die Events stammen aus der Kultur der Sprache, die du lernst. Namen, Geschichte, Anleitungen und Belohnungen werden in die Sprache übersetzt, die du kennst. Traditionen können sich je nach Familie und Region unterscheiden.',
 pt:'Os eventos vêm da cultura do idioma que você está aprendendo. Nomes, história, instruções e recompensas são traduzidos para o idioma que você conhece. As tradições podem variar entre famílias e regiões.',
 vi:'Các sự kiện thuộc nền văn hóa của ngôn ngữ bạn đang học. Tên, lịch sử, hướng dẫn và phần thưởng được dịch sang ngôn ngữ bạn biết. Truyền thống có thể khác nhau theo gia đình và vùng miền.',
 th:'กิจกรรมมาจากวัฒนธรรมของภาษาที่คุณกำลังเรียน ชื่อ ประวัติ คำแนะนำ และรางวัลจะแปลเป็นภาษาที่คุณรู้ ประเพณีอาจแตกต่างกันตามครอบครัวและภูมิภาค',
 tr:'Etkinlikler öğrendiğiniz dilin kültüründen gelir. Adlar, tarihçe, talimatlar ve ödüller bildiğiniz dile çevrilir. Gelenekler aileye ve bölgeye göre değişebilir.',
 id:'Acara berasal dari budaya bahasa yang sedang Anda pelajari. Nama, sejarah, petunjuk, dan hadiah diterjemahkan ke bahasa yang Anda ketahui. Tradisi dapat berbeda menurut keluarga dan wilayah.',
 pl:'Wydarzenia pochodzą z kultury języka, którego się uczysz. Nazwy, historia, instrukcje i nagrody są tłumaczone na język, który znasz. Tradycje mogą różnić się między rodzinami i regionami.',
 el:'Οι εκδηλώσεις προέρχονται από τον πολιτισμό της γλώσσας που μαθαίνετε. Τα ονόματα, η ιστορία, οι οδηγίες και οι ανταμοιβές μεταφράζονται στη γλώσσα που γνωρίζετε. Οι παραδόσεις μπορεί να διαφέρουν ανά οικογένεια και περιοχή.',
 uk:'Події походять із культури мови, яку ви вивчаєте. Назви, історія, інструкції та нагороди перекладаються мовою, яку ви знаєте. Традиції можуть відрізнятися між родинами та регіонами.'
};

const fixed=(id,icon,name,month,startDay,endMonth,endDay,color,windowLabel,history,meaning)=>({id,icon,name,color,windowLabel,history,meaning,rule:{type:'fixed',month,startDay,endMonth,endDay}});
const lastWeekday=(id,icon,name,month,weekday,beforeDays,afterDays,color,windowLabel,history,meaning)=>({id,icon,name,color,windowLabel,history,meaning,rule:{type:'lastWeekday',month,weekday,beforeDays,afterDays}});
const nthWeekday=(id,icon,name,month,weekday,nth,beforeDays,afterDays,color,windowLabel,history,meaning)=>({id,icon,name,color,windowLabel,history,meaning,rule:{type:'nthWeekday',month,weekday,nth,beforeDays,afterDays}});

const CALENDARS={
 en:[
  fixed('juneteenth','✊🏿','Juneteenth',6,18,6,20,'#ef6b63','June 19','Juneteenth remembers June 19, 1865, when General Order No. 3 announced emancipation in Galveston, Texas. Black communities developed the observance through reunions, education, music, and public celebration.','It honours African American freedom, memory, community, and the continuing work of equality.'),
  lastWeekday('notting-hill','🎺','Notting Hill Carnival',8,1,1,0,'#ffb44c','The Sunday and Monday of the August bank-holiday weekend','The London carnival grew from Caribbean community organizing in response to racism faced by the Windrush generation. Outdoor celebrations developed in Notting Hill during the 1960s.','Mas bands, steelpan, sound systems, food, and dance celebrate Caribbean creativity, resilience, and belonging in Britain.'),
  fixed('christmas-en','🎄','Christmas traditions',12,24,12,26,'#58c985','December 24–26','Christmas developed as a Christian festival of the birth of Jesus and also absorbed many regional winter customs. English-speaking communities mark it in religious and secular ways.','Families and communities may gather, worship, exchange gifts, share meals, volunteer, or simply enjoy a winter public holiday.')
 ],
 es:[
  fixed('reyes','👑','Día de Reyes',1,5,1,6,'#f0bd4f','5–6 de enero','La celebración cristiana de la Epifanía recuerda la visita de los Reyes Magos al niño Jesús. En muchos lugares del mundo hispano se incorporaron cabalgatas y regalos para la infancia.','Se celebra con reuniones, rosca o roscón, desfiles y regalos, aunque las costumbres cambian según el país.'),
  fixed('muertos','🕯️','Día de Muertos',10,31,11,2,'#d783ff','31 de octubre–2 de noviembre','La tradición mexicana combina prácticas indígenas para recordar a los difuntos con festividades católicas introducidas en el siglo XVI. Las familias preparan ofrendas, flores, velas y alimentos.','Afirma la memoria familiar y comunitaria y expresa que recordar a quienes murieron forma parte de celebrar la vida.'),
  fixed('posadas','🪅','Las Posadas',12,16,12,24,'#ff6d72','16–24 de diciembre','Las Posadas surgieron en la época colonial de México como una representación de la búsqueda de alojamiento de María y José. Con el tiempo se convirtió en una tradición comunitaria.','Procesiones, cantos, comida y piñatas reúnen a vecinos y familias durante los días previos a Navidad.')
 ],
 ru:[
  fixed('new-year-ru','🎆','Новый год',12,31,1,2,'#80c7ff','31 декабря–2 января','Современная светская традиция Нового года в России особенно укрепилась в советский период, когда ёлка, Дед Мороз и семейный праздник стали центральными зимними символами.','Люди встречают новый год с близкими, украшают ёлку, обмениваются подарками и желают друг другу благополучия.'),
  fixed('victory-day','🎖️','День Победы',5,8,5,10,'#e56a5d','9 мая','День Победы отмечает окончание Великой Отечественной войны для Советского Союза в 1945 году. Память о войне остаётся личной и сложной для многих семей и народов.','День посвящён памяти погибших, ветеранов и огромной человеческой цене войны.'),
  fixed('russia-day','🇷🇺','День России',6,11,6,13,'#6aa9ff','12 июня','Праздник связан с принятием в 1990 году декларации о государственном суверенитете РСФСР и получил современное название в 2002 году.','Это государственный праздник, посвящённый стране, гражданству и общественной жизни.')
 ],
 ja:[
  fixed('shogatsu','🎍','お正月',1,1,1,3,'#e56b6f','1月1日〜3日','日本の正月行事は、年神を迎えて新しい年の無事と豊作を願う習慣から発展しました。初詣、門松、おせち、年賀状など地域や家庭ごとの伝統があります。','家族や地域で新年を迎え、前年に感謝し、健康と幸運を願います。'),
  fixed('hanami','🌸','花見',3,20,4,15,'#ff92c2','3月下旬〜4月中旬（地域・年により異なる）','花見は奈良・平安時代の貴族文化にさかのぼり、やがて桜を楽しむ行事として広まりました。開花時期は地域と年によって変わります。','桜の短い美しさを楽しみ、春の始まりや人とのつながりを感じる季節行事です。'),
  fixed('obon','🏮','お盆',8,13,8,16,'#f6a84f','8月13日〜16日ごろ（地域により7月）','お盆は仏教行事と日本の祖先祭祀が結びついた習慣です。地域によって7月または8月に行われ、迎え火や盆踊りなどがあります。','祖先や亡くなった家族を迎え、供養し、家族のつながりを確かめます。')
 ],
 ko:[
  fixed('children-kr','🧒','어린이날',5,4,5,6,'#73d89c','5월 5일','한국의 어린이날은 1920년대 어린이를 존중하는 사회를 만들자는 운동에서 발전했고, 5월 5일이 공휴일로 자리 잡았습니다.','어린이의 존엄과 행복을 생각하고 가족이 함께 시간을 보내는 날입니다.'),
  fixed('liberation-kr','🇰🇷','광복절',8,14,8,16,'#69a9ff','8월 15일','광복절은 1945년 8월 15일 일제 식민 통치에서 해방된 것을 기념하며, 1948년 대한민국 정부 수립도 함께 기억합니다.','독립을 위해 노력한 사람들을 기리고 자유와 주권의 의미를 되새깁니다.'),
  fixed('hangul-day','한','한글날',10,8,10,10,'#62d5c7','10월 9일','한글날은 세종대왕과 집현전 학자들이 만든 훈민정음의 반포를 기념합니다. 훈민정음은 1446년에 백성이 쉽게 글을 익히도록 공개되었습니다.','한글의 과학성, 문해력, 문화적 가치를 기념하는 날입니다.')
 ],
 zh:[
  fixed('spring-festival','🧧','春节',1,20,2,20,'#ef5d5d','农历正月前后（公历日期每年变化）','春节以农历新年为中心，融合祭祖、辞旧迎新和家庭团聚等悠久传统。具体公历日期每年不同，各地习俗也很丰富。','人们团聚、拜年、分享年夜饭，并祝愿新年平安兴旺。'),
  fixed('qingming','🌿','清明节',4,4,4,6,'#75c986','4月4日至6日前后','清明既是二十四节气之一，也逐渐形成扫墓祭祖和春日踏青的传统节日。日期会随节气略有变化。','人们缅怀祖先和逝去的亲友，也感受春天和生命延续。'),
  fixed('national-day-cn','🇨🇳','国庆节',10,1,10,7,'#e45252','10月1日至7日前后','中华人民共和国国庆节纪念1949年10月1日中华人民共和国中央人民政府成立。随后形成国庆纪念活动和假期安排。','人们通过公共活动、旅行和家庭相聚纪念国家成立。')
 ],
 it:[
  fixed('epifania-it','🧹','Epifania e Befana',1,5,1,6,'#af8cff','5–6 gennaio','L’Epifania cristiana ricorda la visita dei Magi. In Italia si è intrecciata con la figura popolare della Befana, che porta dolci o carbone simbolico ai bambini.','La festa chiude tradizionalmente il periodo natalizio con riti religiosi, mercati e usanze familiari.'),
  fixed('liberation-it','🇮🇹','Festa della Liberazione',4,24,4,26,'#69c98c','25 aprile','Il 25 aprile ricorda l’insurrezione del 1945 e la liberazione dal nazifascismo, un passaggio decisivo verso la Repubblica e la Costituzione italiana.','Si onorano la Resistenza, la libertà democratica e le persone che lottarono contro la dittatura e l’occupazione.'),
  fixed('ferragosto','☀️','Ferragosto',8,14,8,16,'#ffb84f','15 agosto','Ferragosto deriva dalle Feriae Augusti dell’antica Roma e in seguito si è unito alla festa cattolica dell’Assunzione di Maria.','È un momento di riposo estivo, viaggi, pranzi condivisi e feste locali in tutta Italia.')
 ],
 fr:[
  fixed('epiphanie-fr','👑','Épiphanie',1,5,1,7,'#e2b74d','autour du 6 janvier','L’Épiphanie chrétienne commémore la visite des mages. En France, la galette des rois a développé ses propres coutumes, dont la fève cachée et la couronne.','Familles, amis et collègues partagent une galette et désignent symboliquement un roi ou une reine.'),
  fixed('musique-fr','🎵','Fête de la musique',6,20,6,22,'#69d2c2','21 juin','La Fête de la musique a été lancée en France en 1982 pour encourager musiciens amateurs et professionnels à jouer gratuitement dans l’espace public.','Elle célèbre la diversité musicale, la participation de tous et l’arrivée de l’été.'),
  fixed('national-fr','🇫🇷','Fête nationale',7,13,7,15,'#6ea6ff','14 juillet','La fête nationale renvoie à la prise de la Bastille en 1789 et à la Fête de la Fédération de 1790, symboles liés à la Révolution française et à l’unité nationale.','Cérémonies, bals, concerts et feux d’artifice marquent une journée consacrée à la République et à la vie civique.')
 ],
 de:[
  fixed('karneval-de','🎭','Karneval, Fastnacht und Fasching',2,1,3,10,'#d678e8','Februar bis Anfang März; Termin variiert','Die Bräuche entwickelten sich regional vor der christlichen Fastenzeit. Namen, Figuren und Umzüge unterscheiden sich besonders zwischen Rheinland, Südwestdeutschland, Bayern und Österreich.','Verkleidungen, Satire, Musik und Umzüge schaffen Raum für gemeinschaftliches Feiern vor der Fastenzeit.'),
  fixed('unity-de','🇩🇪','Tag der Deutschen Einheit',10,2,10,4,'#e1b34f','3. Oktober','Der Feiertag erinnert an den Beitritt der DDR zur Bundesrepublik Deutschland am 3. Oktober 1990 und damit an die staatliche Wiedervereinigung.','Er lädt dazu ein, über Teilung, friedliche Revolution, Demokratie und das Zusammenwachsen Deutschlands nachzudenken.'),
  fixed('markets-de','🕯️','Advents- und Weihnachtsmärkte',12,1,12,24,'#5fc78a','Adventszeit bis 24. Dezember','Wintermärkte sind seit dem späten Mittelalter in deutschsprachigen Städten belegt. Später verbanden sie sich mit Adventsbräuchen, Handwerk, Musik und saisonalen Speisen.','Menschen treffen sich in der Adventszeit, unterstützen lokales Handwerk und pflegen regionale Wintertraditionen.')
 ],
 pt:[
  fixed('carnaval-br','🎉','Carnaval',2,1,3,10,'#ff7a66','fevereiro ou março; a data varia','O Carnaval brasileiro reúne heranças europeias, africanas e indígenas. Blocos, escolas de samba, maracatus e outras formas regionais cresceram ao longo dos séculos.','A festa valoriza música, dança, criatividade comunitária e identidades locais antes do período cristão da Quaresma.'),
  fixed('festa-junina','🔥','Festas Juninas',6,1,6,30,'#f1a343','mês de junho','As festas vieram de celebrações católicas portuguesas dedicadas a santos de junho e, no Brasil, ganharam ritmos, alimentos e símbolos ligados à vida rural e às culturas regionais.','Quadrilhas, fogueiras, comidas e música reúnem escolas, famílias e comunidades.'),
  fixed('independence-br','🇧🇷','Independência do Brasil',9,6,9,8,'#6fcb78','7 de setembro','A data recorda a declaração de independência de Portugal em 1822. A construção do país e da cidadania, porém, foi um processo mais longo e desigual.','Desfiles e atividades cívicas convidam à reflexão sobre independência, participação e história nacional.')
 ],
 vi:[
  fixed('tet','🧧','Tết Nguyên Đán',1,20,2,20,'#ef6161','dịp đầu năm âm lịch; ngày dương lịch thay đổi','Tết đánh dấu năm mới âm lịch và kết hợp tục thờ cúng tổ tiên, sum họp gia đình, dọn nhà và chúc năm mới. Ngày dương lịch thay đổi mỗi năm.','Mọi người tưởng nhớ tổ tiên, đoàn tụ, lì xì và cầu chúc sức khỏe, may mắn, thịnh vượng.'),
  fixed('reunification-vi','🇻🇳','Ngày Thống nhất',4,29,5,1,'#e85858','30 tháng 4','Ngày 30 tháng 4 ghi dấu sự kết thúc chiến tranh năm 1975 và sự thống nhất đất nước. Ký ức về chiến tranh có thể khác nhau giữa các gia đình và cộng đồng.','Đây là dịp tưởng niệm lịch sử, hòa bình, mất mát và quá trình xây dựng đất nước.'),
  fixed('national-vi','⭐','Quốc khánh Việt Nam',9,1,9,3,'#e75a56','2 tháng 9','Quốc khánh kỷ niệm Tuyên ngôn Độc lập được đọc tại Hà Nội ngày 2 tháng 9 năm 1945, khai sinh nước Việt Nam Dân chủ Cộng hòa.','Cờ, lễ tưởng niệm và sinh hoạt cộng đồng đánh dấu độc lập và đời sống quốc gia.')
 ],
 th:[
  fixed('songkran','💦','สงกรานต์',4,13,4,15,'#57cbe1','13–15 เมษายน','สงกรานต์เป็นประเพณีปีใหม่ไทยในช่วงกลางเดือนเมษายนหลังฤดูเก็บเกี่ยว การรดน้ำสื่อถึงการชำระล้าง ความเคารพ และความโชคดี', 'ผู้คนกลับบ้าน ทำบุญ เคารพผู้สูงอายุและบรรพบุรุษ รวมทั้งเล่นน้ำร่วมกันอย่างมีความรับผิดชอบ'),
  fixed('mothers-day-th','💙','วันแม่แห่งชาติ',8,12,8,12,'#75aaff','12 สิงหาคม','ประเทศไทยกำหนดวันแม่แห่งชาติในวันที่ 12 สิงหาคม ซึ่งตรงกับวันพระราชสมภพของสมเด็จพระนางเจ้าสิริกิติ์ พระบรมราชชนนีพันปีหลวง', 'ครอบครัวแสดงความกตัญญูต่อแม่และผู้ดูแล พร้อมทำกิจกรรมสาธารณประโยชน์'),
  fixed('fathers-day-th','🟡','วันพ่อแห่งชาติ',12,5,12,5,'#f0c34f','5 ธันวาคม','วันพ่อแห่งชาติตรงกับวันคล้ายวันพระบรมราชสมภพของพระบาทสมเด็จพระเจ้าอยู่หัวภูมิพลอดุลยเดชมหาราช', 'ผู้คนระลึกถึงบทบาทของพ่อและผู้ดูแล รวมทั้งกิจกรรมเพื่อชุมชนและสังคม')
 ],
 tr:[
  fixed('children-tr','🧒','Ulusal Egemenlik ve Çocuk Bayramı',4,22,4,24,'#ef6a69','23 Nisan','23 Nisan, Türkiye Büyük Millet Meclisinin 1920’de açılışını anar. Mustafa Kemal Atatürk günü çocuklara armağan etmiş ve çocuk etkinlikleri bayramın önemli parçası olmuştur.','Ulusal egemenlik düşüncesi ile çocukların gelecekteki rolü birlikte kutlanır.'),
  fixed('victory-tr','🏅','Zafer Bayramı',8,29,8,31,'#e95c5c','30 Ağustos','30 Ağustos, 1922’de Başkomutanlık Meydan Muharebesi’nin kazanılmasını ve Türk Kurtuluş Savaşı’nın belirleyici aşamasını anar.','Bağımsızlık mücadelesinde yaşamını yitirenler ve gaziler anılır.'),
  fixed('republic-tr','🇹🇷','Cumhuriyet Bayramı',10,28,10,29,'#e34e4e','29 Ekim','29 Ekim, Türkiye Cumhuriyeti’nin 1923’te ilan edilmesini ve yönetim biçiminin cumhuriyet olarak belirlenmesini anar.','Törenler, konserler ve kamusal etkinlikler cumhuriyet ve yurttaşlığı kutlar.')
 ],
 id:[
  fixed('kartini','📚','Hari Kartini',4,20,4,22,'#d978b0','21 April','Hari Kartini mengenang Raden Ajeng Kartini, penulis dan pelopor pendidikan perempuan Jawa yang surat-suratnya mendorong pembicaraan tentang kesetaraan dan pendidikan.','Sekolah dan komunitas membahas pendidikan, kesempatan, serta kontribusi perempuan Indonesia.'),
  fixed('pancasila','🦅','Hari Lahir Pancasila',6,1,6,1,'#dfb94d','1 Juni','Tanggal ini mengenang pidato Sukarno pada 1 Juni 1945 yang merumuskan gagasan dasar Pancasila dalam proses menuju kemerdekaan Indonesia.','Hari ini mengajak masyarakat merenungkan lima prinsip dasar dan kehidupan bersama dalam keberagaman.'),
  fixed('independence-id','🇮🇩','Hari Kemerdekaan Indonesia',8,16,8,18,'#e85b58','17 Agustus','Hari Kemerdekaan memperingati Proklamasi 17 Agustus 1945 oleh Sukarno dan Mohammad Hatta setelah masa penjajahan dan pendudukan.','Upacara bendera, permainan kampung, dan kegiatan warga merayakan kemerdekaan dan gotong royong.')
 ],
 pl:[
  fixed('constitution-pl','📜','Święto Konstytucji 3 Maja',5,2,5,4,'#e36565','3 maja','Święto upamiętnia Konstytucję z 1791 roku, jedną z najwcześniejszych nowoczesnych konstytucji w Europie, która próbowała zreformować Rzeczpospolitą.','Uroczystości przypominają o prawie, odpowiedzialności obywatelskiej i historii państwa.'),
  fixed('independence-pl','🇵🇱','Narodowe Święto Niepodległości',11,10,11,12,'#e75d5d','11 listopada','Data symbolizuje odzyskanie przez Polskę niepodległości w 1918 roku po 123 latach zaborów, choć proces odbudowy państwa trwał dłużej.','Obchody oddają hołd ludziom walczącym o niepodległość i zachęcają do refleksji nad wspólnotą obywatelską.'),
  fixed('andrzejki','🔮','Andrzejki',11,29,11,30,'#a47be7','noc z 29 na 30 listopada','Andrzejki wywodzą się z dawnych wróżb matrymonialnych odprawianych w wigilię świętego Andrzeja. Z czasem stały się świecką zabawą towarzyską.','Lanie wosku, gry i spotkania są dziś traktowane głównie jako zabawna tradycja przed Adwentem.')
 ],
 el:[
  fixed('independence-el','🇬🇷','Επέτειος της 25ης Μαρτίου',3,24,3,26,'#6ca9ef','25 Μαρτίου','Η ημέρα συνδέεται με την έναρξη της Ελληνικής Επανάστασης του 1821 και συμπίπτει με τον ορθόδοξο Ευαγγελισμό της Θεοτόκου.','Παρελάσεις και τελετές τιμούν τον αγώνα για ανεξαρτησία και τη θρησκευτική παράδοση.'),
  fixed('ohi-day','ΟΧΙ','Επέτειος του Όχι',10,27,10,29,'#79aef0','28 Οκτωβρίου','Η επέτειος θυμάται την απόρριψη του ιταλικού τελεσιγράφου το 1940 και την είσοδο της Ελλάδας στον Β΄ Παγκόσμιο Πόλεμο.','Τιμώνται όσοι αντιστάθηκαν στον φασισμό και όσοι υπέφεραν στον πόλεμο και την κατοχή.'),
  fixed('christmas-el','⭐','Χριστούγεννα',12,24,12,26,'#66c787','24–26 Δεκεμβρίου','Η χριστιανική γιορτή της Γέννησης του Χριστού συνδέθηκε στην Ελλάδα με κάλαντα, εκκλησιασμό, οικογενειακά τραπέζια και τοπικά έθιμα.','Οικογένειες και κοινότητες συναντιούνται, προσφέρουν και διατηρούν θρησκευτικές ή κοσμικές παραδόσεις.')
 ],
 uk:[
  nthWeekday('vyshyvanka','👕','День вишиванки',5,4,3,0,0,'#e65a68','третій четвер травня','День вишиванки започаткували студенти Чернівецького університету у 2006 році як ініціативу вдягати традиційну вишиту сорочку без обов’язкового офіційного ритуалу.','Подія підтримує живу традицію вишивки, культурну різноманітність регіонів і зв’язок поколінь.'),
  fixed('constitution-uk','📜','День Конституції України',6,27,6,29,'#69aaf2','28 червня','Свято відзначає ухвалення Конституції України Верховною Радою 28 червня 1996 року після тривалого конституційного процесу.','День нагадує про права людини, демократію, державний устрій та відповідальність громадян.'),
  fixed('independence-uk','🇺🇦','День Незалежності України',8,23,8,26,'#f0c94c','24 серпня','24 серпня відзначає проголошення незалежності України Верховною Радою у 1991 році, підтверджене всеукраїнським референдумом 1 грудня.','Подія вшановує свободу, державність, культуру та людей, які захищають незалежність України.')
 ]
};

function localDate(year,month,day,end=false){return new Date(year,month-1,day,end?23:0,end?59:0,end?59:0,end?999:0);}
function weekdayDate(year,month,weekday,nth,last=false){
 if(last){const date=new Date(year,month,0);while(date.getDay()!==weekday)date.setDate(date.getDate()-1);return date;}
 const date=new Date(year,month-1,1);while(date.getDay()!==weekday)date.setDate(date.getDate()+1);date.setDate(date.getDate()+(nth-1)*7);return date;
}
function bounds(event,year){
 const rule=event.rule;
 if(rule.type==='fixed'){
  const endYear=rule.endMonth<rule.month?year+1:year;
  return{start:localDate(year,rule.month,rule.startDay),end:localDate(endYear,rule.endMonth,rule.endDay,true),seasonYear:year};
 }
 const anchor=weekdayDate(year,rule.month,rule.weekday,rule.nth||1,rule.type==='lastWeekday');
 return{start:new Date(anchor.getTime()-Number(rule.beforeDays||0)*DAY),end:new Date(anchor.getTime()+(Number(rule.afterDays||0)+1)*DAY-1),seasonYear:year};
}
function occurrence(event,now){
 const year=now.getFullYear(),candidates=[bounds(event,year-1),bounds(event,year),bounds(event,year+1)];
 const active=candidates.find(item=>now>=item.start&&now<=item.end);
 if(active)return{...active,status:'active'};
 const annual=bounds(event,year);
 return{...annual,status:annual.start>now?'upcoming':'ended'};
}
function eventView(event,cultureLanguage,knownLanguageId,now,translated={}){
 const timing=occurrence(event,now),locale=LOCALES[knownLanguageId]||LOCALES.en,format=new Intl.DateTimeFormat(locale,{month:'short',day:'numeric'});
 return Object.freeze({...event,...translated,nativeName:event.name,nativeWindowLabel:event.windowLabel,cultureLanguage,cultureLocale:LOCALES[cultureLanguage]||LOCALES.en,...timing,startAt:timing.start.getTime(),endAt:timing.end.getTime(),claimKey:`${cultureLanguage}:${event.id}:${timing.seasonYear}`,dateLabel:`${format.format(timing.start)} – ${format.format(timing.end)}`});
}
function knownLanguage(){const context=window.LanguageMinerI18n?.getContext?.();return CALENDARS[context?.known]?context.known:(CALENDARS[window.LanguageMinerI18n?.getLocale?.()]?window.LanguageMinerI18n.getLocale():'en');}
function learningLanguage(){const context=window.LanguageMinerI18n?.getContext?.(),dataset=document.documentElement.dataset.lmLearningLanguage;return CALENDARS[context?.learning]?context.learning:(CALENDARS[dataset]?dataset:'ja');}
function sourceCalendar(language=learningLanguage(),date=new Date()){
 const culture=CALENDARS[language]?language:'ja',now=date instanceof Date?date:new Date(date);
 return Object.freeze({language:culture,cultureLanguage:culture,languageName:LANGUAGE_NAMES[culture],locale:LOCALES[culture],copy:UI[culture]||UI.en,events:Object.freeze(CALENDARS[culture].map(event=>eventView(event,culture,culture,now)).sort((a,b)=>a.startAt-b.startAt))});
}
function calendar(language=learningLanguage(),knownOrDate=knownLanguage(),date=new Date()){
 const culture=CALENDARS[language]?language:'ja',legacyDate=knownOrDate instanceof Date,known=legacyDate?knownLanguage():(CALENDARS[knownOrDate]?knownOrDate:knownLanguage()),now=legacyDate?knownOrDate:(date instanceof Date?date:new Date(date)),translations=window.LANGUAGE_MINER_CULTURAL_EVENT_TRANSLATIONS?.[known]||{},copy=Object.freeze({...UI[known]||UI.en,intro:LEARNING_CULTURE_INTRO[known]||LEARNING_CULTURE_INTRO.en});
 const events=CALENDARS[culture].map(event=>eventView(event,culture,known,now,translations[`${culture}:${event.id}`]||{})).sort((a,b)=>a.startAt-b.startAt);
 return Object.freeze({language:culture,cultureLanguage:culture,knownLanguage:known,languageName:LANGUAGE_NAMES[culture],knownLanguageName:LANGUAGE_NAMES[known],locale:LOCALES[known],copy,events:Object.freeze(events)});
}
function active(language=learningLanguage(),knownOrDate=knownLanguage(),date=new Date()){return calendar(language,knownOrDate,date).events.filter(event=>event.status==='active');}

window.LanguageMinerCulturalEvents=Object.freeze({version:'6.4.185',rewardXpRate:.15,requiredCorrect:5,languages:Object.freeze(Object.keys(CALENDARS)),knownLanguage,learningLanguage,sourceCalendar,calendar,active});
})();
