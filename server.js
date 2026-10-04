require('dotenv').config();
const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const connectDatabase = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const tienIchRoutes = require('./routes/tienIchRoutes');
const loaiRoutes = require('./routes/loaiRoutes');
const bcrypt = require('bcryptjs');
const demoStore = require('./data-demo');
const LoaiTienIch = require('./models/LoaiTienIch');
const TienIch = require('./models/TienIch');
const TaiKhoanQuanTri = require('./models/TaiKhoanQuanTri');

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '2mb' }));

app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'TienIchCongCong-Hanoi' }));
app.use('/api/auth', authRoutes);
app.use('/api/tien-ich', tienIchRoutes);
app.use('/api/loai-tien-ich', loaiRoutes);
// Shared in-memory list of utilities searched from the public page. It is intentionally
// not persisted to MongoDB: admin can review them without manually adding records.
const recentPublicSearches = new Map();
app.get('/api/osm/recent', (req, res) => { res.set('Cache-Control', 'no-store'); res.json(Array.from(recentPublicSearches.values()).slice(0, 100)); });
app.post('/api/osm/visited', (req, res) => {
  const items = Array.isArray(req.body?.items) ? req.body.items.slice(0, 50) : [];
  for (const item of items) {
    if (!item || typeof item.TenTienIch !== 'string' || !Number.isFinite(Number(item.ViDo)) || !Number.isFinite(Number(item.KinhDo))) continue;
    const key = String(item._id || `${item.TenTienIch}:${item.ViDo}:${item.KinhDo}`);
    recentPublicSearches.delete(key);
    recentPublicSearches.set(key, { ...item, _source: item._source || 'Tìm kiếm trang người dùng', NgayTimKiem: new Date().toISOString() });
  }
  while (recentPublicSearches.size > 100) recentPublicSearches.delete(recentPublicSearches.keys().next().value);
  res.json({ ok: true, count: recentPublicSearches.size });
});

