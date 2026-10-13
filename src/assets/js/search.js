export function init(root=document) {
 root.querySelectorAll('button.nv-search').forEach(button=>{const parent=button.closest('.menu-item-nav-search');button.addEventListener('click',()=>{const open=button.getAttribute('aria-expanded')!=='true';parent?.classList.toggle('active',open);button.setAttribute('aria-expanded',String(open));if(open)parent?.querySelector('input[type="search"]')?.focus();});});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'){root.querySelectorAll('.menu-item-nav-search.active').forEach(p=>{p.classList.remove('active');const b=p.querySelector('button.nv-search');b?.setAttribute('aria-expanded','false');b?.focus();});}});
 const params=new URLSearchParams(location.search);if(!params.has('s'))return;
 const query=params.get('s').trim();const main=root.querySelector('#content');if(!main)return;
 main.replaceChildren();const section=document.createElement('section');section.className='container archive-search-results';main.append(section);
 const h=document.createElement('h1');h.textContent=query?`Search results for: ${query}`:'Search the archive';section.append(h);
 const form=document.createElement('form');form.action='/';form.role='search';
 const label=document.createElement('label');label.textContent='Search the archive';label.htmlFor='archive-search-query';
 const input=document.createElement('input');input.type='search';input.name='s';input.id='archive-search-query';input.value=query;
 const button=document.createElement('button');button.textContent='Search';button.type='submit';form.append(label,input,button);section.append(form);
 document.title=query?`Search: ${query} — DLF Forum 2022`:'Search — DLF Forum 2022';
 const status=document.createElement('p');status.role='status';status.textContent=query?'Searching…':'Enter a word or phrase to search pages and posts.';section.append(status);if(!query)return;
 fetch('/search-index.json').then(r=>{if(!r.ok)throw Error('Search unavailable');return r.json();}).then(index=>{
  const terms=query.toLocaleLowerCase().split(/\s+/);const results=index.filter(p=>terms.every(t=>(p.title+' '+p.text).toLocaleLowerCase().includes(t)));
  status.textContent=results.length?`${results.length} result${results.length===1?'':'s'}`:'No results found. Try another search.';
  for(const p of results){const article=document.createElement('article');const heading=document.createElement('h2');const link=document.createElement('a');link.href=p.path;link.textContent=p.title;heading.append(link);const excerpt=document.createElement('p');const first=p.text.toLocaleLowerCase().indexOf(terms[0]);const start=Math.max(0,first-70);excerpt.textContent=(start?'…':'')+p.text.slice(start,start+230)+'…';article.append(heading,excerpt);section.append(article);}
 }).catch(()=>{status.textContent='Search could not load. Please try again.';});
}
