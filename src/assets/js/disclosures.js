function activateWithKeyboard(element,action){element.addEventListener('click',action);element.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();action();}});}
export function init(root=document){
 root.querySelectorAll('.elementor-accordion,.elementor-toggle').forEach(widget=>{
  const titles=[...widget.querySelectorAll('.elementor-tab-title')];
  const set=(title,open)=>{title.setAttribute('aria-expanded',String(open));title.classList.toggle('elementor-active',open);const panel=root.getElementById(title.getAttribute('aria-controls'));if(panel){panel.hidden=!open;panel.classList.toggle('elementor-active',open);panel.style.display=open?'block':'none';}};
  titles.forEach((title,i)=>{title.tabIndex=0;title.querySelectorAll('a').forEach(a=>a.tabIndex=-1);set(title,widget.classList.contains('elementor-accordion')&&i===0);activateWithKeyboard(title,()=>{const open=title.getAttribute('aria-expanded')!=='true';if(open&&widget.classList.contains('elementor-accordion'))titles.forEach(t=>set(t,false));set(title,open);});});
 });
 root.querySelectorAll('.elementor-widget-tabs').forEach(widget=>{
  const titles=[...widget.querySelectorAll('.elementor-tab-title')];const panels=[...widget.querySelectorAll('.elementor-tab-content')];
  const select=index=>{titles.forEach(t=>{const on=t.dataset.tab===index;t.setAttribute('aria-selected',String(on));t.setAttribute('aria-expanded',String(on));t.classList.toggle('elementor-active',on);t.tabIndex=on?0:-1;});panels.forEach(p=>{const on=p.dataset.tab===index;p.hidden=!on;p.classList.toggle('elementor-active',on);p.style.display=on?'block':'none';});};
  titles.forEach(t=>{activateWithKeyboard(t,()=>select(t.dataset.tab));t.addEventListener('keydown',e=>{const siblings=titles.filter(x=>x.classList.contains('elementor-tab-desktop-title')===t.classList.contains('elementor-tab-desktop-title'));const index=siblings.indexOf(t);let next;if(['ArrowRight','ArrowDown'].includes(e.key))next=(index+1)%siblings.length;if(['ArrowLeft','ArrowUp'].includes(e.key))next=(index+siblings.length-1)%siblings.length;if(e.key==='Home')next=0;if(e.key==='End')next=siblings.length-1;if(next!==undefined){e.preventDefault();select(siblings[next].dataset.tab);siblings[next].focus();}});});select(titles[0]?.dataset.tab);
 });
 root.querySelectorAll('.elementor-widget-table-of-contents').forEach(widget=>{const body=widget.querySelector('.elementor-toc__body');widget.querySelectorAll('.elementor-toc__toggle-button').forEach(button=>activateWithKeyboard(button,()=>{const open=body.hidden;body.hidden=!open;widget.classList.toggle('archive-toc-collapsed',!open);widget.querySelectorAll('.elementor-toc__toggle-button').forEach(b=>b.setAttribute('aria-expanded',String(open)));}));});
}
