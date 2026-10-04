import { useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, Crosshair, Filter, LocateFixed, MapPin, Navigation, Phone, RotateCcw, Search, X, Clock3, Tag, Menu, UserRound } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import MapView from '../components/MapView';
import api from '../services/api';
import { demoTypes, demoUtilities } from '../data/demoData';
import { getDrivingRoute, type LatLng, type RouteStep } from '../services/directions';
import type { Utility, UtilityType } from '../types';

const HANOI: LatLng = [21.0278, 105.8342];
function distanceKm(a: LatLng, b: LatLng) {
  const [lat1, lon1] = a.map(v => v * Math.PI / 180), [lat2, lon2] = b.map(v => v * Math.PI / 180);
  const dLat = lat2 - lat1, dLon = lon2 - lon1;
  const h = Math.sin(dLat/2)**2 + Math.cos(lat1)*Math.cos(lat2)*Math.sin(dLon/2)**2;
  return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1-h));
}
const typeStyle = (name = '') => {
  const n = name.toLowerCase();
  if (n.includes('công viên')) return ['#16a66d','♟'];
  if (n.includes('atm')) return ['#1179e7','▣'];
  if (n.includes('vệ sinh')) return ['#157de1','♟'];
  if (n.includes('xăng')) return ['#f59e0b','⛽'];
  if (n.includes('buýt')) return ['#f59e0b','▣'];
  if (n.includes('thư viện')) return ['#6d2bd1','◆'];
  return ['#ef4444','✚'];
};

