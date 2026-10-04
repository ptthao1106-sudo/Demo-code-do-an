const mongoose = require('mongoose');

const tienIchSchema = new mongoose.Schema(
  {
    MaTienIch: { type: Number, unique: true, required: true },
    TenTienIch: { type: String, required: true, trim: true, maxlength: 100 },
    MaLoai: { type: Number, required: true, index: true },
    DiaChi: { type: String, required: true, trim: true, maxlength: 255 },
    ViDo: { type: Number, required: true, min: -90, max: 90 },
    KinhDo: { type: Number, required: true, min: -180, max: 180 },
    MoTa: { type: String, default: '', maxlength: 255 },
    SoDienThoai: { type: String, default: '', maxlength: 20 },
    GioMoCua: { type: String, default: '', maxlength: 50 },
    HinhAnh: { type: String, default: '' },
    TrangThai: { type: Boolean, default: true },
    NgayCapNhat: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

module.exports = mongoose.model('TienIch', tienIchSchema);
