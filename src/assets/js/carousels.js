export function init(root=document){
 const motion=matchMedia('(prefers-reduced-motion:reduce)');
 root.querySelectorAll('.elementor-widget-slides,.elementor-widget-image-carousel,.elementor-widget-media-carousel').forEach(widget=>{
  const element=widget.querySelector('.swiper');if(!element||!window.Swiper)return;
  const settings=JSON.parse(widget.dataset.settings||'{}');const image=widget.classList.contains('elementor-widget-image-carousel');const effect=settings.effect||settings.transition||'slide';
  const count=image?Number(settings.slides_to_show||3):1;
  const swiper=new window.Swiper(element,{slidesPerView:1,slidesPerGroup:1,speed:motion.matches?0:Number(settings.speed||settings.transition_speed||500),effect,loop:settings.infinite!=='no'&&settings.loop!=='no',spaceBetween:Number(settings.space_between?.size||settings.image_spacing_custom?.size||0),
   breakpoints:effect==='slide'?{768:{slidesPerView:image?Number(settings.slides_to_show_tablet||2):1},1025:{slidesPerView:count}}:undefined,
   navigation:{prevEl:widget.querySelector('.elementor-swiper-button-prev'),nextEl:widget.querySelector('.elementor-swiper-button-next')},
   pagination:{el:widget.querySelector('.swiper-pagination'),clickable:true},
   autoplay:settings.autoplay==='yes'&&!motion.matches?{delay:Number(settings.autoplay_speed||5000),disableOnInteraction:settings.pause_on_interaction!=='no',pauseOnMouseEnter:settings.pause_on_hover!=='no'}:false,
   keyboard:{enabled:true,onlyInViewport:true},a11y:{enabled:true},observer:true,observeParents:true,
  });
  if(settings.autoplay==='yes'){const pause=document.createElement('button');pause.type='button';pause.className='archive-carousel-pause';pause.textContent=motion.matches?'Play slideshow':'Pause slideshow';let paused=motion.matches;
   pause.addEventListener('click',()=>{paused=!paused;if(paused)swiper.autoplay.stop();else{swiper.params.autoplay={delay:Number(settings.autoplay_speed||5000),disableOnInteraction:true,pauseOnMouseEnter:true};swiper.autoplay.start();}pause.textContent=paused?'Play slideshow':'Pause slideshow';});widget.append(pause);
   widget.addEventListener('focusin',e=>{if(e.target===pause)return;swiper.autoplay?.stop();paused=true;pause.textContent='Play slideshow';});motion.addEventListener('change',e=>{if(e.matches){swiper.autoplay?.stop();swiper.params.speed=0;paused=true;pause.textContent='Play slideshow';}});
  }
 });
}
