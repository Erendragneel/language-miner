/* Core reward controls follow the player's known/interface language. */
(()=>{'use strict';
 const keys=['Daily Reward','Day','Daily Mini Golem','Prismatic Mini Golem','Practice questions','READY TO BREAK','Break Golem','Golem Core','Reward claimed today','Practice 5 questions','7-day rewards','Daily Miner','Reward added','Continue','Sync daily reward'];
 const packs={
 ja:['デイリー報酬','日目','デイリーミニゴーレム','虹色ミニゴーレム','練習問題','割る準備完了','ゴーレムを割る','ゴーレムコア','今日の報酬は受取済み','5問練習する','7日間の報酬','デイリー採掘者','報酬を追加しました','続ける','報酬を同期'],
 es:['Recompensa diaria','Día','Minigólem diario','Minigólem prismático','Preguntas de práctica','LISTO PARA ABRIR','Abrir gólem','Núcleo de gólem','Recompensa de hoy recibida','Practica 5 preguntas','Recompensas de 7 días','Minero diario','Recompensa añadida','Continuar','Sincronizar recompensa'],
 fr:['Récompense quotidienne','Jour','Mini-golem quotidien','Mini-golem prismatique','Questions de pratique','PRÊT À OUVRIR','Ouvrir le golem','Cœur de golem','Récompense du jour reçue','Répondre à 5 questions','Récompenses sur 7 jours','Mineur quotidien','Récompense ajoutée','Continuer','Synchroniser la récompense'],
 de:['Tägliche Belohnung','Tag','Täglicher Mini-Golem','Prismatischer Mini-Golem','Übungsfragen','BEREIT ZUM ÖFFNEN','Golem öffnen','Golem-Kern','Heutige Belohnung erhalten','5 Fragen üben','7-Tage-Belohnungen','Täglicher Bergmann','Belohnung hinzugefügt','Weiter','Belohnung synchronisieren'],
 it:['Ricompensa giornaliera','Giorno','Mini golem giornaliero','Mini golem prismatico','Domande di pratica','PRONTO DA APRIRE','Apri il golem','Nucleo del golem','Ricompensa di oggi ricevuta','Esercitati con 5 domande','Ricompense di 7 giorni','Minatore quotidiano','Ricompensa aggiunta','Continua','Sincronizza ricompensa'],
 ko:['일일 보상','일','일일 미니 골렘','무지개 미니 골렘','연습 문제','깨뜨릴 준비 완료','골렘 깨뜨리기','골렘 코어','오늘의 보상 수령 완료','5문제 연습하기','7일 보상','매일의 광부','보상이 추가되었어요','계속','보상 동기화'],
 zh:['每日奖励','天','每日迷你魔像','棱彩迷你魔像','练习题','可以敲开了','敲开魔像','魔像核心','已领取今日奖励','练习5道题','7天奖励','每日矿工','奖励已添加','继续','同步奖励'],
 ru:['Ежедневная награда','День','Ежедневный мини-голем','Радужный мини-голем','Учебные вопросы','МОЖНО РАСКОЛОТЬ','Расколоть голема','Ядро голема','Сегодняшняя награда получена','Ответить на 5 вопросов','Награды за 7 дней','Ежедневный шахтёр','Награда добавлена','Продолжить','Синхронизировать награду'],
 pt:['Recompensa diária','Dia','Minigolem diário','Minigolem prismático','Perguntas de prática','PRONTO PARA ABRIR','Abrir golem','Núcleo do golem','Recompensa de hoje recebida','Praticar 5 perguntas','Recompensas de 7 dias','Mineiro diário','Recompensa adicionada','Continuar','Sincronizar recompensa'],
 vi:['Phần thưởng hằng ngày','Ngày','Golem nhỏ hằng ngày','Golem nhỏ cầu vồng','Câu hỏi luyện tập','SẴN SÀNG ĐỂ MỞ','Mở golem','Lõi golem','Đã nhận thưởng hôm nay','Luyện tập 5 câu hỏi','Phần thưởng 7 ngày','Thợ mỏ hằng ngày','Đã thêm phần thưởng','Tiếp tục','Đồng bộ phần thưởng'],
 th:['รางวัลประจำวัน','วัน','โกเลมจิ๋วประจำวัน','โกเลมจิ๋วสีรุ้ง','คำถามฝึกฝน','พร้อมเปิดแล้ว','เปิดโกเลม','แกนโกเลม','รับรางวัลวันนี้แล้ว','ฝึกตอบ 5 ข้อ','รางวัล 7 วัน','นักขุดประจำวัน','เพิ่มรางวัลแล้ว','ต่อไป','ซิงค์รางวัล'],
 tr:['Günlük ödül','Gün','Günlük mini golem','Prizmatik mini golem','Alıştırma soruları','AÇILMAYA HAZIR','Golemi aç','Golem çekirdeği','Bugünün ödülü alındı','5 soru çöz','7 günlük ödüller','Günlük madenci','Ödül eklendi','Devam','Ödülü eşitle'],
 id:['Hadiah harian','Hari','Golem mini harian','Golem mini prismatik','Soal latihan','SIAP DIBUKA','Buka golem','Inti golem','Hadiah hari ini diterima','Latih 5 soal','Hadiah 7 hari','Penambang harian','Hadiah ditambahkan','Lanjut','Sinkronkan hadiah'],
 pl:['Nagroda dzienna','Dzień','Codzienny minigolem','Pryzmatyczny minigolem','Pytania ćwiczeniowe','GOTOWY DO OTWARCIA','Otwórz golema','Rdzeń golema','Dzisiejsza nagroda odebrana','Przećwicz 5 pytań','Nagrody na 7 dni','Codzienny górnik','Dodano nagrodę','Kontynuuj','Synchronizuj nagrodę'],
 el:['Ημερήσια ανταμοιβή','Ημέρα','Ημερήσιο μίνι γκόλεμ','Πρισματικό μίνι γκόλεμ','Ερωτήσεις εξάσκησης','ΕΤΟΙΜΟ ΓΙΑ ΑΝΟΙΓΜΑ','Άνοιξε το γκόλεμ','Πυρήνας γκόλεμ','Η σημερινή ανταμοιβή παραλήφθηκε','Εξάσκηση με 5 ερωτήσεις','Ανταμοιβές 7 ημερών','Καθημερινός μεταλλωρύχος','Προστέθηκε ανταμοιβή','Συνέχεια','Συγχρονισμός ανταμοιβής'],
 uk:['Щоденна нагорода','День','Щоденний мініголем','Райдужний мініголем','Навчальні запитання','МОЖНА РОЗКОЛОТИ','Розколоти голема','Ядро голема','Сьогоднішню нагороду отримано','Відповісти на 5 запитань','Нагороди за 7 днів','Щоденний шахтар','Нагороду додано','Продовжити','Синхронізувати нагороду'],
 ar:['المكافأة اليومية','اليوم','الغولم الصغير اليومي','الغولم الصغير القزحي','أسئلة التدريب','جاهز للفتح','افتح الغولم','نواة الغولم','تم استلام مكافأة اليوم','تدرّب على 5 أسئلة','مكافآت 7 أيام','عامل المنجم اليومي','تمت إضافة المكافأة','متابعة','مزامنة المكافأة'],
 hi:['दैनिक पुरस्कार','दिन','दैनिक छोटा गोलेम','इंद्रधनुषी छोटा गोलेम','अभ्यास प्रश्न','खोलने के लिए तैयार','गोलेम खोलें','गोलेम कोर','आज का पुरस्कार मिल गया','5 प्रश्नों का अभ्यास करें','7 दिनों के पुरस्कार','दैनिक खनिक','पुरस्कार जोड़ा गया','जारी रखें','पुरस्कार सिंक करें'],
 nl:['Dagelijkse beloning','Dag','Dagelijkse minigolem','Prismatische minigolem','Oefenvragen','KLAAR OM TE OPENEN','Golem openen','Golemkern','Beloning van vandaag ontvangen','Oefen 5 vragen','Beloningen voor 7 dagen','Dagelijkse mijnwerker','Beloning toegevoegd','Doorgaan','Beloning synchroniseren'],
 sv:['Daglig belöning','Dag','Daglig minigolem','Prismatisk minigolem','Övningsfrågor','REDO ATT ÖPPNAS','Öppna golem','Golemkärna','Dagens belöning hämtad','Öva på 5 frågor','Belöningar för 7 dagar','Daglig gruvarbetare','Belöning tillagd','Fortsätt','Synkronisera belöning']
 };
 const tips={
 ja:['休んでも報酬の日数は維持されます。問題数はUTC午前0時にリセットされます。','週のコア4個で無料の称号を獲得。','オンラインで同期してください。'],
 es:['Los días perdidos conservan tu día de recompensa. Las preguntas se reinician a las 00:00 UTC.','Cuatro núcleos semanales desbloquean un título gratis.','Conéctate para sincronizar.'],
 fr:['Les jours manqués conservent votre progression. Les questions sont réinitialisées à 00 h UTC.','Quatre cœurs hebdomadaires débloquent un titre gratuit.','Connectez-vous pour synchroniser.'],
 de:['Verpasste Tage setzen den Belohnungstag nicht zurück. Fragen werden um 00:00 UTC zurückgesetzt.','Vier Wochenkerne schalten einen kostenlosen Titel frei.','Zum Synchronisieren online gehen.'],
 it:['I giorni saltati non azzerano il giorno del premio. Le domande si azzerano alle 00:00 UTC.','Quattro nuclei settimanali sbloccano un titolo gratuito.','Connettiti per sincronizzare.'],
 ko:['하루를 쉬어도 보상 일차는 유지돼요. 문제 수는 UTC 0시에 초기화돼요.','주간 코어 4개로 무료 칭호를 얻어요.','온라인으로 연결하여 동기화하세요.'],
 zh:['错过的日期不会重置奖励进度。题数在UTC零点重置。','四个每周核心可解锁免费称号。','请联网同步。'],
 ru:['Пропущенные дни не сбрасывают день награды. Вопросы сбрасываются в 00:00 UTC.','Четыре недельных ядра открывают бесплатный титул.','Подключитесь для синхронизации.'],
 pt:['Faltar um dia não reinicia o dia da recompensa. As perguntas reiniciam às 00:00 UTC.','Quatro núcleos semanais desbloqueiam um título grátis.','Conecte-se para sincronizar.'],
 vi:['Nghỉ một ngày không đặt lại tiến độ thưởng. Số câu hỏi đặt lại lúc 00:00 UTC.','Bốn lõi hằng tuần mở khóa danh hiệu miễn phí.','Kết nối mạng để đồng bộ.'],
 th:['วันที่ไม่ได้เล่นไม่รีเซ็ตวันรับรางวัล จำนวนข้อรีเซ็ตเวลา 00:00 UTC','แกนรายสัปดาห์สี่ชิ้นปลดล็อกฉายาฟรี','เชื่อมต่ออินเทอร์เน็ตเพื่อซิงค์'],
 tr:['Kaçırılan günler ödül gününü sıfırlamaz. Sorular 00:00 UTC’de sıfırlanır.','Dört haftalık çekirdek ücretsiz unvan açar.','Eşitlemek için internete bağlan.'],
 id:['Hari yang terlewat tidak mereset hari hadiah. Soal direset pukul 00.00 UTC.','Empat inti mingguan membuka gelar gratis.','Hubungkan ke internet untuk sinkronisasi.'],
 pl:['Pominięte dni nie resetują dnia nagrody. Pytania resetują się o 00:00 UTC.','Cztery tygodniowe rdzenie odblokowują darmowy tytuł.','Połącz się, aby zsynchronizować.'],
 el:['Οι χαμένες ημέρες δεν μηδενίζουν την πρόοδο. Οι ερωτήσεις μηδενίζονται στις 00:00 UTC.','Τέσσερις εβδομαδιαίοι πυρήνες ξεκλειδώνουν έναν δωρεάν τίτλο.','Συνδεθείτε για συγχρονισμό.'],
 uk:['Пропущені дні не скидають день нагороди. Запитання скидаються о 00:00 UTC.','Чотири щотижневі ядра відкривають безкоштовний титул.','Підключіться для синхронізації.'],
 ar:['الأيام الفائتة لا تعيد تقدم المكافآت. تُصفّر الأسئلة عند 00:00 UTC.','أربع نوى أسبوعية تفتح لقبًا مجانيًا.','اتصل بالإنترنت للمزامنة.'],
 hi:['छूटे दिन पुरस्कार की प्रगति नहीं मिटाते। प्रश्न 00:00 UTC पर रीसेट होते हैं।','चार साप्ताहिक कोर से मुफ़्त उपाधि खुलती है।','सिंक करने के लिए इंटरनेट से जुड़ें।'],
 nl:['Gemiste dagen behouden je beloningsdag. Vragen worden om 00:00 UTC gereset.','Vier wekelijkse kernen ontgrendelen een gratis titel.','Ga online om te synchroniseren.'],
 sv:['Missade dagar återställer inte belöningsdagen. Frågorna återställs kl. 00:00 UTC.','Fyra veckokärnor låser upp en gratis titel.','Anslut till internet för att synkronisera.']
 };
 const tipKeys=['Missed days keep your reward day. Questions reset at 00:00 UTC.','Weekly cores unlock a free title.','Connect to sync your daily golem'];
 window.LanguageMinerDailyGolemText=(text)=>{const locale=window.LanguageMinerI18n?.getLocale?.(),index=keys.indexOf(text),tip=tipKeys.indexOf(text),pack=packs[locale];return index>=0&&pack?pack[index]:tip>=0&&tips[locale]?tips[locale][tip]:window.LanguageMinerI18n?.translate?.(text)||text;};
})();
(()=>{'use strict';
 const keys=['Preview animation','Ready your pickaxe','Pickaxe strike','The shell cracks open','Animation preview — no reward claimed'];
 const packs={
 ja:['アニメーションを見る','つるはしを構える','つるはしで一撃','殻が割れます','プレビューです。報酬は受け取りません'],
 es:['Ver animación','Prepara tu pico','Golpe de pico','La coraza se abre','Vista previa: no se recibió ninguna recompensa'],
 fr:['Voir l’animation','Prépare ta pioche','Coup de pioche','La coque se fissure','Aperçu : aucune récompense réclamée'],
 de:['Animation ansehen','Spitzhacke bereitmachen','Spitzhacken-Schlag','Die Schale bricht auf','Vorschau – keine Belohnung beansprucht'],
 it:['Guarda animazione','Prepara il piccone','Colpo di piccone','Il guscio si apre','Anteprima: nessuna ricompensa riscossa'],
 ko:['애니메이션 보기','곡괭이 준비','곡괭이로 치기','껍질이 열려요','미리보기 — 보상을 받지 않았어요'],
 zh:['预览动画','准备好镐子','挥镐敲击','外壳裂开了','动画预览 — 未领取奖励'],
 ru:['Посмотреть анимацию','Приготовь кирку','Удар киркой','Оболочка раскрывается','Предпросмотр — награда не получена'],
 pt:['Ver animação','Prepare sua picareta','Golpe de picareta','A casca se abre','Prévia: nenhuma recompensa recebida'],
 vi:['Xem hoạt ảnh','Chuẩn bị cuốc','Vung cuốc','Lớp vỏ nứt ra','Xem thử — chưa nhận phần thưởng'],
 th:['ดูตัวอย่างแอนิเมชัน','เตรียมอีเต้อ','ฟาดอีเต้อ','เปลือกแตกออก','ตัวอย่างแอนิเมชัน — ยังไม่ได้รับรางวัล'],
 tr:['Animasyonu izle','Kazmanı hazırla','Kazma darbesi','Kabuk açılıyor','Önizleme — ödül alınmadı'],
 id:['Lihat animasi','Siapkan beliung','Ayunan beliung','Cangkang terbuka','Pratinjau — hadiah tidak diambil'],
 pl:['Podgląd animacji','Przygotuj kilof','Uderzenie kilofem','Skorupa pęka','Podgląd — nie odebrano nagrody'],
 el:['Προβολή κίνησης','Ετοίμασε την αξίνα','Χτύπημα αξίνας','Το κέλυφος ανοίγει','Προεπισκόπηση — δεν ελήφθη ανταμοιβή'],
 uk:['Переглянути анімацію','Приготуй кирку','Удар киркою','Оболонка розкривається','Попередній перегляд — нагороду не отримано'],
 ar:['معاينة الحركة','جهّز معولك','ضربة المعول','تنفتح القشرة','معاينة الحركة — لم تُستلم مكافأة'],
 hi:['ऐनिमेशन देखें','कुदाल तैयार करें','कुदाल से प्रहार','खोल खुल रहा है','पूर्वावलोकन — कोई पुरस्कार नहीं लिया गया'],
 nl:['Animatie bekijken','Maak je houweel klaar','Slag met de houweel','De schaal breekt open','Voorbeeld — geen beloning opgehaald'],
 sv:['Visa animation','Gör hackan redo','Slag med hackan','Skalet öppnas','Förhandsvisning — ingen belöning hämtad']
 };
 const previous=window.LanguageMinerDailyGolemText;
 window.LanguageMinerDailyGolemText=text=>{const index=keys.indexOf(text),pack=packs[window.LanguageMinerI18n?.getLocale?.()];return index>=0&&pack?pack[index]:previous(text);};
})();
