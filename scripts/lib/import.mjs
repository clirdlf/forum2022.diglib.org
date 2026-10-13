import {load} from 'cheerio';
import {writeFile,mkdir,rm,mkdtemp,cp} from 'node:fs/promises';
import {join,dirname,resolve} from 'node:path';
import {publishStaged} from './publish.mjs';
import {parseExport} from './wxr.mjs';
import {crawlPublicSite} from './crawl.mjs';
import {normalizePage} from './normalize.mjs';
import {collectAssetUrls,localizeAssets} from './assets.mjs';

export async function importSite({origin,xml,fetchPage,fetchAsset,cacheDir,archiveDir,sourceDir,inventoryOnly=false,refresh=false}) {
 const pageCache=join(cacheDir,'pages');const assetCache=join(cacheDir,'assets');
 if(refresh){await rm(pageCache,{recursive:true,force:true});await rm(assetCache,{recursive:true,force:true});}
 const records=parseExport(xml);
 const result=await crawlPublicSite({origin,records,fetchPage,cacheDir:pageCache});
 const publicRecord=({metadata,contentHtml,...record})=>record;
 const manifest={origin,capturedAt:new Date().toISOString(),included:result.included.map(publicRecord),excluded:result.excluded.map(publicRecord),aliases:result.aliases,captures:result.captures.map(({html,...capture})=>capture),issues:result.issues};
 await mkdir(archiveDir,{recursive:true});
 console.log(`Inventoried ${result.included.length} exported records and ${result.captures.length} public routes; excluded ${result.excluded.length}.`);
 if(inventoryOnly){await writeFile(join(archiveDir,'inventory.json'),JSON.stringify(manifest,null,2)+'\n');return manifest;}
 const urls=new Set(result.captures.flatMap(c=>[...collectAssetUrls(c.html,c.url)]));
 for(const capture of result.captures){const $=load(capture.html);$('script[src]').each((_,e)=>{const url=$(e).attr('src');if(url.includes('/swiper/')&&url.includes('.js'))urls.add(new URL(url,capture.url).href);});}
 const stage=await mkdtemp(join(dirname(resolve(archiveDir)),'.archive-import-'));
 const stagedArchive=join(stage,'archive'),stagedSource=join(stage,'src');
 try {
 await cp(archiveDir,stagedArchive,{recursive:true});
 const assets=await localizeAssets({urls,fetchAsset,outputDir:join(stagedSource,'assets/vendor'),cacheDir:assetCache});
 manifest.assetMap=Object.fromEntries(Object.entries(assets.assetMap).sort(([a],[b])=>a.localeCompare(b)));
 manifest.issues.push(...assets.issues);
 const normalized=result.captures.map(c=>normalizePage(c,result.included.find(r=>r.path===c.path)||null,manifest.assetMap));
 await mkdir(join(stagedArchive,'bodies'),{recursive:true});await mkdir(join(stagedSource,'_includes/partials'),{recursive:true});
 for(const entry of normalized){
  await writeFile(join(stagedArchive,'bodies',entry.page.bodyFile),entry.bodyHtml);
  manifest.issues.push(...entry.issues);
  if(entry.page.path==='/'){await writeFile(join(stagedSource,'_includes/partials/header.njk'),entry.chrome.headerHtml);await writeFile(join(stagedSource,'_includes/partials/footer.njk'),entry.chrome.footerHtml);}
 }
 // Stage the complete import before replacing any build input.
 await writeFile(join(stagedArchive,'pages.json'),JSON.stringify(normalized.map(r=>r.page),null,2)+'\n');
 await writeFile(join(stagedArchive,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
 await publishStaged([
  {staged:stagedArchive,target:archiveDir},
  ...['assets/vendor','_includes/partials/header.njk','_includes/partials/footer.njk'].map(path=>({staged:join(stagedSource,path),target:join(sourceDir,path)})),
 ]);
 console.log(`Localized ${Object.keys(manifest.assetMap).length} assets; prepared ${normalized.length} Eleventy records.`);
 return manifest;
 } finally { await rm(stage,{recursive:true,force:true}); }
}
