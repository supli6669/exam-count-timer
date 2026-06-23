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
- [/] Tích hợp thêm các task cần làm (Todo checklist) cho từng môn thi cụ thể có deadline (Trạng thái: Đang triển khai)

## 2. Chi Tiết Các Phần Đã Triển Khai Gần Đây (So với lần cuối)
- **src/components/PomodoroTimer.jsx**:
  - Tích hợp thêm state `completedWorkSessions` lưu số phiên làm việc đã hoàn thành vào `localStorage`.
  - Hiển thị 3 dấu chấm tròn đỏ chỉ báo phiên làm việc và 1 dấu chấm kim cương nhấp nháy xanh dương (`pulse-blue`) báo hiệu phiên nghỉ dài tiếp theo.
  - Hiển thị text động: **"Còn X lần Nghỉ ngắn nữa đến Nghỉ dài"** hoặc thông báo khi đợt nghỉ tiếp theo là Nghỉ dài.
  - Sửa đổi hàm `handleSkip` để khi người dùng nhấn bỏ qua phiên Nghỉ ngắn/Nghỉ dài thì sẽ quay về phiên **Tập trung** thay vì chuyển tiếp sang break khác không hợp lệ.
- **src/index.css**:
  - Thêm CSS định hình layout cho container dấu chấm chu kỳ Pomodoro (`.pomodoro-progress-dots-container`, `.pomodoro-dots-indicator`, `.indicator-dot`, v.v.).
  - Thêm hiệu ứng động `@keyframes pulse-blue` để tạo nhịp đập cho chấm Nghỉ dài tiếp theo.

## 3. Trạng Thái Git Hiện Tại
- Mã SHA commit / Message gần nhất: `eb00554 feat: add pomodoro cycle indicator showing breaks remaining until long break and fix skip logic`
- Tên Branch hiện tại: `main`
- GitHub Remote: `https://github.com/supli6669/exam-count-timer.git` (Đã kết nối, commit và push thành công)

## 4. Các Bước Tiếp Theo (Dành cho AI Agent)
- [ ] Tích hợp tính năng thêm các task cần làm (Todo checklist) cụ thể cho từng môn thi:
  - Cho phép người dùng lưu trữ danh sách các công việc (ví dụ: làm đề cương, làm bài tập lớn, ôn chương 1-3) đính kèm riêng cho từng Exam Card.
  - Mỗi task con sẽ có tiêu đề, trạng thái hoàn thành (checkbox) và **hạn chót (deadline) riêng** cho task đó.
  - Thiết kế UI mờ ảo (glassmorphism) đẹp mắt, có thể mở rộng danh sách task trực tiếp trên thẻ môn thi hoặc qua một Modal chi tiết.
- [ ] Tích hợp trình phát nhạc Spotify Embed (theo kế hoạch triển khai đã được duyệt sơ bộ).

## 5. Lỗi Hiện Tại / Điểm Nghẽn / Khó Khăn Kỹ Thuật
- Không có lỗi hiện tại.
