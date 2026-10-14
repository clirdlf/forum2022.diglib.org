import {load} from 'cheerio';

// Reapplied during every build, so importing fresh WordPress HTML cannot undo repairs.
export function enhanceAccessibility(html) {
  const $ = load(html, null, /<!doctype|<html(?:\s|>)/i.test(html));
  const photoDescription = 'Two people smiling and shaking hands at a DLF Forum exhibit table.';
  $('[role="img"][aria-label="JAN_6997-scaled.jpg"]').attr('aria-label', photoDescription);
  $('img[alt="JAN_6997-scaled.jpg"]').attr('alt', photoDescription);
  $('footer h5.elementor-heading-title').each((_, e) => { e.name = 'h2'; });

  // Retained WordPress page IDs scope these editorial repairs to News and FAQ.
  $('.elementor-151 h3.elementor-post__title').each((_, e) => { e.name = 'h2'; });
  $('.elementor-127 .elementor-widget-text-editor p').each((_, e) => {
    const paragraph = $(e);
    const first = paragraph.contents().toArray().find(node => node.type !== 'text' || node.data.trim());
    if (first?.name !== 'strong' || !$(first).text().trim().endsWith('?')) return;
    const heading = $('<h2 class="archive-faq-question"></h2>').html($(first).html());
    $(first).remove();
    // The old line break is replaced by the block boundary between heading and answer.
    while (paragraph.contents().length) {
      const node = paragraph.contents()[0];
      if (node.name !== 'br' && !(node.type === 'text' && !node.data.trim())) break;
      $(node).remove();
    }
    paragraph.before(heading, '\n');
  });
  const hasName = e => $(e).text().trim() || $(e).attr('aria-label') || $(e).attr('aria-labelledby') || $(e).find('img[alt]').toArray().some(img => img.attribs.alt?.trim());
  $('a.swiper-slide-inner').each((_, e) => {
    if (hasName(e)) return;
    const name = $(e).closest('.swiper-slide').find('[role="img"][aria-label]').first().attr('aria-label');
    if (name) $(e).attr('aria-label', name + ' — view sponsors');
  });
  $('a.elementor-icon').each((_, e) => {
    if (hasName(e)) return;
    const column = $(e).closest('.elementor-column');
    const heading = column.find('h1,h2,h3,h4,h5,h6').first().text().trim();
    const related = column.find('a[href]').filter((_, a) => a !== e && a.attribs.href === e.attribs.href && $(a).text().trim()).first().text().trim();
    if (heading || related) $(e).attr('aria-label', heading || related);
    else {
      const adjacent=column.find('.elementor-widget-text-editor a[href],p a[href]').filter((_, a)=>$(a).text().trim()).first();
      if(adjacent.length)$(e).attr('aria-label',adjacent.text().trim()).attr('href',adjacent.attr('href'));
    }
  });
  const labels = {
    'https://twitter.com/aliyareich': 'Aliya Reich on Twitter',
    'https://www.clir.org/hiddencollections/events/2022-symposium/': 'Digitizing Hidden Collections Symposium',
  };
  $('a[href]').each((_, e) => { if (!hasName(e) && labels[e.attribs.href]) $(e).attr('aria-label', labels[e.attribs.href]); });
  $('iframe').each((_, e) => {
    if ($(e).attr('title')?.trim()) return;
    const src = $(e).attr('src') || '';
    if (src.startsWith('https://www.google.com/maps/')) $(e).attr('title', 'Baltimore local guide map');
    if (src.startsWith('https://open.spotify.com/embed/')) $(e).attr('title', 'DLF community Baltimore playlist');
  });
  $('.elementor-swiper-button-prev').attr('aria-label','Previous slide');
  $('.elementor-swiper-button-next').attr('aria-label','Next slide');
  $('.elementor-tabs-content-wrapper').removeAttr('role aria-orientation');
  $('.elementor-tab-mobile-title').attr('role', 'button').removeAttr('aria-selected');
  $('.elementor-menu-toggle').each((i, e) => {
    const heading = $(e).closest('.elementor-widget-wrap').find('h2,h3,h4,h5').first().text().trim();
    if (heading) $(e).attr('aria-label', heading + ' menu');
    const menu = $(e).parent().find('.elementor-nav-menu--dropdown').first();
    const id = menu.attr('id') || 'archive-footer-menu-' + i;
    menu.attr('id', id); $(e).attr('aria-controls', id);
  });
  if($('#sched-embed').length&&!$('#archive-program-note').length){
    const note='<aside id="archive-program-note" class="archive-program-note" aria-label="Archived program"><p><strong>Explore the 2022 events program</strong></p><p><a href="/schedule/program/">Read the archived program with session descriptions and speakers</a> or <a href="/schedule/program.json" download>download the program data (JSON)</a>.</p></aside>';
    $('#sched-embed').before(note);
  }
  return $.html();
}
