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
- [x] Khởi chạy tự động cùng Windows (Startup script & shortcut) (Trạng thái: Đã xong)
- [x] Thống kê thời gian học tập chi tiết theo ngày & môn thi (Trạng thái: Đã xong)
- [x] 5 chủ đề nghệ thuật (Art Themes) cho Pomodoro (Trạng thái: Đã xong)
- [x] Bản đồ đóng góp học tập kiểu GitHub (Study Commits Map) (Trạng thái: Đã xong)
- [x] Hiệu ứng hạt động (Ambient Particles) cho 5 Art Themes (Trạng thái: Đã xong)
- [x] Bảng âm thanh môi trường (Ambient Soundboard) cho Pomodoro (Trạng thái: Đã xong)
- [x] Trình phân tích & Cảnh báo học tập thông minh (Smart Study Insights) (Trạng thái: Đã xong)

## 2. Chi Tiết Các Phần Đã Triển Khai Gần Đây (So với lần cuối)
- **Bản đồ đóng góp học tập (GitHub-style Study Commits Map)**:
  - Tích hợp biểu đồ đóng đóng góp 53 tuần (1 năm) kiểu GitHub (Contribution Graph) trực quan ngay trên trang chính dashboard.
  - Các ô lịch tự động chuyển sang màu xanh lục đậm dần tùy theo năng suất (số lượng task hoàn thành) của bạn trong ngày.
  - Tự động cộng "commit" khi check hoàn thành sub-task của môn thi, check hoàn thành mục tiêu Rule of 3 hoặc hoàn thành một phiên Pomodoro.
  - Tự động trừ đóng góp tương ứng khi bạn bỏ check (uncheck) nhiệm vụ.
  - Hiển thị tổng số đóng góp trong năm cùng chuỗi ngày học liên tục (Streak) ở góc bảng điều khiển.
- **Tự động khởi động cùng hệ thống**:
  - Cấu hình server chạy mặc định ở cổng `5174` và tự kích hoạt trình duyệt khi khởi chạy (`server: { port: 5174, open: true }`).
  - Đặt shortcut khởi chạy `start-timer.lnk` vào thư mục Startup của Windows (`%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup`), khởi chạy server Vite thu nhỏ (minimized) mỗi khi máy tính bật.
- **Thống kê thời gian học tập nâng cao**:
  - Hỗ trợ xem thống kê thời gian học tập linh hoạt theo 3 chu kỳ: **Tuần**, **Tháng**, và **Năm**.
  - Tích hợp thanh điều hướng thời gian (`◀` và `▶`) cho phép xem lại dữ liệu của tuần trước, tháng trước, năm ngoái một cách trực quan.
  - Tự động so sánh tổng thời lượng học của chu kỳ hiện tại với chu kỳ trước đó để đưa ra **tỷ lệ phần trăm tăng/giảm (%)** (Ví dụ: `↑ 15% so với tuần trước`).
  - Biểu đồ cột tự động thích ứng với số lượng cột hiển thị (7 cột đối với Tuần, 5 cột đối với các tuần trong Tháng, và 12 cột đối với các tháng trong Năm) và tự căn chỉnh kích thước cột (responsive).
  - Tự động cập nhật bảng tổng kết (số giờ, số phút, số phiên học) và phân bố thời gian theo môn học tương thích chính xác với khoảng thời gian đang chọn.
  - Cho phép người dùng chọn môn thi đang tập trung ôn luyện để ghi nhận chính xác thời gian học từng môn vào `localStorage` (bảo toàn dữ liệu khi reset, skip phiên, hoặc đóng panel).
- **Chủ đề Nghệ thuật (Art Themes)**:
  - Bổ sung 5 chủ đề nghệ thuật: **Lofi Café, Cyberpunk Alley, Sakura Library, Space Odyssey, Nature Cabin**.
  - Các theme thay đổi ảnh nền, màu sắc vòng đếm ngược, màu nút bấm và hiệu ứng glow neon lấp lánh tương ứng với mỗi không gian học tập.
- **Hiệu ứng hạt động (Theme Particles)**:
  - Tích hợp canvas hoạt họa hạt động bay nền mượt mà theo từng chủ đề: tàn lửa trại, cánh hoa anh đào rơi chao nghiêng, mưa kỹ thuật số neon, sao nhấp nháy & sao băng, và bụi nắng lofi ấm áp.
