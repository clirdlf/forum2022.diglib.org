import {readFile} from 'node:fs/promises';
import {preparePage} from '../../scripts/lib/archive-data.mjs';

export default async function() {
  const corrections = JSON.parse(await readFile('data/content-corrections.json', 'utf8'));
  const pages = JSON.parse(await readFile('data/archive/pages.json', 'utf8'));
  return Promise.all(pages.map(async page => preparePage(page, await readFile('data/archive/bodies/' + page.bodyFile, 'utf8'), corrections)));
}
