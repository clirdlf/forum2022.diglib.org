export function applyCorrections(html, path, corrections) {
  for (const correction of corrections[path] || []) {
    if (typeof correction.find !== 'string' || !correction.find || typeof correction.replace !== 'string') throw Error(`Invalid content correction for ${path}`);
    if (!html.includes(correction.find)) throw Error(`Stale content correction for ${path}: original text not found`);
    html = html.replaceAll(correction.find, correction.replace);
  }
  return html;
}