export default function HomePage() {
  const navigate = useNavigate();
  const [utilities, setUtilities] = useState<Utility[]>([]), [types, setTypes] = useState<UtilityType[]>([]);
  const [query, setQuery] = useState(''), [typeId, setTypeId] = useState(''), [distance, setDistance] = useState(''), [district, setDistrict] = useState('');
  const [userLocation, setUserLocation] = useState<LatLng | null>(null), [selected, setSelected] = useState<Utility | null>(null);
  const [route, setRoute] = useState<LatLng[] | null>(null), [routeInfo, setRouteInfo] = useState<{distanceKm:number;durationMin:number;steps:RouteStep[]}|null>(null);
  const [loading, setLoading] = useState(true), [notice, setNotice] = useState(''), [routeLoading, setRouteLoading] = useState(false);
  const [filterOpen, setFilterOpen] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [u,t] = await Promise.all([api.get<Utility[]>('/tien-ich',{params:{q:query||undefined,maLoai:typeId||undefined}}), api.get<UtilityType[]>('/loai-tien-ich')]);
      let found = u.data.filter(x=>x.TrangThai);
      // Query the public OSM catalogue around the current map/user area as well as the
      // project's own records. This keeps the map useful beyond the small demo dataset.
      // For an empty query, load nearby OSM facilities by category so the map can suggest
      // useful places instead of showing only the seeded eight records.
      try {
        const osm = await api.get<Utility[]>('/osm/search', { params: {
          q: query.trim(), category: typeId || undefined, district: district || undefined,
          radiusKm: distance || (district ? 25 : undefined),
          lat: userLocation?.[0] ?? HANOI[0], lon: userLocation?.[1] ?? HANOI[1],
          nearby: query.trim() ? undefined : 'true'
        } });
        const known = new Set(found.map(x => `${x.TenTienIch.toLowerCase()}|${Number(x.ViDo).toFixed(4)}|${Number(x.KinhDo).toFixed(4)}`));
        for (const item of osm.data || []) {
          const key = `${item.TenTienIch.toLowerCase()}|${Number(item.ViDo).toFixed(4)}|${Number(item.KinhDo).toFixed(4)}`;
          if (!known.has(key)) { found.push(item); known.add(key); }
        }
      } catch { /* Keep local results if the public OSM service is unavailable. */ }
      setUtilities(found); setTypes(t.data.filter(x=>x.TrangThai));
      // Every query result displayed to the public user is immediately published to the
      // admin feed. The feed is temporary and never creates a database record.
      if (found.length && (query.trim() || typeId)) { api.post('/osm/visited', { items: found.slice(0, 50) }).catch(() => {}); }
    } catch {
      const q = query.trim().toLowerCase();
      setUtilities(demoUtilities.filter(x => (!q || `${x.TenTienIch} ${x.DiaChi} ${x.MoTa}`.toLowerCase().includes(q)) && (!typeId || x.MaLoai === Number(typeId))));
      setTypes(demoTypes);
    } finally { setLoading(false); }
  };
  useEffect(() => { const timer = setTimeout(load, 450); return () => clearTimeout(timer); }, [query, typeId, userLocation, distance, district]);

  const visible = useMemo(() => utilities.filter(item => {
    const origin = userLocation || HANOI;
    const dOk = !distance || distanceKm(origin,[item.ViDo,item.KinhDo]) <= Number(distance);
    const searchableAddress = `${item.DiaChi || ''} ${(item as Utility & {_district?: string})._district || ''} ${item.TenTienIch || ''}`.toLocaleLowerCase('vi');
    const qOk = !district || searchableAddress.includes(district.toLocaleLowerCase('vi')); 
    return dOk && qOk;
  }), [utilities,distance,userLocation,district]);

  const locate = () => {
    if (!navigator.geolocation) { setUserLocation(HANOI); setNotice('Trình duyệt không hỗ trợ vị trí, đang dùng vị trí trung tâm Hà Nội để demo.'); return; }
    setNotice('Đang xác định vị trí hiện tại...');
    navigator.geolocation.getCurrentPosition(({coords}) => { setUserLocation([coords.latitude,coords.longitude]); setNotice('Đã xác định vị trí hiện tại.'); }, () => { setUserLocation(HANOI); setNotice('Không được cấp quyền vị trí. Hệ thống đang dùng vị trí trung tâm Hà Nội để bạn vẫn thử được chỉ đường.'); }, { enableHighAccuracy:true, timeout:7000 });
  };
  const directions = async (item: Utility) => {
    const origin = userLocation || HANOI;
    setRouteLoading(true); setNotice('Đang tính tuyến đường Hà Nội...');
    try {
      const r = await getDrivingRoute(origin,[item.ViDo,item.KinhDo]);
      setRoute(r.coordinates); setRouteInfo({distanceKm:r.distanceKm,durationMin:r.durationMin,steps:r.steps}); setSelected(item); setNotice('Đã vẽ tuyến đường lái xe trên bản đồ.');
    } catch (e) { setNotice(e instanceof Error ? e.message : 'Không thể tính đường đi.'); }
    finally { setRouteLoading(false); }
  };
  const reset = () => { setQuery(''); setTypeId(''); setDistance(''); setDistrict(''); setSelected(null); setRoute(null); setRouteInfo(null); setNotice(''); };
  const resultList = visible.slice(0,12);

  return <div className="public-app">
    <Header />
    <div className="quick-search-bar">
      <div className="quick-search-box"><Search size={19}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Nhập từ khóa (ví dụ: bệnh viện, công viên, ATM, nhà vệ sinh...)"/><button onClick={load}>Tìm kiếm</button></div>
      <div className="support-actions"><button onClick={locate}><LocateFixed size={19}/> Vị trí hiện tại</button><button onClick={()=>selected?directions(selected):setNotice('Hãy chọn một tiện ích rồi bấm Chỉ đường.') }><Navigation size={19}/> Chỉ đường</button><Link to="/admin/login" className="account-link"><UserRound size={20}/></Link></div>
    </div>
    {notice && <div className="top-notice"><span>{notice}</span><button onClick={()=>setNotice('')}><X size={14}/></button></div>}

    <main className="public-grid">
      <aside className={`filter-column ${filterOpen?'':'collapsed'}`}>
        <button className="filter-header" onClick={()=>setFilterOpen(v=>!v)}><span><Filter size={17}/> Bộ lọc tiện ích</span><ChevronDown size={17}/></button>
        {filterOpen && <div className="filter-body">
          <section><div className="section-title">Loại tiện ích <ChevronDown size={15}/></div>{types.slice(0,7).map(t=>{const [bg,g]=typeStyle(t.TenLoai); return <label key={t.MaLoai} className="type-option"><input type="checkbox" checked={typeId===String(t.MaLoai)} onChange={()=>setTypeId(typeId===String(t.MaLoai)?'':String(t.MaLoai))}/><span className="type-bubble" style={{background:bg}}>{g}</span><span>{t.TenLoai}</span></label>})}</section>
          <section><div className="section-title">Khoảng cách <ChevronDown size={15}/></div>{[['1','Trong 1 km'],['3','Trong 3 km'],['5','Trong 5 km'],['10','Trong 10 km']].map(([v,l])=><label className="radio-option" key={v}><input type="radio" name="distance" checked={distance===v} onChange={()=>setDistance(v)}/><span>{l}</span></label>)}</section>
          <section><div className="section-title">Quận/Huyện <ChevronDown size={15}/></div><select value={district} onChange={e=>setDistrict(e.target.value)}><option value="">Tất cả quận/huyện</option><option>Ba Đình</option><option>Bắc Từ Liêm</option><option>Cầu Giấy</option><option>Đống Đa</option><option>Hai Bà Trưng</option><option>Hoàn Kiếm</option><option>Hà Đông</option><option>Long Biên</option><option>Nam Từ Liêm</option><option>Thanh Xuân</option><option>Tây Hồ</option></select></section>
          <button className="reset-filter" onClick={reset}><RotateCcw size={16}/> Đặt lại</button>
        </div>}
      </aside>

      <section className="map-column">
        <MapView utilities={visible} selected={selected} userLocation={userLocation} route={route} onSelect={(item)=>setSelected(item)} onLocate={locate}/>
        {loading && <div className="map-loading-pill">Đang tải dữ liệu...</div>}
        {routeLoading && <div className="map-loading-pill">Đang tính đường đi...</div>}
        {routeInfo && <div className="route-summary"><b>{routeInfo.distanceKm.toFixed(1)} km</b><span>~ {Math.round(routeInfo.durationMin)} phút</span><button onClick={()=>{setRoute(null);setRouteInfo(null)}}><X size={13}/></button></div>}
      </section>

      <aside className="result-column">
        {!selected ? <>
          <div className="result-header"><h2>Kết quả tìm kiếm</h2><span>{visible.length} kết quả</span></div>
          <div className="result-list">{resultList.length ? resultList.map(item=>{const [bg,g]=typeStyle(item.TenLoai); const d=userLocation?distanceKm(userLocation,[item.ViDo,item.KinhDo]):null; return <button className="result-row" key={item._id||item.MaTienIch} onClick={()=>setSelected(item)}><span className="result-bubble" style={{background:bg}}>{g}</span><span className="result-copy"><b>{item.TenTienIch}</b><small>{item.DiaChi}</small><em><MapPin size={13}/> {d===null?'—':`${d.toFixed(1)} km`}</em></span><ChevronRight size={20} className="result-arrow"/></button>}) : <div className="empty-result">Không tìm thấy tiện ích phù hợp.</div>}</div>
        </> : routeInfo ? <DirectionsPanel item={selected} info={routeInfo} onClose={()=>{setRoute(null);setRouteInfo(null)}} onDirections={()=>directions(selected)}/> : <DetailPanel item={selected} distance={userLocation?distanceKm(userLocation,[selected.ViDo,selected.KinhDo]):undefined} onClose={()=>setSelected(null)} onDirections={()=>directions(selected)}/>} 
      </aside>
    </main>
    <div className="map-status">● Đã bật định vị — {userLocation ? 'vị trí hiện tại đã được xác định.' : 'chọn Vị trí hiện tại để hỗ trợ chỉ đường.'}</div>
  </div>;
}