- **Bảng âm thanh môi trường tự nhiên (Ambient Soundboard)**:
  - Tích hợp bảng âm thanh tự nhiên vòng lặp: Mưa rơi, Gió rừng, Sóng biển, Lửa trại, Suối chảy hoạt động không phụ thuộc Spotify.
  - Hỗ trợ trộn âm thanh với thanh điều khiển âm lượng độc lập và lưu trữ cấu hình âm lượng mix vào LocalStorage.
  - Tự động ngắt phát âm thanh khi đóng sidebar Pomodoro để tối ưu tài nguyên hệ thống.
- **Trình phân tích & Cảnh báo ôn thi (Smart Study Insights)**:
  - Tự động đối chiếu logs học tập thực tế và ngày thi của các môn sắp tới để hiển thị cảnh báo đỏ (`🚨 CẦN ÔN THI GẤP!`) hoặc vàng (`⚠️ Ít học bài`) trực quan trên trang chính dashboard.
  - Gợi ý cụ thể số phút khuyên học mỗi ngày cho từng môn thi để đạt mục tiêu ôn luyện tương ứng.
  - Mục tiêu ôn thi được tự động ước tính dựa trên số tín chỉ môn học nhân với hệ số thời gian theo phân loại kỳ thi (Cuối kỳ: 180 phút/tín, Giữa kỳ: 120 phút/tín, Bài tập lớn: 90 phút/tín, Kiểm tra: 45 phút/tín, Khác: 60 phút/tín). Bạn có thể chỉnh sửa số tín chỉ này trực tiếp trong biểu mẫu thêm/sửa môn thi.
  - Phân tích và động viên người dùng bằng biểu đồ so sánh xu hướng thời gian học hôm nay so với ngày hôm qua.
- **src/components/ThemeParticles.jsx**:
  - [NEW] Component Canvas vẽ hạt bay tự động theo chủ đề.
- **src/components/AmbientSoundboard.jsx**:
  - [NEW] Component điều khiển phát các âm thanh loop.
- **src/components/SmartInsights.jsx**:
  - [NEW] Component phân tích thống kê và hiển thị cảnh báo ôn thi.
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
  - Nhúng `<SpotifyPlayer />` và `<AmbientSoundboard />` động chỉ khi mở sidebar (tự động ngắt nhạc khi đóng).
  - Đưa nút đóng Pomodoro thành nút nổi cố định ở góc trên bên phải màn hình (pomodoro-close-btn) đi kèm hiệu ứng hover xoay 90 độ và glow màu đỏ neon.
  - Nhúng lớp nền `<ThemeParticles />` chạy dưới giao diện tập trung.
- **src/components/ExamCard.jsx**:
  - [MODIFY] Hiển thị thẻ số lượng tín chỉ bên cạnh thẻ phân loại môn học trên giao diện Dashboard chính.
- **src/components/ExamForm.jsx**:
  - [MODIFY] Thêm trường nhập số tín chỉ môn học (mặc định bằng 3) khi tạo/chỉnh sửa thông tin kỳ thi.
- **src/App.jsx**:
  - Tích hợp và hiển thị `<RecurringTasks />` và `<SmartInsights />` trên trang chính dashboard.
- **src/index.css**:
  - Thêm CSS responsive cho Spotify Player, Soundboard, Smart Insights, Mục tiêu định kỳ và hiệu ứng tương tác cao cấp cho các hạt canvas nền.

## 3. Trạng Thế Git Hiện Tại
- Mã SHA commit / Message gần nhất: `feat: add study stats, Pomodoro art themes, Windows auto-start, and GitHub-style contribution graph`
- Tên Branch hiện tại: `main`
- GitHub Remote: `https://github.com/supli6669/exam-count-timer.git`

## 4. Các Bước Tiếp Theo (Dành cho AI Agent)
- Hiện tại các tính năng đề ra đã hoàn thành đầy đủ và hoạt động ổn định.

## 5. Lỗi Hiện Tại / Điểm Nghẽn / Khó Khăn Kỹ Thuật
- Không có lỗi hiện tại.
