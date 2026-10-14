import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {load} from 'cheerio';
import {enhanceAccessibility} from '../scripts/lib/accessibility.mjs';

// These exercise the retained source HTML, so refreshes cannot silently undo repairs.
test('homepage photo is exposed with a meaningful description instead of its filename', async () => {
  const $ = load(enhanceAccessibility(await readFile('data/archive/bodies/86.html', 'utf8')));
  const photo = $('[style*="JAN_6997"]');
  assert.equal(photo.length, 1);
  assert.equal(photo.attr('role'), 'img');
  assert.match(photo.attr('aria-label'), /shaking hands/i);
  assert.doesNotMatch(photo.attr('aria-label'), /JAN_|\.jpg/i);
});

test('footer sections are level two headings after build-time repair', async () => {
  const $ = load(enhanceAccessibility('<footer>' + await readFile('src/_includes/partials/footer.njk', 'utf8') + '</footer>'));
  assert.deepEqual($('footer h2').toArray().map(e => $(e).text()), ['Connect', 'Sponsor', 'Help', 'Follow Us']);
  assert.equal($('footer h5').length, 0);
});

test('news titles sit directly beneath the page heading on both pagination routes', async () => {
  const pages = JSON.parse(await readFile('data/archive/pages.json', 'utf8'));
  for (const path of ['/news/', '/news/2/']) {
    const page = pages.find(p => p.path === path);
    const body = await readFile('data/archive/bodies/' + page.bodyFile, 'utf8');
    const before = load(body);
    const $ = load(enhanceAccessibility(body));
    assert.equal($('h3.elementor-post__title').length, 0);
    assert.deepEqual($('h2.elementor-post__title a').toArray().map(e => $(e).attr('href')), before('.elementor-post__title a').toArray().map(e => before(e).attr('href')));
    assert.ok($('h2.elementor-post__title').length > 0);
  }
});

test('FAQ questions become navigable headings without losing answers or email links', async () => {
  const body = await readFile('data/archive/bodies/127.html', 'utf8');
  const before = load(body);
  const $ = load(enhanceAccessibility(body));
  const questions = $('.elementor-127 h2.archive-faq-question');
  assert.equal(questions.length, 8);
  assert.deepEqual(questions.toArray().map(e => $(e).text()), before('.elementor-widget-text-editor p > strong').toArray().map(e => before(e).text()));
  assert.equal($('.elementor-127').text().replace(/\s+/g, ' ').trim(), before('.elementor-127').text().replace(/\s+/g, ' ').trim());
  assert.equal($('.elementor-127 a[href="mailto:forum@diglib.org"]').length, 2);
  assert.equal(questions.next('p').length, 8);
  assert.equal(enhanceAccessibility(enhanceAccessibility(body)), enhanceAccessibility(body));
});

test('editorial repairs leave unrelated bold paragraphs and nested post headings intact', () => {
  const $ = load(enhanceAccessibility('<main><h1>Other page</h1><h2>Section</h2><h3 class="elementor-post__title">Related news</h3><p><strong>Question?</strong><br>Answer</p></main>'));
  assert.equal($('h3').text(), 'Related news');
  assert.equal($('p strong').text(), 'Question?');
});
