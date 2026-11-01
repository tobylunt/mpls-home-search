// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { beforeAll, beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { App } from './main';

vi.mock('./Basemap',()=>({Basemap:()=>null}));

let host:HTMLDivElement;
let root:Root;
let returnFocus:HTMLElement|null;
beforeAll(()=>{
 Object.assign(globalThis,{IS_REACT_ACT_ENVIRONMENT:true});
 HTMLDialogElement.prototype.showModal=function(){
  returnFocus=document.activeElement as HTMLElement;
  this.open=true;
  this.querySelector<HTMLButtonElement>('button')?.focus();
 };
 HTMLDialogElement.prototype.close=function(){
  if(!this.open)return;
  this.open=false;
  returnFocus?.focus();
 };
});
beforeEach(async()=>{
 localStorage.clear();
 host=document.createElement('div');
 document.body.append(host);
 root=createRoot(host);
 await act(async()=>root.render(<App/>));
});
afterEach(async()=>{await act(async()=>root.unmount());host.remove()});

function pin(price:string){
 const el=Array.from(host.querySelectorAll<HTMLElement>('.home-pin')).find(el=>el.textContent===price);
 if(!el)throw Error(`Missing map tag: ${price}`);
 return el;
}
async function mouse(el:Element,type:string){
 await act(async()=>{el.dispatchEvent(new MouseEvent(type,{bubbles:true}))});
}

describe('map tag interactions',()=>{
 it('raises a map tag on pointer movement and restores its exact stack position on exit',async()=>{
  const target=pin('$445k');
  const original=target.style.zIndex;
  await mouse(target,'mouseover');
  await mouse(target,'mousemove');
  expect(Number(target.style.zIndex)).toBeGreaterThan(Math.max(...Array.from(host.querySelectorAll<HTMLElement>('.home-pin')).filter(el=>el!==target).map(el=>Number(el.style.zIndex))));
  expect(target.classList.contains('is-highlighted')).toBe(true);
  expect(host.querySelector('[role=tooltip]')?.textContent).toBe('7823 Alden Way NE');
  await mouse(target,'mouseout');
  expect(target.style.zIndex).toBe(original);
  expect(target.classList.contains('is-highlighted')).toBe(false);
  expect(host.querySelector('[role=tooltip]')).toBeNull();
 });
 it('clears the tooltip and highlight on click, including after dialog focus returns',async()=>{
  const target=pin('$445k');
  await act(async()=>target.focus());
  // Leaflet can pan to a keyboard-focused marker. Record the resting stack
  // after that pan, so we only measure the temporary hover offset.
  await mouse(target,'mousemove');
  await mouse(target,'mouseout');
  const original=target.style.zIndex;
  await mouse(target,'mousemove');
  await mouse(target,'click');
  expect(host.querySelector<HTMLDialogElement>('.detail-dialog')?.open).toBe(true);
  expect(host.querySelector('[role=tooltip]')).toBeNull();
  await mouse(host.querySelector('[aria-label="Close property details"]')!,'click');
  expect(document.activeElement).toBe(target);
  expect(host.querySelector('[role=tooltip]')).toBeNull();
  expect(target.classList.contains('is-highlighted')).toBe(false);
  expect(target.style.zIndex).toBe(original);
  await mouse(target,'mousemove');
  expect(host.querySelector('[role=tooltip]')?.textContent).toBe('7823 Alden Way NE');
 });
 it('uses the same raise-and-reset behavior for the sidebar',async()=>{
  const target=pin('$445k');
  const original=target.style.zIndex;
  const card=Array.from(host.querySelectorAll('article')).find(el=>el.querySelector('h3')?.textContent==='7823 Alden Way NE')!;
  await mouse(card,'mouseover');
  await mouse(card,'mousemove');
  expect(Number(target.style.zIndex)).toBeGreaterThan(Number(original));
  await mouse(card,'mouseout');
  expect(target.style.zIndex).toBe(original);
 });
 it('shows one shortlist symbol for former top-tier homes',()=>{
  expect(host.querySelector('.map-key')?.textContent).toContain('Shortlisted');
  expect(Array.from(host.querySelectorAll('.home-pin')).some(el=>el.textContent==='★ $775k')).toBe(true);
  expect(host.querySelector('.map-wrap')?.textContent).not.toContain('◆');
 });
});
