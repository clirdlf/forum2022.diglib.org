import {JSDOM} from 'jsdom';
import axe from 'axe-core';
import {readFile,readdir,mkdir,writeFile} from 'node:fs/promises';
import {join,relative,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {init as navigation} from '../src/assets/js/navigation.js';
import {init as disclosures} from '../src/assets/js/disclosures.js';

export async function auditHtml(html) {
  // No resource loader: external embeds, imported scripts and CSS are never fetched.
  const dom=new JSDOM(html,{url:'https://forum2022.diglib.org/',runScripts:'outside-only'});
  const saved={};
  for(const key of ['document','location','addEventListener','scrollY']){
    saved[key]=globalThis[key];
    globalThis[key]=key==='addEventListener'?dom.window.addEventListener.bind(dom.window):key==='scrollY'?0:dom.window[key];
  }
  try{
    navigation(dom.window.document);disclosures(dom.window.document);
    dom.window.eval(axe.source);
    const result=await dom.window.axe.run(dom.window.document,{
      preload:false,iframes:false,
      runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']},
      rules:{'color-contrast':{enabled:false}},
    });
    return Array.from(result.violations,v=>({id:v.id,impact:v.impact,help:v.help,url:v.helpUrl,nodes:v.nodes.map(n=>({html:n.html,target:n.target,reason:n.failureSummary}))}));
  }finally{
    for(const key of Object.keys(saved))if(saved[key]===undefined)delete globalThis[key];else globalThis[key]=saved[key];
    dom.window.close();
  }
}
async function walk(dir){const paths=[];for(const e of await readdir(dir,{withFileTypes:true})){const path=join(dir,e.name);if(e.isDirectory())paths.push(...await walk(path));else if(e.name.endsWith('.html'))paths.push(path);}return paths;}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const files=await walk('_site');const findings=[];
 for(const file of files){const violations=await auditHtml(await readFile(file,'utf8'));if(violations.length)findings.push({file:relative('_site',file),violations});}
 await mkdir('.cache',{recursive:true});await writeFile('.cache/accessibility-results.json',JSON.stringify({routes:files.length,findings},null,2)+'\n');
 console.log(`Accessibility semantics: ${files.length} HTML routes, ${findings.reduce((n,f)=>n+f.violations.length,0)} rule violations.`);
 if(findings.length){console.log(JSON.stringify(findings,null,2));process.exitCode=1;}
 console.log('Layout, contrast, screen-reader interaction and third-party content require browser/manual checks.');
}
