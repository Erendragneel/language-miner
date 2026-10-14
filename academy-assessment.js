/* Real, untimed N5 Academy assessments. Results never award mine progress. */
(()=>{
  'use strict';
  const COUNTS=new Set([20,50,100]);
  const SECTIONS=['vocabulary','kanji','grammar','reading'];
  const LABELS={vocabulary:'Vocabulary',kanji:'Kanji',grammar:'Grammar',reading:'Reading'};
  let session=null;
  const plain=value=>stripMarkup(String(value??'')).trim();
  const normalized=value=>plain(value).normalize('NFKC').replace(/\s+/g,' ').trim().toLowerCase();
  const escape=value=>v3Esc(value);
  const currentProfile=()=>String(activeProfileId||'');
  function tabs(disabled){
    document.querySelectorAll('[data-academy-tab]').forEach(button=>{
      button.disabled=disabled;button.setAttribute('aria-disabled',String(disabled));
    });
  }
  function bestScore(){
    const attempts=state.learningReport?.assessmentAttempts||[];
    const completed=attempts.filter(attempt=>attempt.type==='N5 Academy assessment'&&attempt.finishReason==='completed'&&attempt.answered===attempt.total&&COUNTS.has(attempt.total));
    return completed.length?Math.max(...completed.map(attempt=>Number(attempt.score)||0)):null;
  }
  function prepareQuestion(original){
    if(!original||Number(original.stage)!==2||tutorQuestion(original)||!questionAllowedForSession(original))return null;
    const question={...original,opts:[...(original.opts||[])]};
    window.LanguageMinerVocabulary?.refreshJapanese(question);
    let display=question.concealedPrompt||question.displayChallenge||question.q;
    const vocabularyTerm=question.vocabularyKey||(/reading/i.test(question.prompt||'')?plain(display):'');
    const entry=vocabularyTerm&&(window.N5_VOCABULARY_1000||[]).find(row=>row[0]===vocabularyTerm);
    if(entry){
      const old=question.a;
      if(/meaning/i.test(question.prompt||'')){
        display=entry[0];question.a=entry[2];
      }else if(/reading/i.test(question.prompt||'')){
        question.a=entry[1];
        if(/Which (?:Japanese )?word means/i.test(question.q||''))display=`Which word means “${entry[2]}”?`;
      }else if(/Choose the Japanese word/i.test(question.prompt||'')){
        question.a=entry[0];display=`Which Japanese word means “${entry[2]}”?`;
      }
      question.opts=question.opts.map(option=>option===old?question.a:option);
    }
    display=plain(display);
    const prompt=plain(question.prompt),answer=plain(question.a),needle=normalized(answer);
    if(!display||!prompt||!needle||/^(?:—|-|repetition mark)$/i.test(answer)||display==='々')return null;
    // Do not test a revealed answer, nor a placeholder used to pad a course.
    if(normalized(display).includes(needle)||normalized(prompt).includes(needle))return null;
    const rawOptions=window.LanguageMinerVocabulary?.japaneseOptions(question)||question.opts;
    const options=[...new Set((rawOptions||[]).map(plain))].filter(option=>option&&!/^(?:—|-|repetition mark)$/i.test(option));
    if(!options.includes(answer)||options.length<2)return null;
    const section=jlptQuestionSection(question);
    if(!SECTIONS.includes(section))return null;
    return {id:String(question.id||''),section,display,prompt,answer,options:shuffle([answer,...shuffle(options.filter(option=>option!==answer)).slice(0,3)]),
      key:section==='vocabulary'&&question.vocabularyKey?`vocabulary:${normalized(question.vocabularyKey)}`:`${normalized(display)}|${normalized(prompt)}`};
  }
  function buildDeck(count){
    const groups=Object.fromEntries(SECTIONS.map(section=>[section,[]])),seen=new Set();
    for(const original of questions){
      const question=prepareQuestion(original);
      if(!question||seen.has(question.key))continue;
      seen.add(question.key);groups[question.section].push(question);
    }
    if(SECTIONS.some(section=>!groups[section].length))return [];
    if(SECTIONS.reduce((total,section)=>total+groups[section].length,0)<count)return [];
    SECTIONS.forEach(section=>{groups[section]=shuffle(groups[section]);});
    const deck=[];
    // Draw across every section, then continue from larger banks as needed.
    while(deck.length<count){
      for(const section of shuffle([...SECTIONS])){
        if(groups[section].length&&deck.length<count)deck.push(groups[section].pop());
      }
    }
    return shuffle(deck);
  }
  function cancel(renderAgain=true){
    const existed=!!session;session=null;tabs(false);
    const box=document.getElementById('academyContent');if(box)box.onclick=null;
    if(existed&&renderAgain)renderAcademy();
    return existed;
  }
  function sameProfile(){
    if(!session)return false;
    if(session.profileId===currentProfile()&&session.profileId&&session.state===state&&Number(academyStage)===2&&academyTab==='tests')return true;
    cancel(false);return false;
  }
  function start(count){
    count=Number(count);
    if(!COUNTS.has(count)||!currentProfile()||Number(academyStage)!==2)return false;
    if(session&&sameProfile())return false;
    const deck=buildDeck(count);
    if(deck.length!==count){setMessage(`This assessment needs ${count} different valid questions across vocabulary, kanji, grammar, and reading. Please choose a smaller assessment.`,'wrong');return false;}
    if(typeof clearJlptReviewQuizClock==='function')clearJlptReviewQuizClock();
    if(academyView){academyView.quiz=null;academyView.checkpointQuiz=null;}
    academyTab='tests';
    session={profileId:currentProfile(),state,questions:deck,index:0,correct:0,answered:0,selected:null,finished:false,startedAt:Date.now()};
    window.LanguageMinerSpeech?.cancel();
    renderAcademy();return true;
  }
  function choose(index){
    if(!sameProfile()||session.finished||session.selected!==null)return false;
    if(!Number.isInteger(index))return false;
    const question=session.questions[session.index],selected=question.options[index];
    if(selected===undefined)return false;
    session.selected=selected;session.answered+=1;
    if(selected===question.answer)session.correct+=1;
    renderAcademy();return true;
  }
  function next(){
    if(!sameProfile()||session.finished||session.selected===null)return false;
    if(session.index<session.questions.length-1){session.index+=1;session.selected=null;renderAcademy();return true;}
    // Completion is possible only after one submitted answer per real question.
    if(session.answered!==session.questions.length)return false;
    session.finished=true;session.completedAt=Date.now();session.score=Math.round(session.correct/session.answered*100);
    recordLearningAssessment({group:'practiceTest',type:'N5 Academy assessment',course:'Japanese',level:'JLPT N5',section:'Mixed',difficulty:'not-recorded',
      score:session.score,correct:session.correct,total:session.questions.length,answered:session.answered,passed:session.score>=75,
      completedAt:session.completedAt,durationMs:session.completedAt-session.startedAt,finishReason:'completed'});
    renderAcademy();return true;
  }
  function render(){
    if(!sameProfile())return false;
    const box=document.getElementById('academyContent');if(!box)return false;
    tabs(true);updateAcademyChrome();
    const note='<p class="small">Untimed N5 practice assessment · not an official JLPT exam. No hints, answer audio, hearts, XP, mastery, or rewards. Refreshing or closing ends an unfinished assessment.</p>';
    if(session.finished){
      box.innerHTML=`<section class="course-focus"><div class="course-kicker">N5 Academy assessment complete</div><h3>${session.score}%</h3><p>${session.correct} of ${session.questions.length} correct · ${session.answered} answered</p>${note}<p>Your result appears in this profile’s assessment history. It does not change lesson mastery or unlock lessons.</p><button data-n5-assessment-back class="primary" type="button">Back to assessments</button></section>`;
    }else{
      const question=session.questions[session.index],answered=session.selected!==null;
      box.innerHTML=`<section class="course-focus"><div class="course-kicker">N5 Academy · ${LABELS[question.section]}</div><h3 id="n5AssessmentHeading" tabindex="-1">Question ${session.index+1} of ${session.questions.length}</h3>${note}<article class="jlpt-review-question" data-n5-question-id="${escape(question.id)}"><div class="jlpt-review-question-display">${escape(question.display)}</div><p>${escape(question.prompt)}</p><div class="course-answer-grid">${question.options.map((option,index)=>`<button data-n5-assessment-answer="${index}" class="${answered&&option===question.answer?'answer-good':answered&&option===session.selected?'answer-bad':''}" type="button" ${answered?'disabled':''}>${escape(option)}</button>`).join('')}</div><div class="course-feedback" role="status" aria-live="polite">${answered?(session.selected===question.answer?'Correct.':`Correct answer: ${escape(question.answer)}.`):'Choose one answer. Your first answer counts.'}</div></article><div class="lesson-preview-actions"><button data-n5-assessment-cancel type="button">Cancel assessment</button>${answered?`<button data-n5-assessment-next class="primary" type="button">${session.index===session.questions.length-1?'Finish assessment':'Next question'}</button>`:''}</div></section>`;
    }
    // Native buttons support Enter/Space. Keep feedback until explicit Next.
    box.onclick=event=>{
      const target=event.target.closest('button');if(!target)return;
      if(target.hasAttribute('data-n5-assessment-answer'))choose(Number(target.dataset.n5AssessmentAnswer));
      else if(target.hasAttribute('data-n5-assessment-next'))next();
      else if(target.hasAttribute('data-n5-assessment-cancel')||target.hasAttribute('data-n5-assessment-back'))cancel();
    };
    return true;
  }
  window.LanguageMinerAcademyAssessment=Object.freeze({start,render,cancel,bestScore,active:sameProfile});
  window.addEventListener('jm-profile-loaded',()=>cancel());
  window.addEventListener('jm-profile-logged-out',()=>cancel());
})();
