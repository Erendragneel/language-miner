// A saved, action-driven tour of the real game controls.
(()=>{
 'use strict';
 const VERSION=2;
 const COPY={
 "home.language": {
  "title": "Change Language",
  "body": "Check the language pair at the top. The language on the left is the language you know; the language on the right is the course you are learning."
 },
 "home.next": {
  "title": "Next",
  "body": "Start or resume practice. Choose one answer, read the correction, then use Next to continue."
 },
 "home.modes": {
  "title": "Picture · Reading · Listening · Writing",
  "body": "Choose the practice mode supported by the current lesson. Listening uses a recording when available; Writing opens character practice."
 },
 "home.help": {
  "title": "Audio · Hint · Use Shield",
  "body": "Hint removes uncertainty, Shield protects one normal mistake, and “I don’t know this kanji” appears only when the visible prompt contains kanji."
 },
 "home.wallet": {
  "title": "Nuggets and hearts",
  "body": "Hints and Shields are supplies shown in Inventory. Hearts are practice health and recover while the game is closed; missing a study day does not remove hearts."
 },
 "home.daily": {
  "title": "Daily Mini Golem",
  "body": "Read the daily practice requirement, complete it through normal questions, and claim the reward when it is ready."
 },
 "navigation.explore": {
  "title": "Explore",
  "body": "Learning activities: Expedition Hub, Course, Writing Practice and Goals."
 },
 "navigation.gear": {
  "title": "Gear",
  "body": "Your belongings and study tools: Shop, Inventory, Character, Notebook and Listen & follow along."
 },
 "navigation.player": {
  "title": "Player & settings",
  "body": "Your reports, Settings, Account & Support, Parent/Teacher Center and Help & Community."
 },
 "navigation.back": {
  "title": "← Menu / × Close",
  "body": "Use ← Menu to return to the category menu. Use × to close an overlay and return directly to the mine."
 },
 "explore.hub": {
  "title": "Expedition Hub",
  "body": "Use the Expedition Hub to choose a mine, lesson, guardian, or related study tool."
 },
 "explore.course": {
  "title": "Course",
  "body": "Lessons organize the course into manageable groups and unlock later checkpoints."
 },
 "explore.writing": {
  "title": "Writing Practice",
  "body": "Trace and write the selected course’s alphabet, script, Kana, Kanji, Hangul, Hanzi, or other characters in short saved lessons."
 },
 "explore.goals": {
  "title": "Goals",
  "body": "These systems reward different kinds of consistent play."
 },
 "hub-learning.map": {
  "title": "Expedition",
  "body": "Open a mine card, then choose an available family, section, lesson, checkpoint, or guardian."
 },
 "hub-learning.boss": {
  "title": "Bosses",
  "body": "A guardian uses questions from the mine you are trying to complete."
 },
 "hub-learning.review": {
  "title": "Review",
  "body": "Daily Refresher prepares up to ten familiar questions from the previous completed study session and has no timer, heart loss, or lesson penalty."
 },
 "hub-learning.book": {
  "title": "Word Book",
  "body": "Correct course vocabulary enters the permanent Word Book automatically, where you can inspect mastery and use optional listening."
 },
 "hub-extra.companions": {
  "title": "Companions",
  "body": "Inspect companion collection and equipped-companion information. The Shop handles adoption and outfits; displayed access and unlock rules apply."
 },
 "hub-extra.settlement": {
  "title": "Settlement",
  "body": "Settlement is a Patreon Tier 3 benefit. Buildings require both the displayed Player Level and Nugget price."
 },
 "hub-extra.events": {
  "title": "Events",
  "body": "Events contain seasonal activities and rewards with their own availability or claim rules."
 },
 "course.overview": {
  "title": "Course overview",
  "body": "Open a lesson to see its preview cards, then begin the practice questions. Skip Lesson Review enters the lesson without opening every preview card."
 },
 "course.words": {
  "title": "Vocabulary / alphabet / characters",
  "body": "Study words and the writing system appropriate to this course. Japanese courses can show a separate Kanji section."
 },
 "course.grammar": {
  "title": "Grammar",
  "body": "Study sentence patterns and explanations before practising them."
 },
 "course.reading": {
  "title": "Reading",
  "body": "Practise understanding the course’s written text."
 },
 "course.listening": {
  "title": "Listening",
  "body": "Practise understanding a recording. Missing exact recordings are explained and can offer written practice."
 },
 "course.review": {
  "title": "Daily Review",
  "body": "Daily Refresher prepares up to ten familiar questions from the previous completed study session and has no timer, heart loss, or lesson penalty."
 },
 "course.tests": {
  "title": "Tests",
  "body": "The question count, pass score, and timer are shown before or during each assessment. Answers advance automatically where the test says they will."
 },
 "writing.choose": {
  "title": "Writing set · lesson · character",
  "body": "Choose the script and character you want to practise. Each learning language keeps a separate writing record."
 },
 "writing.model": {
  "title": "Stroke-order model",
  "body": "Draw one stroke at a time. A stroke is accepted only when it begins in the required area, follows the shown direction, and stays on the character guide; an incorrect stroke is removed for another try."
 },
 "writing.hide": {
  "title": "Hide Guide",
  "body": "Repeat the character from memory after learning its model."
 },
 "writing.clear": {
  "title": "Clear",
  "body": "Remove the current writing page and begin it again."
 },
 "writing.undo": {
  "title": "Undo",
  "body": "Return to the previous accepted stroke."
 },
 "writing.check": {
  "title": "Check & Next",
  "body": "This becomes available after the required ordered strokes are complete. Check the result and continue to the next character."
 },
 "goals.daily": {
  "title": "Daily",
  "body": "Inspect objectives for the current study day and any rewards ready to claim."
 },
 "goals.weekly": {
  "title": "Weekly",
  "body": "Inspect longer objectives for the current week and their remaining progress."
 },
 "goals.expedition": {
  "title": "Expedition",
  "body": "Track objectives such as answers, accuracy, reviews and treasure alongside your active mine."
 },
 "gear.shop": {
  "title": "Shop",
  "body": "Inspect available cosmetics, supplies, companions, upgrades and games. Read prices and access rules before buying."
 },
 "gear.inventory": {
  "title": "Inventory",
  "body": "View owned items, equipped appearances, supplies and collected gemstones."
 },
 "gear.character": {
  "title": "Character",
  "body": "Inspect and customize your miner’s appearance."
 },
 "gear.notebook": {
  "title": "Notebook",
  "body": "Organize review words, recorded mistakes and your own notes."
 },
 "gear.stories": {
  "title": "Listen & follow along",
  "body": "Read beginner short stories with optional translations and recorded narration."
 },
 "shop.mine": {
  "title": "Mine Cosmetics",
  "body": "Inspect appearance options for the mine and its background."
 },
 "shop.pickaxes": {
  "title": "Pickaxe Skins",
  "body": "Inspect pickaxe appearance options and their ownership or unlock requirements."
 },
 "shop.character": {
  "title": "Character",
  "body": "Character changes skin tone, hair, clothing, accessories, gloves, and shoes for the active player profile."
 },
 "shop.companions": {
  "title": "Companions",
  "body": "Inspect companions, adoption requirements and saved outfits."
 },
 "shop.settlement": {
  "title": "Settlement",
  "body": "Settlement is a Patreon Tier 3 benefit. Buildings require both the displayed Player Level and Nugget price."
 },
 "shop.arcade": {
  "title": "Arcade",
  "body": "Inspect available study games and their access requirements. Claimed games can also appear in Inventory."
 },
 "shop.wallpapers": {
  "title": "Wallpapers",
  "body": "Inspect additional scene and background options."
 },
 "shop.supplies": {
  "title": "Supplies",
  "body": "Inspect useful practice items such as Hints and Shields and read their prices before buying."
 },
 "inventory.health": {
  "title": "Practice Health",
  "body": "Inspect practice hearts, recovery and available health-related tools."
 },
 "inventory.exchange": {
  "title": "Nugget Exchange",
  "body": "Read the exchange amounts and costs before choosing a transaction."
 },
 "inventory.inventory": {
  "title": "Inventory",
  "body": "Inventory or Bag groups everything owned, marks equipped items, shows supply counts, and contains claimed Study Arcade games."
 },
 "inventory.gems": {
  "title": "Gem Collection",
  "body": "Inspect discovered gemstone types, collected amounts and their saved values."
 },
 "character.skin": {
  "title": "Skin tone",
  "body": "Choose the miner’s skin tone from the available options."
 },
 "character.hair": {
  "title": "Hair",
  "body": "Inspect hairstyles and hair colors."
 },
 "character.clothes": {
  "title": "Clothing",
  "body": "Inspect shirts, trousers, outerwear and their colors or ownership requirements."
 },
 "character.accessories": {
  "title": "Accessories",
  "body": "Inspect accessories such as glasses, headwear and other wearable details."
 },
 "character.gloves": {
  "title": "Gloves",
  "body": "Inspect available glove appearances and colors."
 },
 "character.shoes": {
  "title": "Shoes",
  "body": "Inspect available footwear and its equipped state."
 },
 "character.holiday": {
  "title": "Holiday Specials",
  "body": "Holiday Specials appear below gloves and shoes. They are seasonal avatar sets reserved for verified Patreon Tier 2 members and higher."
 },
 "notebook.learn": {
  "title": "Learn together",
  "body": "Open study references and pictures for the current course."
 },
 "notebook.queue": {
  "title": "Review Queue",
  "body": "Notebook Review Queue shows every due word. Search the list or select one exact word to move it to the current review position."
 },
 "notebook.difficult": {
  "title": "Difficult",
  "body": "Inspect recorded questions you answered incorrectly in quizzes and tests."
 },
 "notebook.notes": {
  "title": "Notes",
  "body": "Notes lets you create, edit, reopen, resolve, or delete your own study reminders."
 },
 "notebook.search": {
  "title": "Search",
  "body": "Find a word, meaning, question or note without scanning the whole list."
 },
 "stories.story": {
  "title": "Short story",
  "body": "Choose which beginner story to read and hear."
 },
 "stories.listen": {
  "title": "Listen / Pause",
  "body": "Start narration or pause it."
 },
 "stories.restart": {
  "title": "Restart",
  "body": "Begin the recording again from its first sentence."
 },
 "stories.speed": {
  "title": "Speed",
  "body": "Choose a slower, normal or faster narration pace."
 },
 "stories.translation": {
  "title": "Show translation",
  "body": "Reveal the meaning of each sentence in your known language."
 },
 "stories.follow": {
  "title": "Follow narration",
  "body": "Keep the sentence being spoken in view as the story continues."
 },
 "stories.sentence": {
  "title": "Choose a sentence",
  "body": "Listen from the sentence you select. Closing the story stops its recording."
 },
 "player.progress": {
  "title": "My Progress & Grades",
  "body": "These screens explain what has been studied and when it happened."
 },
 "player.settings": {
  "title": "Settings",
  "body": "Adjust reading support, audio, accessibility, screen orientation and local save tools."
 },
 "player.account": {
  "title": "Account & Support",
  "body": "Manage backups, privacy information and optional supporter membership."
 },
 "player.family": {
  "title": "Parent/Teacher Center",
  "body": "Approved adults can switch between linked learners and view progress without controlling the game."
 },
 "player.help": {
  "title": "Help & Community",
  "body": "Reopen guidance, share the game or find feedback and community options."
 },
 "progress.overview": {
  "title": "Grade Summary",
  "body": "Inspect the overview of completed learning. Suggested grades use completed lessons and tests; placement and unfinished work do not count."
 },
 "progress.activity": {
  "title": "Daily Activity & Streaks",
  "body": "A study day is recorded when practice questions are answered. Merely opening the game does not add a study day."
 },
 "progress.course": {
  "title": "Lessons & Completion",
  "body": "Inspect completion and mastery across your language course."
 },
 "progress.assessments": {
  "title": "Quizzes & Tests",
  "body": "Inspect recorded attempts, results and completion records."
 },
 "progress.practice": {
  "title": "Practice & Rewards",
  "body": "Inspect normal-practice totals, balances and earned rewards."
 },
 "progress.calendar": {
  "title": "Calendar",
  "body": "Practice Calendar shows daily activity, monthly totals, current streak, and total study time. Select a date to inspect that day."
 },
 "settings.reading": {
  "title": "Reading support",
  "body": "Choose guided readings, normal support or a reduced-support challenge."
 },
 "settings.voice": {
  "title": "Question support and native speakers",
  "body": "Control answer sounds, course voice, automatic speech, speaker, voice style and voice speed."
 },
 "settings.review": {
  "title": "Smart Review",
  "body": "Control whether weak questions are offered for review."
 },
 "settings.accessibility": {
  "title": "Text size and accessibility",
  "body": "Adjust text size, reduced motion, contrast, color indicators and answer explanations."
 },
 "settings.music": {
  "title": "Music and sound levels",
  "body": "Choose music and adjust sound effect and music volumes."
 },
 "settings.portrait": {
  "title": "Portrait lock",
  "body": "Control the upright-phone display preference and inspect any device limitation shown by the game."
 },
 "settings.recovery": {
  "title": "Save recovery",
  "body": "Safety snapshots create local recovery points. Restoring a snapshot replaces the current saved state, so inspect its date first."
 },
 "settings.reset": {
  "title": "Reset Save",
  "body": "This is a separate destructive action that asks for confirmation. It is not required for normal play."
 },
 "settings.guide": {
  "title": "Game Guide",
  "body": "Search the handbook for a topic, control or feature and read its location and explanation."
 },
 "account-install.export": {
  "title": "Export gameplay backup",
  "body": "Account export creates a portable backup of the active player. Import restores that backup in another supported browser or device."
 },
 "account-install.import": {
  "title": "Import gameplay backup",
  "body": "Restore a chosen backup. Check the file before replacing your current progress."
 },
 "account-install.privacy": {
  "title": "Privacy & Safety",
  "body": "Review stored data and policies, export an account-data copy, inspect private-request options or choose account deletion."
 },
 "account-install.support": {
  "title": "Patreon support & membership",
  "body": "Inspect optional supporter access. Verification uses your game account; Patreon passwords and payment details stay with Patreon."
 },
 "account-install.achievements": {
  "title": "Player Center tabs / Achievements",
  "body": "The tabs available from Account & Support or Goals also open Character, Goals, Achievements and other player areas. Achievements explains lifetime milestones and earned titles."
 },
 "account-install.install": {
  "title": "Install App",
  "body": "This button is directly on the game and menu headers, login screen and Settings. It opens the browser’s install prompt or device-specific instructions."
 },
 "account-install.login": {
  "title": "Log in / Log out",
  "body": "Opening the game waits for your Log in click even when your account is remembered. Log out signs out; your browser can retain a saved password for a later deliberate login."
 },
 "family.learner": {
  "title": "Choose / switch learner",
  "body": "Select an approved linked learner to inspect their grades, activity, course completion and assessments."
 },
 "family.link": {
  "title": "Link student",
  "body": "Use Link student to send a request to another player profile. Nothing is shared while the request is waiting."
 },
 "family.decision": {
  "title": "Approve / Decline",
  "body": "The learner signs in to their own profile, opens Parent/Teacher Center, and chooses Approve or Decline. Only the learner can approve access."
 },
 "family.manage": {
  "title": "Manage access",
  "body": "Use Switch student to change reports. Manage access lets an adult cancel or remove a link, and lets a learner revoke previously approved access."
 },
 "help.guide": {
  "title": "Game Guide",
  "body": "Search the handbook for a topic, control or feature and read its location and explanation."
 },
 "help.replay": {
  "title": "Replay beginner tutorial",
  "body": "Practise this menu walkthrough again whenever you want a refresher."
 },
 "help.share": {
  "title": "Share Game",
  "body": "Share Game creates a QR code, copyable link, native share action, and downloadable QR image for the current hosted game address."
 },
 "help.feedback": {
  "title": "Feedback & Discord",
  "body": "Find community and issue-reporting options. Nothing is sent until you deliberately choose to send it."
 }
};
 const STEPS=[];
 const opened=id=>'#'+id+'.open';
 function add(id,scene,target,key,expected,extra={}){
  STEPS.push({id,scene,target,action:'click',...COPY[key],expected,...extra});
 }
 function info(id,scene,target,key,extra={}){add(id,scene,target,key,'',{action:'info',...extra});}
 function back(id,scene,target,expected){add(id,scene,target,'navigation.back',expected);}
 const menu=category=>'.miner-interface-menu[data-category="'+category+'"]';
 const tab=(attribute,value,selected='active')=>'['+attribute+'="'+value+'"].'+selected;
 add('open-menu','home','[data-adventure="menu"],#gameMenuBtn','navigation.explore',opened('gameMenuOverlay'),{
  title:'Your first five minutes',body:'Welcome to your mine! I’ll show you the real controls. Follow the glowing hand to open the Menu.'});
 add('explore-category','menu:adventure','[data-menu-category="adventure"]','navigation.explore',menu('adventure'));
 add('open-hub','menu:adventure','[data-v5-open]','explore.hub',opened('v5Overlay'));
 for(const name of ['boss','review','book','companions','settlement','events','map']){
  const key=['companions','settlement','events'].includes(name)?'hub-extra.'+name:'hub-learning.'+name;
  add('hub-'+name,'hub:'+(['boss','review','book','companions','settlement','events','map'].indexOf(name)?['boss','review','book','companions','settlement','events','map'][['boss','review','book','companions','settlement','events','map'].indexOf(name)-1]:'map'),'[data-v5tab="'+name+'"]',key,tab('data-v5tab',name));
 }
 info('practice-modes','hub:map','.practice-mode-picker,[data-v5tab="map"]','home.modes');
 back('hub-menu','hub:map','#v5BackToMenu',opened('gameMenuOverlay'));
 info('course-location','menu:adventure','[data-menu-action="course"]','explore.course');
 add('open-writing','menu:adventure','[data-writing-practice-open]','explore.writing',opened('languageMinerWritingPractice'));
 info('writing-controls','writing','#writingPracticeCanvas,.writing-pad','writing.model');
 back('writing-back','writing','[data-writing-close="menu"]','!'+opened('languageMinerWritingPractice'));
 add('writing-menu','home','[data-adventure="menu"],#gameMenuBtn','navigation.back',opened('gameMenuOverlay'));
 add('open-goals','menu:adventure','[data-feature-open="quests"],[data-menu-action="quests"]','explore.goals',opened('featureCenterOverlay'));
 for(const name of ['daily','weekly','expedition'])add('goals-'+name,'feature:quests','[data-goals-view="'+name+'"]','goals.'+name,tab('data-goals-view',name,'primary'));
 back('goals-menu','feature:quests','#backFeatureCenterToMenu',opened('gameMenuOverlay'));
 add('gear-category','menu:adventure','[data-menu-category="gear"]','navigation.gear',menu('gear'));
 add('open-shop','menu:gear','[data-menu-action="shop"]','gear.shop',opened('shopOverlay'));
 for(const [name,key] of [['mine-cosmetics','mine'],['character','character'],['companions','companions'],['settlement','settlement'],['arcade','arcade'],['supplies','supplies']]){
  add('shop-'+name,'shop:mine-cosmetics','[data-shop-tab="'+name+'"]','shop.'+key,tab('data-shop-tab',name,'primary'));
 }
 back('shop-menu','shop:supplies','#backShopToMenu',opened('gameMenuOverlay'));
 add('open-inventory','menu:gear','[data-menu-action="inventory"]','gear.inventory',opened('utilityOverlay'));
 for(const name of ['health','exchange','inventory','gems'])add('inventory-'+name,'utility:inventory','[data-utility-tab="'+name+'"]','inventory.'+name,tab('data-utility-tab',name));
 back('inventory-menu','utility:gems','#utilityBackToMenu',opened('gameMenuOverlay'));
 add('open-notebook','menu:gear','[data-menu-action="notebook"]','gear.notebook',opened('featureCenterOverlay'));
 for(const [name,key] of [['learn','learn'],['queue','queue'],['review','difficult'],['stickies','notes']])add('notebook-'+name,'feature:notebook','[data-notebook-view="'+name+'"]','notebook.'+key,tab('data-notebook-view',name,'primary'));
 back('notebook-menu','feature:notebook','#backFeatureCenterToMenu',opened('gameMenuOverlay'));
 add('open-character','menu:gear','[data-feature-open="profile"]','gear.character',opened('featureCenterOverlay'));
 back('character-menu','feature:profile','#backFeatureCenterToMenu',opened('gameMenuOverlay'));
 info('stories-location','menu:gear','[data-adventure="stories"]','gear.stories');
 add('player-category','menu:gear','[data-menu-category="player"]','navigation.player',menu('player'));
 add('open-progress','menu:player','[data-my-progress]','player.progress',opened('parentTeacherCenter'));
 for(const name of ['activity','course','assessments','practice','overview'])add('progress-'+name,'progress','[data-ptc-tab="'+name+'"]','progress.'+name,tab('data-ptc-tab',name));
 back('progress-menu','progress','#ptcBackMenu',opened('gameMenuOverlay'));
 add('open-account','menu:player','[data-feature-open="account"],.menu-wheel [data-adventure="account"]','player.account',opened('featureCenterOverlay'));
 back('account-menu','feature:account','#backFeatureCenterToMenu',opened('gameMenuOverlay'),{});
 add('open-family','menu:player','[data-parent-teacher-center]','player.family',opened('parentTeacherCenter'));
 add('family-manage','parent:dashboard','[data-ptc-view="manage"]','family.manage','[data-ptc-view="dashboard"]');
 add('family-dashboard','parent:manage','[data-ptc-view="dashboard"]','navigation.back','[data-ptc-view="manage"]');
 add('family-link','parent:dashboard','[data-ptc-view="link"]','family.link','[data-ptc-cloud-form],.ptc-cloud-link');
 back('family-menu','parent:link','#ptcBackMenu',opened('gameMenuOverlay'));
 add('open-settings','menu:player','[data-v6-menu="settings"]','player.settings',opened('v6SettingsOverlay'));
 info('settings-accessibility','settings','#v6TextSize','settings.accessibility');
 info('settings-audio','settings','#v6SupportMode','settings.voice');
 info('settings-portrait','settings','#v6PortraitLockToggle','settings.portrait');
 info('settings-recovery','settings','.v6-save-recovery','settings.recovery');
 info('settings-install','settings','#v6InstallApp','account-install.install');
 add('settings-guide','settings','#v6SettingsGuide','settings.guide',opened('completeGameGuide'));
 info('guide-search','guide','#completeGuideSearch','help.guide');
 back('guide-menu','guide','#completeGuideMenu',opened('gameMenuOverlay'));
 add('open-help','menu:player','[data-v6-menu="help"]','player.help',opened('v6FeedbackOverlay'));
 info('help-options','help','#v6FeedbackContent','help.replay');
 back('help-menu','help','[data-v6-back="feedback"]',opened('gameMenuOverlay'));
 back('return-game','menu:player','#backGameMenuToGame','!'+opened('gameMenuOverlay'));
 info('practice-controls','home','#adventureContinue,#quickMineBtn,#rock','home.next');
 info('practice-help','home','#rock,#challengeArea','home.help');
 info('ready','home','#adventureContinue,#quickMineBtn,#rock','home.next',{
  action:'finish',title:'You’re ready to play',body:'You have visited the real game menus. Finish the tutorial to choose your starting level and begin your course.'});
 const ids=new Set(STEPS.map(step=>step.id));
 const snapshot=()=>typeof state!=='undefined'&&state&&typeof state==='object'?state:null;
 const profile=()=>window.japaneseMinerActiveProfile?.()||null;
 const courses=()=>{try{return window.LanguageMinerCourseCloud?.exportCurrent?.()||{};}catch{return {};}};
 function hasCounts(value,depth=0){
  if(!value||typeof value!=='object'||depth>6)return false;
  return Object.entries(value).some(([key,item])=>/^(answered|correct|wrong|seen|attempts|questionsAnswered|totalQuestions)$/.test(key)&&Number(item)>0||item&&typeof item==='object'&&hasCounts(item,depth+1));
 }
 function hasPractice(game={},settings={}){
  game=game&&typeof game==='object'?game:{};settings=settings&&typeof settings==='object'?settings:{};
  return Number(game.sessionAnswered)>0||hasCounts(game.questionStats)||hasCounts(game.kanaStats)||hasCounts(game.stats)||hasCounts(settings.progress)||
   (Array.isArray(game.learningReport?.assessmentAttempts)&&game.learningReport.assessmentAttempts.some(row=>row.group!=='placement'&&Number(row.answered)>0));
 }
 function normalizeRecord(raw,total=STEPS.length){
  if(!raw||typeof raw!=='object'||![1,VERSION].includes(raw.version))return null;
  const completed=raw.completed===true,exempt=!completed&&raw.exempt===true;
  const visited=raw.version===VERSION?[...new Set((Array.isArray(raw.visited)?raw.visited:[]).filter(id=>ids.has(id)))]:[];
  const missing=STEPS.findIndex(step=>!visited.includes(step.id));
  const limit=completed||exempt||missing<0?total-1:Math.min(total-1,missing);
  const step=raw.version===VERSION?Math.max(0,Math.min(limit,Math.floor(Number(raw.step)||0))):0;
  return {version:VERSION,step,completed,exempt,visited,languageSelected:raw.languageSelected===true,...(completed&&Number(raw.completedAt)>0?{completedAt:Number(raw.completedAt)}:{})};
 }
 function createRecord(game={},settings={}){
  game=game&&typeof game==='object'?game:{};
  return normalizeRecord(game.v6?.beginnerTutorial)||{version:VERSION,step:0,completed:false,exempt:hasPractice(game,settings),visited:[],languageSelected:false};
 }
 function requiredFor(game={},settings={}){const record=createRecord(game,settings);return !record.completed&&!record.exempt;}
 const model=Object.freeze({normalizeRecord,hasPractice,createRecord,requiredFor});
 let active=false,required=false,index=0,currentProfile='',visited=new Set(),timer=null,replayRequested=false;
 let finishing=false,transitioning=false,restoring=false,saveError=false,returnFocus=null,target=null;
 let frame=0,actionTimer=null,restoreTimer=null,stepEpoch=0,internalNavigation=0,redirectingFocus=false,recoveryAttempted=false;
 const savedAria=new Map();
 function locale(){return window.LanguageMinerI18n?.getLocale?.()||document.documentElement.dataset.lmKnownLanguage||'en';}
 function text(key){const packs=window.LanguageMinerBeginnerTutorialLocales||{};return packs[locale()]?.[key]||packs.en?.[key]||key;}
 function translate(value){
  return window.LanguageMinerGuidedTutorialLocales?.[locale()]?.[value]||window.LanguageMinerBeginnerTutorialLocales?.[locale()]?.guidedPhrases?.[value]||
   window.LanguageMinerBeginnerTutorialPhrases?.[locale()]?.[value]||window.LanguageMinerI18n?.translate?.(String(value||''))||String(value||'');
 }
 function languageReady(record,settings=courses()){
  if(record?.languageSelected)return true;
  const placement=settings.placements?.[settings.learning];
  return !!settings.known&&!!settings.learning&&settings.known!==settings.learning&&(placement==='tested'||placement==='beginner'||placement?.status==='tested'||placement?.status==='beginner');
 }
 function visible(node){
  if(!node||!node.isConnected||node.hidden||node.closest('[hidden],[inert]'))return false;
  const style=getComputedStyle(node);return style.display!=='none'&&style.visibility!=='hidden'&&node.getClientRects().length>0;
 }
 function firstVisible(selector,enabled=false){
  if(!selector)return null;
  return [...document.querySelectorAll(selector)].find(node=>visible(node)&&(!enabled||!node.disabled))||null;
 }
 function priorityOverlay(){return ['authOverlay','legalConsentOverlay','portraitGuard','lmMultilingualOverlay','placementOverlay'].map(id=>document.getElementById(id)).find(visible)||null;}
 function blocked(){return !!priorityOverlay()||[...document.querySelectorAll('dialog[open]')].some(node=>visible(node));}
 function status(){
  const record=normalizeRecord(snapshot()?.v6?.beginnerTutorial),player=profile(),step=STEPS[index];
  const eligible=!!player&&!!record&&!record.completed&&!record.exempt,languageSelected=!!player&&languageReady(record);
  return {active,required:active&&required,step:index,stepId:step?.id||'',total:STEPS.length,target:step?.target||'',targetSelector:step?.target||'',targetId:target?.id||'',action:step?.action||'',scene:step?.scene||'',completed:record?.completed===true,eligible,languageSelected,awaitingLanguage:eligible&&!languageSelected,profileId:player?.id||null,finishing,transitioning,waiting:active&&(!target||!visible(target)||!target.hasAttribute('data-beginner-tutorial-target')||restoring),version:VERSION};
 }
 function announce(){window.dispatchEvent(new CustomEvent('lm-beginner-tutorial-changed',{detail:status()}));}
 function saveRecord(record){
  const game=snapshot();if(!game||!profile()||active&&profile().id!==currentProfile)return false;
  game.v6=game.v6&&typeof game.v6==='object'?game.v6:{};game.v6.beginnerTutorial=record;
  try{return typeof save==='function'&&save()!==false;}catch{return false;}
 }
 function ensureRecord(){
  const game=snapshot();if(!game||!profile()||window.LANGUAGE_MINER_PREVIEW===true)return null;
  const record=createRecord(game,courses());
  if(!normalizeRecord(game.v6?.beginnerTutorial)||game.v6.beginnerTutorial.version!==VERSION)saveRecord(record);
  return record;
 }
 function saveProgress(){const record=createRecord(snapshot(),courses());return saveRecord({...record,step:index,visited:[...visited]});}
 function createShell(){
  if(document.getElementById('beginnerTutorialOverlay'))return;
  const layer=document.createElement('div');layer.id='beginnerTutorialOverlay';layer.className='beginner-tutorial';layer.hidden=true;layer.setAttribute('data-lm-no-interface-translate','');
  layer.innerHTML='<div class="beginner-tutorial-shade" data-side="top"></div><div class="beginner-tutorial-shade" data-side="left"></div><div class="beginner-tutorial-shade" data-side="right"></div><div class="beginner-tutorial-shade" data-side="bottom"></div><div id="beginnerTutorialRing" aria-hidden="true"><span class="beginner-tutorial-hand">☝</span></div><section id="beginnerTutorialCoach" role="dialog" aria-modal="false" aria-labelledby="beginnerTutorialTitle" aria-describedby="beginnerTutorialIntro"><img class="beginner-tutorial-portrait" src="gnome-guide-v1.png" alt=""><div class="beginner-tutorial-speech"><header><span id="beginnerTutorialKind"></span><button id="beginnerTutorialClose" type="button">×</button></header><p id="beginnerTutorialCount"></p><h2 id="beginnerTutorialTitle"></h2><p id="beginnerTutorialIntro"></p><p id="beginnerTutorialStatus" role="status" aria-live="polite"></p><div class="beginner-tutorial-progress" role="progressbar" aria-valuemin="0"><i></i></div><footer><small id="beginnerTutorialSaved"></small><button id="beginnerTutorialNext" type="button"></button><button id="beginnerTutorialRetry" type="button" hidden></button></footer></div></section>';
  document.body.appendChild(layer);
  document.getElementById('beginnerTutorialNext').onclick=()=>{if(active&&!transitioning&&!restoring&&STEPS[index].action!=='click')advance();};
  document.getElementById('beginnerTutorialRetry').onclick=()=>{if(active){saveError=false;restoreScene(STEPS[index].scene);}};
  document.getElementById('beginnerTutorialClose').onclick=()=>{if(!required)dismiss(true);};
 }
 function updateStatus(message=''){
  const step=STEPS[index],button=document.getElementById('beginnerTutorialNext');
  document.getElementById('beginnerTutorialStatus').textContent=message||(finishing?text('saving'):saveError?text('saveError'):restoring?translate('Restoring your place…'):translate(step.action==='click'?'Tap the glowing control.':'Look here, then continue.'));
  button.hidden=step.action==='click'||!target||restoring;
  button.disabled=finishing||transitioning||restoring;
  button.textContent=finishing?text('saving'):translate(step.action==='finish'?'Finish tutorial':'Continue');
  document.getElementById('beginnerTutorialRetry').textContent=translate('Try again');
 }
 function restoreTargetAria(){
  if(target){target.removeAttribute('data-beginner-tutorial-target');const old=savedAria.get(target);if(old===null)target.removeAttribute('aria-describedby');else if(old!==undefined)target.setAttribute('aria-describedby',old);savedAria.delete(target);}
  target=null;
 }
 function queueRecovery(delay=400){
  if(!active||transitioning||restoring||recoveryAttempted||restoreTimer!==null)return;
  const epoch=stepEpoch;restoreTimer=setTimeout(()=>{restoreTimer=null;if(active&&stepEpoch===epoch&&!target)restoreScene(STEPS[index].scene);},delay);
 }
 function decorateTarget(){
  if(!target)return;
  if(!target.hasAttribute('data-beginner-tutorial-target'))target.setAttribute('data-beginner-tutorial-target','');
  const description=target.getAttribute('aria-describedby')||'';
  if(!description.split(/\s+/).includes('beginnerTutorialIntro'))target.setAttribute('aria-describedby',[description,'beginnerTutorialIntro'].filter(Boolean).join(' '));
 }
 function setTarget(next,focus=true){
  if(next===target){decorateTarget();if(!target)queueRecovery();return;}
  restoreTargetAria();target=next;
  if(target){
   clearTimeout(restoreTimer);restoreTimer=null;recoveryAttempted=false;
   savedAria.set(target,target.getAttribute('aria-describedby'));decorateTarget();
   target.scrollIntoView({block:'center',inline:'center',behavior:'instant'});
   if(focus&&STEPS[index].action==='click'&&!target.disabled)try{target.focus({preventScroll:true});}catch{}
  }
  if(!target)queueRecovery();updateStatus();schedulePosition();
 }
 function renderStep(recover=false){
  if(!active)return;stepEpoch++;clearTimeout(actionTimer);clearTimeout(restoreTimer);restoreTimer=null;transitioning=false;recoveryAttempted=false;
  const step=STEPS[index],layer=document.getElementById('beginnerTutorialOverlay');layer.lang=locale();
  document.getElementById('beginnerTutorialKind').textContent=translate('KŌJI · YOUR MINE GUIDE');
  const chapter=index<STEPS.findIndex(row=>row.id==='gear-category')?'Explore':index<STEPS.findIndex(row=>row.id==='player-category')?'Gear':index<STEPS.findIndex(row=>row.id==='practice-controls')?'Player & settings':'Getting started';
  document.getElementById('beginnerTutorialCount').textContent=translate(chapter);
  document.getElementById('beginnerTutorialTitle').textContent=translate(step.title||'Explore');
  document.getElementById('beginnerTutorialIntro').textContent=translate(step.body||'');
  document.getElementById('beginnerTutorialSaved').textContent=translate('Your place is saved automatically.');
  const close=document.getElementById('beginnerTutorialClose');close.hidden=required;close.setAttribute('aria-label',text('close'));
  const progress=layer.querySelector('[role="progressbar"]');progress.setAttribute('aria-label',text('progressLabel'));progress.setAttribute('aria-valuemax',STEPS.length);progress.setAttribute('aria-valuenow',index);progress.firstElementChild.style.width=index/STEPS.length*100+'%';
  document.getElementById('beginnerTutorialRetry').hidden=true;
  restoreTargetAria();setTarget(firstVisible(step.target,step.action==='click'));updateStatus();announce();
  if(recover||!target){clearTimeout(restoreTimer);restoreTimer=null;queueRecovery(recover?0:500);}
  if(step.action!=='click'&&target)document.getElementById('beginnerTutorialNext').focus({preventScroll:true});
 }
 function expected(step){
  if(!step.expected)return true;
  return step.expected[0]==='!'?!firstVisible(step.expected.slice(1)):!!firstVisible(step.expected);
 }
 function observeAction(){
  const epoch=stepEpoch,owner=currentProfile,step=STEPS[index],began=performance.now();transitioning=true;updateStatus();
  function check(){
   if(!active||stepEpoch!==epoch||profile()?.id!==owner)return;
   if(blocked()){dismiss(false);request();return;}
   if(expected(step)){actionTimer=setTimeout(()=>{if(active&&stepEpoch===epoch)advance();},150);return;}
   if(performance.now()-began<2200){actionTimer=setTimeout(check,60);return;}
   transitioning=false;updateStatus(translate('This control is not ready yet. Try again.'));setTarget(firstVisible(step.target,true),false);schedulePosition();
  }
  actionTimer=setTimeout(check,60);
 }
 async function advance(){
  if(!active||finishing||profile()?.id!==currentProfile)return;
  visited.add(STEPS[index].id);
  if(index<STEPS.length-1){index++;if(required)saveError=!saveProgress();renderStep();return;}
  if(!required){dismiss(true);return;}
  const missing=STEPS.findIndex(step=>!visited.has(step.id));if(missing>=0){index=missing;renderStep(true);return;}
  finishing=true;updateStatus();const owner=currentProfile;
  const record={version:VERSION,step:index,visited:[...visited],completed:true,exempt:false,languageSelected:true,completedAt:Date.now()};
  let saved=saveRecord(record);if(!saved){try{saved=(await window.languageMinerPushCloudSave?.())?.accepted===true;}catch{}}
  if(profile()?.id!==owner){finishing=false;dismiss(false);return;}
  finishing=false;
  if(saved){dismiss(true);window.dispatchEvent(new CustomEvent('lm-beginner-tutorial-complete',{detail:{profileId:owner}}));}
  else{saveRecord({...record,completed:false});saveError=true;transitioning=false;updateStatus();}
 }
 function internal(fn){internalNavigation++;try{return fn();}finally{internalNavigation--;}}
 function click(selector){const node=firstVisible(selector,true);if(node)internal(()=>node.click());return !!node;}
 function closeViews(){
  for(const selector of ['#v5Close','#closeShopBtn','#utilityClose','#closeFeatureCenter','[data-v6-close="settings"]','[data-v6-close="feedback"]','#ptcClose','#completeGuideClose','[data-writing-close]','#closeAcademyBtn'])click(selector);
 }
 function openMenu(category='adventure'){
  closeViews();internal(()=>{if(typeof openGameMenu==='function')openGameMenu();else document.getElementById('gameMenuBtn')?.click();});
  click('[data-menu-category="'+category+'"]');
 }
 // Rebuild only safe navigation on reload or a remote-save handoff. No purchases,
 // installs, account actions, answers or tests are ever replayed programmatically.
 async function restoreScene(scene){
  if(!active||restoring||blocked())return;
  const epoch=stepEpoch,owner=currentProfile;restoring=true;recoveryAttempted=true;restoreTargetAria();updateStatus();schedulePosition();
  const [kind,tabName]=scene.split(':');
  internal(()=>{
   if(kind==='home'){closeViews();window.closeGameMenu?.();}
   else if(kind==='menu')openMenu(tabName);
   else if(kind==='hub'){openMenu('adventure');click('[data-v5-open]');click('[data-v5tab="'+tabName+'"]');}
   else if(kind==='shop'){openMenu('gear');click('[data-menu-action="shop"]');click('[data-shop-tab="'+tabName+'"]');}
   else if(kind==='utility'){closeViews();window.openJapaneseMinerDashboard?.(tabName);}
   else if(kind==='feature'){
    openMenu(tabName==='quests'?'adventure':tabName==='account'?'player':'gear');
    const selector=tabName==='notebook'?'[data-menu-action="notebook"]':'[data-feature-open="'+tabName+'"]';click(selector);
   }
   else if(kind==='writing'){closeViews();window.closeGameMenu?.();window.openLanguageMinerWritingPractice?.();}
   else if(kind==='progress'){closeViews();window.closeGameMenu?.();window.openLanguageMinerMyProgress?.();}
   else if(kind==='parent'){closeViews();window.closeGameMenu?.();window.openLanguageMinerParentTeacherCenter?.(tabName||'dashboard');}
   else if(kind==='settings'){closeViews();window.closeGameMenu?.();window.openJapaneseMinerSettings?.();}
   else if(kind==='guide'){closeViews();window.closeGameMenu?.();window.LanguageMinerGameGuide?.open?.();}
   else if(kind==='help'){closeViews();window.closeGameMenu?.();window.openLanguageMinerHelpCommunity?.();}
  });
  await new Promise(resolve=>setTimeout(resolve,80));
  if(!active||profile()?.id!==owner||stepEpoch!==epoch){restoring=false;return;}
  restoring=false;setTarget(firstVisible(STEPS[index].target,STEPS[index].action==='click'));updateStatus();
  if(!target){document.getElementById('beginnerTutorialRetry').hidden=false;updateStatus(translate('This control is not ready yet. Try again.'));}
  if(target&&STEPS[index].action!=='click')document.getElementById('beginnerTutorialNext').focus({preventScroll:true});
  announce();schedulePosition();
 }
 function dismiss(focus){
  const wasActive=active;active=false;finishing=false;transitioning=false;restoring=false;stepEpoch++;
  clearTimeout(actionTimer);clearTimeout(restoreTimer);restoreTimer=null;restoreTargetAria();
  const layer=document.getElementById('beginnerTutorialOverlay');if(layer){layer.hidden=true;layer.classList.remove('open');}
  document.body.classList.remove('beginner-tutorial-active');
  if(focus&&wasActive){const node=visible(returnFocus)?returnFocus:firstVisible('[data-adventure="menu"],#gameMenuBtn');try{node?.focus({preventScroll:true});}catch{}}
  announce();
 }
 function show(record,isRequired){
  createShell();active=true;required=isRequired;currentProfile=profile().id;index=isRequired?record.step:0;visited=new Set(isRequired?record.visited:[]);saveError=false;returnFocus=document.activeElement;
  const layer=document.getElementById('beginnerTutorialOverlay');layer.hidden=false;layer.classList.add('open');document.body.classList.add('beginner-tutorial-active');renderStep(true);
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
  else if(required&&(index!==record.step||JSON.stringify([...visited])!==JSON.stringify(record.visited))){index=record.step;visited=new Set(record.visited);renderStep(true);}
 }
 function request(){const record=ensureRecord();if(active&&(profile()?.id!==currentProfile||blocked()))dismiss(false);if(timer===null)timer=setTimeout(reconcile,300);return !!record&&!record.completed&&!record.exempt||active&&required;}
 function afterLanguageSelection(){const record=ensureRecord();if(!record)return false;saveRecord({...record,languageSelected:true});request();return !record.completed&&!record.exempt;}
 function replay(){if(!profile())return false;replayRequested=true;request();return true;}
 function permittedControls(){
  const controls=[];if(target&&visible(target)&&!restoring&&!transitioning&&STEPS[index].action==='click'&&!target.disabled)controls.push(target);
  for(const id of ['beginnerTutorialNext','beginnerTutorialRetry','beginnerTutorialClose']){const node=document.getElementById(id);if(visible(node)&&!node.disabled)controls.push(node);}
  return controls;
 }
 function trapTab(event,controls){
  event.preventDefault();event.stopImmediatePropagation();if(!controls.length)return;const position=controls.indexOf(document.activeElement),next=position<0?(event.shiftKey?controls.length-1:0):(position+(event.shiftKey?-1:1)+controls.length)%controls.length;
  if(controls[next]!==document.activeElement)controls[next].focus({preventScroll:true});
 }
 function focusPermitted(node){
  if(redirectingFocus||!node||!visible(node)||node===document.activeElement)return;
  redirectingFocus=true;try{node.focus({preventScroll:true});}finally{redirectingFocus=false;}
 }
 function guard(event){
  if(internalNavigation||redirectingFocus&&event.type==='focusin')return;
  // The visible Menu and several real Back buttons forward to the native Menu
  // button on the next task. Permit only that causal navigation while waiting.
  if(active&&transitioning&&!event.isTrusted&&event.type==='click'&&event.target?.id==='gameMenuBtn'&&STEPS[index].expected===opened('gameMenuOverlay'))return;
  if(active&&blocked()){dismiss(false);request();}
  if(!active){
   const record=normalizeRecord(snapshot()?.v6?.beginnerTutorial);if(!profile()||!record||record.completed||record.exempt)return;
   const priority=priorityOverlay(),controls=priority?[...priority.querySelectorAll('button,input,select,textarea,a[href],[tabindex]')].filter(node=>visible(node)&&!node.disabled):[];
   if(priority&&event.type==='keydown'&&event.key==='Tab'){trapTab(event,controls);return;}
   if(priority&&event.type==='keydown'&&event.key==='Escape'){event.preventDefault();event.stopImmediatePropagation();return;}
   if(priority?.contains(event.target))return;
   event.preventDefault();event.stopImmediatePropagation();if(event.type==='focusin')focusPermitted(controls[0]);request();return;
  }
  if(event.type==='keydown'&&event.key==='Escape'){event.preventDefault();event.stopImmediatePropagation();if(!required)dismiss(true);return;}
  if(event.type==='keydown'&&event.key==='Tab'){trapTab(event,permittedControls());return;}
  const own=event.target?.closest?.('#beginnerTutorialNext,#beginnerTutorialRetry,#beginnerTutorialClose');
  const allowedOwn=own&&visible(own)&&!own.disabled;
  const allowedTarget=!restoring&&!transitioning&&target&&STEPS[index].action==='click'&&(event.target===target||target.contains(event.target));
  if(allowedOwn||allowedTarget){
   if(allowedTarget&&event.type==='click')observeAction();
   // Only ordinary activation keys reach the one permitted game control.
   if(event.type!=='keydown'||['Enter',' ','Shift','Control','Alt','Meta'].includes(event.key))return;
  }
  event.preventDefault();event.stopImmediatePropagation();
  if(event.type==='focusin')focusPermitted(permittedControls()[0]);
 }
 function schedulePosition(){if(active&&!frame)frame=requestAnimationFrame(()=>{frame=0;position();});}
 function position(){
  if(!active)return;const layer=document.getElementById('beginnerTutorialOverlay'),coach=document.getElementById('beginnerTutorialCoach'),ring=document.getElementById('beginnerTutorialRing');
  if(target&&!visible(target)){setTarget(firstVisible(STEPS[index].target,STEPS[index].action==='click'),false);}
  const width=innerWidth,height=innerHeight,pad=7,rect=target?.getBoundingClientRect();
  const box=rect?{left:Math.max(0,rect.left-pad),top:Math.max(0,rect.top-pad),right:Math.min(width,rect.right+pad),bottom:Math.min(height,rect.bottom+pad)}:{left:0,top:0,right:0,bottom:0};
  const sides={top:[0,0,width,box.top],bottom:[0,box.bottom,width,height-box.bottom],left:[0,box.top,box.left,Math.max(0,box.bottom-box.top)],right:[box.right,box.top,width-box.right,Math.max(0,box.bottom-box.top)]};
  for(const shade of layer.querySelectorAll('.beginner-tutorial-shade')){const [x,y,w,h]=sides[shade.dataset.side];Object.assign(shade.style,{left:x+'px',top:y+'px',width:Math.max(0,w)+'px',height:Math.max(0,h)+'px'});}
  ring.hidden=!rect;Object.assign(ring.style,{left:box.left+'px',top:box.top+'px',width:Math.max(0,box.right-box.left)+'px',height:Math.max(0,box.bottom-box.top)+'px'});
  ring.classList.toggle('informational',STEPS[index].action!=='click');
  coach.style.maxWidth=Math.min(430,width-24)+'px';const cw=coach.offsetWidth,ch=coach.offsetHeight,margin=12,gap=22;
  let x=Math.max(margin,Math.min(width-cw-margin,rect?box.left:Math.round((width-cw)/2))),y;
  if(rect&&box.bottom+gap+ch<=height-margin)y=box.bottom+gap;
  else if(rect&&box.top-gap-ch>=margin)y=box.top-gap-ch;
  else if(rect&&box.right+gap+cw<=width-margin){x=box.right+gap;y=Math.max(margin,Math.min(height-ch-margin,box.top));}
  else if(rect&&box.left-gap-cw>=margin){x=box.left-gap-cw;y=Math.max(margin,Math.min(height-ch-margin,box.top));}
  else y=rect&&box.top>height/2?margin:Math.max(margin,height-ch-margin);
  coach.style.left=x+'px';coach.style.top=Math.max(margin,Math.min(height-ch-margin,y))+'px';
  const above=y+ch<=box.top;ring.dataset.hand=above?'above':'below';
 }
 function init(){
  createShell();for(const name of ['jm-profile-loaded','lm-cloud-save-applied','lm-course-settings-saved','lm-interface-language-changed'])window.addEventListener(name,()=>{if(name==='lm-interface-language-changed'&&active)renderStep();request();});
  window.addEventListener('jm-profile-logged-out',()=>{replayRequested=false;clearTimeout(timer);timer=null;if(active)dismiss(false);});
  for(const name of ['click','pointerdown','keydown','focusin'])window.addEventListener(name,guard,true);
  window.addEventListener('resize',schedulePosition);window.addEventListener('scroll',schedulePosition,true);
  window.visualViewport?.addEventListener('resize',schedulePosition);
  new MutationObserver(rows=>{
   if(active&&target&&rows.some(row=>row.target===target&&['data-beginner-tutorial-target','aria-describedby'].includes(row.attributeName)))decorateTarget();
   if(!rows.some(row=>!row.target?.closest?.('#beginnerTutorialOverlay')&&!['data-beginner-tutorial-target','aria-describedby'].includes(row.attributeName)))return;
   if(active){if(blocked()){dismiss(false);request();}else{if(!restoring&&(!target||!visible(target)||!target.hasAttribute('data-beginner-tutorial-target')))setTarget(firstVisible(STEPS[index].target,STEPS[index].action==='click'),false);schedulePosition();}}
   else request();
  }).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class','hidden','aria-hidden','open','data-beginner-tutorial-target','aria-describedby']});
  request();
 }
 window.LanguageMinerBeginnerTutorial=Object.freeze({request,maybeStart:request,afterLanguageSelection,replay,start:options=>options?.replay?replay():request(),status,model,steps:()=>STEPS.map(step=>({...step}))});
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
