require('dotenv').config();
const bcrypt = require('bcryptjs');
const connectDatabase = require('./config/db');
const LoaiTienIch = require('./models/LoaiTienIch');
const TienIch = require('./models/TienIch');
const TaiKhoanQuanTri = require('./models/TaiKhoanQuanTri');

const types = [
  { MaLoai: 1, TenLoai: 'Bệnh viện / Y tế', MoTa: 'Cơ sở y tế và bệnh viện', TrangThai: true },
  { MaLoai: 2, TenLoai: 'Trạm xe buýt', MoTa: 'Điểm dừng xe buýt', TrangThai: true },
  { MaLoai: 3, TenLoai: 'ATM', MoTa: 'Máy giao dịch ngân hàng', TrangThai: true },
  { MaLoai: 4, TenLoai: 'Trạm xăng', MoTa: 'Trạm cung cấp nhiên liệu', TrangThai: true },
  { MaLoai: 5, TenLoai: 'Bãi đỗ xe', MoTa: 'Khu vực gửi và đỗ xe', TrangThai: true },
  { MaLoai: 6, TenLoai: 'Công viên', MoTa: 'Không gian công cộng, cây xanh', TrangThai: true },
  { MaLoai: 7, TenLoai: 'Nhà vệ sinh công cộng', MoTa: 'Nhà vệ sinh phục vụ cộng đồng', TrangThai: true }
];

const utilities = [
  { MaTienIch: 1, TenTienIch: 'Bệnh viện Bạch Mai', MaLoai: 1, DiaChi: '78 Giải Phóng, Đống Đa, Hà Nội', ViDo: 20.9986, KinhDo: 105.8411, MoTa: 'Cơ sở y tế lớn tại Hà Nội.', SoDienThoai: '02435741200', GioMoCua: '24/7', TrangThai: true },
  { MaTienIch: 2, TenTienIch: 'Bệnh viện Việt Đức', MaLoai: 1, DiaChi: '40 Tràng Thi, Hoàn Kiếm, Hà Nội', ViDo: 21.0276, KinhDo: 105.8468, MoTa: 'Cơ sở y tế khu vực trung tâm.', SoDienThoai: '02438253531', GioMoCua: '24/7', TrangThai: true },
  { MaTienIch: 3, TenTienIch: 'Điểm xe buýt Bờ Hồ', MaLoai: 2, DiaChi: 'Đinh Tiên Hoàng, Hoàn Kiếm, Hà Nội', ViDo: 21.0287, KinhDo: 105.8524, MoTa: 'Điểm dừng xe buýt gần Hồ Hoàn Kiếm.', GioMoCua: '05:00 - 22:00', TrangThai: true },
  { MaTienIch: 4, TenTienIch: 'ATM Vietcombank Hoàn Kiếm', MaLoai: 3, DiaChi: '29 Hàng Bài, Hoàn Kiếm, Hà Nội', ViDo: 21.0258, KinhDo: 105.8516, MoTa: 'ATM phục vụ giao dịch cơ bản.', GioMoCua: '24/7', TrangThai: true },
  { MaTienIch: 5, TenTienIch: 'Trạm xăng Petrolimex Trần Hưng Đạo', MaLoai: 4, DiaChi: '95 Trần Hưng Đạo, Hoàn Kiếm, Hà Nội', ViDo: 21.0197, KinhDo: 105.8478, MoTa: 'Trạm xăng khu vực trung tâm.', GioMoCua: '06:00 - 22:00', TrangThai: true },
  { MaTienIch: 6, TenTienIch: 'Bãi đỗ xe Trần Nhật Duật', MaLoai: 5, DiaChi: 'Trần Nhật Duật, Hoàn Kiếm, Hà Nội', ViDo: 21.0393, KinhDo: 105.8518, MoTa: 'Khu vực đỗ xe gần phố cổ.', GioMoCua: '06:00 - 23:00', TrangThai: true },
  { MaTienIch: 7, TenTienIch: 'Công viên Thống Nhất', MaLoai: 6, DiaChi: '354 Lê Duẩn, Hai Bà Trưng, Hà Nội', ViDo: 21.0112, KinhDo: 105.8431, MoTa: 'Không gian xanh phục vụ vui chơi, đi bộ.', GioMoCua: '05:00 - 22:00', TrangThai: true },
  { MaTienIch: 8, TenTienIch: 'Nhà vệ sinh công cộng Hồ Hoàn Kiếm', MaLoai: 7, DiaChi: 'Khu vực Hồ Hoàn Kiếm, Hà Nội', ViDo: 21.0285, KinhDo: 105.8520, MoTa: 'Nhà vệ sinh công cộng khu vực hồ.', GioMoCua: '06:00 - 22:00', TrangThai: true }
];

async function seed() {
  await connectDatabase();
  await LoaiTienIch.deleteMany({});
  await TienIch.deleteMany({});
  await TaiKhoanQuanTri.deleteMany({});
  await LoaiTienIch.insertMany(types);
  await TienIch.insertMany(utilities);
  const hash = await bcrypt.hash('Admin@123', 10);
  await TaiKhoanQuanTri.create({ MaTaiKhoan: 1, TenDangNhap: 'admin', MatKhau: hash, HoTen: 'Quản trị viên hệ thống', VaiTro: 'Quản trị viên', TrangThai: true });
  console.log('✓ Seed hoàn tất');
  console.log('Tài khoản demo: admin / Admin@123');
  process.exit(0);
}

seed().catch((error) => { console.error(error); process.exit(1); });
