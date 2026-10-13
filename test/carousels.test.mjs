import test from 'node:test';import assert from 'node:assert/strict';import {init} from '../src/assets/js/carousels.js';
test('first pointer activation pauses autoplay after button focus, and second resumes',()=>{
 const previous={document:globalThis.document,window:globalThis.window,matchMedia:globalThis.matchMedia};
 const widget=new EventTarget();widget.dataset={settings:'{"autoplay":"yes"}'};widget.classList={contains:()=>false};widget.querySelector=s=>s==='.swiper'?{}:null;widget.append=button=>{widget.button=button;};
 let running;globalThis.document={createElement:()=>new EventTarget()};globalThis.matchMedia=()=>({matches:false,addEventListener(){}});globalThis.window={Swiper:class{constructor(){running=true;this.params={};this.autoplay={stop(){running=false;},start(){running=true;}};}}};
 try{init({querySelectorAll:()=>[widget]});const focus=new Event('focusin');Object.defineProperty(focus,'target',{value:widget.button});widget.dispatchEvent(focus);widget.button.dispatchEvent(new Event('click'));assert.equal(running,false);assert.equal(widget.button.textContent,'Play slideshow');widget.button.dispatchEvent(new Event('click'));assert.equal(running,true);assert.equal(widget.button.textContent,'Pause slideshow');}finally{Object.assign(globalThis,previous);}
});
