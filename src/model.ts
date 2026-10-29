import seeds from './properties.json';
export type Verdict = 'unknown' | 'yes' | 'no';
export type Criterion = { id: string; name: string; tier: 'Must-have' | 'Nice-to-have'; detail: string; weight: number };
export type Property = { id:string; address:string; city:string; price:number|null; status:string; style:string; reaction:string; description:string; context:string; url:string; year:number|null; sqft:number|null; lat:number|null; lng:number|null; locationSource:string|null; matchedAddress?:string };
export type Review = { favorite?: boolean; notes?: string; checks?: Record<string,Verdict> };
export type State = { version: 1; reviews: Record<string, Review>; criteria: Criterion[]; budget: number };
export const sourceChat = 'https://chatgpt.com/share/6ae3ac2e-a27c-83ea-837d-3a71ec763fbf';
export const properties: Property[] = seeds;
export const initial: State = {version:1, budget:1000000, reviews:{hobe:{favorite:true}}, criteria:[
 {id:'quiet',name:'A genuinely quiet street',tier:'Must-have',detail:'No busy arterial. Visit at rush hour and in the evening; listen for traffic and nearby activity.',weight:1},
 {id:'architecture',name:'Architecture with a point of view',tier:'Must-have',detail:'Distinctive spaces, form or craftsmanship. Hobe Lane is the benchmark. A famous architect is optional.',weight:1},
 {id:'materials',name:'Warmth & original character',tier:'Nice-to-have',detail:'Natural materials, original details and thoughtful updates. Avoid generic renovations that erase the house.',weight:3},
 {id:'setting',name:'A relationship to its setting',tier:'Nice-to-have',detail:'Privacy, mature trees and an intentional connection between indoor and outdoor spaces.',weight:3},
 {id:'southwest',name:'Southwest & the city lakes',tier:'Nice-to-have',detail:'Lake Harriet and southwest Minneapolis are favorites. The wider metro, including White Bear Lake, is realistic.',weight:2}
]};
export function assess(p: Property, review: Review = {}, criteria = initial.criteria, budget = initial.budget) {
 const must=criteria.filter(c=>c.tier==='Must-have');
 const failed=must.filter(c=>review.checks?.[c.id]==='no');
 const unknown=must.filter(c=>!review.checks?.[c.id] || review.checks[c.id]==='unknown');
 const priceFail=p.price!==null && p.price>=budget;
 const budgetUnknown=p.price===null;
 const nice=criteria.filter(c=>c.tier==='Nice-to-have');
 const total=nice.reduce((n,c)=>n+c.weight,0);
 const checked=nice.filter(c=>review.checks?.[c.id] && review.checks[c.id]!=='unknown');
 const earned=nice.filter(c=>review.checks?.[c.id]==='yes').reduce((n,c)=>n+c.weight,0);
 return { label:failed.length || priceFail ? 'Does not meet brief' : unknown.length || budgetUnknown ? 'Needs review' : 'Meets rubric', failed, unknown, priceFail, budgetUnknown, earned,total,checked:checked.length,niceCount:nice.length };
}
export function parseState(value: unknown): State {
 if(!value || typeof value!=='object') throw Error('This is not a Fieldguide backup.');
 const s=value as State;
 if(s.version!==1 || !Number.isFinite(s.budget) || s.budget<=0 || !Array.isArray(s.criteria) || s.criteria.length>50 || !s.reviews || typeof s.reviews!=='object' || Array.isArray(s.reviews)) throw Error('Invalid backup format.');
 const ids=new Set<string>();
 for(const c of s.criteria) {
  if(!c || typeof c.id!=='string' || !/^[a-z0-9-]+$/.test(c.id) || ids.has(c.id) || typeof c.name!=='string' || typeof c.detail!=='string' || !['Must-have','Nice-to-have'].includes(c.tier) || !Number.isInteger(c.weight) || c.weight<1 || c.weight>5) throw Error('Invalid criteria in backup.');
  ids.add(c.id);
 }
 for(const [id,r] of Object.entries(s.reviews)) {
  if(!properties.some(p=>p.id===id) || !r || typeof r!=='object' || (r.notes!==undefined && typeof r.notes!=='string') || (r.favorite!==undefined && typeof r.favorite!=='boolean')) throw Error('Invalid property notes in backup.');
  if(r.checks && (typeof r.checks!=='object' || Array.isArray(r.checks) || Object.entries(r.checks).some(([key,v])=>!ids.has(key)||!['yes','no','unknown'].includes(v)))) throw Error('Invalid assessments in backup.');
 }
 return s;
}
export function download(filename: string, body: string, type='application/json') {
 const url=URL.createObjectURL(new Blob([body],{type}));const a=document.createElement('a');a.href=url;a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
export const money=(n:number|null)=> n===null?'Price unknown':new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(n);
