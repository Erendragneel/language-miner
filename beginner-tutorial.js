// Required first-practice orientation. Preview controls never invoke game actions.
(()=>{
 'use strict';
 const VERSION=1;
 const STEPS=[
 {
  "id": "home",
  "section": "Getting started",
  "title": "Your first five minutes",
  "summary": "Use this simple route whenever you are unsure how to begin.",
  "path": "Home screen",
  "prompt": "Which control starts or resumes the next practice question?",
  "target": "next",
  "options": [
   {
    "id": "language",
    "label": "Change Language",
    "description": "Check the language pair at the top. The language on the left is the language you know; the language on the right is the course you are learning."
   },
   {
    "id": "next",
    "label": "Next",
    "description": "Start or resume practice. Choose one answer, read the correction, then use Next to continue."
   },
   {
    "id": "modes",
    "label": "Picture · Reading · Listening · Writing",
    "description": "Choose the practice mode supported by the current lesson. Listening uses a recording when available; Writing opens character practice."
   },
   {
    "id": "help",
    "label": "Audio · Hint · Use Shield",
    "description": "Hint removes uncertainty, Shield protects one normal mistake, and “I don’t know this kanji” appears only when the visible prompt contains kanji."
   },
   {
    "id": "wallet",
    "label": "Nuggets and hearts",
    "description": "Hints and Shields are supplies shown in Inventory. Hearts are practice health and recover while the game is closed; missing a study day does not remove hearts."
   },
   {
    "id": "daily",
    "label": "Daily Mini Golem",
    "description": "Read the daily practice requirement, complete it through normal questions, and claim the reward when it is ready."
   }
  ]
 },
 {
  "id": "navigation",
  "section": "Getting started",
  "title": "Find a menu and return",
  "summary": "Learn what the buttons around the mine do and how to return from other screens.",
  "path": "Home → Menu & options / phone Menu",
  "prompt": "Which category contains Settings and account tools?",
  "target": "player",
  "options": [
   {
    "id": "explore",
    "label": "Explore",
    "description": "Learning activities: Expedition Hub, Course, Writing Practice and Goals."
   },
   {
    "id": "gear",
    "label": "Gear",
    "description": "Your belongings and study tools: Shop, Inventory, Character, Notebook and Listen & follow along."
   },
   {
    "id": "player",
    "label": "Player & settings",
    "description": "Your reports, Settings, Account & Support, Parent/Teacher Center and Help & Community."
   },
   {
    "id": "back",
    "label": "← Menu / × Close",
    "description": "Use ← Menu to return to the category menu. Use × to close an overlay and return directly to the mine."
   }
  ]
 },
 {
  "id": "explore",
  "section": "Explore",
  "title": "Choose what to study",
  "summary": "Explore contains the learning route, detailed course, writing coach and objective list.",
  "path": "Menu → Explore",
  "prompt": "Which option opens the map of mines and lessons?",
  "target": "hub",
  "options": [
   {
    "id": "hub",
    "label": "Expedition Hub",
    "description": "Use the Expedition Hub to choose a mine, lesson, guardian, or related study tool."
   },
   {
    "id": "course",
    "label": "Course",
    "description": "Lessons organize the course into manageable groups and unlock later checkpoints."
   },
   {
    "id": "writing",
    "label": "Writing Practice",
    "description": "Trace and write the selected course’s alphabet, script, Kana, Kanji, Hangul, Hanzi, or other characters in short saved lessons."
   },
   {
    "id": "goals",
    "label": "Goals",
    "description": "These systems reward different kinds of consistent play."
   }
  ]
 },
 {
  "id": "hub-learning",
  "section": "Explore",
  "title": "The Hub’s learning tabs",
  "summary": "Use the Expedition Hub to choose a mine, lesson, guardian, or related study tool.",
  "path": "Menu → Explore → Expedition Hub",
  "prompt": "Which tab holds vocabulary collected from correct course answers?",
  "target": "book",
  "options": [
   {
    "id": "map",
    "label": "Expedition",
    "description": "Open a mine card, then choose an available family, section, lesson, checkpoint, or guardian."
   },
   {
    "id": "boss",
    "label": "Bosses",
    "description": "A guardian uses questions from the mine you are trying to complete."
   },
   {
    "id": "review",
    "label": "Review",
    "description": "Daily Refresher prepares up to ten familiar questions from the previous completed study session and has no timer, heart loss, or lesson penalty."
   },
   {
    "id": "book",
    "label": "Word Book",
    "description": "Correct course vocabulary enters the permanent Word Book automatically, where you can inspect mastery and use optional listening."
   }
  ]
 },
 {
  "id": "hub-extra",
  "section": "Explore",
  "title": "Companions, Settlement and Events",
  "summary": "The remaining Hub tabs show collection features, long-term upgrades and cultural activities.",
  "path": "Expedition Hub → Companions / Settlement / Events",
  "prompt": "Which tab explains cultural observances and their dates?",
  "target": "events",
  "options": [
   {
    "id": "companions",
    "label": "Companions",
    "description": "Inspect companion collection and equipped-companion information. The Shop handles adoption and outfits; displayed access and unlock rules apply."
   },
   {
    "id": "settlement",
    "label": "Settlement",
    "description": "Settlement is a Patreon Tier 3 benefit. Buildings require both the displayed Player Level and Nugget price."
   },
   {
    "id": "events",
    "label": "Events",
    "description": "Events contain seasonal activities and rewards with their own availability or claim rules."
   }
  ]
 },
 {
  "id": "course",
  "section": "Explore",
  "title": "Lessons, preview cards, and mastery",
  "summary": "Lessons organize the course into manageable groups and unlock later checkpoints.",
  "path": "Menu → Explore → Course",
  "prompt": "Which section shows assessment options and their rules?",
  "target": "tests",
  "options": [
   {
    "id": "overview",
    "label": "Course overview",
    "description": "Open a lesson to see its preview cards, then begin the practice questions. Skip Lesson Review enters the lesson without opening every preview card."
   },
   {
    "id": "words",
    "label": "Vocabulary / alphabet / characters",
    "description": "Study words and the writing system appropriate to this course. Japanese courses can show a separate Kanji section."
   },
   {
    "id": "grammar",
    "label": "Grammar",
    "description": "Study sentence patterns and explanations before practising them."
   },
   {
    "id": "reading",
    "label": "Reading",
    "description": "Practise understanding the course’s written text."
   },
   {
    "id": "listening",
    "label": "Listening",
    "description": "Practise understanding a recording. Missing exact recordings are explained and can offer written practice."
   },
   {
    "id": "review",
    "label": "Daily Review",
    "description": "Daily Refresher prepares up to ten familiar questions from the previous completed study session and has no timer, heart loss, or lesson penalty."
   },
   {
    "id": "tests",
    "label": "Tests",
    "description": "The question count, pass score, and timer are shown before or during each assessment. Answers advance automatically where the test says they will."
   }
  ],
  "note": "Course labels and available sections depend on the language and mine. These records are independent practice results, not official language certification."
 },
 {
  "id": "writing",
  "section": "Explore",
  "title": "Alphabet and character writing practice",
  "summary": "Trace and write the selected course’s alphabet, script, Kana, Kanji, Hangul, Hanzi, or other characters in short saved lessons.",
  "path": "Menu → Explore → Writing Practice",
  "prompt": "Which control returns to the previous accepted stroke?",
  "target": "undo",
  "options": [
   {
    "id": "choose",
    "label": "Writing set · lesson · character",
    "description": "Choose the script and character you want to practise. Each learning language keeps a separate writing record."
   },
   {
    "id": "model",
    "label": "Stroke-order model",
    "description": "Draw one stroke at a time. A stroke is accepted only when it begins in the required area, follows the shown direction, and stays on the character guide; an incorrect stroke is removed for another try."
   },
   {
    "id": "hide",
    "label": "Hide Guide",
    "description": "Repeat the character from memory after learning its model."
   },
   {
    "id": "clear",
    "label": "Clear",
    "description": "Remove the current writing page and begin it again."
   },
   {
    "id": "undo",
    "label": "Undo",
    "description": "Return to the previous accepted stroke."
   },
   {
    "id": "check",
    "label": "Check & Next",
    "description": "This becomes available after the required ordered strokes are complete. Check the result and continue to the next character."
   }
  ]
 },
 {
  "id": "goals",
  "section": "Explore",
  "title": "Goals have three schedules",
  "summary": "These systems reward different kinds of consistent play.",
  "path": "Menu → Explore → Goals",
  "prompt": "Which tab shows objectives that refresh each week?",
  "target": "weekly",
  "options": [
   {
    "id": "daily",
    "label": "Daily",
    "description": "Inspect objectives for the current study day and any rewards ready to claim."
   },
   {
    "id": "weekly",
    "label": "Weekly",
    "description": "Inspect longer objectives for the current week and their remaining progress."
   },
   {
    "id": "expedition",
    "label": "Expedition",
    "description": "Track objectives such as answers, accuracy, reviews and treasure alongside your active mine."
   }
  ],
  "note": "A completed objective is not always paid automatically. Look for Claim. Achievements separately record lifetime milestones."
 },
 {
  "id": "gear",
  "section": "Gear",
  "title": "Find belongings and study tools",
  "summary": "Buy, find, equip, and manage permanent collection items.",
  "path": "Menu → Gear",
  "prompt": "Which option shows items you already own?",
  "target": "inventory",
  "options": [
   {
    "id": "shop",
    "label": "Shop",
    "description": "Inspect available cosmetics, supplies, companions, upgrades and games. Read prices and access rules before buying."
   },
   {
    "id": "inventory",
    "label": "Inventory",
    "description": "View owned items, equipped appearances, supplies and collected gemstones."
   },
   {
    "id": "character",
    "label": "Character",
    "description": "Inspect and customize your miner’s appearance."
   },
   {
    "id": "notebook",
    "label": "Notebook",
    "description": "Organize review words, recorded mistakes and your own notes."
   },
   {
    "id": "stories",
    "label": "Listen & follow along",
    "description": "Read beginner short stories with optional translations and recorded narration."
   }
  ]
 },
 {
  "id": "shop",
  "section": "Gear",
  "title": "Understand every Shop tab",
  "summary": "Buy, find, equip, and manage permanent collection items.",
  "path": "Menu → Gear → Shop",
  "prompt": "Which tab is for practice items such as Hints and Shields?",
  "target": "supplies",
  "options": [
   {
    "id": "mine",
    "label": "Mine Cosmetics",
    "description": "Inspect appearance options for the mine and its background."
   },
   {
    "id": "pickaxes",
    "label": "Pickaxe Skins",
    "description": "Inspect pickaxe appearance options and their ownership or unlock requirements."
   },
   {
    "id": "character",
    "label": "Character",
    "description": "Character changes skin tone, hair, clothing, accessories, gloves, and shoes for the active player profile."
   },
   {
    "id": "companions",
    "label": "Companions",
    "description": "Inspect companions, adoption requirements and saved outfits."
   },
   {
    "id": "settlement",
    "label": "Settlement",
    "description": "Settlement is a Patreon Tier 3 benefit. Buildings require both the displayed Player Level and Nugget price."
   },
   {
    "id": "arcade",
    "label": "Arcade",
    "description": "Inspect available study games and their access requirements. Claimed games can also appear in Inventory."
   },
   {
    "id": "wallpapers",
    "label": "Wallpapers",
    "description": "Inspect additional scene and background options."
   },
   {
    "id": "supplies",
    "label": "Supplies",
    "description": "Inspect useful practice items such as Hints and Shields and read their prices before buying."
   }
  ],
  "note": "Previewable permanent items show their appearance and price before purchase. Locked items explain their course, level or membership requirement."
 },
 {
  "id": "inventory",
  "section": "Gear",
  "title": "Health, Inventory and gemstones",
  "summary": "Learn what each reward is for and where balances are stored.",
  "path": "Menu → Gear → Inventory",
  "prompt": "Which tab explains hearts and their recovery?",
  "target": "health",
  "options": [
   {
    "id": "health",
    "label": "Practice Health",
    "description": "Inspect practice hearts, recovery and available health-related tools."
   },
   {
    "id": "exchange",
    "label": "Nugget Exchange",
    "description": "Read the exchange amounts and costs before choosing a transaction."
   },
   {
    "id": "inventory",
    "label": "Inventory",
    "description": "Inventory or Bag groups everything owned, marks equipped items, shows supply counts, and contains claimed Study Arcade games."
   },
   {
    "id": "gems",
    "label": "Gem Collection",
    "description": "Inspect discovered gemstone types, collected amounts and their saved values."
   }
  ]
 },
 {
  "id": "character",
  "section": "Gear",
  "title": "Customize your miner",
  "summary": "Buy, find, equip, and manage permanent collection items.",
  "path": "Menu → Gear → Character",
  "prompt": "Which appearance group changes what your miner wears on their feet?",
  "target": "shoes",
  "options": [
   {
    "id": "skin",
    "label": "Skin tone",
    "description": "Choose the miner’s skin tone from the available options."
   },
   {
    "id": "hair",
    "label": "Hair",
    "description": "Inspect hairstyles and hair colors."
   },
   {
    "id": "clothes",
    "label": "Clothing",
    "description": "Inspect shirts, trousers, outerwear and their colors or ownership requirements."
   },
   {
    "id": "accessories",
    "label": "Accessories",
    "description": "Inspect accessories such as glasses, headwear and other wearable details."
   },
   {
    "id": "gloves",
    "label": "Gloves",
    "description": "Inspect available glove appearances and colors."
   },
   {
    "id": "shoes",
    "label": "Shoes",
    "description": "Inspect available footwear and its equipped state."
   },
   {
    "id": "holiday",
    "label": "Holiday Specials",
    "description": "Holiday Specials appear below gloves and shoes. They are seasonal avatar sets reserved for verified Patreon Tier 2 members and higher."
   }
  ],
  "note": "Achievement titles are separate earned rewards. Inspect Achievements through the Player Center tabs available from Account & Support or Goals."
 },
 {
  "id": "notebook",
  "section": "Gear",
  "title": "Notebook, difficult items, notes, and Word Book",
  "summary": "Notebook manages work that needs attention; Word Book stores collected vocabulary.",
  "path": "Menu → Gear → Notebook",
  "prompt": "Which section lists words due for Smart Review?",
  "target": "queue",
  "options": [
   {
    "id": "learn",
    "label": "Learn together",
    "description": "Open study references and pictures for the current course."
   },
   {
    "id": "queue",
    "label": "Review Queue",
    "description": "Notebook Review Queue shows every due word. Search the list or select one exact word to move it to the current review position."
   },
   {
    "id": "difficult",
    "label": "Difficult",
    "description": "Inspect recorded questions you answered incorrectly in quizzes and tests."
   },
   {
    "id": "notes",
    "label": "Notes",
    "description": "Notes lets you create, edit, reopen, resolve, or delete your own study reminders."
   },
   {
    "id": "search",
    "label": "Search",
    "description": "Find a word, meaning, question or note without scanning the whole list."
   }
  ],
  "note": "Notebook and Word Book are different. Notebook organizes review work and private notes; Word Book is your collected course vocabulary."
 },
 {
  "id": "stories",
  "section": "Gear",
  "title": "Listen and follow along",
  "summary": "Choose a short story for your learning language and follow the text sentence by sentence.",
  "path": "Menu → Gear → Listen & follow along",
  "prompt": "Which option reveals the meaning in your known language?",
  "target": "translation",
  "options": [
   {
    "id": "story",
    "label": "Short story",
    "description": "Choose which beginner story to read and hear."
   },
   {
    "id": "listen",
    "label": "Listen / Pause",
    "description": "Start narration or pause it."
   },
   {
    "id": "restart",
    "label": "Restart",
    "description": "Begin the recording again from its first sentence."
   },
   {
    "id": "speed",
    "label": "Speed",
    "description": "Choose a slower, normal or faster narration pace."
   },
   {
    "id": "translation",
    "label": "Show translation",
    "description": "Reveal the meaning of each sentence in your known language."
   },
   {
    "id": "follow",
    "label": "Follow narration",
    "description": "Keep the sentence being spoken in view as the story continues."
   },
   {
    "id": "sentence",
    "label": "Choose a sentence",
    "description": "Listen from the sentence you select. Closing the story stops its recording."
   }
  ]
 },
 {
  "id": "player",
  "section": "Player & settings",
  "title": "Find reports, account tools and help",
  "summary": "Player & settings is the category for progress reports, personal settings and assistance.",
  "path": "Menu → Player & settings",
  "prompt": "Which option contains reading assistance, voice and accessibility controls?",
  "target": "settings",
  "options": [
   {
    "id": "progress",
    "label": "My Progress & Grades",
    "description": "These screens explain what has been studied and when it happened."
   },
   {
    "id": "settings",
    "label": "Settings",
    "description": "Adjust reading support, audio, accessibility, screen orientation and local save tools."
   },
   {
    "id": "account",
    "label": "Account & Support",
    "description": "Manage backups, privacy information and optional supporter membership."
   },
   {
    "id": "family",
    "label": "Parent/Teacher Center",
    "description": "Approved adults can switch between linked learners and view progress without controlling the game."
   },
   {
    "id": "help",
    "label": "Help & Community",
    "description": "Reopen guidance, share the game or find feedback and community options."
   }
  ]
 },
 {
  "id": "progress",
  "section": "Player & settings",
  "title": "Stats, study streak, Calendar, and records",
  "summary": "These screens explain what has been studied and when it happened.",
  "path": "Menu → Player & settings → My Progress & Grades",
  "prompt": "Which section lists your recorded assessment attempts?",
  "target": "assessments",
  "options": [
   {
    "id": "overview",
    "label": "Grade Summary",
    "description": "Inspect the overview of completed learning. Suggested grades use completed lessons and tests; placement and unfinished work do not count."
   },
   {
    "id": "activity",
    "label": "Daily Activity & Streaks",
    "description": "A study day is recorded when practice questions are answered. Merely opening the game does not add a study day."
   },
   {
    "id": "course",
    "label": "Lessons & Completion",
    "description": "Inspect completion and mastery across your language course."
   },
   {
    "id": "assessments",
    "label": "Quizzes & Tests",
    "description": "Inspect recorded attempts, results and completion records."
   },
   {
    "id": "practice",
    "label": "Practice & Rewards",
    "description": "Inspect normal-practice totals, balances and earned rewards."
   },
   {
    "id": "calendar",
    "label": "Calendar",
    "description": "Practice Calendar shows daily activity, monthly totals, current streak, and total study time. Select a date to inspect that day."
   }
  ]
 },
 {
  "id": "settings",
  "section": "Player & settings",
  "title": "Make the game comfortable",
  "summary": "Install from the sign-in page or Settings, then adjust learning support, comfort, display, sound, rotation, and local safety tools.",
  "path": "Menu → Player & settings → Settings",
  "prompt": "Which group controls the speaker and pronunciation speed?",
  "target": "voice",
  "options": [
   {
    "id": "reading",
    "label": "Reading support",
    "description": "Choose guided readings, normal support or a reduced-support challenge."
   },
   {
    "id": "voice",
    "label": "Question support and native speakers",
    "description": "Control answer sounds, course voice, automatic speech, speaker, voice style and voice speed."
   },
   {
    "id": "review",
    "label": "Smart Review",
    "description": "Control whether weak questions are offered for review."
   },
   {
    "id": "accessibility",
    "label": "Text size and accessibility",
    "description": "Adjust text size, reduced motion, contrast, color indicators and answer explanations."
   },
   {
    "id": "music",
    "label": "Music and sound levels",
    "description": "Choose music and adjust sound effect and music volumes."
   },
   {
    "id": "portrait",
    "label": "Portrait lock",
    "description": "Control the upright-phone display preference and inspect any device limitation shown by the game."
   },
   {
    "id": "recovery",
    "label": "Save recovery",
    "description": "Safety snapshots create local recovery points. Restoring a snapshot replaces the current saved state, so inspect its date first."
   },
   {
    "id": "reset",
    "label": "Reset Save",
    "description": "This is a separate destructive action that asks for confirmation. It is not required for normal play."
   },
   {
    "id": "guide",
    "label": "Game Guide",
    "description": "Search the handbook for a topic, control or feature and read its location and explanation."
   }
  ]
 },
 {
  "id": "account-install",
  "section": "Player & settings",
  "title": "Account, installation and backups",
  "summary": "Progress belongs to the signed-in game account. Keep a portable backup when changing devices or clearing browser data.",
  "path": "Menu → Player & settings → Account & Support · header Install App",
  "prompt": "Which control adds the game to this device or shows installation instructions?",
  "target": "install",
  "options": [
   {
    "id": "export",
    "label": "Export gameplay backup",
    "description": "Account export creates a portable backup of the active player. Import restores that backup in another supported browser or device."
   },
   {
    "id": "import",
    "label": "Import gameplay backup",
    "description": "Restore a chosen backup. Check the file before replacing your current progress."
   },
   {
    "id": "privacy",
    "label": "Privacy & Safety",
    "description": "Review stored data and policies, export an account-data copy, inspect private-request options or choose account deletion."
   },
   {
    "id": "support",
    "label": "Patreon support & membership",
    "description": "Inspect optional supporter access. Verification uses your game account; Patreon passwords and payment details stay with Patreon."
   },
   {
    "id": "achievements",
    "label": "Player Center tabs / Achievements",
    "description": "The tabs available from Account & Support or Goals also open Character, Goals, Achievements and other player areas. Achievements explains lifetime milestones and earned titles."
   },
   {
    "id": "install",
    "label": "Install App",
    "description": "This button is directly on the game and menu headers, login screen and Settings. It opens the browser’s install prompt or device-specific instructions."
   },
   {
    "id": "login",
    "label": "Log in / Log out",
    "description": "Opening the game waits for your Log in click even when your account is remembered. Log out signs out; your browser can retain a saved password for a later deliberate login."
   }
  ]
 },
 {
  "id": "family",
  "section": "Player & settings",
  "title": "Parent/Teacher Center and learner access",
  "summary": "Approved adults can switch between linked learners and view progress without controlling the game.",
  "path": "Menu → Player & settings → Parent/Teacher Center",
  "prompt": "Which option lets you inspect or revoke existing learner links?",
  "target": "manage",
  "options": [
   {
    "id": "learner",
    "label": "Choose / switch learner",
    "description": "Select an approved linked learner to inspect their grades, activity, course completion and assessments."
   },
   {
    "id": "link",
    "label": "Link student",
    "description": "Use Link student to send a request to another player profile. Nothing is shared while the request is waiting."
   },
   {
    "id": "decision",
    "label": "Approve / Decline",
    "description": "The learner signs in to their own profile, opens Parent/Teacher Center, and chooses Approve or Decline. Only the learner can approve access."
   },
   {
    "id": "manage",
    "label": "Manage access",
    "description": "Use Switch student to change reports. Manage access lets an adult cancel or remove a link, and lets a learner revoke previously approved access."
   }
  ],
  "note": "Linked adults cannot answer questions, spend Nuggets, reset the learner’s progress or read private Notebook notes."
 },
 {
  "id": "help",
  "section": "Player & settings",
  "title": "Help is always available",
  "summary": "You have now practised the routes through every player menu and its main controls. Guidance remains available after you finish.",
  "path": "Menu → Player & settings → Help & Community",
  "prompt": "Which option lets you practise these menu routes again?",
  "target": "replay",
  "options": [
   {
    "id": "guide",
    "label": "Game Guide",
    "description": "Search the handbook for a topic, control or feature and read its location and explanation."
   },
   {
    "id": "replay",
    "label": "Replay beginner tutorial",
    "description": "Practise this menu walkthrough again whenever you want a refresher."
   },
   {
    "id": "share",
    "label": "Share Game",
    "description": "Share Game creates a QR code, copyable link, native share action, and downloadable QR image for the current hosted game address."
   },
   {
    "id": "feedback",
    "label": "Feedback & Discord",
    "description": "Find community and issue-reporting options. Nothing is sent until you deliberately choose to send it."
   }
  ],
  "note": "After finishing, choose an unlocked lesson in Expedition Hub. You can always return to Help & Community."
 }
];
 const ids=new Set(STEPS.map(step=>step.id));
 const escape=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
 const snapshot=()=>typeof state!=='undefined'&&state&&typeof state==='object'?state:null;
 const profile=()=>window.japaneseMinerActiveProfile?.()||null;
 const courses=()=>{try{return window.LanguageMinerCourseCloud?.exportCurrent?.()||{};}catch{return {};}};
 function hasCounts(value,depth=0){
  if(!value||typeof value!=='object'||depth>6)return false;
  return Object.entries(value).some(([key,item])=>/^(answered|correct|wrong|seen|attempts|questionsAnswered|totalQuestions)$/.test(key)&&Number(item)>0||item&&typeof item==='object'&&hasCounts(item,depth+1));
 }
 function hasPractice(game={},courseSettings={}){
  game=game&&typeof game==='object'?game:{};courseSettings=courseSettings&&typeof courseSettings==='object'?courseSettings:{};
  return Number(game.sessionAnswered)>0||hasCounts(game.questionStats)||hasCounts(game.kanaStats)||hasCounts(game.stats)||hasCounts(courseSettings.progress)||
   (Array.isArray(game.learningReport?.assessmentAttempts)&&game.learningReport.assessmentAttempts.some(item=>item.group!=='placement'&&Number(item.answered)>0));
 }
 function normalizeRecord(record,total=STEPS.length){
  if(!record||typeof record!=='object'||record.version!==VERSION)return null;
  const visited=[...new Set((Array.isArray(record.visited)?record.visited:[]).filter(id=>ids.has(id)))];
  const completed=record.completed===true,exempt=!completed&&record.exempt===true;
  const firstMissing=STEPS.findIndex(step=>!visited.includes(step.id));
  const limit=completed||exempt||firstMissing<0?total-1:Math.min(total-1,firstMissing);
  const step=Math.max(0,Math.min(limit,Math.floor(Number(record.step)||0)));
  return {version:VERSION,step,completed,exempt,visited,languageSelected:record.languageSelected===true,...(completed&&Number(record.completedAt)>0?{completedAt:Number(record.completedAt)}:{})};
 }
 function createRecord(game={},courseSettings={}){
  game=game&&typeof game==='object'?game:{};
  return normalizeRecord(game.v6?.beginnerTutorial)||{version:VERSION,step:0,completed:false,exempt:hasPractice(game,courseSettings),visited:[],languageSelected:false};
 }
 function requiredFor(game={},courseSettings={}){const record=createRecord(game,courseSettings);return !record.completed&&!record.exempt;}
 const model=Object.freeze({normalizeRecord,hasPractice,createRecord,requiredFor});
 let active=false,required=false,currentProfile='',index=0,visited=new Set(),timer=null,replayRequested=false,finishing=false,returnFocus=null,saveError=false;
 const savedInert=new Map();
 function locale(){return window.LanguageMinerI18n?.getLocale?.()||document.documentElement?.dataset?.lmKnownLanguage||'en';}
 function text(key){const packs=window.LanguageMinerBeginnerTutorialLocales||{};return packs[locale()]?.[key]||packs.en?.[key]||key;}
 function translate(value){return window.LanguageMinerBeginnerTutorialPhrases?.[locale()]?.[value]||window.LanguageMinerI18n?.translate?.(String(value||''))||String(value||'');}
 function format(key,values){return Object.entries(values).reduce((result,[name,value])=>result.replaceAll('{'+name+'}',value),text(key));}
 function languageReady(record,settings=courses()){
  if(record?.languageSelected)return true;
  const placement=settings?.placements?.[settings.learning];
  return !!settings?.known&&!!settings?.learning&&settings.known!==settings.learning&&(placement==='tested'||placement==='beginner'||placement?.status==='tested'||placement?.status==='beginner');
 }
 function status(){
  const record=normalizeRecord(snapshot()?.v6?.beginnerTutorial),player=profile();
  const eligible=!!player&&!!record&&!record.completed&&!record.exempt,languageSelected=!!player&&languageReady(record);
  return {active,required:active&&required,step:index,stepId:STEPS[index]?.id||'',target:STEPS[index]?.target||'',total:STEPS.length,completed:record?.completed===true,eligible,languageSelected,awaitingLanguage:eligible&&!languageSelected,profileId:player?.id||null,finishing};
 }
 function announce(){window.dispatchEvent(new CustomEvent('lm-beginner-tutorial-changed',{detail:status()}));}
 function saveRecord(record){
  const game=snapshot();if(!game||!profile()||active&&profile().id!==currentProfile)return false;
  game.v6=game.v6&&typeof game.v6==='object'?game.v6:{};
  game.v6.beginnerTutorial=record;
  try{return typeof save==='function'&&save()!==false;}catch{return false;}
 }
 function ensureRecord(){
  const game=snapshot();if(!game||!profile()||window.LANGUAGE_MINER_PREVIEW===true)return null;
  const record=createRecord(game,courses());
  if(!normalizeRecord(game.v6?.beginnerTutorial))saveRecord(record);
  return record;
 }
 function visible(node){
  if(!node||node.hidden)return false;
  const style=window.getComputedStyle(node);return style.display!=='none'&&style.visibility!=='hidden'&&node.getClientRects().length>0;
 }
 function priorityOverlay(){return ['authOverlay','legalConsentOverlay','portraitGuard','lmMultilingualOverlay','placementOverlay'].map(id=>document.getElementById(id)).find(visible)||null;}
 function blocked(){
  return !!priorityOverlay()||
   [...document.querySelectorAll('dialog[open]')].some(node=>node.id!=='beginnerTutorialOverlay');
 }
 function setBackgroundInert(){
  const dialog=document.getElementById('beginnerTutorialOverlay');
  for(const node of document.body.children){
   if(node===dialog||/^(SCRIPT|STYLE|LINK)$/.test(node.tagName))continue;
   if(!savedInert.has(node))savedInert.set(node,{inert:node.hasAttribute('inert'),ariaHidden:node.getAttribute('aria-hidden')});
   node.inert=true;
  }
 }
 function restoreBackground(){
  // Auth owns the app's lock if logout happened while this dialog was open.
  const signedIn=!!profile();
  for(const [node,previous] of savedInert){
   if(!node.isConnected)continue;
   node.inert=previous.inert||!signedIn&&node.classList.contains('app');
  }
  savedInert.clear();
 }
 function createShell(){
  if(document.getElementById('beginnerTutorialOverlay'))return;
  const dialog=document.createElement('dialog');dialog.id='beginnerTutorialOverlay';dialog.className='beginner-tutorial';dialog.setAttribute('role','dialog');dialog.setAttribute('aria-modal','true');dialog.setAttribute('aria-labelledby','beginnerTutorialTitle');dialog.setAttribute('aria-describedby','beginnerTutorialIntro');
  dialog.innerHTML='<div class="beginner-tutorial-panel"><header class="beginner-tutorial-head"><span class="beginner-tutorial-compass" aria-hidden="true">🧭</span><div><span id="beginnerTutorialKind"></span><p id="beginnerTutorialCount"></p></div><button id="beginnerTutorialClose" type="button">×</button></header><div id="beginnerTutorialProgress" class="beginner-tutorial-progress" role="progressbar" aria-valuemin="0"><i></i></div><main id="beginnerTutorialContent" tabindex="-1"></main><footer class="beginner-tutorial-footer"><p id="beginnerTutorialStatus" role="status" aria-live="polite"></p><nav><button id="beginnerTutorialBack" type="button"></button><button id="beginnerTutorialNext" class="primary" type="button"></button></nav></footer></div>';
  document.body.appendChild(dialog);
  document.getElementById('beginnerTutorialBack').addEventListener('click',()=>move(-1));
  document.getElementById('beginnerTutorialNext').addEventListener('click',next);
  document.getElementById('beginnerTutorialClose').addEventListener('click',()=>{if(!required)dismiss(true);});
  dialog.addEventListener('cancel',event=>{event.preventDefault();if(!required)dismiss(true);});
  dialog.addEventListener('close',()=>{if(active&&!dialog.open){active=false;restoreBackground();if(required)request();}});
  dialog.addEventListener('click',event=>{
   const option=event.target.closest('[data-tutorial-option]');if(option)selectOption(option.dataset.tutorialOption);
  });
 }
 function updateStatus(){
  const node=document.getElementById('beginnerTutorialStatus');
  node.textContent=finishing?text('saving'):saveError?text('saveError'):visited.has(STEPS[index].id)?text('ready'):text('choose');
  node.classList.toggle('save-error',saveError);
  const nextButton=document.getElementById('beginnerTutorialNext');nextButton.disabled=finishing||required&&!visited.has(STEPS[index].id);
  nextButton.textContent=finishing?text('saving'):index===STEPS.length-1?text('finish'):text('next');
 }
 function render(){
  const step=STEPS[index],content=document.getElementById('beginnerTutorialContent');if(!step||!content)return;
  document.getElementById('beginnerTutorialOverlay').lang=locale();
  document.getElementById('beginnerTutorialKind').textContent=text(required?'requiredTitle':'replayTitle');
  document.getElementById('beginnerTutorialCount').textContent=format('step',{current:index+1,total:STEPS.length});
  const close=document.getElementById('beginnerTutorialClose');close.hidden=required;close.setAttribute('aria-label',text('close'));
  const progress=document.getElementById('beginnerTutorialProgress');progress.setAttribute('aria-label',text('progressLabel'));progress.setAttribute('aria-valuemax',STEPS.length);progress.setAttribute('aria-valuenow',index+1);progress.querySelector('i').style.width=((index+1)/STEPS.length*100)+'%';
  content.innerHTML='<div class="beginner-tutorial-topic"><span>'+escape(translate(step.section))+'</span><h2 id="beginnerTutorialTitle">'+escape(translate(step.title))+'</h2><p id="beginnerTutorialIntro">'+escape(translate(step.summary))+'</p><p class="beginner-tutorial-route">'+escape(translate(step.path))+'</p></div><section class="beginner-tutorial-preview" aria-label="'+escape(text('previewLabel'))+'"><header><strong>'+escape(text('previewLabel'))+'</strong><span>'+escape(text('tryLabel'))+': '+escape(translate(step.prompt))+'</span></header><div class="beginner-tutorial-options">'+step.options.map(option=>'<button type="button" data-tutorial-option="'+escape(option.id)+'" class="'+(option.id===step.target?'tutorial-target':'')+'" aria-pressed="false"><strong>'+escape(translate(option.label))+'</strong><span>'+escape(translate(option.description))+'</span></button>').join('')+'</div><p class="beginner-tutorial-preview-note">'+escape(text('previewNote'))+'</p></section>'+(step.note?'<aside class="beginner-tutorial-note">'+escape(translate(step.note))+'</aside>':'')+'<p class="beginner-tutorial-requirement">'+escape(text(required?'requiredNote':'replayNote'))+'</p>';
  const back=document.getElementById('beginnerTutorialBack');back.textContent=text('back');back.disabled=index===0||finishing;
  updateStatus();content.scrollTop=0;content.focus({preventScroll:true});announce();
 }
 function selectOption(id){
  if(!active||finishing||profile()?.id!==currentProfile)return;
  const step=STEPS[index],option=step.options.find(option=>option.id===id);if(!option)return;
  document.querySelectorAll('#beginnerTutorialContent [data-tutorial-option]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.tutorialOption===id)));
  if(id===step.target){visited.add(step.id);if(required)saveError=!saveProgress();}
  updateStatus();announce();
 }
 function saveProgress(){
  const record=createRecord(snapshot(),courses());visited=new Set([...record.visited,...visited]);
  return saveRecord({...record,step:index,visited:[...visited]});
 }
 function move(delta){
  if(!active||finishing||profile()?.id!==currentProfile)return;
  index=Math.max(0,Math.min(STEPS.length-1,index+delta));
  if(required)saveError=!saveProgress();
  render();
 }
 async function next(){
  if(!active||finishing||profile()?.id!==currentProfile||required&&!visited.has(STEPS[index].id))return;
  if(index<STEPS.length-1){move(1);return;}
  if(!required){dismiss(true);return;}
  const firstMissing=STEPS.findIndex(step=>!visited.has(step.id));
  if(firstMissing>=0){index=firstMissing;render();return;}
  finishing=true;saveError=false;updateStatus();
  const owner=currentProfile,record={version:VERSION,step:index,visited:[...visited],completed:true,exempt:false,languageSelected:true,completedAt:Date.now()};
  let saved=saveRecord(record);
  if(!saved){try{saved=(await window.languageMinerPushCloudSave?.())?.accepted===true;}catch{}}
  if(profile()?.id!==owner){finishing=false;dismiss(false);return;}
  finishing=false;
  if(saved){dismiss(true);window.dispatchEvent(new CustomEvent('lm-beginner-tutorial-complete',{detail:{profileId:owner}}));}
  else{saveRecord({...record,completed:false});saveError=true;updateStatus();}
 }
 function dismiss(focus){
  const dialog=document.getElementById('beginnerTutorialOverlay'),wasActive=active;active=false;finishing=false;
  dialog?.classList.remove('open');if(dialog?.open)dialog.close();
  document.body.classList.remove('beginner-tutorial-active');restoreBackground();
  if(focus&&wasActive){const target=returnFocus?.isConnected&&returnFocus.matches('button,a,input,select,textarea,[tabindex]')&&visible(returnFocus)&&!returnFocus.closest('[inert]')?returnFocus:[...document.querySelectorAll('[data-adventure="menu"],button')].find(node=>visible(node)&&!node.disabled&&!node.closest('[inert]'));try{target?.focus({preventScroll:true});}catch{}}
  announce();
 }
 function show(record,isRequired){
  createShell();active=true;required=isRequired;currentProfile=profile().id;index=isRequired?record.step:0;visited=new Set(isRequired?record.visited:[]);saveError=false;returnFocus=document.activeElement;
  setBackgroundInert();const dialog=document.getElementById('beginnerTutorialOverlay');dialog.classList.add('open');document.body.classList.add('beginner-tutorial-active');
  dialog.showModal();render();window.syncJapaneseMinerPageScroll?.();
 }
 function reconcile(){
  timer=null;const player=profile();if(!player||window.LANGUAGE_MINER_PREVIEW===true){replayRequested=false;if(active)dismiss(false);return;}
  if(active&&currentProfile!==player.id)dismiss(false);
  const record=ensureRecord();if(!record)return;
  if(blocked()){if(active)dismiss(false);return;}
  if(finishing)return;
  if(!record.completed&&!record.exempt&&!languageReady(record)){if(active)dismiss(false);window.LanguageMinerCourseSetup?.open?.();return;}
  if(replayRequested){replayRequested=false;if(active)dismiss(false);show(record,!record.completed&&!record.exempt);return;}
  if(record.completed||record.exempt){if(active&&required)dismiss(true);return;}
  if(!active)show(record,true);
  else if(required&&(index!==record.step||JSON.stringify([...visited])!==JSON.stringify(record.visited))){index=record.step;visited=new Set(record.visited);render();}
  if(active)setBackgroundInert();
 }
 function request(){
  const replayButton=document.getElementById('v6HelpTutorial');
  if(replayButton){
   const article=replayButton.closest('article'),heading=article?.querySelector('h3'),description=article?.querySelector('p');
   if(replayButton.textContent!==text('replayLabel'))replayButton.textContent=text('replayLabel');
   if(heading&&heading.textContent!==text('requiredTitle'))heading.textContent=text('requiredTitle');
   if(description&&description.textContent!==text('replayNote'))description.textContent=text('replayNote');
  }
  const record=ensureRecord();if(active&&(profile()?.id!==currentProfile||blocked()))dismiss(false);
  if(timer===null)timer=setTimeout(reconcile,500);
  return !!record&&!record.completed&&!record.exempt||active&&required;
 }
 function afterLanguageSelection(){
  const record=ensureRecord();if(!record)return false;
  saveRecord({...record,languageSelected:true});request();return !record.completed&&!record.exempt;
 }
 function replay(){if(!profile())return false;replayRequested=true;request();return true;}
 function trapTab(container,event){
  const controls=[...container.querySelectorAll('button,input,select,textarea,a[href],[tabindex]:not([tabindex="-1"])')].filter(node=>!node.disabled&&visible(node));
  if(controls.length){const position=controls.indexOf(document.activeElement),nextPosition=position<0?(event.shiftKey?controls.length-1:0):(position+(event.shiftKey?-1:1)+controls.length)%controls.length;event.preventDefault();event.stopImmediatePropagation();controls[nextPosition].focus();}
 }
 function guard(event){
  if(active&&blocked()){dismiss(false);request();}
  if(!active){
   const record=normalizeRecord(snapshot()?.v6?.beginnerTutorial);
   if(!profile()||!record||record.completed||record.exempt)return;
   const priority=priorityOverlay();
   if(priority&&event.type==='keydown'&&event.key==='Tab'){trapTab(priority,event);return;}
   if(priority&&event.type==='keydown'&&event.key==='Escape'){event.preventDefault();event.stopImmediatePropagation();return;}
   if(priority?.contains(event.target))return;
   event.preventDefault();event.stopImmediatePropagation();
   if(priority&&event.type==='focusin')[...priority.querySelectorAll('button,input,select,textarea,[tabindex]')].find(node=>!node.disabled&&visible(node))?.focus({preventScroll:true});
   request();return;
  }
  const dialog=document.getElementById('beginnerTutorialOverlay');
  if(event.type==='keydown'&&event.key==='Escape'){event.preventDefault();event.stopImmediatePropagation();if(!required)dismiss(true);return;}
  if(event.type==='keydown'&&event.key==='Tab'){
   trapTab(dialog,event);
   return;
  }
  if(event.target===dialog||dialog?.contains(event.target))return;
  event.preventDefault();event.stopImmediatePropagation();
  if(event.type==='focusin')document.getElementById('beginnerTutorialContent')?.focus({preventScroll:true});
 }
 function init(){
  createShell();['jm-profile-loaded','lm-cloud-save-applied','lm-course-settings-saved','lm-interface-language-changed'].forEach(name=>window.addEventListener(name,()=>{if(name==='lm-interface-language-changed'&&active)render();request();}));
  window.addEventListener('jm-profile-logged-out',()=>{replayRequested=false;clearTimeout(timer);timer=null;if(active)dismiss(false);});
  ['click','pointerdown','keydown','focusin'].forEach(name=>window.addEventListener(name,guard,true));
  new MutationObserver(rows=>{if(rows.some(row=>!row.target?.closest?.('#beginnerTutorialOverlay')))request();}).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class','hidden','aria-hidden','open']});
  request();
 }
 window.LanguageMinerBeginnerTutorial=Object.freeze({request,maybeStart:request,afterLanguageSelection,replay,start:options=>options?.replay?replay():request(),status,model,steps:()=>STEPS.map(step=>({...step,options:step.options.map(option=>({...option}))}))});
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
