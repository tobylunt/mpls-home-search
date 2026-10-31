import { describe,it,expect } from 'vitest';
import {assess,initial,properties,parseState,reviewFor,isSaved} from './model';
const unassessedHome = {...properties[0], research: undefined};
describe('shared shortlist',()=>{
 it('shows shared selections for new and existing browsers while honoring personal overrides',()=>{
  const home={...unassessedHome,shortlisted:true};
  expect(isSaved(home)).toBe(true);
  const personal={notes:'Keep these notes',checks:{quiet:'yes' as const}};
  expect(isSaved(home,personal)).toBe(true);
  expect(isSaved(home,{...personal,favorite:false})).toBe(false);
  expect(isSaved({...home,shortlisted:false},{favorite:true})).toBe(true);
  expect(personal).toEqual({notes:'Keep these notes',checks:{quiet:'yes'}});
 });
});
describe('transparent rubric',()=>{
 it('never treats missing evidence as a pass',()=>expect(assess(unassessedHome).label).toBe('Needs review'));
 it('does not let bonuses cancel a failed must-have',()=>expect(assess(unassessedHome,{checks:{quiet:'no',architecture:'yes',materials:'yes',setting:'yes',southwest:'yes'}}).label).toBe('Does not meet brief'));
 it('distinguishes unknown bonuses from assessed bonuses',()=>{const a=assess(unassessedHome,{checks:{quiet:'yes',architecture:'yes',commute:'yes',materials:'yes'}});expect(a.label).toBe('Meets rubric');expect(a.earned).toBe(3);expect(a.checked).toBe(1)});
 it('honors the strict under-budget requirement',()=>expect(assess({...unassessedHome,price:1000000}).priceFail).toBe(true));
 it('keeps an unknown price unresolved',()=>expect(assess({...unassessedHome,price:null},{checks:{quiet:'yes',architecture:'yes'}}).label).toBe('Needs review'));
 it('validates backups before replacing user work',()=>{expect(parseState(initial)).toEqual(initial);expect(()=>parseState({...initial,budget:-1})).toThrow();expect(()=>parseState({...initial,reviews:{hobe:{checks:{quiet:'maybe'}}}})).toThrow()});
 it('requires a confirmed commute even when every bonus is met',()=>{
  const checks = Object.fromEntries(initial.criteria.map(c=>[c.id,c.id==='commute'?'unknown' as const:'yes' as const]));
  expect(assess(unassessedHome,{checks}).label).toBe('Needs review');
  expect(assess(unassessedHome,{checks:{...checks,commute:'no'}}).label).toBe('Does not meet brief');
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
 it('uses researched bonuses without overwriting personal ratings or notes',()=>{
  const p=properties.find(p=>p.id==='wyoming')!;
  expect(assess(p).earned).toBe(10);
  const personal={notes:'Ask about dust collection',favorite:true,checks:{water:'no' as const,workshop:'unknown' as const}};
  const merged=reviewFor(p,personal);
  expect(merged.checks?.water).toBe('no');
  expect(merged.checks?.workshop).toBe('unknown');
  expect(merged.notes).toBe(personal.notes);
  expect(merged.favorite).toBe(true);
  expect(assess(p,personal).earned).toBe(0);
  expect(parseState({...initial,reviews:{wyoming:personal}}).reviews.wyoming).toEqual(personal);
 });
 it('keeps the longer Pomroy commute disqualifying despite its bonuses',()=>{
  const p=properties.find(p=>p.id==='pomroy')!;
  expect(assess(p).earned).toBe(10);
  expect(assess(p).label).toBe('Does not meet brief');
 });
});
