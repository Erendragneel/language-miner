'use strict';
// Local audit only. No browser, player storage, deployment or paid service.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),cp=require('node:child_process'),vm=require('node:vm');
const root=path.resolve(__dirname,'../..'),files=['teaching-notes.js','v6.js','game-6460.js','multilingual-preview.js','language-quality.js','tests/answer-explanations.test.cjs'];
const run=cp.spawnSync(process.execPath,['tests/answer-explanations.test.cjs'],{cwd:root,encoding:'utf8'});
const context={window:{}};vm.createContext(context);vm.runInContext(fs.readFileSync(path.join(root,'teaching-notes.js'),'utf8'),context,{filename:'teaching-notes.js'});
const report={reviewDate:'2026-10-17',status:run.status===0?'implemented-and-regression-tested':'regression-failed',method:'Source-backed AI content review and isolated VM regression tests; no production player account was accessed.',files:Object.fromEntries(files.map(file=>[file,crypto.createHash('sha256').update(fs.readFileSync(path.join(root,file))).digest('hex')])),coverage:JSON.parse(JSON.stringify(context.window.LanguageMinerTeachingNotes.coverage)),reviewedSourceScope:{nativePublicGrammarPatterns:138,nativePublicReadingPassagesAndComprehensionQuestions:28,nativeInitialParticleQuestions:10,nativeInitialSentenceQuestions:10,multilingualGrammarMeaningPairs:80,multilingualLanguagesInWrongChoiceRegression:17,privateTutorArraysRead:['vocabulary','verb forms','particles','patterns','adjectives','conversation']},findingsAndRepairs:[
 'Grammar feedback now preserves the exact displayed sentence; a shared answer label can no longer substitute an unrelated reference example.',
 'All 138 native grammar examples have authored rule/context guidance and a full English example translation, guarded by both pattern and exact source sentence.',
 'Ten native particle questions have exact contextual notes; は/が alternatives are explicitly recognized instead of treating every alternative as categorically ungrammatical.',
 'All 28 native reading passages have full English translations and passage-specific evidence explaining the comprehension answer.',
 'All 80 shared grammar rows receive meaning-specific context notes. They do not assume that every target language follows English tense, word order or inflection.',
 'Wrong multilingual choices are contrasted using the actual selected row and the current known-language translation, when both sides can be identified without guessing.',
 'Additional reviewed item.learningNotes.en are supported; English notes are explicitly labeled when the learner’s known language is different, while the known-language translation remains visible.',
 'Native proposed definition/prompt corrections are recorded in native-teaching-recommendations.json for root integration, preserving stable item IDs and recorded Japanese passage text.'
],securityAndProgressChecks:['Silent guardian/assessment questions suppress teaching markup and the explanation panel.','Explanation preference suppresses feedback.','Untrusted answer/help/translation/example/item notes remain escaped.','No scoring, mastery, XP, hearts or ordinary save writes are introduced by the explanation model.','Assisted-answer behavior and accepted alternate-answer correctness remain covered.','Replacing the question removes its previous answer feedback.'],tests:{command:'node tests/answer-explanations.test.cjs',exitCode:run.status,scenariosPassed:(run.stdout.match(/PASS explanation regression scenarios: (\d+) passed/)||[])[1]?Number((run.stdout.match(/PASS explanation regression scenarios: (\d+) passed/)||[])[1]):null,output:run.stdout+run.stderr},primaryReferences:[
 {url:'https://www.jpf.go.jp/j/project/japanese/teach/tsushin/grammar/201012.html',usedFor:'Appearance versus hearsay そう: different attachment and meaning.'},
 {url:'https://www.irodori.jpf.go.jp/assets/data/elementary01/pdf/Y_L08.pdf',usedFor:'Past-experience construction uses the verb ta-form before ことがある.'},
 {url:'https://www.irodori.jpf.go.jp/assets/data/elementary01/pdf/Y_L02.pdf',usedFor:'ている can express habits or situations rather than only English progressive -ing.'},
 {url:'https://www.jpf.go.jp/j/project/japanese/teach/tsushin/grammar/201112.html',usedFor:'ことにする decision versus ことになっている arrangement; ability with ことができる.'}
],limits:[
 'This is AI-reviewed teaching content, not certification by native teachers in all 17 languages.',
 'The 80 shared grammar notes explain sentence meaning and context. They do not constitute 1,360 separately authored language-specific grammar lessons.',
 'Authored detailed rules and reading translations are in English; non-English learners retain their bilingual answer translations and see the added English guidance explicitly labeled.',
 'Native examples with omitted Japanese subjects use a plausible conversational I/you rendering where needed; these pronouns are not asserted to be the only possible referents.',
 'Audio was neither regenerated nor physically listened to in this audit. Written text and recorded pronunciation can require a separate alignment/listening check.',
 'Private tutor arrays were read and specific concerns reported, but the 138-pattern metadata covers the public grammar curriculum, not every private tutor exercise.',
 'Tests establish content availability and regression properties; they do not demonstrate measured learning outcomes or guarantee error-free language teaching.',
 'No deployment or Android rebuild was performed by this teaching subtask.'
]};
const listening=cp.spawnSync(process.execPath,['tests/listening-clues.test.cjs'],{cwd:root,encoding:'utf8'}),syntax=cp.spawnSync(process.execPath,['--check','game-6460.js'],{cwd:root,encoding:'utf8'});
report.files['tests/listening-clues.test.cjs']=crypto.createHash('sha256').update(fs.readFileSync(path.join(root,'tests/listening-clues.test.cjs'))).digest('hex');
report.nativeStudyViews={currentLessonPreviewCards:true,n5GrammarAndReadingReferenceViews:true,advancedGrammarAndReadingReferenceViews:true,unansweredQuizExcludesStudyGuidance:true,englishNotesLabeledForOtherKnownLanguages:true};
report.nativeReferenceQuizFeedback={exactSourceContext:true,reviewedGuidanceAfterCorrectAndWrongAnswers:true,unansweredQuizHasNoGuidance:true,teachingWaitsForContinue:true,existingMasteryAndNotebookCallbackRunsOnce:true,continueAwardsNothing:true,staleCallbacksIgnoreReplacementQuiz:true,testedPaths:20};
report.privateTutorVerbGrouping={standardGroups:['Ru/ichidan','U/godan','irregular'],ikuGroup:'U/godan',inventedUSpecialChoiceRemoved:true,promptContainsNoExceptionHint:true,exceptionsInPostAnswerHelp:['いった','いって'],questionCount:54,orderAndIdsUnchanged:true};
for(const file of ['native-teaching-recommendations.json','native-source-edits.json','apply-native-teaching.cjs'])report.files['reviews/language-2026-10-17/'+file]=crypto.createHash('sha256').update(fs.readFileSync(path.join(__dirname,file))).digest('hex');
report.tests.additional=[{command:'node tests/listening-clues.test.cjs',exitCode:listening.status,output:listening.stdout+listening.stderr},{command:'node --check game-6460.js',exitCode:syntax.status,output:syntax.stdout+syntax.stderr}];
report.findingsAndRepairs.push('The actual native studycards now include reviewed rules, English example/passages translations and reading-answer evidence. Reference guidance never enters the unanswered quiz renderer.','Private tutor particle prompts now identify the requested semantic role, retaining Japanese, answers, order and IDs.','Per-text website audio availability now requires an exact bundled clip or an installed native device voice. A language-level voice record no longer falsely makes every text playable; Play remains bundled-only.');
if(listening.status!==0||syntax.status!==0)report.status='regression-failed';
fs.writeFileSync(path.join(__dirname,'teaching-review.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({status:report.status,coverage:report.coverage,scenariosPassed:report.tests.scenariosPassed,report:'reviews/language-2026-10-17/teaching-review.json'}));
if(report.status==='regression-failed')process.exitCode=1;
