const jwt = require('jsonwebtoken');

function signAdminToken(admin) {
  return jwt.sign(
    {
      id: admin._id,
      MaTaiKhoan: admin.MaTaiKhoan,
      TenDangNhap: admin.TenDangNhap,
      HoTen: admin.HoTen,
      VaiTro: admin.VaiTro
    },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );
}

module.exports = { signAdminToken };
