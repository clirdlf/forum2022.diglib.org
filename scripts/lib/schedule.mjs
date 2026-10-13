import {load} from 'cheerio';
const origin = 'https://clirevents2022.sched.com/';
const text = ($, selector) => $(selector).text().replace(/\s+/g, ' ').trim();
export function parseScheduleIndex(html) {
  const $ = load(html); const sessions = []; const seen = new Set();
  let date, day, time;
  const inner=$('#sched-content-inner');const list=inner.find('.list-simple').first();
  (list.length?list:inner).children().each((_, element) => {
    const e = $(element);
    if (e.hasClass('sched-container-anchor')) date = e.attr('id');
    if (e.hasClass('sched-container-header')) day = text($, e.find('.sched-current-date'));
    if (element.name === 'h3') time = text($, e);
    if (!e.hasClass('sched-container')) return;
    e.find('a.name[href^="event/"]').each((_, link) => {
      const a = $(link); const url = new URL(a.attr('href'), origin); const id = url.pathname.split('/')[2];
      if (seen.has(id)) return; seen.add(id);
      if (!/^2022-10-\d\d$/.test(date || '') || !day || !time || !a.find('.session-title').length) throw Error('Incomplete schedule session: ' + url.href);
      sessions.push({id, date, day, time, title: text($, a.find('.session-title')), venue: text($, a.find('.vs')), url: url.href});
    });
  });
  if (!sessions.length) throw Error('No schedule sessions found');
  return sessions;
}
export function parseScheduleDetail(html) {
  const $ = load(html);
  if (!$('.sched-event-details').length && !$('.tip-description').length) throw Error('No session detail found');
  const description = load($('.tip-description').first().html() || '', null, false);
  description('script,style,iframe,object,embed,form,svg').remove();
  const allowed = new Set(['p','br','strong','b','em','i','u','ul','ol','li','a','h3','h4','blockquote']);
  description('*').toArray().reverse().forEach(e => {
    if (!allowed.has(e.name)) { description(e).replaceWith(description(e).contents()); return; }
    const href = e.name === 'a' ? e.attribs.href : null;
    for (const attr of Object.keys(e.attribs)) description(e).removeAttr(attr);
    if (href) { const url = new URL(href, origin); if (/^https?:$/.test(url.protocol)) description(e).attr('href', url.href); }
  });
  return {
    descriptionHtml: description.html().trim(),
    speakers: [...new Set($('.sched-event-details-roles h2').toArray().map(e => text($, e)))],
    timeAndPlace: text($, '.sched-event-details-timeandplace'),
    type: text($, '.sched-event-type'),
  };
}
