# HƯỚNG DẪN DEMO CUỐI

## Lệnh chạy

Tại thư mục gốc:

```bash
npm install
npm run dev
```

Hoặc sau khi đã cài package:

```bash
npm start
```

Mở `http://localhost:5000`.

## Luồng demo đúng phạm vi báo cáo

1. **Trang chủ**: bản đồ + danh sách tiện ích.
2. **Tìm kiếm**: nhập `bệnh viện`, `ATM`, `công viên` hoặc tên địa điểm.
3. **Lọc loại**: chọn một trong 7 nhóm tiện ích.
4. **Lọc khoảng cách**: bấm `Vị trí hiện tại`, sau đó chọn 1/3/5/10 km.
5. **Xem chi tiết**: chọn marker hoặc một dòng trong danh sách.
6. **Chỉ đường**: từ chi tiết chọn `Chỉ đường`; tuyến được vẽ trên bản đồ khi dịch vụ định tuyến có Internet.
7. **Quản trị**: vào `/admin/login`, đăng nhập `admin / Admin@123`.
8. **Quản lý tiện ích**: thử Thêm → Sửa → bật/tắt → Xóa.
9. **Quản lý loại tiện ích**: thử Thêm → Sửa → bật/tắt; thử xóa loại đang được sử dụng để xem cảnh báo.

## MongoDB

MongoDB là cơ sở dữ liệu chính. Nếu MongoDB chưa chạy, ứng dụng tự chuyển sang DEMO MODE để không làm hỏng buổi trình diễn. Khi MongoDB chạy lại, dữ liệu sẽ dùng DB thật.
