import { FormEvent, useState } from 'react';
import { ArrowLeft, Eye, EyeOff, LockKeyhole, MapPin, ShieldCheck, UserRound } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import type { AdminUser } from '../types';

export default function AdminLoginPage({onLogin}:{onLogin:(data:{token:string;admin:AdminUser})=>void}){
  const nav=useNavigate(); const [username,setUsername]=useState('admin'); const [password,setPassword]=useState('Admin@123'); const [show,setShow]=useState(false); const [error,setError]=useState(''); const [loading,setLoading]=useState(false);
  const submit=async(e:FormEvent)=>{e.preventDefault();setError('');setLoading(true);try{const r=await api.post('/auth/login',{TenDangNhap:username,MatKhau:password});onLogin(r.data);nav('/admin')}catch(err:any){setError(err?.response?.data?.message||'Không thể kết nối máy chủ. Hãy thử lại.')}finally{setLoading(false)}};
  return <div className="login-page"><div className="login-card-final">
    <section className="login-visual">
      <div className="login-visual-content">
        <Link to="/" className="login-back"><ArrowLeft size={15}/> Quay lại bản đồ</Link>
        <div className="login-logo"><span className="login-logo-pin"><MapPin size={30}/></span><div><b>HỆ THỐNG TÌM KIẾM</b><strong>CÁC TIỆN ÍCH CÔNG CỘNG<br/>TÍCH HỢP BẢN ĐỒ</strong></div></div>
        <p>Kết nối tiện ích - Hành trình dễ dàng hơn</p>
        <div className="login-map-art">
          <div className="login-art-water"></div><div className="login-art-road road-a"></div><div className="login-art-road road-b"></div>
          <span className="login-art-pin pin-a"><MapPin size={24}/></span><span className="login-art-pin pin-b"><MapPin size={24}/></span><span className="login-art-pin pin-c"><MapPin size={24}/></span>
        </div>
        <div className="login-category-row"><span>✚<small>Bệnh viện</small></span><span>♟<small>Công viên</small></span><span>▣<small>Trạm xe buýt</small></span><span>▣<small>ATM</small></span><span>⛽<small>Trạm xăng</small></span><span>♟<small>Nhà vệ sinh</small></span></div>
        <div className="login-slogan"><MapPin size={17}/> Dễ dàng tìm kiếm · Nhanh chóng di chuyển · Cuộc sống tiện nghi hơn</div>
      </div>
    </section>
    <form className="login-form-final" onSubmit={submit}>
      <div className="login-shield"><ShieldCheck size={30}/></div><h1>Đăng nhập quản trị</h1><p>Vui lòng nhập thông tin tài khoản để truy cập<br/>vào hệ thống quản trị</p>
      {error&&<div className="login-error">{error}</div>}
      <label><span>Tên đăng nhập</span><div><UserRound size={17}/><input value={username} onChange={e=>setUsername(e.target.value)} /></div></label>
      <label><span>Mật khẩu</span><div><LockKeyhole size={17}/><input type={show?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)}/><button type="button" onClick={()=>setShow(v=>!v)}>{show?<EyeOff size={16}/>:<Eye size={16}/>}</button></div></label>
      <div className="remember-row"><label><input type="checkbox" defaultChecked/> <span>Ghi nhớ đăng nhập</span></label><a href="#" onClick={e=>e.preventDefault()}>Quên mật khẩu?</a></div>
      <button className="login-btn" disabled={loading}>{loading?'Đang đăng nhập...':'↪  Đăng nhập'}</button><div className="login-or"><span>Hoặc</span></div><Link to="/" className="home-login-btn">←  Quay về trang chủ</Link><div className="login-tip">● &nbsp;Chỉ dành cho quản trị viên hệ thống</div>
    </form>
  </div></div>;
}
