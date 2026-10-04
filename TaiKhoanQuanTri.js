const mongoose = require('mongoose');

const taiKhoanQuanTriSchema = new mongoose.Schema(
  {
    MaTaiKhoan: { type: Number, unique: true, required: true },
    TenDangNhap: { type: String, unique: true, required: true, trim: true, maxlength: 50 },
    MatKhau: { type: String, required: true },
    HoTen: { type: String, required: true, maxlength: 100 },
    VaiTro: { type: String, default: 'Quản trị viên', maxlength: 50 },
    TrangThai: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('TaiKhoanQuanTri', taiKhoanQuanTriSchema);
