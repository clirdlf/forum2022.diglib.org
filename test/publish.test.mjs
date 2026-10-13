import test from 'node:test';import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,readFile,chmod,rm,readdir} from 'node:fs/promises';import {join} from 'node:path';
import {publishStaged} from '../scripts/lib/publish.mjs';
test('a mid-publication rename failure restores previously replaced files',async t=>{
 if(process.getuid?.()===0){t.skip('root bypasses the filesystem write protection used by this fixture');return;}
 const dir=await mkdtemp('/private/tmp/publish-');const locked=join(dir,'locked');await mkdir(locked);const first=join(dir,'first'),second=join(locked,'second'),a=join(dir,'a'),b=join(dir,'b');await writeFile(first,'old first');await writeFile(second,'old second');await writeFile(a,'new first');await writeFile(b,'new second');await chmod(locked,0o500);
 try{await assert.rejects(publishStaged([{staged:a,target:first},{staged:b,target:second}]),/EACCES|EPERM/);assert.equal(await readFile(first,'utf8'),'old first');assert.equal(await readFile(second,'utf8'),'old second');assert.equal((await readdir(dir)).some(x=>x.includes('.backup-')),false);}finally{await chmod(locked,0o700);await rm(dir,{recursive:true});}
});
