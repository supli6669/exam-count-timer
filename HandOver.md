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
- [x] Bộ hòa âm sóng não & tiếng ồn trắng (Web Audio API Synthesizer) (Trạng thái: Đã xong)
- [x] Hiệu ứng hạt tương tác chuột (Interactive Particles) (Trạng thái: Đã xong)
- [x] Bản đồ nhiệt & Phân tích Nhịp sinh học (Chronotype Focus Heatmap) (Trạng thái: Đã xong)
- [x] Điều chỉnh âm lượng tổng cho Soundboard & chuông báo Pomodoro (Trạng thái: Đã xong)
- [x] 12 Kiểu âm báo tùy chỉnh dạng lưới radio 2 cột (Sparkle, Commuter Jingle, Airport, Chime, Success, Applause, Train Arrival, Game Show, Soft, Piano, Level Up, No Alert) (Trạng thái: Đã xong)
- [x] Thanh điều chỉnh âm lượng cảnh báo bảo mật cho trình phát Spotify (Trạng thái: Đã xong)
- [x] Nút "Nghe thử" để phát thử kiểu chuông và âm lượng đã cài đặt (Trạng thái: Đã xong)
- [x] Mô tả chi tiết kiểu chuông, nhãn âm lượng trực quan, thanh trượt viền tím filled-track và tự động phát thử khi kéo thả (Trạng thái: Đã xong)
- [x] Nâng cấp tab Thống kê học tập thành bảng điều khiển Focus Stats toàn diện (Today, 1 Week, 4 Weeks) và Focus History chi tiết (Trạng thái: Đã xong)
- [x] Tái thiết kế giao diện Focus Stats với 5 thẻ gradient rực rỡ và biểu đồ đường cong SVG (Bezier Curve) mượt mà (Trạng thái: Đã xong)

## 2. Chi Tiết Các Phần Đã Triển Khai Gần Đây
- **Bảng Thống Kê Focus Stats & Biểu Đồ Bezier SVG Mượt Mà**:
  - Thiết kế lại Tab Thống kê học tập thành một dashboard cao cấp:
    - **Thanh Chọn Khoảng Thời Gian (Today, 1 Week, 4 Weeks)**: Cho phép chuyển đổi nhanh để cập nhật toàn bộ số liệu thống kê thời gian thực.
    - **5 Thẻ Chỉ Số Gradient**:
      - **Focus Time** (Gradient Vàng-Cam): Tổng số giờ học kèm phần trăm thay đổi so với kỳ trước.
      - **Tasks Completed** (Gradient Xanh Lá): Số nhiệm vụ đã làm xong kèm phần trăm thay đổi.
      - **Sessions** (Gradient Xanh Dương): Số phiên Pomodoro.
      - **Streak** (Gradient Đỏ-Cam): Chuỗi ngày học tập liên tục và kỷ lục chuỗi ngày dài nhất (tự động tính toán từ study logs).
      - **Breaks** (Gradient Hồng-Đỏ): Số lần nghỉ ngơi.
    - **Visual Chart (Biểu Đồ Đường Cong SVG)**: Biểu đồ đường cong Bezier mềm mại với nét màu động đổi theo theme hoạt động, phần tô dải màu (gradient fill) mờ dưới đường cong, các nút điểm tròn kèm nhãn số phút và ngày hiển thị sắc nét.
    - **Focus History**: Danh sách lịch sử học tập phân loại theo các sub-tab Ngày, Tuần, Tháng hiển thị thời lượng học tập, số phiên học, và số task hoàn thành của từng mốc thời gian.
  - Tự động hóa việc ghi nhận break logs và lưu giữ lịch sử tasks hoàn thành thời gian thực thông qua việc lưu trữ thêm thuộc tính `completedAt` cho các sub-tasks.
- **Mô tả chi tiết kiểu chuông, nhãn âm lượng và tự động phát thử khi kéo thả (Alarm Sound Descriptions & Auto-Preview on Slider Release)**:
  - Bổ sung hộp thông tin mô tả đặc trưng (Classic - bíp bíp dồn dập đánh thức tức thì, Zen Chime - giai điệu thiền thanh tao thư thái, Woodblock - mộc mạc không xao nhãng, Gong - ngân vang sâu lắng tĩnh tâm, Bell - reng reng cơ học giòn giã rõ ràng) xuất hiện linh hoạt theo kiểu chuông được chọn.
  - Hiển thị nhãn âm lượng cụ thể tùy theo phần trăm (Tắt tiếng 🔕, Nhỏ nhẹ 🔈, Vừa phải 🔉, To rõ 🔊, Rất to 📢) để người học biết chính xác âm lượng đang điều chỉnh ở mức độ nào.
  - Sự kiện `onMouseUp` và `onTouchEnd` được liên kết với bộ phát âm thanh giúp tự động phát thử tiếng chuông ngay khi người dùng thả con chạy của thanh trượt âm lượng chuông báo, giúp người dùng cảm nhận âm lượng thực tế cực kỳ trực quan và tiện lợi.
- **12 Tùy chọn kiểu âm báo Pomodoro & Giao diện dạng lưới 2 cột (12 Alarm Sound Grid)**:
  - Tích hợp 12 kiểu âm báo khác nhau vào menu Cài đặt Pomodoro thiết kế dạng lưới 2 cột theo đúng mẫu thiết kế: **Sparkle, Commuter Jingle, Airport, Chime, Success, Applause, Train Arrival, Game Show, Soft, Piano, Level Up, No Alert**.
  - Toàn bộ âm báo đều được thiết kế và tạo dao động âm trực tiếp bằng **Web Audio API** thời gian thực (100% offline) không cần tải file MP3 ngoài.
  - Tích hợp tính năng nhấp chọn để nghe thử trực tiếp âm thanh tương ứng mà không cần nút nghe thử riêng biệt.
  - Thiết kế thanh trượt âm lượng với viền filled-track màu tím chuyển màu mượt mà ôm sát con chạy (slider thumb), mô phỏng hoàn hảo thiết kế cao cấp của giao diện tham chiếu.