const osmSearchCache = new Map();
const OSM_CACHE_TTL = 60 * 1000;
app.get('/api/osm/search', async (req, res) => {
  const q = String(req.query.q || '').trim().slice(0, 100);
  const category = String(req.query.category || '').trim();
  const district = String(req.query.district || '').trim().slice(0, 60);
  const lat = Number(req.query.lat) || 21.0278;
  const lon = Number(req.query.lon) || 105.8342;
  const nearby = req.query.nearby === 'true' || !q;
  const requestedKm = Number(req.query.radiusKm);
  const radiusKm = Number.isFinite(requestedKm) && requestedKm > 0 ? Math.min(25, Math.max(1, requestedKm)) : (nearby ? 7 : 18);
  const radius = Math.round(radiusKm * 1000);
  const cacheKey = JSON.stringify([q.toLocaleLowerCase('vi'), category, district.toLocaleLowerCase('vi'), lat.toFixed(3), lon.toFixed(3), radius]);
  const cached = osmSearchCache.get(cacheKey);
  if (cached && Date.now() - cached.at < OSM_CACHE_TTL) return res.json(cached.items);

  const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/"/g, '\\"');
  const safeQ = escapeRegex(q);
  const knownCategory = /^(bệnh viện|y tế|atm|ngân hàng|công viên|park|trạm xăng|xăng|xe buýt|bus|nhà vệ sinh|vệ sinh công cộng|bãi đỗ xe|bãi xe|thư viện)$/i.test(q);
  const districtOnly = /^(ba đình|bắc từ liêm|cầu giấy|đống đa|hai bà trưng|hoàn kiếm|hà đông|long biên|nam từ liêm|thanh xuân|tây hồ)$/i.test(q);
  const specificName = q.length >= 4 && !knownCategory && !districtOnly;
  const categoryFilter = category === '1' || /bệnh viện|y tế|clinic|hospital|pharmacy/i.test(q)
    ? '[amenity~"^(hospital|clinic|doctors|pharmacy)$"]'
    : category === '2' || /buýt|xe bus|bus stop/i.test(q)
      ? '[highway=bus_stop]'
      : category === '3' || /\batm\b|ngân hàng/i.test(q)
        ? '[amenity=atm]'
        : category === '4' || /trạm xăng|xăng|fuel/i.test(q)
          ? '[amenity=fuel]'
          : category === '5' || /đỗ xe|bãi xe|parking/i.test(q)
            ? '[amenity=parking]'
            : category === '6' || /công viên|park/i.test(q)
              ? '[leisure=park]'
              : category === '7' || /nhà vệ sinh|vệ sinh|toilet/i.test(q)
                ? '[amenity=toilets]'
                : '';
  const around = `(around:${radius},${lat},${lon})`;
  const statements = [];
  if (specificName) {
    // Match both facility name and address-related tags; do not query every POI for a named search.
    statements.push(`nwr${around}[name~"${safeQ}",i];`);
    statements.push(`nwr${around}["addr:street"~"${safeQ}",i];`);
    statements.push(`nwr${around}["addr:suburb"~"${safeQ}",i];`);
    statements.push(`nwr${around}["addr:district"~"${safeQ}",i];`);
  } else if (categoryFilter) {
    statements.push(`nwr${around}${categoryFilter};`);
  } else {
    statements.push(
      `nwr${around}[amenity~"^(hospital|clinic|doctors|pharmacy|atm|fuel|toilets|parking)$"];`,
      `nwr${around}[leisure=park];`,
      `nwr${around}[highway=bus_stop];`,
      `nwr${around}[public_transport=platform];`,
      `nwr${around}[amenity=library];`
    );
  }
  const query = `[out:json][timeout:5];(${[...new Set(statements)].join('')});out center tags 80;`;
  const endpoints = [
    'https://overpass-api.de/api/interpreter',
    'https://overpass.kumi.systems/api/interpreter',
    'https://overpass.nchc.org.tw/api/interpreter'
  ];
  const requestEndpoint = async (endpoint) => {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8', 'User-Agent': 'TienIchCongCongStudentDemo/1.1' },
      body: `data=${encodeURIComponent(query)}`,
      signal: AbortSignal.timeout(4500)
    });
    if (!response.ok) throw new Error(`Overpass HTTP ${response.status}`);
    return response.json();
  };
  try {
    // Query mirrors concurrently; use the first healthy response instead of waiting 18 seconds per server.
    const data = await Promise.any(endpoints.map(requestEndpoint));
    let items = (data.elements || []).map(el => {
      const itemLat = el.lat ?? el.center?.lat, itemLon = el.lon ?? el.center?.lon, t = el.tags || {};
      if (!Number.isFinite(itemLat) || !Number.isFinite(itemLon)) return null;
      const amenity = `${t.amenity || ''} ${t.highway || ''} ${t.public_transport || ''}`;
      const type = /\batm\b/.test(amenity) ? 'ATM' : /fuel/.test(amenity) ? 'Trạm xăng' : /toilets/.test(amenity) ? 'Nhà vệ sinh công cộng' : /parking/.test(amenity) ? 'Bãi đỗ xe' : t.leisure === 'park' ? 'Công viên' : /hospital|clinic|doctors|pharmacy/.test(amenity) ? 'Bệnh viện / Y tế' : /bus_stop|platform/.test(amenity) ? 'Trạm xe buýt' : t.amenity === 'library' ? 'Thư viện' : 'Tiện ích công cộng';
      const address = [t['addr:housenumber'], t['addr:street'], t['addr:suburb'], t['addr:district'], t['addr:county'], t['addr:city'], t['addr:state']].filter(Boolean).join(', ');
      return { _id: `osm-${el.type}-${el.id}`, MaTienIch: Number(el.id), TenTienIch: t.name || `${type} OpenStreetMap`, MaLoai: Number(category) || 0, TenLoai: type, DiaChi: address || 'Địa chỉ chưa được cập nhật trên OpenStreetMap', ViDo: itemLat, KinhDo: itemLon, MoTa: 'Dữ liệu truy vấn trực tiếp từ OpenStreetMap Overpass API; không tự động ghi vào cơ sở dữ liệu OSM.', SoDienThoai: t.phone || t['contact:phone'] || '', GioMoCua: t.opening_hours || '', HinhAnh: '', TrangThai: true, NgayCapNhat: '', _source: 'OpenStreetMap', _district: [t['addr:suburb'], t['addr:district'], t['addr:county'], t['addr:city']].filter(Boolean).join(' ') };
    }).filter(Boolean);
    const filterText = (district || (districtOnly ? q : '')).toLocaleLowerCase('vi');
    if (filterText) items = items.filter(item => `${item.DiaChi} ${item._district} ${item.TenTienIch}`.toLocaleLowerCase('vi').includes(filterText));
    if (specificName) {
      const normalized = q.toLocaleLowerCase('vi').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      items = items.filter(item => `${item.TenTienIch} ${item.DiaChi}`.toLocaleLowerCase('vi').normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(normalized) || normalized.split(/\\s+/).filter(Boolean).some(token => token.length > 3 && `${item.TenTienIch} ${item.DiaChi}`.toLocaleLowerCase('vi').normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(token)));
    }
    const unique = Array.from(new Map(items.map(item => [item._id, item])).values());
    osmSearchCache.set(cacheKey, { at: Date.now(), items: unique });
    while (osmSearchCache.size > 200) osmSearchCache.delete(osmSearchCache.keys().next().value);
    res.set('Cache-Control', 'private, max-age=30');
    return res.json(unique);
  } catch (error) {
    // A short-lived empty result is better than leaving the UI spinning indefinitely.
    res.set('Cache-Control', 'no-store');
    return res.status(503).json({ message: 'OpenStreetMap đang phản hồi chậm. Hãy thử lại sau vài giây.', detail: error?.message || 'Overpass unavailable' });
  }
});

