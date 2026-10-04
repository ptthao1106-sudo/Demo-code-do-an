import { Link } from 'react-router-dom';
import { CircleUserRound, MapPin, Navigation, Compass } from 'lucide-react';

export default function Header() {
  return <header className="public-header">
    <Link to="/" className="public-brand"><span className="brand-icon"><MapPin size={27} fill="white"/></span><span><b>Tiện ích công cộng Hà Nội</b><small>Tra cứu - Tìm kiếm - Chỉ đường</small></span></Link>
    <nav className="public-nav"><Link to="/" className="public-nav-link"><Compass size={17}/> Bản đồ</Link><Link to="/admin/login" className="public-nav-link"><CircleUserRound size={20}/> Tài khoản</Link></nav>
  </header>;
}