- **Thanh cảnh báo điều chỉnh âm lượng Spotify**:
  - Do chính sách bảo mật sandboxed của Spotify cấm điều chỉnh âm lượng trình phát nhúng Iframe từ code ứng dụng bên ngoài (trừ khi dùng Web Playback SDK Premium phức tạp và yêu cầu login token), chúng tôi đã thiết kế một giải pháp thông minh:
  - Bổ sung thanh trượt âm lượng Spotify tương tác. Khi người dùng cố gắng kéo thanh trượt, hệ thống sẽ hiển thị một thông báo hướng dẫn cụ thể màu đỏ: *"Do chính sách bảo mật, Spotify không cho phép chỉnh âm lượng qua web nhúng. Vui lòng tăng/giảm trực tiếp trên thiết bị của bạn hoặc app Spotify Connect."* để hướng dẫn học sinh thao tác nhanh.
- **Bộ hòa âm sóng não & tiếng ồn trắng (Web Audio API Synthesizer)**:
  - Tích hợp trực tiếp 3 loại sóng não tập trung (Alpha - 10Hz, Beta - 16Hz, Theta - 6Hz) và 3 loại tiếng ồn màu (White, Pink, Brown Noise) ngay trong bảng điều khiển.
  - Sử dụng **Web Audio API** tạo dao động âm và lọc tần số thời gian thực ngay trên trình duyệt mà không cần tải file MP3 bên ngoài, giúp ứng dụng hoạt động offline 100% và nhẹ tối đa.
- **Tính năng điều chỉnh âm lượng nâng cao & Sửa lỗi hiển thị**:
  - **Thanh trượt âm lượng tổng (Master Volume)**: Điều khiển đồng bộ mức âm thanh của toàn bộ Soundboard (âm tự nhiên và sóng tổng hợp). Cấu hình lưu trữ tự động vào `localStorage` (`pomodoro_ambient_master`).
  - **Âm lượng chuông báo Pomodoro**: Cho phép tuỳ chỉnh âm lượng tiếng chuông báo khi hết phiên tập trung/nghỉ ngơi trong menu Cài đặt, có giới hạn biên độ tối đa giúp bảo vệ tai khi nghe tai nghe.
  - **Cải tiến tương tác**: Bỏ thuộc tính `disabled` giúp người dùng chỉnh trước âm lượng của các âm thanh ngay cả khi chúng chưa phát. Cập nhật CSS để con chạy của thanh trượt (slider thumb) luôn có màu trắng phát sáng nổi bật trên nền kính mờ.
- **Hiệu ứng hạt tương tác (Interactive Theme Particles)**:
  - Cải tiến hiệu ứng hạt chạy dưới màn hình Pomodoro để phản hồi trực tiếp với con trỏ chuột:
    - **Cyberpunk Alley / Sakura Library**: Giọt mưa neon và cánh hoa đào tự né tránh (repel) con trỏ chuột tạo vùng bảo vệ.
    - **Lofi Café / Nature Cabin**: Hạt bụi nắng và tàn lửa trại bị hút nhẹ (attract) và xoay theo chuyển động chuột (swirl).
    - **Space Odyssey**: Các vì sao phát sáng rực rỡ và phóng to nhẹ khi chuột di chuyển đến gần.
  - Canvas giữ thuộc tính `pointer-events: none` nên hoàn toàn không ảnh hưởng tới tương tác click của các nút bấm giao diện phía trên.
- **Phân tích nhịp sinh học ôn thi & Bản đồ nhiệt 24 giờ (Chronotype Heatmap)**:
  - Phân tích log thời gian học từ `localStorage` để phân loại nhịp sinh học tập trung của học sinh: **Sơn Ca Đón Sớm (Early Bird)**, **Chiến Binh Chiều Tà (Afternoon Warrior)**, hoặc **Cú Đêm Ôn Luyện (Night Owl)** kèm lời khuyên tối ưu giờ học.
  - Vẽ bản đồ nhiệt dạng lưới 24 giờ ngang trực quan, đổi màu xanh đậm dần tùy thuộc vào mức độ tập trung ôn bài trong ngày cùng tooltip CSS mượt mà khi di chuột qua.

## 3. Trạng Thế Git Hiện Tại
- Mã SHA commit / Message gần nhất: `e5458bf` / `style: expand statistics dashboard container width and increase typography size on desktop`
- Tên Branch hiện tại: `main`
- GitHub Remote: `https://github.com/supli6669/exam-count-timer.git`

## 4. Các Steps Tiếp Theo (Dành cho AI Agent)
- Hiện tại toàn bộ tính năng đề xuất đã hoàn thiện, hoạt động ổn định và được đẩy thành công lên nhánh chính GitHub.

## 5. Lỗi Hiện Tại / Điểm Nghẽn / Khó Khăn Kỹ Thuật
- **Đã khắc phục lỗi ReferenceError khởi động**: Sửa lỗi tham chiếu `studyLogs` trước khi khởi tạo trong `PomodoroTimer.jsx` bằng cách chuyển các hàm tính toán thống kê xuống dưới phần khai báo các React hooks và state. Hiện tại trang web khởi chạy hoàn hảo không còn lỗi runtime.
