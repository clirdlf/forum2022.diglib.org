import {load} from 'cheerio';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {join} from 'node:path';
export const hash = value => createHash('sha256').update(value).digest('hex');
export function isContentUrl(url, origin) {
 return url.origin===origin && !/^\/(wp-admin|wp-json|wp-content|wp-includes|cdn-cgi|feed|comments)(\/|$)/.test(url.pathname) && !/\.(?:jpg|jpeg|png|webp|gif|svg|pdf|docx?|xlsx?|zip|mp[34]|css|js|woff2?|ico|xml)$/i.test(url.pathname) && !url.pathname.endsWith('/feed/') && [...url.searchParams.keys()].every(k=>['paged','page'].includes(k));
}
export async function crawlPublicSite({origin,records,fetchPage,cacheDir}) {
 await mkdir(cacheDir,{recursive:true});const queue=[origin+'/'];const seen=new Set();const captures=[];const issues=[];const aliases=[];
 const byPath=new Map(records.filter(r=>['page','post'].includes(r.type)&&!new URL(r.url).search).map(r=>[r.path,r]));
 while(queue.length){
  const requestUrl=queue.shift();if(seen.has(requestUrl))continue;seen.add(requestUrl);
  const request=new URL(requestUrl);const record=byPath.get(request.pathname);
  if(record && (record.status!=='publish' || !['page','post'].includes(record.type)))continue;
  const file=join(cacheDir,hash(requestUrl)+'.json');let capture;
  try{capture=JSON.parse(await readFile(file,'utf8'));}catch{
   const response=await fetchPage(requestUrl);
   if(response.status===404 && !record){issues.push({url:requestUrl,status:404,reason:'Dead source link'});continue;}
   if(response.status!==200 || !response.contentType?.includes('text/html') || !response.body || /challenge-platform|<title>\s*(?:Just a moment|Attention Required)/i.test(response.body) || !load(response.body)('main,#content').length)throw Error(`Invalid or challenge HTML: ${requestUrl}`);
   const final=new URL(response.finalUrl||requestUrl);if(final.origin!==origin)throw Error(`Unexpected off-site redirect: ${requestUrl}`);
   capture={url:final.href,path:final.pathname,html:response.body,sourceHash:hash(response.body)};
   await writeFile(file,JSON.stringify(capture));
  }
  if(request.pathname!==capture.path)aliases.push({path:request.pathname,target:capture.path});
  if(!captures.some(c=>c.url===capture.url))captures.push(capture);
  const $=load(capture.html);
  for(const a of $('a[href]').toArray()){
   const href=$(a).attr('href');let u;try{u=new URL(href,capture.url);}catch{continue;}u.hash='';
   if(isContentUrl(u,origin) && !seen.has(u.href))queue.push(u.href);
  }
 }
 const paths=new Set(captures.map(c=>c.path));
 const eligible=records.filter(r=>r.status==='publish'&&['page','post'].includes(r.type));
 return {captures,included:eligible.filter(r=>paths.has(r.path)),excluded:eligible.filter(r=>!paths.has(r.path)),aliases,issues};
}
