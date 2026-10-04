export interface UtilityType {
  _id?: string;
  MaLoai: number;
  TenLoai: string;
  MoTa: string;
  TrangThai: boolean;
}

export interface Utility {
  _id: string;
  MaTienIch: number;
  TenTienIch: string;
  MaLoai: number;
  TenLoai?: string;
  DiaChi: string;
  ViDo: number;
  KinhDo: number;
  MoTa: string;
  SoDienThoai: string;
  GioMoCua: string;
  HinhAnh: string;
  TrangThai: boolean;
  NgayCapNhat: string;
}

export interface AdminUser {
  MaTaiKhoan: number;
  TenDangNhap: string;
  HoTen: string;
  VaiTro: string;
}
