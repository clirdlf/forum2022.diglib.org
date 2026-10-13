import {readFile} from 'node:fs/promises';
import {importSite} from './lib/import.mjs';
import {fetchPage,fetchResource} from './lib/download.mjs';
const flags=new Set(process.argv.slice(2));
for(const flag of flags)if(!['--refresh','--inventory-only'].includes(flag))throw Error(`Unknown option: ${flag}`);
await importSite({
 origin:'https://forum2022.diglib.org',
 xml:await readFile('data/dlfforum2022.WordPress.2026-10-13.xml','utf8'),
 fetchPage,fetchAsset:fetchResource,cacheDir:'.cache',archiveDir:'data/archive',sourceDir:'src',
 refresh:flags.has('--refresh'),inventoryOnly:flags.has('--inventory-only'),
});
