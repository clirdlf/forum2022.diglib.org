import test from 'node:test';
import assert from 'node:assert/strict';
const {parseExport}=await import('../scripts/lib/wxr.mjs').catch(()=>({parseExport:()=>[]}));
test('export preserves CDATA content and decodes titles without losing metadata',()=>{
 const records=parseExport(`<rss xmlns:wp="http://wordpress.org/export/1.2/" xmlns:content="http://purl.org/rss/1.0/modules/content/"><channel><item><title>People &amp; Places</title><link>https://forum2022.diglib.org/about/</link><wp:post_id>3</wp:post_id><wp:post_type>page</wp:post_type><wp:status>publish</wp:status><wp:post_date>2022-01-01 00:00:00</wp:post_date><content:encoded><![CDATA[<p>A & B</p>]]></content:encoded><wp:postmeta><wp:meta_key>_elementor_data</wp:meta_key><wp:meta_value><![CDATA[[{"id":"a"}]]]></wp:meta_value></wp:postmeta></item></channel></rss>`);
 assert.equal(records[0]?.title,'People & Places');assert.equal(records[0].contentHtml,'<p>A & B</p>');assert.equal(records[0].metadata._elementor_data,'[{"id":"a"}]');
});
