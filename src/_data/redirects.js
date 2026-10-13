import {readFile} from 'node:fs/promises';export default async function(){return JSON.parse(await readFile('data/archive/manifest.json','utf8')).aliases||[];}
