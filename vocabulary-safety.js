/* Vocabulary integrity helpers. Exact alternatives only; no fuzzy answer matching. */
(function(){
  'use strict';
  const normalize=value=>String(value??'').normalize('NFKC').replace(/\s+/g,' ').trim();
  // Keep IDs and lesson positions stable while withholding a Japanese-only
  // combination of senses that is not one answer in the translated courses.
  for(const item of window.LANGUAGE_MINER_MULTILINGUAL_COURSE_DATA?.vocabulary||[]){
    if(item.id===848)item.contentReview={blocked:true,reason:'Japanese pronoun and boyfriend senses require separate translated questions.'};
    for(const [language,value] of Object.entries(item.forms||{})){
      const parts=String(value).split(/[,，]/).map(part=>part.trim());
      if(parts.length>1&&parts.every(part=>normalize(part)===normalize(parts[0]))){
        // The recorded phrase contains only repetitions of this same word. Keep
        // its native recording reachable when cleaning the displayed answer.
        const aliases=window.LANGUAGE_MINER_PRONUNCIATION_PACK?.languages?.[language]?.aliases;
        const original=normalize(value),cleaned=normalize(parts[0]);
        if(aliases?.[original]&&!aliases[cleaned])aliases[cleaned]=aliases[original];
        item.forms[language]=parts[0];
      }
    }
  }
  const rows=()=>window.N5_VOCABULARY_1000||[];
  const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const isMeaning=q=>Boolean(q?.vocabularyKey&&/choose the (?:best )?meaning/i.test(q.prompt||''));
  function refreshJapanese(q){
    if(!q?.vocabularyKey)return;
    const entry=rows().find(r=>r[0]===q.vocabularyKey);if(!entry)return;
    const meaning=isMeaning(q),reading=/choose the (?:correct )?reading/i.test(q.prompt||'');
    if(!meaning&&!reading)return;
    const old=q.a;q.a=entry[meaning?2:1];
    q.opts=[...new Set((q.opts||[]).map(value=>value===old?q.a:value))];
    if(!q.opts.includes(q.a))q.opts.unshift(q.a);
    q.speechText=entry[1];
    q.help=`${escape(entry[0])} is read ${escape(entry[1])} and means “${escape(entry[2])}.”`;
  }
  function japaneseDisplay(q,hard=false){
    if(!isMeaning(q))return null;
    const entry=rows().find(r=>r[0]===q.vocabularyKey);
    if(!entry)return null;
    return hard||entry[0]===entry[1]?escape(entry[0]):`<ruby>${escape(entry[0])}<rt>${escape(entry[1])}</rt></ruby>`;
  }
  function japaneseOptions(q){
    if(q?.vocabularyKey&&/choose the Japanese word/i.test(q.prompt||'')){
      const entry=rows().find(r=>r[0]===q.vocabularyKey);if(!entry)return q.opts;
      const equivalents=new Set(rows().filter(r=>normalize(r[2])===normalize(entry[2])).map(r=>r[0]));
      return (q.opts||[]).filter(option=>option===q.a||!equivalents.has(option));
    }
    if(!isMeaning(q))return q.opts;
    const entry=rows().find(r=>r[0]===q.vocabularyKey);if(!entry)return q.opts;
    // A shared reading must never be used as a competing listening answer.
    const alternatives=new Set(rows().filter(r=>r[1]===entry[1]).map(r=>r[2]));
    return (q.opts||[]).filter(option=>option===q.a||!alternatives.has(option));
  }
  function japaneseAccepts(q,selected,displayed){
    if(selected===q.a)return true;
    if(q?.vocabularyKey&&/choose the Japanese word/i.test(q.prompt||'')){
      const entry=rows().find(r=>r[0]===q.vocabularyKey);
      return Boolean(entry&&rows().some(r=>r[0]===selected&&normalize(r[2])===normalize(entry[2])));
    }
    if(!isMeaning(q))return false;
    const entry=rows().find(r=>r[0]===q.vocabularyKey);if(!entry)return false;
    // Covers already-open or saved kana-only questions from older versions.
    if(normalize(displayed)!==normalize(entry[1]))return false;
    return rows().some(r=>r[1]===entry[1]&&r[2]===selected);
  }
  function multilingualAccepts(question,selected,learning,known){
    if(selected===question.answer)return true;
    const section=question.sourceSection||question.section||question.mode;
    if(!['vocabulary','grammar','sentences','travel'].includes(section))return false;
    const data=window.LANGUAGE_MINER_MULTILINGUAL_COURSE_DATA?.[section]||[];
    const id=question.item?.id??Number(String(question.id||'').split(':').at(-1));
    const item=question.item||data.find(r=>r.id===id);
    const prompt=item?.forms?.[known]||question.meaning||question.display;
    if(!prompt)return false;
    return data.some(r=>normalize(r.forms?.[known])===normalize(prompt)&&normalize(r.forms?.[learning])===normalize(selected));
  }
  function available(item){return item?.contentReview?.blocked!==true;}
  function refreshMultilingual(question,learning,known,promptForMeaning){
    if((question?.sourceSection||question?.mode)!=='vocabulary'||!question.item?.forms)return false;
    const current=window.LANGUAGE_MINER_MULTILINGUAL_COURSE_DATA?.vocabulary.find(r=>r.id===question.item.id);
    if(!current||!available(current))return false;
    const answer=current.forms[learning],meaning=current.forms[known];
    if(!answer||!meaning||question.item.forms[learning]===answer&&question.item.forms[known]===meaning)return false;
    const oldAnswer=question.answer;question.item=current;question.answer=answer;question.meaning=meaning;question.spoken=answer;
    if('label' in question)question.label=meaning;
    if('prompt' in question&&typeof promptForMeaning==='function')question.prompt=promptForMeaning(meaning);
    question.options=[...new Set((question.options||[]).map(value=>value===oldAnswer?answer:value))];
    if(!question.options.includes(answer))question.options.unshift(answer);
    return true;
  }
  window.LanguageMinerVocabulary=Object.freeze({normalize,isMeaning,refreshJapanese,japaneseDisplay,japaneseOptions,japaneseAccepts,multilingualAccepts,available,refreshMultilingual});
})();
