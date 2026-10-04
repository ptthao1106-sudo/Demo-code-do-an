const bcrypt = require('bcryptjs');
const TaiKhoanQuanTri = require('../models/TaiKhoanQuanTri');
const { signAdminToken } = require('../utils/jwt');
const demoStore = require('../data-demo');

async function login(req, res) {
  try {
    const { TenDangNhap, MatKhau } = req.body;
    if (!TenDangNhap || !MatKhau) {
      return res.status(400).json({ message: 'Vui lòng nhập tên đăng nhập và mật khẩu.' });
    }

    const admin = global.demoMode ? demoStore.admins.find(x => x.TenDangNhap === TenDangNhap) : await TaiKhoanQuanTri.findOne({ TenDangNhap });
    if (!admin || !admin.TrangThai) {
      return res.status(401).json({ message: 'Tài khoản không tồn tại hoặc không hoạt động.' });
    }

    const valid = global.demoMode ? MatKhau === admin.MatKhau : await bcrypt.compare(MatKhau, admin.MatKhau);
    if (!valid) return res.status(401).json({ message: 'Tên đăng nhập hoặc mật khẩu không đúng.' });

    return res.json({
      token: signAdminToken(admin),
      admin: {
        MaTaiKhoan: admin.MaTaiKhoan,
        TenDangNhap: admin.TenDangNhap,
        HoTen: admin.HoTen,
        VaiTro: admin.VaiTro
      }
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

function me(req, res) {
  return res.json({ admin: req.admin });
}

module.exports = { login, me };
