import type { Utility, UtilityType } from '../types';

export const demoTypes: UtilityType[] = [
  { _id: 'demo-type-1', MaLoai: 1, TenLoai: 'Bệnh viện / Y tế', MoTa: 'Cơ sở y tế và bệnh viện', TrangThai: true },
  { _id: 'demo-type-2', MaLoai: 2, TenLoai: 'Trạm xe buýt', MoTa: 'Điểm dừng xe buýt', TrangThai: true },
  { _id: 'demo-type-3', MaLoai: 3, TenLoai: 'ATM', MoTa: 'Máy giao dịch ngân hàng', TrangThai: true },
  { _id: 'demo-type-4', MaLoai: 4, TenLoai: 'Trạm xăng', MoTa: 'Trạm cung cấp nhiên liệu', TrangThai: true },
  { _id: 'demo-type-5', MaLoai: 5, TenLoai: 'Bãi đỗ xe', MoTa: 'Khu vực gửi và đỗ xe', TrangThai: true },
  { _id: 'demo-type-6', MaLoai: 6, TenLoai: 'Công viên', MoTa: 'Không gian công cộng, cây xanh', TrangThai: true },
  { _id: 'demo-type-7', MaLoai: 7, TenLoai: 'Nhà vệ sinh công cộng', MoTa: 'Nhà vệ sinh phục vụ cộng đồng', TrangThai: true },
];

export const demoUtilities: Utility[] = [
  { _id: 'demo-1', MaTienIch: 1, TenTienIch: 'Bệnh viện Bạch Mai', MaLoai: 1, TenLoai: 'Bệnh viện / Y tế', DiaChi: '78 Giải Phóng, Đống Đa, Hà Nội', ViDo: 20.9986, KinhDo: 105.8411, MoTa: 'Cơ sở y tế lớn tại Hà Nội.', SoDienThoai: '02435741200', GioMoCua: '24/7', HinhAnh: '', TrangThai: true, NgayCapNhat: new Date().toISOString() },
  { _id: 'demo-2', MaTienIch: 2, TenTienIch: 'Bệnh viện Việt Đức', MaLoai: 1, TenLoai: 'Bệnh viện / Y tế', DiaChi: '40 Tràng Thi, Hoàn Kiếm, Hà Nội', ViDo: 21.0276, KinhDo: 105.8468, MoTa: 'Cơ sở y tế khu vực trung tâm.', SoDienThoai: '02438253531', GioMoCua: '24/7', HinhAnh: '', TrangThai: true, NgayCapNhat: new Date().toISOString() },
  { _id: 'demo-3', MaTienIch: 3, TenTienIch: 'Điểm xe buýt Bờ Hồ', MaLoai: 2, TenLoai: 'Trạm xe buýt', DiaChi: 'Đinh Tiên Hoàng, Hoàn Kiếm, Hà Nội', ViDo: 21.0287, KinhDo: 105.8524, MoTa: 'Điểm dừng xe buýt gần Hồ Hoàn Kiếm.', SoDienThoai: '', GioMoCua: '05:00 - 22:00', HinhAnh: '', TrangThai: true, NgayCapNhat: new Date().toISOString() },
  { _id: 'demo-4', MaTienIch: 4, TenTienIch: 'ATM Vietcombank Hoàn Kiếm', MaLoai: 3, TenLoai: 'ATM', DiaChi: '29 Hàng Bài, Hoàn Kiếm, Hà Nội', ViDo: 21.0258, KinhDo: 105.8516, MoTa: 'ATM phục vụ giao dịch cơ bản.', SoDienThoai: '', GioMoCua: '24/7', HinhAnh: '', TrangThai: true, NgayCapNhat: new Date().toISOString() },
  { _id: 'demo-5', MaTienIch: 5, TenTienIch: 'Trạm xăng Petrolimex Trần Hưng Đạo', MaLoai: 4, TenLoai: 'Trạm xăng', DiaChi: '95 Trần Hưng Đạo, Hoàn Kiếm, Hà Nội', ViDo: 21.0197, KinhDo: 105.8478, MoTa: 'Trạm xăng khu vực trung tâm.', SoDienThoai: '', GioMoCua: '06:00 - 22:00', HinhAnh: '', TrangThai: true, NgayCapNhat: new Date().toISOString() },
  { _id: 'demo-6', MaTienIch: 6, TenTienIch: 'Bãi đỗ xe Trần Nhật Duật', MaLoai: 5, TenLoai: 'Bãi đỗ xe', DiaChi: 'Trần Nhật Duật, Hoàn Kiếm, Hà Nội', ViDo: 21.0393, KinhDo: 105.8518, MoTa: 'Khu vực đỗ xe gần phố cổ.', SoDienThoai: '', GioMoCua: '06:00 - 23:00', HinhAnh: '', TrangThai: true, NgayCapNhat: new Date().toISOString() },
  { _id: 'demo-7', MaTienIch: 7, TenTienIch: 'Công viên Thống Nhất', MaLoai: 6, TenLoai: 'Công viên', DiaChi: '354 Lê Duẩn, Hai Bà Trưng, Hà Nội', ViDo: 21.0112, KinhDo: 105.8431, MoTa: 'Không gian xanh phục vụ vui chơi, đi bộ.', SoDienThoai: '', GioMoCua: '05:00 - 22:00', HinhAnh: '', TrangThai: true, NgayCapNhat: new Date().toISOString() },
  { _id: 'demo-8', MaTienIch: 8, TenTienIch: 'Nhà vệ sinh công cộng Hồ Hoàn Kiếm', MaLoai: 7, TenLoai: 'Nhà vệ sinh công cộng', DiaChi: 'Khu vực Hồ Hoàn Kiếm, Hà Nội', ViDo: 21.0285, KinhDo: 105.8520, MoTa: 'Nhà vệ sinh công cộng khu vực hồ.', SoDienThoai: '', GioMoCua: '06:00 - 22:00', HinhAnh: '', TrangThai: true, NgayCapNhat: new Date().toISOString() },
];
