import seeds from './properties.json';
import researchData from './research.json';
export type Verdict = 'unknown' | 'yes' | 'no';
export type Evidence = { verdict: Verdict; detail: string; sourceUrl: string; returnUrl?: string; checkedOn: string };
export type Criterion = { id: string; name: string; tier: 'Must-have' | 'Nice-to-have'; detail: string; weight: number };
export type PropertyPhoto = { src:string; sourceUrl:string; credit:string; caption?:string };
export type Property = { id:string; address:string; city:string; price:number|null; priceLabel?:string; status:string; style:string; reaction:string; shortlisted?:boolean; description:string; context:string; url:string; year:number|null; sqft:number|null; lat:number|null; lng:number|null; locationSource:string|null; matchedAddress?:string; photo?:PropertyPhoto; gallery?:PropertyPhoto[]; verifiedOn?:string; research?: Record<string,Evidence> };
export type Review = { favorite?: boolean; notes?: string; checks?: Record<string,Verdict> };
export type State = { version: 1; reviews: Record<string, Review>; criteria: Criterion[]; budget: number };
export const sourceChat = 'https://chatgpt.com/share/6ae3ac2e-a27c-83ea-837d-3a71ec763fbf';
export const properties: Property[] = seeds.map(p=>({...p,research:(researchData as Record<string,Record<string,Evidence>>)[p.id]}));
export function priceLabel(p: Property): string {
 return p.priceLabel ?? (p.status==='Sold reference'?'Reported sale price':'Reported asking price');
}
export function isSaved(p: Property, review?: Review): boolean {
 return review?.favorite ?? p.shortlisted ?? false;
}
export function reviewFor(p: Property, review: Review = {}): Review {
 return {...review, checks:{...Object.fromEntries(Object.entries(p.research??{}).map(([id,e])=>[id,e.verdict])),...review.checks}};
}
const knownPropertyIds = new Set([...properties.map(p=>p.id), "walnut", "hobe", "decatur", "luverne", "glenhurst", "shore", "humboldt", "woodlawn", "turnpike", "keston", "virginia", "cedar", "benhill", "ewing", "summit", "croix", "goodrich", "knox", "kyle", "orchard", "normandale", "bridgeview", "knoll", "colfax", "moritz", "minnetonka", "linwood", "hopkins", "ricecreek", "holly458", "oak"]);
export const initial: State = {version:1, budget:1000000, reviews:{hobe:{favorite:true}}, criteria:[
 {id:'quiet',name:'Quiet street',tier:'Must-have',detail:'No busy arterial. Visit at rush hour and in the evening; listen for traffic and nearby activity.',weight:1},
 {id:'architecture',name:'Architectural interest',tier:'Must-have',detail:'Distinctive spaces, form or craftsmanship. Hobe Lane is the benchmark. A famous architect is optional.',weight:1},
 {id:'commute',name:'45-minute commute',tier:'Must-have',detail:'Within 45 minutes by car of McKnight Foundation, 921 Washington Avenue S, Minneapolis. Flexible schedule outside rush hour; check both directions.',weight:1},
 {id:'materials',name:'Original character',tier:'Nice-to-have',detail:'Natural materials, original details and thoughtful updates. Avoid generic renovations that erase the house.',weight:3},
 {id:'setting',name:'Privacy & outdoor space',tier:'Nice-to-have',detail:'Privacy, mature trees and an intentional connection between indoor and outdoor spaces.',weight:3},
 {id:'renewables',name:'Off-grid / renewables',tier:'Nice-to-have',detail:'Solar, geothermal, battery storage or off-grid capability. Verify the installed systems and what they power.',weight:5},
 {id:'water',name:'Water access',tier:'Nice-to-have',detail:'Usable lake, river or creek access. Confirm whether access is private, shared or public.',weight:5},
 {id:'gardens',name:'Gardens',tier:'Nice-to-have',detail:'Established gardens, productive growing space, an orchard or a greenhouse.',weight:5},
 {id:'workshop',name:'Woodshop / workshop',tier:'Nice-to-have',detail:'Dedicated space for making and woodworking. Check usable area, power, ventilation and year-round comfort.',weight:5},
 {id:'library',name:'Study / library',tier:'Nice-to-have',detail:'A dedicated room for reading, writing or focused work. Built-in bookshelves, warm woodwork and good natural light are especially desirable.',weight:5},
 {id:'southwest',name:'Southwest Minneapolis',tier:'Nice-to-have',detail:'Lake Harriet and southwest Minneapolis are favorites. The wider metro, including White Bear Lake, is realistic.',weight:2}
]};
export function assess(p: Property, review: Review = {}, criteria = initial.criteria, budget = initial.budget) {
 review=reviewFor(p,review);
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
  if(!knownPropertyIds.has(id) || !r || typeof r!=='object' || (r.notes!==undefined && typeof r.notes!=='string') || (r.favorite!==undefined && typeof r.favorite!=='boolean')) throw Error('Invalid property notes in backup.');
  if(r.checks && (typeof r.checks!=='object' || Array.isArray(r.checks) || Object.entries(r.checks).some(([key,v])=>!ids.has(key)||!['yes','no','unknown'].includes(v)))) throw Error('Invalid assessments in backup.');
 }
 const names: Record<string,string> = {"A genuinely quiet street": "Quiet street", "Architecture with a point of view": "Architectural interest", "Warmth & original character": "Original character", "A relationship to its setting": "Privacy & outdoor space", "Southwest & the city lakes": "Southwest Minneapolis"};
 const additions = new Set(['commute','renewables','water','gardens','workshop','library']);
 const oldCommute='Within 45 minutes by car of McKnight Foundation, 921 Washington Avenue S, Minneapolis. Check typical weekday commute traffic.';
 const criteria = s.criteria.map(c=>({...c,name:names[c.name]??c.name,detail:c.id==='commute'&&c.detail===oldCommute?initial.criteria.find(x=>x.id==='commute')!.detail:c.detail}));
 for (const c of initial.criteria) {
  if (additions.has(c.id) && !ids.has(c.id)) criteria.push({...c});
 }
 return {...s,criteria};
}
export function download(filename: string, body: string, type='application/json') {
 const url=URL.createObjectURL(new Blob([body],{type}));const a=document.createElement('a');a.href=url;a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
export const money=(n:number|null)=> n===null?'Price unknown':new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(n);