function DetailPanel({item,distance,onClose,onDirections}:{item:Utility;distance?:number;onClose:()=>void;onDirections:()=>void}) {
  return <div className="side-detail"><div className="side-detail-head"><h2>Chi tiết tiện ích</h2><button onClick={onClose}><X size={19}/></button></div><img className="side-detail-image" src={item.HinhAnh || '/assets/park-demo.jpg'} alt="" onError={(e)=>{e.currentTarget.src='/assets/park-demo.jpg'}}/><div className="side-detail-title"><span className="detail-type-dot" style={{background:typeStyle(item.TenLoai)[0]}}>{typeStyle(item.TenLoai)[1]}</span><b>{item.TenTienIch}</b></div><div className="detail-lines"><div><Tag/><b>Loại:</b><span>{item.TenLoai||`Loại ${item.MaLoai}`}</span></div><div><MapPin/><b>Địa chỉ:</b><span>{item.DiaChi}</span></div><div className="wide"><Crosshair/><b>Mô tả:</b><span>{item.MoTa||'Chưa có mô tả.'}</span></div><div><Phone/><b>Số điện thoại:</b><span>{item.SoDienThoai||'Chưa cập nhật'}</span></div><div><Clock3/><b>Giờ mở cửa:</b><span>{item.GioMoCua||'Chưa cập nhật'}</span></div><div className="wide"><MapPin/><b>Vị trí:</b><span>{item.ViDo.toFixed(5)}, {item.KinhDo.toFixed(5)}{distance!==undefined?` · ${distance.toFixed(1)} km`:''}</span></div></div><div className="side-actions"><button onClick={onDirections}><Navigation size={16}/> Chỉ đường</button><button onClick={onClose}>Đóng</button></div></div>
}

