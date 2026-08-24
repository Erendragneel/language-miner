// Language Miner v6.4.182 — expands every travel course from 60 to 200 aligned phrases.
(()=>{
'use strict';

const data=window.LANGUAGE_MINER_MULTILINGUAL_COURSE_DATA;
if(!data||!Array.isArray(data.sentences)||!Array.isArray(data.vocabulary)||data.travelPhraseExpansionVersion>=1)return;

const LANGUAGES=['en','zh','ko','es','ja','fr','de','ru','it','pt','vi','th','tr','id','pl','el','uk'];
const TEMPLATES=Object.freeze({
 where:{en:'Where is this place? — {x}',zh:'这个地方在哪里？— {x}',ko:'이곳은 어디에 있나요? — {x}',es:'¿Dónde está este lugar? — {x}',ja:'この場所はどこですか？— {x}',fr:'Où se trouve cet endroit ? — {x}',de:'Wo ist dieser Ort? — {x}',ru:'Где находится это место? — {x}',it:"Dov'è questo posto? — {x}",pt:'Onde fica este lugar? — {x}',vi:'Nơi này ở đâu? — {x}',th:'สถานที่นี้อยู่ที่ไหน — {x}',tr:'Burası nerede? — {x}',id:'Di mana tempat ini? — {x}',pl:'Gdzie jest to miejsce? — {x}',el:'Πού είναι αυτό το μέρος; — {x}',uk:'Де знаходиться це місце? — {x}'},
 take:{en:'Please take me here. — {x}',zh:'请带我到这里。— {x}',ko:'여기로 데려다 주세요. — {x}',es:'Lléveme aquí, por favor. — {x}',ja:'ここまでお願いします。— {x}',fr:"Conduisez-moi ici, s'il vous plaît. — {x}",de:'Bitte bringen Sie mich hierher. — {x}',ru:'Отвезите меня сюда, пожалуйста. — {x}',it:'Mi porti qui, per favore. — {x}',pt:'Por favor, leve-me até aqui. — {x}',vi:'Vui lòng đưa tôi đến đây. — {x}',th:'กรุณาพาฉันมาที่นี่ — {x}',tr:'Lütfen beni buraya götürün. — {x}',id:'Tolong antar saya ke sini. — {x}',pl:'Proszę zabrać mnie tutaj. — {x}',el:'Παρακαλώ πηγαίνετέ με εδώ. — {x}',uk:'Будь ласка, відвезіть мене сюди. — {x}'},
 need:{en:'I need this. — {x}',zh:'我需要这个。— {x}',ko:'이것이 필요해요. — {x}',es:'Necesito esto. — {x}',ja:'これが必要です。— {x}',fr:"J'ai besoin de ceci. — {x}",de:'Ich brauche das. — {x}',ru:'Мне нужно это. — {x}',it:'Ho bisogno di questo. — {x}',pt:'Preciso disto. — {x}',vi:'Tôi cần thứ này. — {x}',th:'ฉันต้องการสิ่งนี้ — {x}',tr:'Buna ihtiyacım var. — {x}',id:'Saya membutuhkan ini. — {x}',pl:'Potrzebuję tego. — {x}',el:'Χρειάζομαι αυτό. — {x}',uk:'Мені потрібно це. — {x}'},
 find:{en:'Where can I find this? — {x}',zh:'在哪里可以找到这个？— {x}',ko:'이것은 어디에서 찾을 수 있나요? — {x}',es:'¿Dónde puedo encontrar esto? — {x}',ja:'これはどこにありますか？— {x}',fr:'Où puis-je trouver ceci ? — {x}',de:'Wo finde ich das? — {x}',ru:'Где я могу найти это? — {x}',it:'Dove posso trovare questo? — {x}',pt:'Onde posso encontrar isto? — {x}',vi:'Tôi có thể tìm thứ này ở đâu? — {x}',th:'ฉันจะหาสิ่งนี้ได้ที่ไหน — {x}',tr:'Bunu nerede bulabilirim? — {x}',id:'Di mana saya dapat menemukan ini? — {x}',pl:'Gdzie mogę to znaleźć? — {x}',el:'Πού μπορώ να βρω αυτό; — {x}',uk:'Де я можу знайти це? — {x}'},
 want:{en:'I would like this, please. — {x}',zh:'我想要这个，谢谢。— {x}',ko:'이것을 주세요. — {x}',es:'Quisiera esto, por favor. — {x}',ja:'これをお願いします。— {x}',fr:"Je voudrais ceci, s'il vous plaît. — {x}",de:'Ich hätte das gern, bitte. — {x}',ru:'Я бы хотел(а) это, пожалуйста. — {x}',it:'Vorrei questo, per favore. — {x}',pt:'Eu gostaria disto, por favor. — {x}',vi:'Cho tôi thứ này, làm ơn. — {x}',th:'ขอสิ่งนี้หน่อย — {x}',tr:'Bunu istiyorum, lütfen. — {x}',id:'Saya ingin ini, tolong. — {x}',pl:'Poproszę to. — {x}',el:'Θα ήθελα αυτό, παρακαλώ. — {x}',uk:'Я хотів/хотіла б це, будь ласка. — {x}'},
 bring:{en:'Can I have this, please? — {x}',zh:'请给我这个，好吗？— {x}',ko:'이것을 주시겠어요? — {x}',es:'¿Me trae esto, por favor? — {x}',ja:'これをいただけますか？— {x}',fr:"Puis-je avoir ceci, s'il vous plaît ? — {x}",de:'Kann ich das bitte bekommen? — {x}',ru:'Можно мне это, пожалуйста? — {x}',it:'Posso avere questo, per favore? — {x}',pt:'Pode me trazer isto, por favor? — {x}',vi:'Cho tôi thứ này được không? — {x}',th:'ขอสิ่งนี้ได้ไหม — {x}',tr:'Bunu alabilir miyim, lütfen? — {x}',id:'Boleh saya minta ini? — {x}',pl:'Czy mogę prosić o to? — {x}',el:'Μπορώ να έχω αυτό, παρακαλώ; — {x}',uk:'Можна мені це, будь ласка? — {x}'},
 lost:{en:'I lost this. — {x}',zh:'我把这个弄丢了。— {x}',ko:'이것을 잃어버렸어요. — {x}',es:'Perdí esto. — {x}',ja:'これをなくしました。— {x}',fr:"J'ai perdu ceci. — {x}",de:'Ich habe das verloren. — {x}',ru:'Я потерял(а) это. — {x}',it:'Ho perso questo. — {x}',pt:'Perdi isto. — {x}',vi:'Tôi đã làm mất thứ này. — {x}',th:'ฉันทำสิ่งนี้หาย — {x}',tr:'Bunu kaybettim. — {x}',id:'Saya kehilangan ini. — {x}',pl:'Zgubiłem/Zgubiłam to. — {x}',el:'Έχασα αυτό. — {x}',uk:'Я загубив/загубила це. — {x}'}
});

const GROUPS=Object.freeze([
 {template:'where',topic:2,category:'directions',ids:[79,966,684,647,312,340,465,745,772,982,711,220,493,343,188,520,969,810,543,517]},
 {template:'take',topic:2,category:'transportation',ids:[79,966,684,647,312,340,465,745,772,982,711,220,493,343,188,520,969,810,543,517]},
 {template:'need',topic:11,category:'essentials',ids:[78,81,5,84,160,314,473,494,527,584,262,278,371,256,317,726,191,64,441,672]},
 {template:'find',topic:4,category:'finding-essentials',ids:[78,81,5,84,160,314,473,494,527,584,262,278,371,256,317,726,191,64,441,672]},
 {template:'want',topic:3,category:'dining',ids:[360,219,342,346,301,302,316,372,484,555,285,631,737,125,651,634,379,387,580,922]},
 {template:'bring',topic:3,category:'dining-requests',ids:[360,219,342,346,301,302,316,372,484,555,285,631,737,125,651,634,379,387,580,922]},
 {template:'lost',topic:7,category:'lost-property',ids:[67,78,191,801,274,278,317,371,406,584,593,674,677,256,262,527,540,494,85,208]}
]);

const vocabularyById=new Map(data.vocabulary.map(item=>[Number(item.id),item]));
const currentIds=new Set(data.sentences.map(item=>Number(item.id)).filter(Number.isFinite));
let nextId=Math.max(2000,...currentIds)+1;
const generated=[];
for(const group of GROUPS){
 const template=TEMPLATES[group.template];
 for(const vocabularyId of group.ids){
  const source=vocabularyById.get(vocabularyId);if(!source?.forms)continue;
  const forms={};
  for(const language of LANGUAGES){const term=String(source.forms[language]||source.forms.en||'').trim(),pattern=String(template[language]||template.en);forms[language]=pattern.replaceAll('{x}',term);}
  generated.push({id:nextId++,topic:group.topic,travel:true,travelCategory:group.category,sourceVocabularyId:vocabularyId,forms});
 }
}

if(generated.length!==140)throw new Error(`Travel phrase expansion expected 140 records but generated ${generated.length}.`);
data.sentences.push(...generated);
data.travelPhraseExpansionVersion=1;
data.travelPhraseCount=200;
window.LANGUAGE_MINER_TRAVEL_PHRASES=Object.freeze({version:1,total:200,added:generated.length,languages:Object.freeze([...LANGUAGES]),categories:Object.freeze(GROUPS.map(group=>group.category))});
})();
