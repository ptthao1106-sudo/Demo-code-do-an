import { useEffect, useMemo, useState } from 'react';
import { Crosshair, LocateFixed, Minus, Plus } from 'lucide-react';
import type { Utility } from '../types';
import type { LatLng } from '../services/directions';

const HANOI: LatLng = [21.0278, 105.8342];
type Props = { utilities: Utility[]; selected: Utility | null; userLocation: LatLng | null; route: LatLng[] | null; onSelect: (utility: Utility) => void; onLocate?: () => void };
const SIZE = 256;
function worldPoint([lat, lon]: LatLng, zoom: number): [number, number] {
  const scale = SIZE * 2 ** zoom;
  const sin = Math.sin(lat * Math.PI / 180);
  return [(lon + 180) / 360 * scale, (0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) * scale];
}
function tileUrl(x: number, y: number, z: number) { const n = 2 ** z; const xx = ((x % n) + n) % n; if (y < 0 || y >= n) return ''; return `https://tile.openstreetmap.org/${z}/${xx}/${y}.png`; }
function iconFor(item: Utility) { const name = `${item.TenLoai || ''} ${item.TenTienIch}`.toLowerCase(); if (name.includes('công viên')) return ['#16a66d','♟']; if (name.includes('atm')) return ['#0b79e6','▣']; if (name.includes('xăng')) return ['#f59e0b','⛽']; if (name.includes('vệ sinh')) return ['#157de1','♟']; if (name.includes('buýt')) return ['#f59e0b','▣']; if (name.includes('đỗ xe')) return ['#1884dd','▰']; if (name.includes('thư viện')) return ['#6b2bd1','◆']; return ['#ef4444','✚']; }
export default function MapView({ utilities, selected, userLocation, route, onSelect, onLocate }: Props) {
  const [zoom, setZoom] = useState(13); const [pan, setPan] = useState<LatLng>(HANOI); const [size, setSize] = useState({ w: 800, h: 600 });
  useEffect(() => { if (selected) setPan([selected.ViDo, selected.KinhDo]); else if (route?.length) setPan(route[Math.floor(route.length / 2)]); }, [selected, route]);
  useEffect(() => { const el = document.querySelector('.real-map-shell'); if (!el) return; const update = () => setSize({ w: el.clientWidth || 800, h: el.clientHeight || 600 }); update(); const observer = new ResizeObserver(update); observer.observe(el); return () => observer.disconnect(); }, []);
  const center = worldPoint(pan, zoom); const originX = Math.floor((center[0] - size.w / 2) / SIZE); const originY = Math.floor((center[1] - size.h / 2) / SIZE);
  const toScreen = (point: LatLng): [number, number] => { const p = worldPoint(point, zoom); return [p[0] - center[0] + size.w / 2, p[1] - center[1] + size.h / 2]; };
  const tiles = useMemo(() => { const arr: {x:number;y:number;url:string}[]=[]; for(let x=originX-1;x<=originX+Math.ceil(size.w/SIZE)+1;x++) for(let y=originY-1;y<=originY+Math.ceil(size.h/SIZE)+1;y++){ const url=tileUrl(x,y,zoom); if(url) arr.push({x,y,url}); } return arr; }, [originX,originY,size.w,size.h,zoom]);
  const routePoints = route?.map(p => toScreen(p).join(',')).join(' ') || '';
  return <div className="real-map-shell osm-map-shell" onWheel={e => { if (e.deltaY < 0) setZoom(z => Math.min(19,z+1)); else setZoom(z => Math.max(3,z-1)); }}>
    <div className="osm-tile-canvas">{tiles.map(t => <img key={`${t.x}-${t.y}-${zoom}`} draggable={false} className="osm-tile" src={t.url} alt="" style={{left:t.x*SIZE-center[0]+size.w/2,top:t.y*SIZE-center[1]+size.h/2}} onError={e=>{e.currentTarget.style.opacity='0.35'}} />)}</div>
    <svg className="osm-route-layer" viewBox={`0 0 ${size.w} ${size.h}`} preserveAspectRatio="none">{route && route.length>1 && <polyline points={routePoints} fill="none" stroke="#0878e5" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />}</svg>
    {utilities.map(item => { const [x,y]=toScreen([item.ViDo,item.KinhDo]); if(x < -30 || y < -40 || x > size.w+30 || y > size.h+20) return null; const [bg,g]=iconFor(item); return <button key={item._id || item.MaTienIch} className="osm-utility-marker" title={item.TenTienIch} onClick={()=>{setPan([item.ViDo,item.KinhDo]);onSelect(item)}} style={{left:x,top:y,'--marker':bg} as React.CSSProperties}>{g}</button>; })}
    {userLocation && (()=>{const [x,y]=toScreen(userLocation); return <span className="osm-user-marker" style={{left:x,top:y}} title="Vị trí hiện tại"/>})()}
    <div className="map-type-switch osm-attribution"><span>OpenStreetMap</span></div><div className="map-zoom-tools"><button onClick={()=>setZoom(z=>Math.min(19,z+1))} aria-label="Phóng to"><Plus size={18}/></button><button onClick={()=>setZoom(z=>Math.max(3,z-1))} aria-label="Thu nhỏ"><Minus size={18}/></button><button onClick={()=>{onLocate?.(); if(userLocation)setPan(userLocation)}} aria-label="Vị trí hiện tại"><LocateFixed size={18}/></button></div><div className="map-crosshair"><Crosshair size={19}/></div>
    <div className="osm-map-credit">© OpenStreetMap contributors</div>{route && <div className="map-route-badge">● Tuyến đường OSRM đang hiển thị</div>}
  </div>;
}
