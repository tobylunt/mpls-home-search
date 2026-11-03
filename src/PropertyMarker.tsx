import { useEffect, useMemo, useRef } from 'react';
import { Marker, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { Property } from './model';
import { assetUrl } from './assets';

type Props = {
 property:Property;
 shortlisted:boolean;
 highlighted:boolean;
 hidden:boolean;
 dimmed:boolean;
 previewPhoto:boolean;
 onHover:(id:string|null)=>void;
 onFocus:(id:string|null)=>void;
 onOpen:(property:Property)=>void;
};

export function PropertyMarker({property:p,shortlisted,highlighted,hidden,dimmed,previewPhoto,onHover,onFocus,onOpen}:Props){
 const marker=useRef<L.Marker>(null);
 const map=useMap();
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
  el.classList.toggle('is-hidden',hidden);
 },[icon,highlighted,hidden,p.address,shortlisted]);

 useEffect(()=>{
  const el=marker.current?.getElement();
  if(!el)return;
  const focus=()=>onFocus(p.id);
  const blur=()=>onFocus(null);
  el.addEventListener('focus',focus);
  el.addEventListener('blur',blur);
  return()=>{el.removeEventListener('focus',focus);el.removeEventListener('blur',blur)};
 },[icon,onFocus,p.id]);

 const hasPhoto=previewPhoto&&!!p.photo;
 // Keep the taller preview below pins near the map's top edge.
 const below=hasPhoto&&map.latLngToContainerPoint(position).y<230;

 return <Marker ref={marker} position={position} icon={icon}
  opacity={hidden?0:dimmed?0.18:1}
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
  {highlighted&&<Tooltip key={`${hasPhoto?'photo':'address'}-${below?'bottom':'top'}`} permanent direction={below?'bottom':'top'} offset={below?[0,34]:[0,0]} opacity={1} className={hasPhoto?'map-photo-tooltip':''}>
   {hasPhoto&&<img src={assetUrl(p.photo!.src)} alt="" width="240" height="150"/>}
   <span>{p.address}</span>
  </Tooltip>}
 </Marker>;
}
