const mongoose = require('mongoose');

const loaiTienIchSchema = new mongoose.Schema(
  {
    MaLoai: { type: Number, unique: true, required: true },
    TenLoai: { type: String, required: true, trim: true, maxlength: 100 },
    MoTa: { type: String, default: '', maxlength: 255 },
    TrangThai: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('LoaiTienIch', loaiTienIchSchema);
