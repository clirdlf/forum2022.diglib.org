import {readFile} from 'node:fs/promises';
export default async function(){const pages=JSON.parse(await readFile('data/archive/pages.json','utf8'));return Promise.all(pages.map(async page=>({...page,bodyHtml:await readFile('data/archive/bodies/'+page.bodyFile,'utf8')})));}