function DirectionsPanel({item,info,onClose,onDirections}:{item:Utility;info:{distanceKm:number;durationMin:number;steps:RouteStep[]};onClose:()=>void;onDirections:()=>void}) {
  const maneuverIcon = (m:string) => m.includes('left') ? '↰' : m.includes('right') ? '↱' : '↑';
  return <div className="directions-panel"><div className="directions-head"><h2>Chỉ đường đến</h2><button onClick={onClose}><X size={19}/></button></div><div className="destination-card"><span className="result-bubble red">✚</span><div><b>{item.TenTienIch}</b><small>{item.DiaChi}</small><em>{info.distanceKm.toFixed(1)} km · khoảng {Math.round(info.durationMin)} phút</em></div></div><div className="route-title">Tuyến đường</div><div className="route-step"><span className="route-dot">●</span><div><b>Bắt đầu từ vị trí hiện tại</b><small>Vị trí của bạn tại Hà Nội</small></div><em>0 m</em></div>{info.steps.length ? info.steps.map((step,index)=><div className="route-step" key={`${step.name}-${index}`}><span className="route-dot">{maneuverIcon(step.maneuver)}</span><div><b>{step.name}</b><small>{index===0?'Bắt đầu đi theo tuyến đường':step.maneuver}</small></div><em>{step.distance >= 1000 ? `${(step.distance/1000).toFixed(1)} km` : `${Math.round(step.distance)} m`}</em></div>) : <div className="route-step"><span className="route-dot">↥</span><div><b>Đi theo tuyến đường đã tính</b><small>Tuyến đường ô tô tại Hà Nội</small></div><em>{info.distanceKm.toFixed(1)} km</em></div>}<div className="route-step"><span className="route-dot">⌖</span><div><b>Đến {item.TenTienIch}</b><small>{item.DiaChi}</small></div><em>Đích</em></div><div className="directions-footer"><button onClick={onClose}>Xem lại</button><button onClick={onDirections}><Navigation size={14}/> Tính lại đường</button></div></div>
}
