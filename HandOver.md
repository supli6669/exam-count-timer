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

## 2. Chi Tiết Các Phần Đã Triển Khai Gần Đây (So với lần cuối)
- **src/components/ExamCard.jsx**:
  - Tích hợp cụm nhiệm vụ con (sub-tasks checklist) dạng collapsible có thanh hiển thị tiến trình (progress bar), checkbox tích chọn, hạn chót (deadline) riêng biệt hiển thị thông minh (đỏ nổi bật nếu quá hạn) và nút xóa nhiệm vụ con.
  - Ô thêm nhanh nhiệm vụ có text input + datetime select.
- **src/App.jsx**:
  - Định nghĩa các state handler: `handleAddTask`, `handleToggleTask`, `handleDeleteTask` để lưu danh sách nhiệm vụ vào LocalStorage của từng môn thi.
- **src/components/PomodoroTimer.jsx**:
  - Tích hợp thêm state `completedWorkSessions` lưu số phiên làm việc đã hoàn thành vào `localStorage`.
  - Hiển thị 3 dấu chấm tròn đỏ chỉ báo phiên làm việc và 1 dấu chấm kim cương nhấp nháy xanh dương (`pulse-blue`) báo hiệu phiên nghỉ dài tiếp theo.
  - Hiển thị text động: **"Còn X lần Nghỉ ngắn nữa đến Nghỉ dài"** hoặc thông báo khi đợt nghỉ tiếp theo là Nghỉ dài.
  - Sửa đổi hàm `handleSkip` để khi người dùng nhấn bỏ qua phiên Nghỉ ngắn/Nghỉ dài thì sẽ quay về phiên **Tập trung** thay vì chuyển tiếp sang break khác không hợp lệ.
- **src/index.css**:
  - Cập nhật `.pomodoro-sidebar` từ giao diện bảng bên phải thành **toàn màn hình (full screen)** phủ toàn bộ viewport (`100vw`, `100vh`, `z-index: 1000`) khi mở, mang lại không gian tập trung tuyệt đối.
  - Căn giữa các khối chức năng Pomodoro (header, chế độ, đồng hồ tròn, nút điều khiển, cài đặt) trong màn hình lớn.
  - Thêm CSS styling cho cụm nhiệm vụ con của từng môn thi đảm bảo đồng nhất thiết kế Dark Premium Glassmorphism.
  - Thêm CSS định hình layout cho container dấu chấm chu kỳ Pomodoro (`.pomodoro-progress-dots-container`, `.pomodoro-dots-indicator`, `.indicator-dot`, v.v.).
  - Thêm hiệu ứng động `@keyframes pulse-blue` để tạo nhịp đập cho chấm Nghỉ dài tiếp theo.

## 3. Trạng Thái Git Hiện Tại
- Mã SHA commit / Message gần nhất: `18450ef feat: add exam sub-tasks support with individual deadlines, progress tracking, and collapsible lists` (Và chuẩn bị commit thêm phần Pomodoro toàn màn hình)
- Tên Branch hiện tại: `main`
- GitHub Remote: `https://github.com/supli6669/exam-count-timer.git` (Đã kết nối, commit và push thành công)

## 4. Các Bước Tiếp Theo (Dành cho AI Agent)
- [ ] Tích hợp trình phát nhạc Spotify Embed (theo kế hoạch triển khai đã được duyệt sơ bộ).

## 5. Lỗi Hiện Tại / Điểm Nghẽn / Khó Khăn Kỹ Thuật
- Không có lỗi hiện tại.
