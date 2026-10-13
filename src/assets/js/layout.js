// Elementor stretches selected top-level sections beyond the theme container.
export function init(root=document){
 const sections=[...root.querySelectorAll('.elementor-section-stretched')];
 const stretch=()=>{for(const section of sections){section.style.left='0px';section.style.width=document.documentElement.clientWidth+'px';section.style.left=-section.getBoundingClientRect().left+'px';}};
 stretch();addEventListener('resize',stretch);addEventListener('load',stretch);new ResizeObserver(stretch).observe(document.documentElement);document.fonts?.ready.then(stretch);
}
