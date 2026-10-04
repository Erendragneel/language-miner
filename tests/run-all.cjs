const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const out=path.resolve(process.env.TEST_RESULTS_DIR||'work/release-regression');fs.mkdirSync(out,{recursive:true});
(async()=>{
 const results=[];
 for(const name of fs.readdirSync(__dirname).filter(name=>name.endsWith('.test.cjs'))){
  const start=Date.now();console.log('START',name);
  const result=await new Promise(resolve=>cp.execFile(process.execPath,[path.join(__dirname,name)],{env:process.env,timeout:180000,maxBuffer:8e6},(error,stdout,stderr)=>{
   fs.writeFileSync(path.join(out,name+'.log'),stdout+'\n'+stderr);
   resolve({name,passed:!error,durationMs:Date.now()-start,error:error?{message:error.message,code:error.code,killed:error.killed}:null});
  }));
  results.push(result);console.log(result.passed?'PASS':'FAIL',name);
  fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(results,null,2));
 }
 if(results.some(r=>!r.passed))process.exitCode=1;
})().catch(error=>{console.error(error);process.exitCode=1;});
