import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { ArrowLeft, Clock3, Crosshair, MapPin, Navigation, Phone, Tag, X } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import MapView from '../components/MapView';
import api from '../services/api';
import { demoUtilities } from '../data/demoData';
import type { Utility } from '../types';
import type { LatLng } from '../services/directions';

function distanceKm(a: LatLng, b: LatLng) { const [lat1, lon1] = a.map(v => v * Math.PI / 180), [lat2, lon2] = b.map(v => v * Math.PI / 180); const dLat = lat2 - lat1, dLon = lon2 - lon1; const h = Math.sin(dLat/2)**2 + Math.cos(lat1)*Math.cos(lat2)*Math.sin(dLon/2)**2; return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1-h)); }
const iconFor = (name = '') => name.toLowerCase().includes('công viên') ? ['#16a66d','♟'] : ['#ef4444','✚'];

export default function PublicDetailPage(){
  const {id} = useParams();
  const nav = useNavigate();
  const [item,setItem] = useState<Utility|null>(null);
  const [userLocation,setUserLocation] = useState<LatLng|null>(null);
  useEffect(()=>{
    const local = demoUtilities.find(x => String(x.MaTienIch) === id || x._id === id);
    if(local) setItem(local);
    api.get<Utility[]>('/tien-ich').then(r=>{
      const found=r.data.find(x=>String(x.MaTienIch)===id || x._id===id);
      if(found) setItem(found);
    }).catch(()=>{});
  },[id]);
  useEffect(()=>{ if (!navigator.geolocation) return; navigator.geolocation.getCurrentPosition(({coords})=>setUserLocation([coords.latitude,coords.longitude]), ()=>{}, {enableHighAccuracy:true, timeout:5000}); },[]);
  if(!item) return <div className="screen-loading">Đang tải thông tin tiện ích...</div>;
  const [bg,g]=iconFor(item.TenLoai);
  return <div className="detail-screen">
    <header className="detail-topbar"><Link to="/" className="detail-brand"><span className="detail-pin">⌖</span><span><b>Bản đồ tiện ích công cộng Hà Nội</b><small>Tra cứu - Tìm kiếm - Chỉ đường</small></span></Link><div className="detail-top-actions"><button onClick={()=>nav('/')}><ArrowLeft size={16}/> Bản đồ</button><button>⌖ Vị trí hiện tại</button><button>◯ Tài khoản</button></div></header>
    <main className="detail-layout">
      <section className="detail-map-pane"><MapView utilities={[item]} selected={item} userLocation={userLocation} route={null} onSelect={()=>{}}/></section>
      <aside className="detail-info-pane">
        <div className="detail-info-head"><h1>Chi tiết tiện ích</h1><button onClick={()=>nav('/')}><X size={19}/></button></div>
        <img src={item.HinhAnh || '/assets/park-demo.jpg'} className="detail-hero" onError={e=>e.currentTarget.src='/assets/park-demo.jpg'} />
        <div className="detail-name"><span style={{background:bg}}>{g}</span><b>{item.TenTienIch}</b></div>
        <div className="detail-info-list">
          <Info icon={<Tag/>} label="Loại" value={item.TenLoai || `Loại ${item.MaLoai}`}/>
          <Info icon={<MapPin/>} label="Địa chỉ" value={item.DiaChi}/>
          <Info icon={<Crosshair/>} label="Mô tả" value={item.MoTa || 'Công viên, khu vui chơi, không gian xanh và khu vực vui chơi, phù hợp nghỉ ngơi và tập thể dục.'}/>
          <Info icon={<Phone/>} label="Số điện thoại" value={item.SoDienThoai || '024 3851 3683'}/>
          <Info icon={<Clock3/>} label="Giờ mở cửa" value={item.GioMoCua || '05:00 – 22:00'}/>
          <Info icon={<MapPin/>} label="Vị trí" value={`${item.ViDo.toFixed(5)}, ${item.KinhDo.toFixed(5)}${userLocation ? ` · ${distanceKm(userLocation,[item.ViDo,item.KinhDo]).toFixed(1)} km` : ''}`}/>
        </div>
        <div className="detail-actions"><button onClick={()=>nav(`/route/${item._id || item.MaTienIch}`)}><Navigation size={15}/> Chỉ đường</button><button onClick={()=>nav('/')}>Đóng</button></div>
      </aside>
    </main>
  </div>
}
function Info({icon,label,value}:{icon:ReactNode;label:string;value:string}){return <div className="detail-info-row">{icon}<b>{label}:</b><span>{value}</span></div>}
