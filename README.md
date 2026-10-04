# Hệ thống tìm kiếm các tiện ích công cộng tích hợp bản đồ

Bản hoàn thiện demo được đối chiếu theo phạm vi và chức năng trong file Word của đồ án: người dùng không cần đăng nhập để xem bản đồ, tìm kiếm, lọc, xác định vị trí, xem chi tiết và chỉ đường; quản trị viên đăng nhập riêng để quản lý loại tiện ích và tiện ích.

## Chức năng khớp phạm vi đồ án

### Người dùng
- Xem bản đồ và các tiện ích tại Hà Nội.
- Tìm kiếm theo tên, địa chỉ hoặc mô tả.
- Lọc theo 7 loại: Bệnh viện/Y tế, Trạm xe buýt, ATM, Trạm xăng, Bãi đỗ xe, Công viên, Nhà vệ sinh công cộng.
- Lọc theo khoảng cách 1/3/5/10 km khi đã xác định vị trí.
- Xác định vị trí hiện tại bằng Geolocation.
- Xem danh sách và vị trí marker trên bản đồ.
- Xem chi tiết: tên, loại, địa chỉ, mô tả, điện thoại, giờ mở cửa, tọa độ và khoảng cách khi có vị trí.
- Chỉ đường từ vị trí hiện tại đến tiện ích bằng OSRM; nếu không có Internet vẫn có luồng demo bản đồ và dữ liệu.

### Quản trị viên
- Đăng nhập quản trị.
- Quản lý tiện ích: thêm, sửa, xóa, bật/tắt trạng thái.
- Quản lý loại tiện ích: thêm, sửa, xóa, bật/tắt trạng thái.
- Kiểm tra loại tiện ích trước khi lưu.
- Không cho xóa loại đang được tiện ích sử dụng.
- Xác nhận trước khi xóa.

## Công nghệ
- Frontend: React + TypeScript + Vite + React Leaflet + Leaflet.
- Backend: Node.js + Express.
- Cơ sở dữ liệu chính: MongoDB + Mongoose.
- Xác thực quản trị: JWT + bcrypt.
- Bản đồ: OpenStreetMap (bản đồ nền và dữ liệu tiện ích qua Overpass API) và OSRM cho định tuyến.

## Chạy nhanh

### 1. Cài Node.js LTS

Dự án cần Node.js và npm.

### 2. Cài toàn bộ dependency

Chỉ cần chạy ở thư mục gốc:

```bash
npm install
```

`postinstall` tự cài dependency cho thư mục `client`, không cần `cd client`.

### 3. Chạy demo

```bash
npm run dev
```

Hoặc:

```bash
npm start
```

Sau đó mở:

- Website: http://localhost:5000
- Đăng nhập quản trị: http://localhost:5000/admin/login
- Kiểm tra API: http://localhost:5000/api/health

### 4. Tài khoản demo

```text
Tên đăng nhập: admin
Mật khẩu: Admin@123
```

## MongoDB

Nếu MongoDB local đang chạy, hệ thống tự kết nối tới:

```text
mongodb://127.0.0.1:27017/tienichcongcong_hanoi
```

Nếu MongoDB chưa chạy, server **không bị crash**: hệ thống tự chuyển sang DEMO MODE với dữ liệu mẫu trong bộ nhớ để vẫn có thể trình diễn giao diện, tìm kiếm, lọc, đăng nhập và CRUD trong phiên chạy. Khi MongoDB hoạt động, dữ liệu sẽ được lưu bằng MongoDB như thiết kế ban đầu.

Có thể chủ động tạo lại dữ liệu MongoDB bằng:

```bash
npm run seed
```

## Một cổng localhost

Lệnh `npm run dev` thực hiện build React trước rồi Express phục vụ cả frontend và API trên cùng cổng 5000. Không cần chạy đồng thời hai terminal cho frontend/backend.

## Lưu ý demo

- Bản đồ nền và định tuyến cần Internet để lấy dữ liệu trực tuyến.
- Xác định vị trí cần người dùng cấp quyền trình duyệt.
- Nếu không cấp quyền vị trí, hệ thống vẫn cho phép tra cứu; các chức năng phụ thuộc vị trí dùng trung tâm Hà Nội cho luồng demo.
- Dữ liệu mẫu phục vụ trình bày và kiểm thử đồ án.
