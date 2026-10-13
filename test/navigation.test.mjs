import test from 'node:test';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {init} from '../src/assets/js/navigation.js';
function withDocument(html,run){
 const dom=new JSDOM(html,{url:'https://forum2022.diglib.org/'});
 const saved={};for(const key of ['document','location','addEventListener']){saved[key]=globalThis[key];globalThis[key]=key==='addEventListener'?dom.window.addEventListener.bind(dom.window):dom.window[key];}
 try{init(dom.window.document);run(dom.window);}finally{for(const key of Object.keys(saved))if(saved[key]===undefined)delete globalThis[key];else globalThis[key]=saved[key];dom.window.close();}
}
test('opened footer links enter tab order and closed links leave it',()=>withDocument('<footer><div><div class="elementor-menu-toggle" role="button" tabindex="0"></div><div class="elementor-nav-menu--dropdown"><a href="/about/" tabindex="-1">About</a></div></div></footer>',w=>{
 const button=w.document.querySelector('[role="button"]'),link=w.document.querySelector('a');button.click();assert.equal(link.tabIndex,0);button.click();assert.equal(link.tabIndex,-1);
}));
test('Escape returns focus from desktop submenu to its opener',()=>withDocument('<header><ul><li><button class="caret-wrap" aria-expanded="false">About submenu</button><ul class="sub-menu"><li><a href="/news/">News</a></li></ul></li></ul></header>',w=>{
 const button=w.document.querySelector('button'),link=w.document.querySelector('a');button.click();link.focus();link.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Escape',bubbles:true}));assert.equal(w.document.activeElement,button);assert.equal(button.getAttribute('aria-expanded'),'false');
}));
test('closing mobile menu restores focus to the opening button',()=>withDocument('<header><button class="navbar-toggle" aria-label="Navigation Menu">Open</button><div id="header-menu-sidebar"><button class="navbar-toggle">Close</button><a href="/news/">News</a></div></header>',w=>{
 const button=w.document.querySelector('button'),link=w.document.querySelector('a');button.click();link.focus();link.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Escape',bubbles:true}));assert.equal(w.document.activeElement,button);assert.equal(button.getAttribute('aria-expanded'),'false');
}));
