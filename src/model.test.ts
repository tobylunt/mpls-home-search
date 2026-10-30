import { describe,it,expect } from 'vitest';
import {assess,initial,properties,parseState} from './model';
describe('transparent rubric',()=>{
 it('never treats missing evidence as a pass',()=>expect(assess(properties[0]).label).toBe('Needs review'));
 it('does not let bonuses cancel a failed must-have',()=>expect(assess(properties[0],{checks:{quiet:'no',architecture:'yes',materials:'yes',setting:'yes',southwest:'yes'}}).label).toBe('Does not meet brief'));
 it('distinguishes unknown bonuses from assessed bonuses',()=>{const a=assess(properties[0],{checks:{quiet:'yes',architecture:'yes',commute:'yes',materials:'yes'}});expect(a.label).toBe('Meets rubric');expect(a.earned).toBe(3);expect(a.checked).toBe(1)});
 it('honors the strict under-budget requirement',()=>expect(assess({...properties[0],price:1000000}).priceFail).toBe(true));
 it('keeps an unknown price unresolved',()=>expect(assess({...properties[0],price:null},{checks:{quiet:'yes',architecture:'yes'}}).label).toBe('Needs review'));
 it('validates backups before replacing user work',()=>{expect(parseState(initial)).toEqual(initial);expect(()=>parseState({...initial,budget:-1})).toThrow();expect(()=>parseState({...initial,reviews:{hobe:{checks:{quiet:'maybe'}}}})).toThrow()});
 it('requires a confirmed commute even when every bonus is met',()=>{
  const checks = Object.fromEntries(initial.criteria.map(c=>[c.id,c.id==='commute'?'unknown' as const:'yes' as const]));
  expect(assess(properties[0],{checks}).label).toBe('Needs review');
  expect(assess(properties[0],{checks:{...checks,commute:'no'}}).label).toBe('Does not meet brief');
 });
 it('adds the expanded brief to saved data without replacing edits or inventing assessments',()=>{
  const legacy = {...initial,budget:900000,criteria:initial.criteria.filter(c=>!['commute','renewables','water','gardens','workshop'].includes(c.id)).map(c=>({...c,detail:'My saved guidance'})),reviews:{hobe:{favorite:true,notes:'Keep these notes',checks:{quiet:'yes' as const}}}};
  const migrated = parseState(legacy);
  expect(migrated.budget).toBe(legacy.budget);
  expect(migrated.reviews).toEqual(legacy.reviews);
  expect(migrated.criteria.find(c=>c.id==='quiet')?.detail).toBe('My saved guidance');
  expect(migrated.criteria.find(c=>c.id==='commute')?.tier).toBe('Must-have');
  expect(migrated.criteria.filter(c=>['renewables','water','gardens','workshop'].includes(c.id)).map(c=>c.weight)).toEqual([5,5,5,5]);
  migrated.criteria.find(c=>c.id==='gardens')!.weight=4;
  expect(parseState(migrated)).toEqual(migrated);
 });
});
