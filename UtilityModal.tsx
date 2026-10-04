import { Clock3, MapPin, Navigation, Phone, Tag, X } from 'lucide-react';
import type { Utility } from '../types';
interface Props {item:Utility;distance?:number;onClose:()=>void;onDirections:()=>void}
export default function UtilityModal({item,distance,onClose,onDirections}:Props){return <div className="detail-overlay" onMouseDown={onClose}><div className="detail-dialog" onMouseDown={e=>e.stopPropagation()}>
  <div className="detail-title"><h2>Chi tiết tiện ích</h2><button onClick={onClose}><X/></button></div>
  {item.HinhAnh?<img className="detail-image" src={item.HinhAnh} alt={item.TenTienIch}/>:<div className="detail-image detail-placeholder">TIỆN ÍCH CÔNG CỘNG HÀ NỘI</div>}
  <div className="detail-name"><span className="result-icon green">♟</span><h3>{item.TenTienIch}</h3></div>
  <div className="detail-grid">
    <div><Tag/><strong>Loại:</strong><span>{item.TenLoai||`Loại ${item.MaLoai}`}</span></div>
    <div><MapPin/><strong>Địa chỉ:</strong><span>{item.DiaChi}</span></div>
    <div className="wide"><span className="detail-icon">▤</span><strong>Mô tả:</strong><span>{item.MoTa||'Chưa có mô tả.'}</span></div>
    <div><Phone/><strong>Số điện thoại:</strong><span>{item.SoDienThoai||'Chưa cập nhật'}</span></div>
    <div><Clock3/><strong>Giờ mở cửa:</strong><span>{item.GioMoCua||'Chưa cập nhật'}</span></div>
    <div><MapPin/><strong>Vị trí:</strong><span>{item.ViDo.toFixed(5)}, {item.KinhDo.toFixed(5)}{distance!==undefined?` · ${distance.toFixed(1)} km`:''}</span></div>
  </div>
  <div className="detail-actions"><button className="primary-action" onClick={onDirections}><Navigation size={18}/> Chỉ đường</button><button className="outline-action" onClick={onClose}>Đóng</button></div>
</div></div>}
