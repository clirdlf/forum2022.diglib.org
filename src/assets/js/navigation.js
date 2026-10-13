export function init(root=document) {
 const sidebar=root.querySelector('#header-menu-sidebar');
 const toggles=[...root.querySelectorAll('header .navbar-toggle:not(.caret-wrap)')];
 const setMenu=open=>{document.body.classList.toggle('is-menu-sidebar',open);if(sidebar)sidebar.inert=!open;toggles.forEach(b=>b.setAttribute('aria-expanded',String(open)));};
 setMenu(false);toggles.forEach(b=>b.addEventListener('click',()=>setMenu(!document.body.classList.contains('is-menu-sidebar'))));
 root.querySelectorAll('header .caret-wrap').forEach(button=>{
  const li=button.closest('li');const submenu=li?.querySelector(':scope > .sub-menu');if(!submenu)return;
  button.addEventListener('click',()=>{const open=button.getAttribute('aria-expanded')!=='true';button.setAttribute('aria-expanded',String(open));submenu.classList.toggle('dropdown-open',open);});
 });
 root.querySelectorAll('header a[href]').forEach(a=>{if(new URL(a.href).pathname===location.pathname){a.setAttribute('aria-current','page');a.closest('li')?.classList.add('current-menu-item','nv-active');let ancestor=a.closest('li')?.parentElement?.closest('li');while(ancestor){ancestor.classList.add('nv-active');ancestor=ancestor.parentElement?.closest('li');}}});
 document.addEventListener('click',e=>{root.querySelectorAll('header .dropdown-open').forEach(submenu=>{if(!submenu.parentElement.contains(e.target)){submenu.classList.remove('dropdown-open');submenu.parentElement.querySelector('.caret-wrap')?.setAttribute('aria-expanded','false');}});});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'){setMenu(false);root.querySelectorAll('header .dropdown-open').forEach(el=>el.classList.remove('dropdown-open'));root.querySelectorAll('header .caret-wrap').forEach(el=>el.setAttribute('aria-expanded','false'));}});
 root.querySelectorAll('.elementor-menu-toggle').forEach(button=>{const menu=button.parentElement.querySelector('.elementor-nav-menu--dropdown');if(!menu)return;const toggle=()=>{const open=button.getAttribute('aria-expanded')!=='true';button.setAttribute('aria-expanded',String(open));button.classList.toggle('elementor-active',open);menu.setAttribute('aria-hidden',String(!open));menu.classList.toggle('archive-footer-open',open);};button.addEventListener('click',toggle);button.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();toggle();}});});
 const top=root.querySelector('#scroll-to-top');if(top){const update=()=>top.classList.toggle('visible',scrollY>400);addEventListener('scroll',update,{passive:true});update();top.addEventListener('click',()=>scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'}));}
}
