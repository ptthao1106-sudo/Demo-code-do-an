import { useEffect, useMemo, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import {
  ChevronDown,
  Edit3,
  Home,
  List,
  LogOut,
  MapPin,
  Plus,
  Search,
  Trash2,
  UserCircle2,
  X,
  Check,
  Building2,
  CircleDollarSign,
  Bus,
  Fuel,
  CarFront,
  Trees,
  School,
  Hospital,
  Toilet,
  Landmark,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { demoTypes, demoUtilities } from '../data/demoData';
import type { AdminUser, Utility, UtilityType } from '../types';

type UtilityForm = Omit<Utility, '_id' | 'MaTienIch' | 'TenLoai' | 'NgayCapNhat'>;
type TypeForm = Omit<UtilityType, '_id' | 'MaLoai'>;

const emptyUtility: UtilityForm = {
  TenTienIch: '', MaLoai: 1, DiaChi: '', ViDo: 21.0278, KinhDo: 105.8342,
  MoTa: '', SoDienThoai: '', GioMoCua: '', HinhAnh: '', TrangThai: true,
};
const emptyType: TypeForm = { TenLoai: '', MoTa: '', TrangThai: true };

const typeIcon = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes('bệnh viện') || n.includes('y tế')) return Hospital;
  if (n.includes('công viên')) return Trees;
  if (n.includes('xe buýt')) return Bus;
  if (n.includes('atm')) return CircleDollarSign;
  if (n.includes('xăng')) return Fuel;
  if (n.includes('đỗ xe')) return CarFront;
  if (n.includes('vệ sinh')) return Toilet;
  if (n.includes('trường')) return School;
  return Landmark;
};

