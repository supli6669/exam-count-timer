# Tài Liệu Bàn Giao Dự Án (Project Handover)

## 1. Trạng Thái Hiện Tại Của Dự Án
- [x] Khởi tạo Dự án & Git Ban đầu (Trạng thái: Đã xong)
- [x] Khởi tạo Ứng dụng React + Vite (Trạng thái: Đã xong)
- [x] Thiết kế Giao diện & Design System (Trạng thái: Đã xong)
- [x] Xây dựng các Components & Logic Đếm Ngược (Trạng thái: Đã xong)
- [x] Tính năng Nhắc nhở Browser Notifications (Trạng thái: Đã xong)
- [x] Custom DatePicker với dropdown select + validation năm (Trạng thái: Đã xong)
- [x] Hiển thị thứ trong ngày (ExamCard & DatePicker) (Trạng thái: Đã xong)
- [x] Bộ đếm Pomodoro & Cấu hình thời lượng lưu trữ LocalStorage (Trạng thái: Đã xong)
- [x] Chỉ báo chu kỳ Pomodoro & đếm ngược số lần nghỉ ngắn đến nghỉ dài (Trạng thái: Đã xong)
- [x] Sửa lỗi skip logic của Pomodoro chuyển tiếp về phiên Tập trung (Trạng thái: Đã xong)
- [x] Tích hợp thêm các task cần làm (Todo checklist) cho từng môn thi cụ thể có deadline (Trạng thái: Đã xong)
- [x] Giao diện Pomodoro toàn màn hình tập trung (như một tab mới) (Trạng thái: Đã xong)
- [x] Tích hợp trình phát nhạc Spotify Embed (Trạng thái: Đã xong)
- [x] Mục tiêu định kỳ Rule of 3 (Hàng ngày, Hàng tuần, Hàng tháng, Hàng năm) kèm reset thông minh & hiển thị mốc thời gian (Trạng thái: Đã xong)
- [x] Tái thiết kế nút đóng Pomodoro thành nút nổi cố định ở góc trên bên phải (Trạng thái: Đã xong)

## 2. Chi Tiết Các Phần Đã Triển Khai Gần Đây (So với lần cuối)
- **src/components/SpotifyPlayer.jsx**:
  - [NEW] Component phát nhạc Spotify Embed với 4 preset focus (Lofi, Classical, Ambient, Nature).
  - Tích hợp ô dán link thông minh tự động trích xuất ID để convert các link chia sẻ Spotify (Playlist, Album, Track) thành dạng nhúng.
  - Lưu trạng thái ẩn/hiện và link nhạc đang phát vào LocalStorage.
- **src/components/RecurringTasks.jsx**:
  - [NEW] Component quản lý Mục tiêu định kỳ theo nguyên lý "Rule of 3" (đúng 3 nhiệm vụ cho mỗi chu kỳ).
  - Tích hợp chỉnh sửa nội dung nhanh (Double-click/Pen icon) và tích chọn đi kèm thanh tiến trình phát sáng.
  - Cơ chế tự động reset thông minh khi bước sang ngày mới, tuần mới, tháng mới hoặc năm mới.
  - Hiển thị mốc thời gian / khoảng ngày thực tế chi tiết của chu kỳ ngay dưới tiêu đề.
- **src/components/PomodoroTimer.jsx**:
  - Nhúng `<SpotifyPlayer />` động chỉ khi mở sidebar (tự động ngắt nhạc khi đóng).
  - Đưa nút đóng Pomodoro thành nút nổi cố định ở góc trên bên phải màn hình (pomodoro-close-btn) đi kèm hiệu ứng hover xoay 90 độ và glow màu đỏ neon.
- **src/App.jsx**:
  - Tích hợp và hiển thị `<RecurringTasks />` ngay dưới statistics bar trên trang chính.
- **src/index.css**:
  - Thêm CSS responsive cho Spotify Player, Mục tiêu định kỳ (bố cục 4 cột) và hiệu ứng tương tác cao cấp cho nút thoát Pomodoro nổi.

## 3. Trạng Thái Git Hiện Tại
- Mã SHA commit / Message gần nhất: `feat: integrate Spotify player, Recurring Tasks tracker (Rule of 3), and improve Pomodoro UI`
- Tên Branch hiện tại: `main`
- GitHub Remote: `https://github.com/supli6669/exam-count-timer.git`

## 4. Các Bước Tiếp Theo (Dành cho AI Agent)
- Hiện tại các tính năng đề ra đã hoàn thành đầy đủ và hoạt động ổn định.

## 5. Lỗi Hiện Tại / Điểm Nghẽn / Khó Khăn Kỹ Thuật
- Không có lỗi hiện tại.
