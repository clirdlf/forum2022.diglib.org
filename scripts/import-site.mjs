import {load} from 'cheerio';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {parseExport} from './lib/wxr.mjs';import {crawlPublicSite} from './lib/crawl.mjs';import {fetchPage} from './lib/download.mjs';
import {normalizePage} from './lib/normalize.mjs';
import {collectAssetUrls,localizeAssets} from './lib/assets.mjs';import {fetchResource} from './lib/download.mjs';
const origin='https://forum2022.diglib.org';
const records=parseExport(await readFile('data/dlfforum2022.WordPress.2026-10-13.xml','utf8'));
const result=await crawlPublicSite({origin,records,fetchPage,cacheDir:'.cache/pages'});
await mkdir('data/archive',{recursive:true});
await writeFile('data/archive/manifest.json',JSON.stringify({origin,capturedAt:new Date().toISOString(),included:result.included.map(({metadata,contentHtml,...r})=>r),excluded:result.excluded.map(({metadata,contentHtml,...r})=>r),aliases:result.aliases,captures:result.captures.map(({html,...c})=>c),issues:result.issues},null,2)+'\n');
console.log(`Inventoried ${result.included.length} exported records and ${result.captures.length} public routes; excluded ${result.excluded.length}.`);

if(!process.argv.includes('--inventory-only')){
 const urls=new Set(result.captures.flatMap(c=>[...collectAssetUrls(c.html,c.url)]));
 for(const c of result.captures){const $=load(c.html);$('script[src]').each((_,e)=>{const url=$(e).attr('src');if(url.includes('/swiper/')&&url.includes('.js'))urls.add(url);});}
 const assets=await localizeAssets({urls,fetchAsset:fetchResource,outputDir:'src/assets/vendor',cacheDir:'.cache/assets'});
 const manifest=JSON.parse(await readFile('data/archive/manifest.json','utf8'));manifest.assetMap=assets.assetMap;manifest.issues.push(...assets.issues);await writeFile('data/archive/manifest.json',JSON.stringify(manifest,null,2)+'\n');
 console.log(`Localized ${Object.keys(assets.assetMap).length} assets.`);
 await mkdir('data/archive/bodies',{recursive:true});await mkdir('src/_includes/partials',{recursive:true});
 const pages=[];
 for(const capture of result.captures){
  const record=result.included.find(r=>r.path===capture.path)||null;
  const normalized=normalizePage(capture,record,assets.assetMap);
  pages.push(normalized.page);await writeFile('data/archive/bodies/'+normalized.page.bodyFile,normalized.bodyHtml);
  manifest.issues.push(...normalized.issues);
  if(capture.path==='/'){await writeFile('src/_includes/partials/header.njk',normalized.chrome.headerHtml);await writeFile('src/_includes/partials/footer.njk',normalized.chrome.footerHtml);}
 }
 await writeFile('data/archive/pages.json',JSON.stringify(pages,null,2)+'\n');
 await writeFile('data/archive/manifest.json',JSON.stringify(manifest,null,2)+'\n');
 console.log(`Prepared ${pages.length} Eleventy page records.`);
}
