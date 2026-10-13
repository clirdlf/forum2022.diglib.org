import {load} from 'cheerio';import {rewriteCss,resolveAsset,excludedAsset} from './assets.mjs';
const text = value => load((value||'').replace(/<[^>]*>/g,' ')).text().replace(/\s+/g,' ').trim();
function decodeEmail(hex){const key=parseInt(hex.slice(0,2),16);return Buffer.from(hex.slice(2).match(/../g).map(v=>parseInt(v,16)^key)).toString('utf8');}
export function normalizePage(capture,record,assetMap){
 const $=load(capture.html);const issues=[];const rewrite=value=>{if(!value||/^(#|mailto:|tel:|data:)/i.test(value))return value;try{const u=new URL(value,capture.url);const bare=new URL(u);bare.hash='';if(assetMap[bare.href])return assetMap[bare.href]+u.hash;if(u.hostname===new URL(capture.url).hostname)return u.pathname+u.search+u.hash;return value;}catch{return value;}};
 $('script').filter((_,e)=>{try{return new URL($(e).attr('src')||'',capture.url).href!=='https://clirevents2022.sched.com/js/embed.js';}catch{return true;}}).remove();
 $('#wpadminbar,#wp-toolbar,#pojo-a11y-toolbar,#pojo-a11y-skip-content,[class*="wpa-toolbar"],link[rel="https://api.w.org/"],link[rel="EditURI"]').remove();
 $('link').each((_,e)=>{const rel=$(e).attr('rel');if(!['stylesheet','icon','apple-touch-icon'].includes(rel)||excludedAsset($(e).attr('href')||''))$(e).remove();});
 $('style').each((_,e)=>{if(/wpa|emoji/i.test($(e).attr('id')||''))$(e).remove();else $(e).html(rewriteCss($(e).html()||'',capture.url,assetMap));});
 $('meta[name="msapplication-TileImage"]').remove();
 $('meta[property^="og:"],meta[name="twitter:image"]').each((_,e)=>{if(/^(og:(url|image|video|audio)(:url)?|twitter:image)$/.test($(e).attr('property')||$(e).attr('name')||'')&&$(e).attr('content'))$(e).attr('content',rewrite($(e).attr('content')));});
 $('a[href*="/cdn-cgi/l/email-protection"],[data-cfemail]').each((_,e)=>{const hex=$(e).attr('data-cfemail')||($(e).attr('href')||'').split('#')[1];if(hex&&/^[a-f0-9]+$/i.test(hex)){const email=decodeEmail(hex);if(e.name==='a'){$(e).attr('href','mailto:'+email);if($(e).hasClass('__cf_email__'))$(e).text(email);}else $(e).replaceWith(email);$(e).removeAttr('data-cfemail');}});
 $('*').each((_,e)=>{
  for(const name of Object.keys(e.attribs||{}))if(/^on/i.test(name))$(e).removeAttr(name);
  $(e).removeClass('elementor-invisible current-menu-item current_page_item current-menu-ancestor current_page_parent logged-in admin-bar');
  for(const attr of ['href','src','poster','action','data-src'])if($(e).attr(attr))$(e).attr(attr,rewrite($(e).attr(attr)));
  if($(e).attr('srcset'))$(e).attr('srcset',$(e).attr('srcset').split(',').map(v=>{const [u,...descriptor]=v.trim().split(/\s+/);return [rewrite(u),...descriptor].join(' ');}).join(', '));
  if($(e).attr('style')){const css=rewriteCss('x{'+$(e).attr('style')+'}',capture.url,assetMap);$(e).attr('style',css.slice(2,-1));}
 });
 $('a[aria-current]').removeAttr('aria-current');
 const main=$('main#content,#content,main').first();if(!main.length)throw Error(`No content: ${capture.url}`);
 const schedScript=$('script[src*="clirevents2022.sched.com/js/embed.js"]').first();if(schedScript.length){schedScript.attr('src','https://clirevents2022.sched.com/js/embed.js').attr('defer','');main.append(schedScript);}
 main.find('img[data-src]').each((_,e)=>{if(!$(e).attr('src'))$(e).attr('src',$(e).attr('data-src'));$(e).attr('loading','lazy');});
 main.find('.elementor-widget-video').each((_,e)=>{const settings=JSON.parse($(e).attr('data-settings')||'{}');if(settings.video_type==='youtube'&&settings.youtube_url){const u=new URL(settings.youtube_url);const id=u.hostname==='youtu.be'?u.pathname.slice(1):u.searchParams.get('v');if(id&&/^[\w-]+$/.test(id)){const iframe=$('<iframe>').attr({src:'https://www.youtube.com/embed/'+id,title:'DLF Forum video',loading:'lazy',allowfullscreen:'',allow:'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'});$(e).find('.elementor-video').replaceWith(iframe);}}});
 main.find('.elementor-widget-table-of-contents').each((_,e)=>{const settings=JSON.parse($(e).attr('data-settings')||'{}');const list=$('<ul class="elementor-toc__list-wrapper">');main.find((settings.headings_by_tags||['h2','h3','h4','h5','h6']).join(',')).filter((_,h)=>!$(h).closest('.elementor-widget-table-of-contents').length).each((i,h)=>{const id=$(h).attr('id')||'elementor-toc__heading-anchor-'+i;$(h).attr('id',id);const link=$('<a class="elementor-toc__list-item-text">').attr('href','#'+id).text($(h).text());list.append($('<li class="elementor-toc__list-item">').append(link));});$(e).find('.elementor-toc__body').empty().append(list);});
 const bodyHtml=$.html(main);const searchText=text($.html(main));
 if(record?.contentHtml){
  const exported=load(record.contentHtml);const canonical=value=>value.normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]/gu,'');
  const rendered=canonical(searchText);const missing=exported('p,li,h1,h2,h3,h4').toArray().filter(e=>!exported(e).find('p,li').length).map(e=>exported(e).text().replace(/\s+/g,' ').trim()).filter(s=>s.length>45&&!s.includes('[sched')&&!rendered.includes(canonical(s)));
  if(missing.length)issues.push({path:capture.path,reason:'Export/rendered text differences requiring reconciliation',excerpts:missing});
 }
 const title=record?text(record.title):text($('title').text()).replace(/\s*[—–|]\s*DLF Forum 2022.*$/,'');
 return {page:{id:record?.id||capture.path.replace(/\W/g,'_'),type:record?.type||'archive',title,path:capture.path,date:record?.date||null,bodyFile:(record?.id||capture.path.replace(/\W/g,'_'))+'.html',bodyClasses:$('body').attr('class')||'',headHtml:$('head').children().not('title,meta[charset],meta[name="viewport"],meta[name="generator"],meta[property="og:url"]').toArray().map(e=>$.html(e)).join('\n'),searchText},bodyHtml,chrome:{headerHtml:$.html($('header').first()),footerHtml:$.html($('footer').first())},issues};
}
