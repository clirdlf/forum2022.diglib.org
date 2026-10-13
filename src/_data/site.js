import {readFile} from 'node:fs/promises';
export default async function(){
 const manifest=JSON.parse(await readFile('data/archive/manifest.json','utf8'));
 const pages=JSON.parse(await readFile('data/archive/pages.json','utf8'));
 return {
  swiperUrl:Object.entries(manifest.assetMap).find(([url])=>url.includes('/swiper/')&&new URL(url).pathname.endsWith('.js'))?.[1],
  defaultHead:pages.find(p=>p.path==='/').headHtml,
 };
}
