import {load} from 'cheerio';
import {enhanceAccessibility} from './accessibility.mjs';
import {applyCorrections} from './content-corrections.mjs';

export function preparePage(page, body, corrections) {
  const correctedBody = applyCorrections(body, page.path, corrections);
  const searchText = load(correctedBody.replace(/<[^>]*>/g, ' ')).text().replace(/\s+/g, ' ').trim();
  return {...page, bodyHtml: enhanceAccessibility(correctedBody), searchText};
}