const clientDist = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get(/^(?!\/api).*/, (req, res, next) => {
    if (req.path.startsWith('/api/')) return next();
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}


async function ensureDemoData() {
  const requiredTypes = [
    { MaLoai: 1, TenLoai: 'Bệnh viện / Y tế', MoTa: 'Cơ sở y tế và bệnh viện', TrangThai: true },
    { MaLoai: 2, TenLoai: 'Trạm xe buýt', MoTa: 'Điểm dừng xe buýt', TrangThai: true },
    { MaLoai: 3, TenLoai: 'ATM', MoTa: 'Máy giao dịch ngân hàng', TrangThai: true },
    { MaLoai: 4, TenLoai: 'Trạm xăng', MoTa: 'Trạm cung cấp nhiên liệu', TrangThai: true },
    { MaLoai: 5, TenLoai: 'Bãi đỗ xe', MoTa: 'Khu vực gửi và đỗ xe', TrangThai: true },
    { MaLoai: 6, TenLoai: 'Công viên', MoTa: 'Không gian công cộng, cây xanh', TrangThai: true },
    { MaLoai: 7, TenLoai: 'Nhà vệ sinh công cộng', MoTa: 'Nhà vệ sinh phục vụ cộng đồng', TrangThai: true }
  ];

  const requiredUtilities = [
    { MaTienIch: 1, TenTienIch: 'Bệnh viện Bạch Mai', MaLoai: 1, DiaChi: '78 Giải Phóng, Đống Đa, Hà Nội', ViDo: 20.9986, KinhDo: 105.8411, MoTa: 'Cơ sở y tế lớn tại Hà Nội.', SoDienThoai: '02435741200', GioMoCua: '24/7', TrangThai: true },
    { MaTienIch: 2, TenTienIch: 'Bệnh viện Việt Đức', MaLoai: 1, DiaChi: '40 Tràng Thi, Hoàn Kiếm, Hà Nội', ViDo: 21.0276, KinhDo: 105.8468, MoTa: 'Cơ sở y tế khu vực trung tâm.', SoDienThoai: '02438253531', GioMoCua: '24/7', TrangThai: true },
    { MaTienIch: 3, TenTienIch: 'Điểm xe buýt Bờ Hồ', MaLoai: 2, DiaChi: 'Đinh Tiên Hoàng, Hoàn Kiếm, Hà Nội', ViDo: 21.0287, KinhDo: 105.8524, MoTa: 'Điểm dừng xe buýt gần Hồ Hoàn Kiếm.', GioMoCua: '05:00 - 22:00', TrangThai: true },
    { MaTienIch: 4, TenTienIch: 'ATM Vietcombank Hoàn Kiếm', MaLoai: 3, DiaChi: '29 Hàng Bài, Hoàn Kiếm, Hà Nội', ViDo: 21.0258, KinhDo: 105.8516, MoTa: 'ATM phục vụ giao dịch cơ bản.', GioMoCua: '24/7', TrangThai: true },
    { MaTienIch: 5, TenTienIch: 'Trạm xăng Petrolimex Trần Hưng Đạo', MaLoai: 4, DiaChi: '95 Trần Hưng Đạo, Hoàn Kiếm, Hà Nội', ViDo: 21.0197, KinhDo: 105.8478, MoTa: 'Trạm xăng khu vực trung tâm.', GioMoCua: '06:00 - 22:00', TrangThai: true },
    { MaTienIch: 6, TenTienIch: 'Bãi đỗ xe Trần Nhật Duật', MaLoai: 5, DiaChi: 'Trần Nhật Duật, Hoàn Kiếm, Hà Nội', ViDo: 21.0393, KinhDo: 105.8518, MoTa: 'Khu vực đỗ xe gần phố cổ.', GioMoCua: '06:00 - 23:00', TrangThai: true },
    { MaTienIch: 7, TenTienIch: 'Công viên Thống Nhất', MaLoai: 6, DiaChi: '354 Lê Duẩn, Hai Bà Trưng, Hà Nội', ViDo: 21.0112, KinhDo: 105.8431, MoTa: 'Không gian xanh phục vụ vui chơi, đi bộ.', GioMoCua: '05:00 - 22:00', TrangThai: true },
    { MaTienIch: 8, TenTienIch: 'Nhà vệ sinh công cộng Hồ Hoàn Kiếm', MaLoai: 7, DiaChi: 'Khu vực Hồ Hoàn Kiếm, Hà Nội', ViDo: 21.0285, KinhDo: 105.8520, MoTa: 'Nhà vệ sinh công cộng khu vực hồ.', GioMoCua: '06:00 - 22:00', TrangThai: true }
  ];

  // Keep the local demo dataset aligned with the report scope (7 utility types).
  await LoaiTienIch.deleteMany({ MaLoai: { $nin: requiredTypes.map(x => x.MaLoai) } });
  await TienIch.deleteMany({ MaLoai: { $nin: requiredTypes.map(x => x.MaLoai) } });
  for (const type of requiredTypes) await LoaiTienIch.updateOne({ MaLoai: type.MaLoai }, { $setOnInsert: type }, { upsert: true });
  for (const utility of requiredUtilities) await TienIch.updateOne({ MaTienIch: utility.MaTienIch }, { $setOnInsert: utility }, { upsert: true });

  const adminCount = await TaiKhoanQuanTri.countDocuments();
  if (adminCount === 0) {
    const hash = await bcrypt.hash('Admin@123', 10);
    await TaiKhoanQuanTri.create({ MaTaiKhoan: 1, TenDangNhap: 'admin', MatKhau: hash, HoTen: 'Quản trị viên hệ thống', VaiTro: 'Quản trị viên', TrangThai: true });
  }
}


async function start() {
  if (require.main !== module) return;
  const connected = await connectDatabase();
  global.demoMode = !connected;
  if (connected) await ensureDemoData();
  else console.log('✓ Dữ liệu DEMO MODE Chương 3 đã sẵn sàng');
  const port = process.env.PORT || 5000;
  app.listen(port, () => console.log(`✓ Backend chạy tại http://localhost:${port}`));
}

start().catch((error) => {
  console.error('Không thể khởi động server:', error.message);
  process.exit(1);
});

module.exports = app;
