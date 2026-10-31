import { describe, it, expect } from 'vitest';
import { existsSync } from 'node:fs';
import { properties, parseState, initial } from './model';
import audit from '../docs/listing-verification.json';

describe('verified gallery',()=>{
 it('publishes only properties with inspected, source-linked photos',()=>{
  for(const p of properties){
   const evidence=audit.find(a=>a.id===p.id);
   expect(evidence?.verified,p.address).toBe(true);
   expect(evidence?.visuallyInspected,p.address).toBe(true);
   expect(p.url,p.address).toBe(evidence?.url);
   expect(p.photo?.credit,p.address).toBeTruthy();
   expect(p.photo?.src,p.address).toMatch(/^\/photos\/[a-z-]+\.(jpg|webp|png)$/);
   expect(existsSync(`public${p.photo.src}`),p.address).toBe(true);
  }
 });
 it('restores notes for newly added properties',()=>{
  const s={...initial,reviews:{thomas:{notes:'Tour'},james:{favorite:true}}};
  expect(parseState(s).reviews).toEqual(s.reviews);
 });
 it('keeps existing notes restorable after a listing is removed',()=>{
  const s={...initial,reviews:{turnpike:{favorite:true,notes:'Keep these notes in my backup.'},walnut:{notes:'Not my style.'}}};
  expect(parseState(s).reviews).toEqual(s.reviews);
 });
});
