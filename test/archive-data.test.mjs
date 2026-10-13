import test from 'node:test';
import assert from 'node:assert/strict';
import {preparePage} from '../scripts/lib/archive-data.mjs';

test('corrected page wording is also available to search', () => {
  const page = {path: '/about/', title: 'About', searchText: 'Incorrect name'};
  const result = preparePage(page, '<h1>About</h1><p>Incorrect name</p>', {'/about/': [{find: 'Incorrect name', replace: 'Correct name'}]});
  assert.equal(result.searchText, 'About Correct name');
  assert.match(result.bodyHtml, /Correct name/);
  assert.equal(result.title, 'About');
});

test('search text separates adjacent blocks and decodes entities', () => {
  const result = preparePage({path: '/about/'}, '<h1>Title</h1><p>First &amp; second</p><p>Third</p>', {});
  assert.equal(result.searchText, 'Title First & second Third');
});