export default function AdminDashboardPage({ admin, onLogout }: { admin: AdminUser; onLogout: () => void }) {
  const nav = useNavigate();
  const [tab, setTab] = useState<'utilities' | 'types'>('utilities');
  const [utilities, setUtilities] = useState<Utility[]>([]);
  const [types, setTypes] = useState<UtilityType[]>([]);
  const [uf, setUf] = useState<UtilityForm>(emptyUtility);
  const [tf, setTf] = useState<TypeForm>(emptyType);
  const [editU, setEditU] = useState<string | null>(null);
  const [editT, setEditT] = useState<string | null>(null);
  const [showU, setShowU] = useState(false);
  const [showT, setShowT] = useState(false);
  const [confirmU, setConfirmU] = useState<Utility | null>(null);
  const [confirmT, setConfirmT] = useState<UtilityType | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [selected, setSelected] = useState<string[]>([]);
  const [publicSearches, setPublicSearches] = useState<Utility[]>([]);

  const loadPublicSearches = async () => {
    try { const r = await api.get<Utility[]>('/osm/recent'); setPublicSearches(r.data || []); } catch { /* optional API feed */ }
  };

  const load = async () => {
    try {
      const [u, t] = await Promise.all([
        api.get<Utility[]>('/tien-ich?admin=true'),
        api.get<UtilityType[]>('/loai-tien-ich'),
      ]);
      setUtilities(u.data.length ? u.data : demoUtilities);
      setTypes(t.data.length ? t.data : demoTypes);
      setError('');
    } catch (e: any) {
      if (e?.response?.status === 401) {
        onLogout();
        nav('/admin/login');
        return;
      }
      setUtilities(demoUtilities);
      setTypes(demoTypes);
      setError('API chưa kết nối; đang hiển thị dữ liệu mẫu để demo.');
    }
  };

  useEffect(() => {
    load(); loadPublicSearches();
    const timer = window.setInterval(loadPublicSearches, 5000);
    return () => window.clearInterval(timer);
  }, []);

  const filteredUtilities = useMemo(() => utilities.filter((x) => {
    const text = `${x.TenTienIch} ${x.DiaChi} ${x.TenLoai || ''}`.toLowerCase();
    const matchesQuery = text.includes(q.toLowerCase());
    const matchesStatus = statusFilter === 'all' || (statusFilter === 'active' ? x.TrangThai : !x.TrangThai);
    return matchesQuery && matchesStatus;
  }), [utilities, q, statusFilter]);

  const filteredTypes = useMemo(() => types.filter((x) => {
    const matchesQuery = `${x.TenLoai} ${x.MoTa}`.toLowerCase().includes(q.toLowerCase());
    const matchesStatus = statusFilter === 'all' || (statusFilter === 'active' ? x.TrangThai : !x.TrangThai);
    return matchesQuery && matchesStatus;
  }), [types, q, statusFilter]);

  const saveU = async (e: FormEvent) => {
    e.preventDefault(); setError('');
    try {
      if (editU) await api.put(`/tien-ich/${editU}`, uf); else await api.post('/tien-ich', uf);
      setMessage(editU ? 'Đã cập nhật tiện ích thành công.' : 'Đã thêm tiện ích thành công.');
      closeU(); await load();
    } catch (e: any) { setError(e?.response?.data?.message || 'Không thể lưu tiện ích.'); }
  };

  const saveT = async (e: FormEvent) => {
    e.preventDefault(); setError('');
    try {
      if (editT) await api.put(`/loai-tien-ich/${editT}`, tf); else await api.post('/loai-tien-ich', tf);
      setMessage(editT ? 'Đã cập nhật loại tiện ích thành công.' : 'Đã thêm loại tiện ích thành công.');
      closeT(); await load();
    } catch (e: any) { setError(e?.response?.data?.message || 'Không thể lưu loại tiện ích.'); }
  };

  const delU = async () => {
    if (!confirmU?._id) return;
    try { await api.delete(`/tien-ich/${confirmU._id}`); setMessage('Đã xóa tiện ích.'); setConfirmU(null); await load(); }
    catch (e: any) { setError(e?.response?.data?.message || 'Không thể xóa tiện ích.'); }
  };

  const delT = async () => {
    if (!confirmT?._id) return;
    try { await api.delete(`/loai-tien-ich/${confirmT._id}`); setMessage('Đã xóa loại tiện ích.'); setConfirmT(null); await load(); }
    catch (e: any) { setError(e?.response?.data?.message || 'Không thể xóa loại tiện ích.'); }
  };

  const closeU = () => { setShowU(false); setEditU(null); setUf({ ...emptyUtility }); };
  const closeT = () => { setShowT(false); setEditT(null); setTf({ ...emptyType }); };

  const openU = (x?: Utility) => {
    if (x) {
      setUf({ TenTienIch: x.TenTienIch, MaLoai: x.MaLoai, DiaChi: x.DiaChi, ViDo: x.ViDo, KinhDo: x.KinhDo,
        MoTa: x.MoTa, SoDienThoai: x.SoDienThoai, GioMoCua: x.GioMoCua, HinhAnh: x.HinhAnh, TrangThai: x.TrangThai });
      setEditU(x._id || null);
    } else { setUf({ ...emptyUtility }); setEditU(null); }
    setShowU(true);
  };

  const openT = (x?: UtilityType) => {
    if (x) { setTf({ TenLoai: x.TenLoai, MoTa: x.MoTa, TrangThai: x.TrangThai }); setEditT(x._id || null); }
    else { setTf({ ...emptyType }); setEditT(null); }
    setShowT(true);
  };

  const toggleUtility = async (x: Utility) => {
    if (!x._id) return;
    try { await api.put(`/tien-ich/${x._id}`, { ...x, TrangThai: !x.TrangThai }); await load(); }
    catch (e: any) { setError(e?.response?.data?.message || 'Không thể cập nhật trạng thái.'); }
  };

  const toggleType = async (x: UtilityType) => {
    if (!x._id) return;
    try { await api.put(`/loai-tien-ich/${x._id}`, { ...x, TrangThai: !x.TrangThai }); await load(); }
    catch (e: any) { setError(e?.response?.data?.message || 'Không thể cập nhật trạng thái loại tiện ích.'); }
  };

  const editSelectedUtility = () => {
    const id = selected[0];
    const item = filteredUtilities.find((x) => String(x._id || x.MaTienIch) === id);
    if (item) openU(item);
    else setError('Vui lòng chọn một tiện ích để chỉnh sửa.');
  };

  const deleteSelectedUtility = () => {
    const id = selected[0];
    const item = filteredUtilities.find((x) => String(x._id || x.MaTienIch) === id);
    if (item) setConfirmU(item);
    else setError('Vui lòng chọn một tiện ích để xóa.');
  };

  const logout = () => { onLogout(); nav('/admin/login'); };
  const currentRows = tab === 'utilities' ? filteredUtilities : filteredTypes;
  const selectedIds = selected;
  const allSelected = currentRows.length > 0 && currentRows.every((x) => selectedIds.includes(String(x._id || x.MaLoai)));

  const toggleAll = () => {
    if (allSelected) setSelected([]);
    else setSelected(currentRows.map((x) => String(x._id || x.MaLoai)));
  };

  return (
    <div className="admin-shell">
      <header className="admin-top">
        <Link to="/" className="admin-brand">
          <MapPin size={24} fill="currentColor" />
          <span><b>HỆ THỐNG TÌM KIẾM</b><small>CÁC TIỆN ÍCH CÔNG CỘNG TÍCH HỢP BẢN ĐỒ</small></span>
        </Link>
        <div className="admin-user">
          <UserCircle2 size={22} />
          <span><b>{admin.TenDangNhap}</b><small>Quản trị viên</small></span>
          <button onClick={logout} aria-label="Đăng xuất"><ChevronDown size={15} /></button>
        </div>
      </header>

      <div className="admin-layout">
        <aside className="admin-sidebar">
          <Link className="admin-menu" to="/"><Home size={16} /> Trang chủ</Link>
          <button className={`admin-menu ${tab === 'utilities' ? 'active' : ''}`} onClick={() => { setTab('utilities'); setQ(''); setSelected([]); }}><Building2 size={16} /> Quản lý tiện ích</button>
          <button className={`admin-menu ${tab === 'types' ? 'active' : ''}`} onClick={() => { setTab('types'); setQ(''); setSelected([]); }}><List size={16} /> Quản lý loại tiện ích</button>
          <button className="admin-menu" onClick={logout}><LogOut size={16} /> Đăng xuất</button>
        </aside>

        <main className="admin-main">
          {message && <div className="admin-success"><span><Check size={15} /> {message}</span><button onClick={() => setMessage('')}><X size={15} /></button></div>}
          {error && <div className="error-box"><span>{error}</span><button onClick={() => setError('')}><X size={15} /></button></div>}

          {tab === 'utilities' ? (
            <section>
              <div className="admin-page-title">
                <div><h1><MapPin size={18} /> Quản lý tiện ích</h1><p>Danh sách các tiện ích công cộng trong hệ thống</p></div>
                <div className="page-actions"><button className="btn-primary" onClick={() => openU()}><Plus size={15} /> Thêm tiện ích</button><button className="btn-secondary" onClick={editSelectedUtility}><Edit3 size={14} /> Chỉnh sửa</button><button className="btn-danger-soft" onClick={deleteSelectedUtility}><Trash2 size={14} /> Xóa</button></div>
              </div>
              <div className="card osm-public-searches osm-admin-search">
                <div className="osm-public-searches-heading"><div><h2><Search size={17} /> Kết quả tìm kiếm từ trang người dùng</h2><p>Tự động nhận tiện ích được tìm ở trang người dùng và gợi ý quanh khu vực bản đồ. Không cần tìm lại, thêm thủ công hoặc lưu vào cơ sở dữ liệu.</p></div><button type="button" onClick={loadPublicSearches}>Làm mới</button></div>
                {publicSearches.length ? <div className="osm-admin-results">{publicSearches.slice(0, 30).map((item, index) => <div className="osm-admin-result" key={`${item._id || item.TenTienIch}-${index}`}><span><b>{item.TenTienIch}</b><small>{item.TenLoai || 'Tiện ích công cộng'} · {item.DiaChi}</small><small>{Number(item.ViDo).toFixed(5)}, {Number(item.KinhDo).toFixed(5)}{(item as Utility & { _source?: string })._source ? ` · ${(item as Utility & { _source?: string })._source}` : ''}</small></span><button type="button" onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${item.ViDo}%2C${item.KinhDo}`, '_blank', 'noopener,noreferrer')}>Xem vị trí <MapPin size={13}/></button></div>)}</div> : <div className="empty-result">Chưa có kết quả. Hãy tìm một tiện ích ở trang chủ; kết quả sẽ tự đồng bộ sang đây.</div>}
              </div>
              <Toolbar q={q} setQ={setQ} status={statusFilter} setStatus={setStatusFilter} placeholder="Tìm kiếm theo tên, địa chỉ..." onSearch={() => load()} />
              <div className="card admin-table-card">
                <table className="admin-table admin-utility-table">
                  <thead><tr><th className="check-col"><input type="checkbox" checked={allSelected} onChange={toggleAll} /></th><th>STT</th><th>Tên tiện ích</th><th>Loại</th><th>Địa chỉ</th><th>Vị trí (Lat, Lng)</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
                  <tbody>
                    {filteredUtilities.map((x, i) => <tr key={x._id || x.MaTienIch}>
                      <td className="check-col"><input type="checkbox" checked={selected.includes(String(x._id || x.MaTienIch))} onChange={() => setSelected(s => s.includes(String(x._id || x.MaTienIch)) ? s.filter(id => id !== String(x._id || x.MaTienIch)) : [...s, String(x._id || x.MaTienIch)])} /></td>
                      <td>{i + 1}</td><td><b>{x.TenTienIch}</b></td><td>{x.TenLoai || types.find(t => t.MaLoai === x.MaLoai)?.TenLoai || x.MaLoai}</td><td>{x.DiaChi}</td><td>{x.ViDo.toFixed(5)}, {x.KinhDo.toFixed(5)}</td>
                      <td><span className={`status-pill ${x.TrangThai ? 'on' : 'off'}`}>{x.TrangThai ? 'Hoạt động' : 'Ngừng hoạt động'}</span></td>
                      <td><button className="table-edit" title="Chỉnh sửa" onClick={() => openU(x)}><Edit3 size={14} /></button><button className="table-delete" title="Xóa" onClick={() => setConfirmU(x)}><Trash2 size={14} /></button><button className={`switch ${x.TrangThai ? 'checked' : ''}`} title="Đổi trạng thái" onClick={() => toggleUtility(x)}><span /></button></td>
                    </tr>)}
                  </tbody>
                </table>
                <div className="table-foot"><span>Hiển thị {filteredUtilities.length} / {utilities.length} tiện ích</span><Pager /></div>
              </div>
            </section>
          ) : (
            <section>
              <div className="admin-page-title">
                <div><h1><List size={18} /> Quản lý loại tiện ích</h1><p>Danh sách các loại tiện ích công cộng trong hệ thống</p></div>
                <button className="btn-primary" onClick={() => openT()}><Plus size={15} /> Thêm loại tiện ích</button>
              </div>
              <Toolbar q={q} setQ={setQ} status={statusFilter} setStatus={setStatusFilter} placeholder="Nhập tên loại tiện ích..." onSearch={() => load()} />
              <div className="card admin-table-card">
                <table className="admin-table">
                  <thead><tr><th>STT</th><th>Mã loại</th><th>Tên loại tiện ích</th><th>Mô tả</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
                  <tbody>{filteredTypes.map((x, i) => { const Icon = typeIcon(x.TenLoai); return <tr key={x._id || x.MaLoai}><td>{i + 1}</td><td>LT{String(x.MaLoai).padStart(2, '0')}</td><td><span className="type-name"><span className={`type-icon type-${x.MaLoai % 8}`}><Icon size={13} /></span><b>{x.TenLoai}</b></span></td><td>{x.MoTa}</td><td><span className={`status-pill ${x.TrangThai ? 'on' : 'off'}`}>{x.TrangThai ? 'Đang hoạt động' : 'Ngừng hoạt động'}</span></td><td><button className="table-edit" title="Chỉnh sửa" onClick={() => openT(x)}><Edit3 size={14} /></button>{x._id && <button className="table-delete" title="Xóa" onClick={() => setConfirmT(x)}><Trash2 size={14} /></button>}<button className={`switch ${x.TrangThai ? 'checked' : ''}`} title="Đổi trạng thái" onClick={() => toggleType(x)}><span /></button></td></tr>; })}</tbody>
                </table>
                <div className="table-foot"><span>Hiển thị {filteredTypes.length} / {types.length} loại tiện ích</span><Pager /></div>
              </div>
            </section>
          )}
        </main>
      </div>

      {showU && <FormModal title={editU ? 'Chỉnh sửa tiện ích' : 'Thêm tiện ích'} onClose={closeU}><form onSubmit={saveU} className="form-grid">
        <Field label="Tên tiện ích *" value={uf.TenTienIch} set={v => setUf({ ...uf, TenTienIch: v })} />
        <SelectField label="Loại tiện ích *" value={uf.MaLoai} set={v => setUf({ ...uf, MaLoai: Number(v) })} options={types.filter(x => x.TrangThai).map(x => ({ value: x.MaLoai, label: x.TenLoai }))} />
        <Field wide label="Địa chỉ *" value={uf.DiaChi} set={v => setUf({ ...uf, DiaChi: v })} />
        <Field label="Vĩ độ (Lat) *" type="number" value={uf.ViDo} set={v => setUf({ ...uf, ViDo: Number(v) })} />
        <Field label="Kinh độ (Lng) *" type="number" value={uf.KinhDo} set={v => setUf({ ...uf, KinhDo: Number(v) })} />
        <Field label="Số điện thoại" value={uf.SoDienThoai} set={v => setUf({ ...uf, SoDienThoai: v })} />
        <Field label="Giờ mở cửa" value={uf.GioMoCua} set={v => setUf({ ...uf, GioMoCua: v })} />
        <Field wide label="Mô tả" value={uf.MoTa} set={v => setUf({ ...uf, MoTa: v })} />
        <Field wide label="Hình ảnh (URL)" value={uf.HinhAnh} set={v => setUf({ ...uf, HinhAnh: v })} />
        <label className="check-row wide"><input type="checkbox" checked={uf.TrangThai} onChange={e => setUf({ ...uf, TrangThai: e.target.checked })} /> Đang hoạt động</label>
        <div className="wide form-actions"><button type="button" className="btn-secondary" onClick={closeU}>Hủy</button><button className="btn-primary">Lưu</button></div>
      </form></FormModal>}

      {showT && <FormModal title={editT ? 'Chỉnh sửa loại tiện ích' : 'Thêm loại tiện ích'} onClose={closeT}><form>
        <Field label="Tên loại *" value={tf.TenLoai} set={v => setTf({ ...tf, TenLoai: v })} />
        <Field label="Mô tả" value={tf.MoTa} set={v => setTf({ ...tf, MoTa: v })} />
        <label className="check-row" style={{ margin: '14px 0' }}><input type="checkbox" checked={tf.TrangThai} onChange={e => setTf({ ...tf, TrangThai: e.target.checked })} /> Đang hoạt động</label>
        <div className="form-actions"><button type="button" className="btn-secondary" onClick={closeT}>Hủy</button><button type="button" className="btn-primary" onClick={(e) => saveT(e as any)}>Lưu</button></div>
      </form></FormModal>}

      {confirmU && <ConfirmModal title="Xác nhận xóa" text={`Bạn có chắc muốn xóa tiện ích “${confirmU.TenTienIch}”?`} onClose={() => setConfirmU(null)} onConfirm={delU} />}
      {confirmT && <ConfirmModal title="Xác nhận xóa" text={`Bạn có chắc muốn xóa loại “${confirmT.TenLoai}”?`} onClose={() => setConfirmT(null)} onConfirm={delT} />}
    </div>
  );
}

function Toolbar({ q, setQ, status, setStatus, placeholder, onSearch }: { q: string; setQ: (v: string) => void; status: 'all' | 'active' | 'inactive'; setStatus: (v: 'all' | 'active' | 'inactive') => void; placeholder: string; onSearch: () => void }) {
  return <div className="admin-toolbar"><div className="admin-search"><Search size={15} /><input value={q} onChange={e => setQ(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') onSearch(); }} placeholder={placeholder} /></div><select className="status-select" value={status} onChange={e => setStatus(e.target.value as 'all' | 'active' | 'inactive')}><option value="all">Tất cả trạng thái</option><option value="active">Đang hoạt động</option><option value="inactive">Ngừng hoạt động</option></select><button className="btn-primary" onClick={onSearch}><Search size={14} /> Tìm kiếm</button></div>;
}

function Pager() { return <div className="pager"><button><ChevronDown size={13} className="rotate-90" /></button><button className="current">1</button><button><ChevronDown size={13} className="-rotate-90" /></button></div>; }

function Field({ label, value, set, type = 'text', wide = false }: { label: string; value: any; set: (v: string) => void; type?: string; wide?: boolean }) {
  return <label className={wide ? 'wide' : ''}><span>{label}</span><input type={type} value={value} onChange={e => set(e.target.value)} required={label.includes('*')} step={type === 'number' ? 'any' : undefined} /></label>;
}
function SelectField({ label, value, set, options }: { label: string; value: number; set: (v: string) => void; options: { value: number; label: string }[] }) {
  return <label><span>{label}</span><select value={value} onChange={e => set(e.target.value)} required>{options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select></label>;
}
function FormModal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) { return <div className="detail-overlay"><div className="admin-modal"><div className="admin-modal-title"><h2>{title}</h2><button onClick={onClose}><X size={18} /></button></div><div className="admin-modal-body">{children}</div></div></div>; }
function ConfirmModal({ title, text, onClose, onConfirm }: { title: string; text: string; onClose: () => void; onConfirm: () => void }) { return <div className="detail-overlay"><div className="confirm-modal"><div className="confirm-icon"><Trash2 size={27} /></div><button className="confirm-close" onClick={onClose}><X size={15} /></button><h2>{title}</h2><p>{text}</p><div><button className="btn-secondary" onClick={onClose}>Hủy</button><button className="danger-btn" onClick={onConfirm}>Xóa</button></div></div></div>; }
