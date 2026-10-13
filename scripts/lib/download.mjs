import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
const run=promisify(execFile);
export async function fetchResource(url) {
 const {stdout}=await run('curl',['--location','--silent','--show-error','--retry','2','--max-time','60','--write-out','\n__ARCHIVE_META__%{http_code}\t%{content_type}\t%{url_effective}',url],{encoding:'buffer',maxBuffer:100*1024*1024});
 const marker=Buffer.from('\n__ARCHIVE_META__');const end=stdout.lastIndexOf(marker);
 if(end<0)throw new Error(`Missing response metadata: ${url}`);
 const [status,contentType,finalUrl]=stdout.subarray(end+marker.length).toString().split('\t');
 return {status:Number(status),contentType,finalUrl,bytes:stdout.subarray(0,end)};
}
export async function fetchPage(url) {const response=await fetchResource(url);return {...response,body:response.bytes.toString('utf8')};}
