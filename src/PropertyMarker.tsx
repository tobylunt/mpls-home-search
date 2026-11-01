import { useEffect, useMemo, useRef } from 'react';
import { Marker, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import type { Property } from './model';

type Props = {
 property:Property;
 shortlisted:boolean;
 highlighted:boolean;
 onHover:(id:string|null)=>void;
 onFocus:(id:string|null)=>void;
 onOpen:(property:Property)=>void;
};

export function PropertyMarker({property:p,shortlisted,highlighted,onHover,onFocus,onOpen}:Props){
 const marker=useRef<L.Marker>(null);
 const position=useMemo(()=>[Number(p.lat),Number(p.lng)] as [number,number],[p.lat,p.lng]);
 const icon=useMemo(()=>L.divIcon({
  className:'home-pin',
  html:`<span class="pin-body${p.status==='Sold reference'?' reference':''}">${shortlisted?'★ ':''}${p.price?'$'+Math.round(p.price/1000)+'k':'?'}</span>`,
  iconSize:[70,30],iconAnchor:[35,30],tooltipAnchor:[0,-34]
 }),[p.price,p.status,shortlisted]);

 useEffect(()=>{
  const el=marker.current?.getElement();
  if(!el)return;
  el.setAttribute('aria-label',`${p.address}${shortlisted?', shortlisted':''}`);
  el.classList.toggle('is-highlighted',highlighted);
 },[icon,highlighted,p.address,shortlisted]);

 useEffect(()=>{
  const el=marker.current?.getElement();
  if(!el)return;
  const focus=()=>onFocus(p.id);
  const blur=()=>onFocus(null);
  el.addEventListener('focus',focus);
  el.addEventListener('blur',blur);
  return()=>{el.removeEventListener('focus',focus);el.removeEventListener('blur',blur)};
 },[icon,onFocus,p.id]);

 return <Marker ref={marker} position={position} icon={icon}
  zIndexOffset={highlighted?1000000:0}
  eventHandlers={{
   // Movement, rather than mouseover, avoids re-highlighting a stationary
   // pointer when the details dialog's backdrop disappears.
   mousemove:()=>onHover(p.id),
   mouseout:()=>onHover(null),
   click:()=>{marker.current?.closeTooltip();onOpen(p)}
  }}>
  {/* Mount only while highlighted. Permanent disables Leaflet's automatic
      click/focus reopening, including the dialog's restored focus. */}
  {highlighted&&<Tooltip permanent direction="top" opacity={1}>{p.address}</Tooltip>}
 </Marker>;
}
