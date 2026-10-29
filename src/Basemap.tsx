import { useEffect, useState } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { maplibreGL } from '@maplibre/maplibre-gl-leaflet';
import { setWorkerUrl } from 'maplibre-gl';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import 'maplibre-gl/dist/maplibre-gl.css';

setWorkerUrl(workerUrl);
const attribution='<a href="https://openfreemap.org/">OpenFreeMap</a> · <a href="https://openmaptiles.org/">OpenMapTiles</a> · © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';
export function Basemap(){
 const map=useMap();
 const [failed,setFailed]=useState(false);
 useEffect(()=>{
  let vector:ReturnType<typeof maplibreGL>|undefined;
  let fallback:L.TileLayer|undefined;
  let disposed=false;
  let loaded=false;
  const useFallback=()=>{
   if(disposed||fallback)return;
   if(vector&&map.hasLayer(vector))map.removeLayer(vector);
   fallback=L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'}).addTo(map);
   setFailed(true);
  };
  try{
   vector=maplibreGL({style:'https://tiles.openfreemap.org/styles/positron',attributionControl:false});
   vector.addTo(map);
   map.attributionControl.addAttribution(attribution);
   vector.getMaplibreMap().on('load',()=>{loaded=true;setFailed(false)});
  }catch{useFallback()}
  const timeout=window.setTimeout(()=>{if(!loaded)useFallback()},20000);
  return()=>{disposed=true;window.clearTimeout(timeout);if(vector&&map.hasLayer(vector))map.removeLayer(vector);if(fallback)map.removeLayer(fallback);map.attributionControl.removeAttribution(attribution)};
 },[map]);
 return failed?<div className="basemap-notice" role="status">Positron unavailable · standard map</div>:null;
}
