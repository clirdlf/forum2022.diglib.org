import {load} from 'cheerio';import postcss from 'postcss';import valueParser from 'postcss-value-parser';
import {mkdir,readFile,writeFile,rm} from 'node:fs/promises';import {basename,join} from 'node:path';import {hash} from './crawl.mjs';
export const excludedAsset = url => /pojo-accessibility|wp-accessibility|googletagmanager|google-analytics|monsterinsights|ivory-search/i.test(url);
export function resolveAsset(value,base){if(!value||/^(?:data:|#|mailto:|tel:|javascript:)/i.test(value))return null;try{const u=new URL(value,base);u.hash='';return /^https?:$/.test(u.protocol)&&!excludedAsset(u.href)?u.href:null;}catch{return null;}}
function visitCss(css,base,callback){
 const root=postcss.parse(css);const visit=value=>{const parsed=valueParser(value);parsed.walk(node=>{if(node.type==='function'&&node.value.toLowerCase()==='url'){const raw=valueParser.stringify(node.nodes).replace(/^['"]|['"]$/g,'');const u=resolveAsset(raw,base);if(u){const next=callback(u);if(next)node.nodes=[{type:'word',value:next}];}return false;}});return parsed.toString();};
 root.walkDecls(d=>{d.value=visit(d.value);});root.walkAtRules('import',r=>{const p=valueParser(r.params);const first=p.nodes[0];if(first?.type==='string'){const u=resolveAsset(first.value,base);if(u){const next=callback(u);if(next)first.value=next;}r.params=p.toString();}else r.params=visit(r.params);});return root.toString();
}
export function rewriteCss(css,sourceUrl,assetMap){return visitCss(css,sourceUrl,u=>assetMap[u]);}
export function collectAssetUrls(html,pageUrl){const $=load(html);const urls=new Set();const add=v=>{const u=resolveAsset(v,pageUrl);if(u)urls.add(u);};
 $('img,video,audio,source,track').each((_,e)=>{for(const attr of ['src','poster','data-src'])add($(e).attr(attr));const set=$(e).attr('srcset');if(set)for(const candidate of set.split(','))add(candidate.trim().split(/\s+/)[0]);});
 $('link[rel="stylesheet"],link[rel="icon"],link[rel="apple-touch-icon"]').each((_,e)=>add($(e).attr('href')));
 $('a[href]').each((_,e)=>{const u=resolveAsset($(e).attr('href'),pageUrl);if(u&&new URL(u).origin===new URL(pageUrl).origin&&/\.(pdf|docx?|xlsx?|zip|mp[34])$/i.test(new URL(u).pathname))add(u);});
 $('style').each((_,e)=>visitCss($(e).html()||'',pageUrl,u=>{urls.add(u);}));
 $('[style]').each((_,e)=>visitCss('x{'+$(e).attr('style')+'}',pageUrl,u=>{urls.add(u);}));
 return urls;
}
function validateAsset(r,url){
 const pathname=new URL(url).pathname;const type=(r.contentType||'').split(';')[0].trim().toLowerCase();const css=/\.css$/i.test(pathname)||type==='text/css';
 const sample=r.bytes?.subarray(0,2000).toString()||'';
 const expected=css?/^text\/css$/:/\.(png|jpe?g|gif|webp|svg|ico|avif)$/i.test(pathname)?/^image\//:/\.(woff2?|ttf|otf|eot)$/i.test(pathname)?/^(font\/|application\/(font|x-font|vnd.ms-fontobject))/:/\.pdf$/i.test(pathname)?/^application\/pdf$/:/\.(mp4|webm)$/i.test(pathname)?/^video\//:/\.(mp3|ogg|wav)$/i.test(pathname)?/^audio\//:/\.js$/i.test(pathname)?/^(application|text)\/javascript$/:null;
 if(r.status!==200||!r.bytes?.length||/html|json/.test(type)||/challenge-platform|<title>\s*(Just a moment|Attention Required)|^\s*(?:<!doctype html|<html)/i.test(sample)||(expected&&!expected.test(type)&&!(type==='application/octet-stream'&&!css)))throw Error(`Invalid asset response/type: ${url} (${r.status} ${r.contentType})`);
 if(css)visitCss(r.bytes.toString('utf8'),url,()=>{});
 return css;
}
export async function localizeAssets({urls,fetchAsset,outputDir,cacheDir}){
 await mkdir(outputDir,{recursive:true});if(cacheDir)await mkdir(cacheDir,{recursive:true});
 const pending=[...urls];const seen=new Set();const assetMap={};const styles=[];const issues=[];let count=0;
 while(pending.length){const batch=pending.splice(0,6).filter(u=>!seen.has(u));batch.forEach(u=>seen.add(u));
  await Promise.all(batch.map(async url=>{
   let r;const cache=cacheDir&&join(cacheDir,hash(url)+'.json');
   try{if(!cache)throw Error('no cache');const saved=JSON.parse(await readFile(cache,'utf8'));r={...saved,bytes:Buffer.from(saved.base64,'base64')};validateAsset(r,url);}catch{if(cache)await rm(cache,{force:true});r=await fetchAsset(url);}
   const css=validateAsset(r,url);
   if(cache)await writeFile(cache,JSON.stringify({status:r.status,contentType:r.contentType,base64:r.bytes.toString('base64')}));
   const pathname=new URL(url).pathname;
   let name=basename(decodeURIComponent(pathname)).replace(/[^a-zA-Z0-9._-]/g,'_')||'asset';if(css&&!name.endsWith('.css'))name+='.css';
   const file=hash(url).slice(0,12)+'-'+name;assetMap[url]='/assets/vendor/'+file;
   if(css){const source=r.bytes.toString('utf8');styles.push({url,file,source});visitCss(source,url,u=>{if(!seen.has(u))pending.push(u);});}else await writeFile(join(outputDir,file),r.bytes);
   count++;if(cacheDir&&count%50===0)console.log(`Captured ${count} assets…`);
  }));
 }
 for(const {url,file,source} of styles)await writeFile(join(outputDir,file),rewriteCss(source,url,assetMap));
 return {assetMap,issues};
}
