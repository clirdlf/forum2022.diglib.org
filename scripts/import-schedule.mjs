import {mkdir,readFile,writeFile,rm} from 'node:fs/promises';
import {join} from 'node:path';
import {fetchPage} from './lib/download.mjs';
import {hash} from './lib/crawl.mjs';
import {parseScheduleIndex,parseScheduleDetail} from './lib/schedule.mjs';
import {publishStaged} from './lib/publish.mjs';
const origin='https://clirevents2022.sched.com/';
const flags=new Set(process.argv.slice(2));
for(const flag of flags)if(flag!=='--refresh')throw Error('Unknown option: '+flag);
const cache='.cache/schedule';
if(flags.has('--refresh'))await rm(cache,{recursive:true,force:true});
await mkdir(cache,{recursive:true});
async function capture(url,parse){
 const file=join(cache,hash(url)+'.html');let html;
 try{html=await readFile(file,'utf8');return {parsed:parse(html),sourceHash:hash(html)};}catch{}
 const response=await fetchPage(url);
 if(response.status!==200||!response.contentType?.includes('text/html')||new URL(response.finalUrl||url).origin!==new URL(origin).origin||/challenge-platform|<title>\s*(Just a moment|Attention Required)/i.test(response.body))throw Error('Invalid public schedule response: '+url);
 html=response.body;const parsed=parse(html);await writeFile(file,html);return {parsed,sourceHash:hash(html)};
}
const index=await capture(origin,parseScheduleIndex);const sessions=index.parsed;let completed=0;
for(let offset=0;offset<sessions.length;offset+=4){
 await Promise.all(sessions.slice(offset,offset+4).map(async session=>{
  const detail=await capture(session.url,parseScheduleDetail);Object.assign(session,detail.parsed,{sourceHash:detail.sourceHash});
  if(++completed%20===0)console.log(`Captured ${completed}/${sessions.length} sessions…`);
 }));
}
const program={source:origin,capturedAt:new Date().toISOString(),indexHash:index.sourceHash,timezone:'America/New_York',sessions};
await mkdir('data/schedule',{recursive:true});
const staged='data/schedule/program.staged.json';
try{await writeFile(staged,JSON.stringify(program,null,2)+'\n');await publishStaged([{staged,target:'data/schedule/program.json'}]);}finally{await rm(staged,{force:true});}
console.log(`Preserved ${sessions.length} sessions across ${new Set(sessions.map(s=>s.date)).size} days.`);
