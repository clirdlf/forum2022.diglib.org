import {XMLParser} from 'fast-xml-parser';
const array = value => value == null ? [] : Array.isArray(value) ? value : [value];
export function parseExport(xml) {
 const parsed = new XMLParser({ignoreAttributes:false,parseTagValue:false,trimValues:false}).parse(xml);
 return array(parsed.rss.channel.item).map(item => {
  const url=item.link;const metadata=Object.fromEntries(array(item['wp:postmeta']).map(m=>[m['wp:meta_key'],m['wp:meta_value']||'']));
  return {id:Number(item['wp:post_id']),type:item['wp:post_type'],status:item['wp:status'],title:item.title,url,path:new URL(url).pathname,date:item['wp:post_date'],contentHtml:item['content:encoded']||'',metadata};
 });
}
