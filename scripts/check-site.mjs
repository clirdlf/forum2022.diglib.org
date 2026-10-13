import {readdir,readFile} from 'node:fs/promises';import {join,relative,resolve} from 'node:path';import {fileURLToPath} from 'node:url';import {load} from 'cheerio';import postcss from 'postcss';import valueParser from 'postcss-value-parser';
async function walk(dir){const files=[];for(const e of await readdir(dir,{withFileTypes:true})){const path=join(dir,e.name);if(e.isDirectory())files.push(...await walk(path));else files.push(path);}return files;}
export async function checkSite(outputDir,{knownDeadLinks=[]}={}){
 const origin='https://forum2022.diglib.org';const files=await walk(outputDir);const paths=new Set(files.map(f=>'/'+relative(outputDir,f).replaceAll('\\','/')));const html=new Map();const errors=[];const warnings=[];const routes=[];
 for(const file of files.filter(f=>f.endsWith('.html'))){const path='/'+relative(outputDir,file).replaceAll('\\','/');const $=load(await readFile(file,'utf8'));html.set(path,{file,$,ids:new Set($('[id],[name]').toArray().flatMap(e=>[e.attribs.id,e.attribs.name].filter(Boolean)))});routes.push(path.endsWith('index.html')?path.slice(0,-10):path);}
 const seen=new Set();const report=(file,url,reason,warning=false)=>{const key=[file,url,reason].join('|');if(seen.has(key))return;seen.add(key);(warning?warnings:errors).push({file:relative(outputDir,file),url,reason});};
 const check=(file,url,base,resource=false)=>{
  if(!url||/^(data:|mailto:|tel:|javascript:)/i.test(url))return;
  let target;try{target=new URL(url,origin+base);}catch{report(file,url,'Invalid URL');return;}if(target.origin!==origin)return;
  if(/^\/(wp-admin|wp-json|wp-includes|cdn-cgi)(\/|$)/.test(target.pathname)){report(file,url,'WordPress backend dependency');return;}
  let path;try{path=decodeURIComponent(target.pathname);}catch{report(file,url,'Invalid URL encoding');return;}
  if(paths.has(path+'/index.html'))path+='/index.html';else if(path.endsWith('/'))path+='index.html';
  if(!paths.has(path)){const known=knownDeadLinks.some(u=>new URL(u,origin).pathname===target.pathname);report(file,url,known?'Pre-existing dead source link':resource?'Missing asset':'Missing route',known);return;}
  if(!resource&&target.hash&&target.hash!=='#'&&html.has(path)){let id;try{id=decodeURIComponent(target.hash.slice(1));}catch{report(file,url,'Invalid fragment');return;}if(!html.get(path).ids.has(id))report(file,url,'Missing fragment');}
 };
 const cssRefs=(css,callback)=>{const root=postcss.parse(css);const value=v=>valueParser(v).walk(n=>{if(n.type==='function'&&n.value==='url'){callback(valueParser.stringify(n.nodes).replace(/^['"]|['"]$/g,''));return false;}});root.walkDecls(d=>value(d.value));root.walkAtRules('import',r=>{const parsed=valueParser(r.params);if(parsed.nodes[0]?.type==='string')callback(parsed.nodes[0].value);else value(r.params);});};
 for(const [path,{file,$}] of html){const base=path.endsWith('index.html')?path.slice(0,-10):path;
  $('a[href]').each((_,e)=>check(file,$(e).attr('href'),base));
  $('img,video,audio,source,track,script,iframe').each((_,e)=>{for(const attr of ['src','poster','data-src'])check(file,$(e).attr(attr),base,true);const srcset=$(e).attr('srcset');if(srcset)for(const candidate of srcset.split(','))check(file,candidate.trim().split(/\s+/)[0],base,true);});
  $('link[rel="stylesheet"],link[rel="icon"],link[rel="apple-touch-icon"]').each((_,e)=>check(file,$(e).attr('href'),base,true));
  $('style').each((_,e)=>cssRefs($(e).html()||'',url=>check(file,url,base,true)));
  $('[style]').each((_,e)=>cssRefs('x{'+$(e).attr('style')+'}',url=>check(file,url,base,true)));
  if($('#wpadminbar,#pojo-a11y-toolbar').length)report(file,'','Excluded admin/widget markup');
 }
 for(const file of files.filter(f=>f.endsWith('.css'))){const base='/'+relative(outputDir,file).replaceAll('\\','/');cssRefs(await readFile(file,'utf8'),url=>{if(!url.startsWith('#'))check(file,url,base,true);});}
 for(const file of files.filter(f=>f.endsWith('.js')&&!f.includes('/vendor/'))){const base='/'+relative(outputDir,file).replaceAll('\\','/');const source=await readFile(file,'utf8');for(const match of source.matchAll(/\bfrom\s+['"]([^'"]+)['"]/g))check(file,match[1],base,true);}
 return {errors,warnings,routes};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const manifest=JSON.parse(await readFile('data/archive/manifest.json','utf8'));const result=await checkSite('_site',{knownDeadLinks:manifest.issues.filter(i=>i.status===404).map(i=>i.url)});
 for(const capture of manifest.captures)if(!result.routes.includes(capture.path))result.errors.push({file:'manifest',url:capture.path,reason:'Missing imported route'});
 console.log(`Checked ${result.routes.length} HTML routes: ${result.errors.length} errors, ${result.warnings.length} known-source warnings.`);
 if(result.errors.length||result.warnings.length)console.log(JSON.stringify({errors:result.errors,warnings:result.warnings},null,2));
 await writeReport(result);if(result.errors.length)process.exitCode=1;
}
async function writeReport(result){const {writeFile,mkdir}=await import('node:fs/promises');await mkdir('.cache',{recursive:true});await writeFile('.cache/check-results.json',JSON.stringify(result,null,2)+'\n');}
