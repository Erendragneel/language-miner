'use strict';
// Compatibility entry point for the replacement live action walkthrough.
module.exports=require('./guided-beginner-tutorial-browser.test.cjs');
if(require.main===module){
 const result=require('node:child_process').spawnSync(process.execPath,[require.resolve('./guided-beginner-tutorial-browser.test.cjs')],{stdio:'inherit'});
 if(result.error)throw result.error;
 process.exitCode=result.status??1;
}
