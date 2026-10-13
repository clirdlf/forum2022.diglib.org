import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {parseExport} from './lib/wxr.mjs';import {crawlPublicSite} from './lib/crawl.mjs';import {fetchPage} from './lib/download.mjs';
const origin='https://forum2022.diglib.org';
const records=parseExport(await readFile('data/dlfforum2022.WordPress.2026-10-13.xml','utf8'));
const result=await crawlPublicSite({origin,records,fetchPage,cacheDir:'.cache/pages'});
await mkdir('data/archive',{recursive:true});
await writeFile('data/archive/manifest.json',JSON.stringify({origin,capturedAt:new Date().toISOString(),included:result.included.map(({metadata,contentHtml,...r})=>r),excluded:result.excluded.map(({metadata,contentHtml,...r})=>r),captures:result.captures.map(({html,...c})=>c),issues:result.issues},null,2)+'\n');
console.log(`Inventoried ${result.included.length} exported records and ${result.captures.length} public routes; excluded ${result.excluded.length}.`);
