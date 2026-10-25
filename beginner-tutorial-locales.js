// Interface labels for the beginner tutorial, in every supported known language.
(()=>{
'use strict';
const locales={
 en:{
  requiredTitle:'Beginner tutorial',replayTitle:'Replay beginner tutorial',
  requiredNote:'Complete this tutorial before your first practice. Your place is saved automatically.',
  replayNote:'Review the controls at your own pace. You can close this replay at any time.',
  previewLabel:'Practice preview',previewNote:'These preview buttons explain the menus. They do not spend items or change your game.',
  step:'Step {current} of {total}',next:'Next',back:'Back',finish:'Finish tutorial',close:'Close replay',tryLabel:'Try it',selected:'Selected',
  ready:'You found it. Continue when you are ready.',choose:'Select the highlighted option to continue.',saving:'Saving…',
  saveError:'Your tutorial progress could not be saved. Try again.',finished:'Tutorial complete. You are ready to explore.',
  progressLabel:'Tutorial progress',replayLabel:'Replay beginner tutorial',helpPath:'Menu → Player & settings → Help & Community'
 },
 es:{
  requiredTitle:'Tutorial para principiantes',replayTitle:'Repetir el tutorial para principiantes',
  requiredNote:'Completa este tutorial antes de tu primera práctica. Tu progreso se guarda automáticamente.',
  replayNote:'Repasa los controles a tu ritmo. Puedes cerrar este repaso cuando quieras.',
  previewLabel:'Práctica de ejemplo',previewNote:'Estos botones de ejemplo explican los menús. No consumen objetos ni cambian tu partida.',
  step:'Paso {current} de {total}',next:'Siguiente',back:'Atrás',finish:'Terminar el tutorial',close:'Cerrar el repaso',tryLabel:'Probar',selected:'Seleccionado',
  ready:'Lo has encontrado. Continúa cuando quieras.',choose:'Selecciona la opción resaltada para continuar.',saving:'Guardando…',
  saveError:'No se ha podido guardar tu progreso del tutorial. Inténtalo de nuevo.',finished:'Tutorial completado. Ya puedes explorar.',
  progressLabel:'Progreso del tutorial',replayLabel:'Repetir el tutorial para principiantes',helpPath:'Menú → Jugador y ajustes → Ayuda y comunidad'
 },
 ru:{
  requiredTitle:'Обучение для новичков',replayTitle:'Повторить обучение для новичков',
  requiredNote:'Пройдите это обучение перед первой тренировкой. Текущий шаг сохраняется автоматически.',
  replayNote:'Изучайте элементы управления в своём темпе. Этот повтор можно закрыть в любой момент.',
  previewLabel:'Пробный режим',previewNote:'Эти пробные кнопки объясняют работу меню. Они не расходуют предметы и не изменяют вашу игру.',
  step:'Шаг {current} из {total}',next:'Далее',back:'Назад',finish:'Завершить обучение',close:'Закрыть повтор',tryLabel:'Попробовать',selected:'Выбрано',
  ready:'Вы нашли нужный пункт. Продолжайте, когда будете готовы.',choose:'Выберите выделенный пункт, чтобы продолжить.',saving:'Сохранение…',
  saveError:'Не удалось сохранить ход обучения. Попробуйте ещё раз.',finished:'Обучение завершено. Можно начинать исследование.',
  progressLabel:'Ход обучения',replayLabel:'Повторить обучение для новичков',helpPath:'Меню → Игрок и настройки → Помощь и сообщество'
 },
 ja:{
  requiredTitle:'初心者向けチュートリアル',replayTitle:'初心者向けチュートリアルをもう一度見る',
  requiredNote:'初めての練習の前に、このチュートリアルを完了してください。進んだところまで自動で保存されます。',
  replayNote:'自分のペースで操作を確認できます。見直しはいつでも閉じられます。',
  previewLabel:'操作体験',previewNote:'この体験用ボタンでメニューの使い方を確認できます。アイテムは消費されず、ゲームの状態も変わりません。',
  step:'全{total}ステップ中{current}ステップ目',next:'次へ',back:'戻る',finish:'チュートリアルを完了',close:'見直しを閉じる',tryLabel:'試してみる',selected:'選択済み',
  ready:'見つかりました。準備ができたら次へ進みましょう。',choose:'強調表示された項目を選んで次へ進んでください。',saving:'保存中…',
  saveError:'チュートリアルの進行状況を保存できませんでした。もう一度お試しください。',finished:'チュートリアルが完了しました。冒険に出かけましょう。',
  progressLabel:'チュートリアルの進行状況',replayLabel:'初心者向けチュートリアルをもう一度見る',helpPath:'メニュー → プレイヤーと設定 → ヘルプとコミュニティ'
 },
 ko:{
  requiredTitle:'초보자 튜토리얼',replayTitle:'초보자 튜토리얼 다시 보기',
  requiredNote:'첫 연습 전에 이 튜토리얼을 완료하세요. 진행 상황은 자동으로 저장됩니다.',
  replayNote:'자신의 속도에 맞춰 조작법을 복습하세요. 다시 보기는 언제든 닫을 수 있습니다.',
  previewLabel:'조작 체험',previewNote:'이 체험용 버튼으로 메뉴 사용법을 알아보세요. 아이템을 소모하거나 게임 상태를 변경하지 않습니다.',
  step:'전체 {total}단계 중 {current}단계',next:'다음',back:'이전',finish:'튜토리얼 완료',close:'다시 보기 닫기',tryLabel:'해 보기',selected:'선택됨',
  ready:'찾았습니다. 준비가 되면 계속하세요.',choose:'강조 표시된 항목을 선택하여 계속하세요.',saving:'저장 중…',
  saveError:'튜토리얼 진행 상황을 저장하지 못했습니다. 다시 시도하세요.',finished:'튜토리얼을 완료했습니다. 이제 탐험할 준비가 되었습니다.',
  progressLabel:'튜토리얼 진행 상황',replayLabel:'초보자 튜토리얼 다시 보기',helpPath:'메뉴 → 플레이어 및 설정 → 도움말 및 커뮤니티'
 },
 zh:{
  requiredTitle:'新手教程',replayTitle:'重看新手教程',
  requiredNote:'首次练习前，请完成本教程。系统会自动保存当前步骤。',
  replayNote:'按自己的节奏复习操作方式。您可以随时关闭重看界面。',
  previewLabel:'操作体验',previewNote:'这些体验按钮用于介绍菜单，不会消耗物品，也不会更改游戏状态。',
  step:'第 {current} 步，共 {total} 步',next:'下一步',back:'上一步',finish:'完成教程',close:'关闭重看',tryLabel:'试一试',selected:'已选择',
  ready:'您找到了。准备好后就继续吧。',choose:'请选择高亮显示的选项以继续。',saving:'正在保存…',
  saveError:'无法保存教程进度，请重试。',finished:'教程已完成。现在可以开始探索了。',
  progressLabel:'教程进度',replayLabel:'重看新手教程',helpPath:'菜单 → 玩家与设置 → 帮助与社区'
 },
 it:{
  requiredTitle:'Tutorial per principianti',replayTitle:'Ripeti il tutorial per principianti',
  requiredNote:'Completa questo tutorial prima della tua prima esercitazione. Il punto raggiunto viene salvato automaticamente.',
  replayNote:'Ripassa i comandi con calma. Puoi chiudere il ripasso in qualsiasi momento.',
  previewLabel:'Prova dei comandi',previewNote:'Questi pulsanti di prova spiegano i menu. Non consumano oggetti e non modificano la partita.',
  step:'Passaggio {current} di {total}',next:'Avanti',back:'Indietro',finish:'Completa il tutorial',close:'Chiudi il ripasso',tryLabel:'Prova',selected:'Selezionato',
  ready:'Hai trovato il comando. Prosegui quando vuoi.',choose:'Seleziona l’opzione evidenziata per continuare.',saving:'Salvataggio…',
  saveError:'Impossibile salvare i progressi del tutorial. Riprova.',finished:'Tutorial completato. Puoi iniziare a esplorare.',
  progressLabel:'Progressi del tutorial',replayLabel:'Ripeti il tutorial per principianti',helpPath:'Menu → Giocatore e impostazioni → Aiuto e community'
 },
 fr:{
  requiredTitle:'Tutoriel pour débutants',replayTitle:'Revoir le tutoriel pour débutants',
  requiredNote:'Terminez ce tutoriel avant votre premier entraînement. Votre progression est enregistrée automatiquement.',
  replayNote:'Revoyez les commandes à votre rythme. Vous pouvez fermer cette révision à tout moment.',
  previewLabel:'Essai des commandes',previewNote:'Ces boutons d’essai expliquent les menus. Ils ne consomment aucun objet et ne modifient pas votre partie.',
  step:'Étape {current} sur {total}',next:'Suivant',back:'Retour',finish:'Terminer le tutoriel',close:'Fermer la révision',tryLabel:'Essayer',selected:'Sélectionné',
  ready:'Vous avez trouvé. Continuez lorsque vous le souhaitez.',choose:'Sélectionnez l’option en surbrillance pour continuer.',saving:'Enregistrement…',
  saveError:'Impossible d’enregistrer votre progression dans le tutoriel. Réessayez.',finished:'Tutoriel terminé. Vous pouvez commencer à explorer.',
  progressLabel:'Progression du tutoriel',replayLabel:'Revoir le tutoriel pour débutants',helpPath:'Menu → Joueur et paramètres → Aide et communauté'
 },
 de:{
  requiredTitle:'Einführung für Anfänger',replayTitle:'Einführung für Anfänger wiederholen',
  requiredNote:'Schließe diese Einführung vor deiner ersten Übung ab. Dein Fortschritt wird automatisch gespeichert.',
  replayNote:'Sieh dir die Steuerung in deinem eigenen Tempo an. Du kannst die Wiederholung jederzeit schließen.',
  previewLabel:'Steuerung ausprobieren',previewNote:'Diese Probeschaltflächen erklären die Menüs. Sie verbrauchen keine Gegenstände und verändern deinen Spielstand nicht.',
  step:'Schritt {current} von {total}',next:'Weiter',back:'Zurück',finish:'Einführung abschließen',close:'Wiederholung schließen',tryLabel:'Ausprobieren',selected:'Ausgewählt',
  ready:'Du hast es gefunden. Fahre fort, wenn du bereit bist.',choose:'Wähle die hervorgehobene Option aus, um fortzufahren.',saving:'Wird gespeichert…',
  saveError:'Dein Fortschritt in der Einführung konnte nicht gespeichert werden. Versuche es erneut.',finished:'Einführung abgeschlossen. Du kannst jetzt auf Entdeckung gehen.',
  progressLabel:'Fortschritt der Einführung',replayLabel:'Einführung für Anfänger wiederholen',helpPath:'Menü → Spieler und Einstellungen → Hilfe und Community'
 },
 pt:{
  requiredTitle:'Tutorial para iniciantes',replayTitle:'Rever o tutorial para iniciantes',
  requiredNote:'Conclua este tutorial antes da primeira prática. Seu progresso é salvo automaticamente.',
  replayNote:'Reveja os controles no seu ritmo. Você pode fechar esta revisão a qualquer momento.',
  previewLabel:'Teste dos controles',previewNote:'Estes botões de teste explicam os menus. Eles não consomem itens nem alteram seu jogo.',
  step:'Etapa {current} de {total}',next:'Próximo',back:'Voltar',finish:'Concluir tutorial',close:'Fechar revisão',tryLabel:'Experimentar',selected:'Selecionado',
  ready:'Você encontrou. Continue quando estiver pronto.',choose:'Selecione a opção destacada para continuar.',saving:'Salvando…',
  saveError:'Não foi possível salvar seu progresso no tutorial. Tente novamente.',finished:'Tutorial concluído. Você já pode explorar.',
  progressLabel:'Progresso do tutorial',replayLabel:'Rever o tutorial para iniciantes',helpPath:'Menu → Jogador e configurações → Ajuda e comunidade'
 },
 vi:{
  requiredTitle:'Hướng dẫn cho người mới',replayTitle:'Xem lại hướng dẫn cho người mới',
  requiredNote:'Hãy hoàn thành hướng dẫn này trước buổi luyện tập đầu tiên. Tiến độ của bạn được tự động lưu.',
  replayNote:'Xem lại cách điều khiển theo tốc độ của bạn. Bạn có thể đóng phần xem lại bất cứ lúc nào.',
  previewLabel:'Thử thao tác',previewNote:'Các nút dùng thử này giúp bạn tìm hiểu các menu. Chúng không tiêu hao vật phẩm hay thay đổi trò chơi của bạn.',
  step:'Bước {current}/{total}',next:'Tiếp theo',back:'Quay lại',finish:'Hoàn thành hướng dẫn',close:'Đóng phần xem lại',tryLabel:'Thử ngay',selected:'Đã chọn',
  ready:'Bạn đã tìm thấy. Hãy tiếp tục khi sẵn sàng.',choose:'Chọn mục được tô sáng để tiếp tục.',saving:'Đang lưu…',
  saveError:'Không thể lưu tiến độ hướng dẫn của bạn. Hãy thử lại.',finished:'Đã hoàn thành hướng dẫn. Bạn đã sẵn sàng khám phá.',
  progressLabel:'Tiến độ hướng dẫn',replayLabel:'Xem lại hướng dẫn cho người mới',helpPath:'Menu → Người chơi và cài đặt → Trợ giúp và cộng đồng'
 },
 th:{
  requiredTitle:'บทสอนสำหรับผู้เริ่มต้น',replayTitle:'ทบทวนบทสอนสำหรับผู้เริ่มต้น',
  requiredNote:'ทำบทสอนนี้ให้จบก่อนเริ่มฝึกครั้งแรก ระบบจะบันทึกขั้นตอนที่คุณทำถึงโดยอัตโนมัติ',
  replayNote:'ทบทวนการควบคุมได้ตามจังหวะของคุณ คุณสามารถปิดการทบทวนได้ทุกเมื่อ',
  previewLabel:'ทดลองการควบคุม',previewNote:'ปุ่มทดลองเหล่านี้ใช้อธิบายเมนู โดยไม่ใช้ไอเทมหรือเปลี่ยนแปลงเกมของคุณ',
  step:'ขั้นตอนที่ {current} จาก {total}',next:'ถัดไป',back:'ย้อนกลับ',finish:'จบบทสอน',close:'ปิดการทบทวน',tryLabel:'ลองใช้',selected:'เลือกแล้ว',
  ready:'คุณหาเจอแล้ว เมื่อพร้อมให้ไปต่อได้เลย',choose:'เลือกตัวเลือกที่ไฮไลต์ไว้เพื่อดำเนินการต่อ',saving:'กำลังบันทึก…',
  saveError:'บันทึกความคืบหน้าของบทสอนไม่สำเร็จ โปรดลองอีกครั้ง',finished:'จบบทสอนแล้ว คุณพร้อมออกสำรวจแล้ว',
  progressLabel:'ความคืบหน้าของบทสอน',replayLabel:'ทบทวนบทสอนสำหรับผู้เริ่มต้น',helpPath:'เมนู → ผู้เล่นและการตั้งค่า → ความช่วยเหลือและชุมชน'
 },
 tr:{
  requiredTitle:'Yeni başlayanlar için öğretici',replayTitle:'Başlangıç öğreticisini yeniden aç',
  requiredNote:'İlk alıştırmadan önce bu öğreticiyi tamamlayın. Kaldığınız yer otomatik olarak kaydedilir.',
  replayNote:'Kontrolleri kendi hızınızda gözden geçirin. Bu tekrarı istediğiniz zaman kapatabilirsiniz.',
  previewLabel:'Kontrolleri deneme',previewNote:'Bu deneme düğmeleri menüleri açıklar. Eşya harcamaz veya oyununuzu değiştirmez.',
  step:'Adım {current}/{total}',next:'İleri',back:'Geri',finish:'Öğreticiyi tamamla',close:'Tekrarı kapat',tryLabel:'Dene',selected:'Seçildi',
  ready:'Buldunuz. Hazır olduğunuzda devam edin.',choose:'Devam etmek için vurgulanan seçeneği seçin.',saving:'Kaydediliyor…',
  saveError:'Öğreticideki ilerlemeniz kaydedilemedi. Yeniden deneyin.',finished:'Öğretici tamamlandı. Artık keşfetmeye hazırsınız.',
  progressLabel:'Öğretici ilerlemesi',replayLabel:'Başlangıç öğreticisini yeniden aç',helpPath:'Menü → Oyuncu ve ayarlar → Yardım ve topluluk'
 },
 id:{
  requiredTitle:'Tutorial pemula',replayTitle:'Ulangi tutorial pemula',
  requiredNote:'Selesaikan tutorial ini sebelum latihan pertama. Kemajuan Anda disimpan secara otomatis.',
  replayNote:'Pelajari kembali kontrol sesuai kecepatan Anda. Anda dapat menutup ulasan ini kapan saja.',
  previewLabel:'Coba kontrol',previewNote:'Tombol percobaan ini menjelaskan menu. Tombol ini tidak menghabiskan item atau mengubah permainan Anda.',
  step:'Langkah {current} dari {total}',next:'Berikutnya',back:'Kembali',finish:'Selesaikan tutorial',close:'Tutup ulasan',tryLabel:'Coba',selected:'Dipilih',
  ready:'Anda menemukannya. Lanjutkan saat sudah siap.',choose:'Pilih opsi yang disorot untuk melanjutkan.',saving:'Menyimpan…',
  saveError:'Kemajuan tutorial Anda tidak dapat disimpan. Coba lagi.',finished:'Tutorial selesai. Anda siap menjelajah.',
  progressLabel:'Kemajuan tutorial',replayLabel:'Ulangi tutorial pemula',helpPath:'Menu → Pemain dan pengaturan → Bantuan dan komunitas'
 },
 pl:{
  requiredTitle:'Samouczek dla początkujących',replayTitle:'Powtórz samouczek dla początkujących',
  requiredNote:'Ukończ ten samouczek przed pierwszym ćwiczeniem. Postęp jest zapisywany automatycznie.',
  replayNote:'Przypomnij sobie sterowanie we własnym tempie. Powtórkę możesz zamknąć w dowolnej chwili.',
  previewLabel:'Próba sterowania',previewNote:'Te przyciski próbne wyjaśniają działanie menu. Nie zużywają przedmiotów ani nie zmieniają stanu gry.',
  step:'Krok {current} z {total}',next:'Dalej',back:'Wstecz',finish:'Ukończ samouczek',close:'Zamknij powtórkę',tryLabel:'Wypróbuj',selected:'Wybrano',
  ready:'Właściwa opcja została znaleziona. Kontynuuj, gdy będziesz gotowy.',choose:'Wybierz podświetloną opcję, aby kontynuować.',saving:'Zapisywanie…',
  saveError:'Nie udało się zapisać postępu samouczka. Spróbuj ponownie.',finished:'Samouczek ukończony. Możesz rozpocząć odkrywanie gry.',
  progressLabel:'Postęp samouczka',replayLabel:'Powtórz samouczek dla początkujących',helpPath:'Menu → Gracz i ustawienia → Pomoc i społeczność'
 },
 el:{
  requiredTitle:'Εκμάθηση για αρχάριους',replayTitle:'Επανάληψη εκμάθησης για αρχάριους',
  requiredNote:'Ολοκληρώστε αυτή την εκμάθηση πριν από την πρώτη εξάσκηση. Η πρόοδός σας αποθηκεύεται αυτόματα.',
  replayNote:'Ελέγξτε ξανά τα χειριστήρια με τον δικό σας ρυθμό. Μπορείτε να κλείσετε την επανάληψη οποιαδήποτε στιγμή.',
  previewLabel:'Δοκιμή χειριστηρίων',previewNote:'Αυτά τα δοκιμαστικά κουμπιά εξηγούν τα μενού. Δεν καταναλώνουν αντικείμενα και δεν αλλάζουν το παιχνίδι σας.',
  step:'Βήμα {current} από {total}',next:'Επόμενο',back:'Πίσω',finish:'Ολοκλήρωση εκμάθησης',close:'Κλείσιμο επανάληψης',tryLabel:'Δοκιμή',selected:'Επιλέχθηκε',
  ready:'Το βρήκατε. Συνεχίστε όταν είστε έτοιμοι.',choose:'Επιλέξτε την επισημασμένη επιλογή για να συνεχίσετε.',saving:'Αποθήκευση…',
  saveError:'Δεν ήταν δυνατή η αποθήκευση της προόδου σας στην εκμάθηση. Δοκιμάστε ξανά.',finished:'Η εκμάθηση ολοκληρώθηκε. Είστε έτοιμοι να εξερευνήσετε.',
  progressLabel:'Πρόοδος εκμάθησης',replayLabel:'Επανάληψη εκμάθησης για αρχάριους',helpPath:'Μενού → Παίκτης και ρυθμίσεις → Βοήθεια και κοινότητα'
 },
 uk:{
  requiredTitle:'Навчання для початківців',replayTitle:'Повторити навчання для початківців',
  requiredNote:'Пройдіть це навчання перед першою практикою. Поточний крок зберігається автоматично.',
  replayNote:'Повторюйте елементи керування у власному темпі. Цей повтор можна закрити будь-коли.',
  previewLabel:'Пробний режим',previewNote:'Ці пробні кнопки пояснюють роботу меню. Вони не витрачають предмети й не змінюють вашу гру.',
  step:'Крок {current} із {total}',next:'Далі',back:'Назад',finish:'Завершити навчання',close:'Закрити повтор',tryLabel:'Спробувати',selected:'Вибрано',
  ready:'Ви знайшли потрібний пункт. Продовжуйте, коли будете готові.',choose:'Виберіть виділений пункт, щоб продовжити.',saving:'Збереження…',
  saveError:'Не вдалося зберегти перебіг навчання. Спробуйте ще раз.',finished:'Навчання завершено. Можна починати дослідження.',
  progressLabel:'Перебіг навчання',replayLabel:'Повторити навчання для початківців',helpPath:'Меню → Гравець і налаштування → Допомога та спільнота'
 }
};
Object.values(locales).forEach(Object.freeze);
window.LanguageMinerBeginnerTutorialLocales=Object.freeze(locales);
})();
