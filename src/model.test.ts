import { describe,it,expect } from 'vitest';
import {assess,initial,properties,parseState} from './model';
describe('transparent rubric',()=>{
 it('never treats missing evidence as a pass',()=>expect(assess(properties[0]).label).toBe('Needs review'));
 it('does not let bonuses cancel a failed must-have',()=>expect(assess(properties[0],{checks:{quiet:'no',architecture:'yes',materials:'yes',setting:'yes',southwest:'yes'}}).label).toBe('Does not meet brief'));
 it('distinguishes unknown bonuses from assessed bonuses',()=>{const a=assess(properties[0],{checks:{quiet:'yes',architecture:'yes',materials:'yes'}});expect(a.label).toBe('Meets rubric');expect(a.earned).toBe(3);expect(a.checked).toBe(1)});
 it('honors the strict under-budget requirement',()=>expect(assess({...properties[0],price:1000000}).priceFail).toBe(true));
 it('keeps an unknown price unresolved',()=>expect(assess({...properties[0],price:null},{checks:{quiet:'yes',architecture:'yes'}}).label).toBe('Needs review'));
 it('validates backups before replacing user work',()=>{expect(parseState(initial)).toEqual(initial);expect(()=>parseState({...initial,budget:-1})).toThrow();expect(()=>parseState({...initial,reviews:{hobe:{checks:{quiet:'maybe'}}}})).toThrow()});
});
