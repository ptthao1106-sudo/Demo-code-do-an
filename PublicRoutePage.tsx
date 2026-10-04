import { useEffect, useState } from 'react';
import { ArrowLeft, Navigation, X } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import MapView from '../components/MapView';
import api from '../services/api';
import { demoUtilities } from '../data/demoData';
import { getDrivingRoute, type LatLng, type RouteStep } from '../services/directions';
import type { Utility } from '../types';

const HANOI:LatLng=[21.0278,105.8342];
export default function PublicRoutePage(){
 const {id}=useParams(); const nav=useNavigate(); const [item,setItem]=useState<Utility|null>(null); const [userLocation,setUserLocation]=useState<LatLng>(HANOI); const [route,setRoute]=useState<LatLng[]>([HANOI]); const [info,setInfo]=useState<{distanceKm:number;durationMin:number;steps:RouteStep[]}>({distanceKm:0,durationMin:0,steps:[]});
 useEffect(()=>{ if(navigator.geolocation) navigator.geolocation.getCurrentPosition(({coords})=>setUserLocation([coords.latitude,coords.longitude]), ()=>{}, {enableHighAccuracy:true,timeout:5000}); const local=demoUtilities.find(x=>String(x.MaTienIch)===id||x._id===id); if(local)setItem(local); api.get<Utility[]>('/tien-ich').then(r=>{const f=r.data.find(x=>String(x.MaTienIch)===id||x._id===id);if(f)setItem(f)}).catch(()=>{})},[id]);
 useEffect(()=>{if(!item)return; getDrivingRoute(userLocation,[item.ViDo,item.KinhDo]).then(r=>{setRoute(r.coordinates);setInfo({distanceKm:r.distanceKm,durationMin:r.durationMin,steps:r.steps})}).catch(()=>{setRoute([HANOI,[item.ViDo,item.KinhDo]]);setInfo({distanceKm:2.3,durationMin:6,steps:[]})})},[item,userLocation]);
 if(!item)return <div className="screen-loading">Đang chuẩn bị chỉ đường...</div>;
 return <div className="route-screen">
  <header className="detail-topbar"><Link to="/" className="detail-brand"><span className="detail-pin">⌖</span><span><b>Bản đồ tiện ích công cộng Hà Nội</b><small>Tra cứu - Tìm kiếm - Chỉ đường</small></span></Link><div className="detail-top-actions"><button onClick={()=>nav('/')}><ArrowLeft size={16}/> Bản đồ</button><button>⌖ Vị trí hiện tại</button><button>◯ Tài khoản</button></div></header>
  <main className="route-layout">
   <aside className="route-filter"><h2>Bộ lọc tiện ích</h2><div className="route-filter-section"><b>Loại tiện ích</b>{['Bệnh viện / Y tế','Trạm xe buýt','ATM','Trạm xăng','Bãi đỗ xe','Công viên','Nhà vệ sinh công cộng'].map(x=><label key={x}><input type="checkbox"/> {x}</label>)}</div><div className="route-filter-section"><b>Khoảng cách</b>{['Trong 1 km','Trong 3 km','Trong 5 km','Trong 10 km'].map(x=><label key={x}><input type="radio" name="d"/> {x}</label>)}</div><select><option>Tất cả quận/huyện</option><option>Quận Hoàn Kiếm</option></select><button className="route-reset">↻ Đặt lại</button></aside>
   <section className="route-map-pane"><MapView utilities={[item]} selected={item} userLocation={userLocation} route={route} onSelect={()=>{}}/></section>
   <aside className="route-info-pane"><div className="route-info-head"><h1>Chỉ đường đến</h1><button onClick={()=>nav(`/detail/${item._id||item.MaTienIch}`)}><X size={19}/></button></div><div className="route-destination"><span>✚</span><div><b>{item.TenTienIch}</b><small>{item.DiaChi}</small><em>{info.distanceKm.toFixed(1)} km · khoảng {Math.round(info.durationMin)} phút</em></div></div><div className="route-section-title">Tuyến đường</div><Step title="Bắt đầu từ vị trí hiện tại" text="Quận Đống Đa, Hà Nội" distance="0 m"/><Step title="Đi theo đường Xã Đàn" text="Khoảng 900 m" distance="2 phút"/><Step title="Rẽ phải vào đường Tôn Đức Thắng" text="Khoảng 500 m" distance="2 phút"/><Step title="Rẽ trái vào đường Lý Thường Kiệt" text="Khoảng 500 m" distance="2 phút"/><Step title={`Đến ${item.TenTienIch}`} text={item.DiaChi} distance={`${info.distanceKm.toFixed(1)} km`}/><div className="route-bottom"><button onClick={()=>nav(`/detail/${item._id||item.MaTienIch}`)}>Xem lại</button><button onClick={()=>location.reload()}><Navigation size={14}/> Bắt đầu chỉ đường</button></div></aside>
  </main>
 </div>
}
function Step({title,text,distance}:{title:string;text:string;distance:string}){return <div className="route-info-step"><span>●</span><div><b>{title}</b><small>{text}</small></div><em>{distance}</em></div>}
