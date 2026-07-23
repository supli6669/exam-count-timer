# Cập Nhật Gần Nhất (2026-07-23)

- Đã sửa độ ổn định dữ liệu LocalStorage: Pomodoro tự phục hồi khi cấu hình số hoặc lịch sử học tập bị hỏng; XP và cấp độ chỉ nhận số nguyên hợp lệ.
- Đã sửa lỗi ngày theo múi giờ địa phương cho log học tập, biểu đồ đóng góp, streak và Smart Insights; không còn lệch ngày gần nửa đêm tại Việt Nam.
- Đã hoàn thiện Backup/Restore: sao lưu thêm task chung, XP, cấp độ, theme, flashcard, streak và onboarding; restore xóa dữ liệu cũ không có trong bản sao lưu, đồng thời bỏ qua key không được hỗ trợ.
- Đã làm an toàn Soundboard khi dữ liệu âm lượng hoặc sound mix trong LocalStorage bị hỏng.
- Đã cập nhật cache PWA lên `exam-countdown-v2` để bản deploy mới không tiếp tục dùng asset cũ từ cache.
- Đã sửa logic danh sách lịch thi rỗng: sau khi người dùng xóa toàn bộ lịch thi, dữ liệu mẫu không tự xuất hiện lại khi tải trang.
- Đã sửa tab **Bảng Thống Kê** trong Pomodoro bị màn hình đen. Nguyên nhân là `breakLogs` không được truyền vào component; tab nay có dữ liệu mặc định an toàn, màu biểu đồ theo phiên Pomodoro và thao tác xóa lịch sử hoạt động đúng.
- Đã xác minh sau mỗi đợt sửa bằng `npm run lint` và `npm run build`.
- Commit đã đẩy lên `main`:
  - `9b3cd55` — harden local data handling and backups
  - `8f803bc` — stabilize local dates, audio settings and PWA updates
  - `7d9ffba` — preserve empty exams and restore Pomodoro stats

## Tính Năng Đang Chờ Push

- Thêm **Hôm nay học gì?** trong tab Kế hoạch & Thói quen: tự xếp tối đa bốn việc ưu tiên từ hạn thi, độ ưu tiên task, số Pomodoro dự kiến và flashcard đến hạn.
- Nâng cấp flashcard Leitner: mặc định mở danh sách thẻ đến hạn; trả lời Đúng/Sai tự tính hộp tiếp theo và ngày ôn kế tiếp (1, 3, 7, 14 hoặc 30 ngày).
- Thêm **Mock Exam**: chọn môn, thời lượng và số câu; đếm giờ làm bài, tự chấm điểm và lưu tối đa 50 kết quả cục bộ.
- Tối ưu phần mới: tính kế hoạch bằng dữ liệu dẫn xuất (`useMemo`), cô lập component kế hoạch bằng `React.memo`, và chống dữ liệu LocalStorage bị hỏng.

---
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
- [x] Hiển thị thời gian đếm ngược Pomodoro & favicon động trên thanh tab/taskbar (Trạng thái: Đã xong)
- [x] Tự động xóa môn thi đã diễn ra khỏi danh sách (Trạng thái: Đã xong)
- [x] Tối ưu hóa hiệu năng Focus Stats: Tách biệt component FocusStatsTab độc lập và memoize dữ liệu (Trạng thái: Đã xong)
- [x] Khắc phục rò rỉ bộ nhớ AudioContext Web Audio API trong playSynthAlarm (Trạng thái: Đã xong)
- [x] Tối ưu hóa hiệu năng SmartInsights: Bọc useMemo cho insights, chronotype, growthInsight và loại bỏ polling setInterval 5s (Trạng thái: Đã xong)
- [x] Tối ưu hóa hiệu năng soundboard & phát nhạc: Caching noise buffers và bọc React.memo cho AmbientSoundboard và SpotifyPlayer (Trạng thái: Đã xong)
- [x] Hệ thống Game Hóa học tập (Gamification): Tích lũy XP, Level thăng cấp, chuông thăng cấp và thanh tiến trình ở Header (Trạng thái: Đã xong)
- [x] Chế độ Bấm giờ đếm xuôi (Stopwatch Mode) bên cạnh Pomodoro (Trạng thái: Đã xong)
- [x] Ước lượng cà chua (🍅) cho task và hiển thị huy hiệu cà chua (Trạng thái: Đã xong)
- [x] Âm thanh Dopamine check-off task tạo trực tiếp bằng Web Audio API (Trạng thái: Đã xong)
- [x] Khung danh ngôn học tập động lực click-to-change (Trạng thái: Đã xong)
- [x] Bảng Huy hiệu Thành tích tự động mở khóa theo lịch sử học tập (Trạng thái: Đã xong)
- [x] Tối ưu hóa pin: Chế độ Tiết kiệm pin tối đa (Low Power Mode) cho canvas hạt, giới hạn tần số quét canvas 30 FPS và đồng bộ hóa cài đặt (Trạng thái: Đã xong)
- [x] Cải tiến trải nghiệm người dùng (UX): Tích hợp onboarding chào mừng, phím tắt Pomodoro và presets âm thanh nhanh (Trạng thái: Đã xong)
- [x] Tích hợp Ma trận ưu tiên công việc (Eisenhower Matrix) cho các nhiệm vụ ôn tập và nhiệm vụ chung (Trạng thái: Đã xong)
- [x] Việc Cần Làm Hằng Ngày (Daily Habits) tự động reset trạng thái lúc 00:00 (Trạng thái: Đã xong)
- [x] Tối ưu hóa bố cục Dashboard dạng 3 tab chuyên biệt (Lịch thi, Kế hoạch & Thói quen, Phân tích & Tiến độ) tránh chồng chéo các tính năng (Trạng thái: Đã xong)
- [x] Tải ảnh nền tùy chỉnh từ máy tính cho chế độ Pomodoro, tự động nén ảnh bằng canvas (Trạng thái: Đã xong)


## 2. Chi Tiết Các Phần Đã Triển Khai Gần Đây
- **Tối Ưu Hóa Hiệu Năng & Quản Lý Bộ Nhớ (Performance & Memory Optimization)**:
  - **Tối ưu hóa hiệu năng Focus Stats**: Tách riêng component `FocusStatsTab.jsx`, chuyển các state bộ lọc nội bộ và sử dụng `useMemo` bọc toàn bộ các tính toán thống kê (streak, so sánh, SVG Bezier path). Điều này giúp cô lập state đếm ngược Pomodoro (chạy mỗi giây), ngăn không cho các phép tính đồ thị nặng re-render vô ích.
  - **Khắc phục rò rỉ bộ nhớ AudioContext**: Cấu trúc lại hàm phát âm thanh `playSynthAlarm` trong `PomodoroTimer.jsx`, tự động giải phóng và đóng `AudioContext` qua `ctx.close()` sau 2.2 giây hoặc lập tức khi âm lượng bằng 0, giúp trình duyệt không bị giới hạn số lượng bộ dựng âm thanh.
  - **Tối ưu hóa SmartInsights**: Bọc các phép phân tích dữ liệu môn thi (`insights`), phân tích giờ sinh học (`chronotype`) và tốc độ tăng trưởng (`growthInsight`) bằng `useMemo`. Đồng thời, loại bỏ hoàn toàn cơ chế polling bằng `setInterval` định kỳ 5 giây để thay bằng trigger phản xạ sự kiện (`storage`, `studyLogsUpdated`).
  - **Tối ưu hóa hiệu năng vẽ Canvas (ThemeParticles)**: Loại bỏ `ctx.shadowBlur` và `ctx.shadowColor` thay bằng kỹ thuật vẽ các hình tròn lồng nhau (Layered Circles), giúp hoạt ảnh 60 FPS chạy siêu nhẹ, tiết kiệm đáng kể CPU/GPU cho thiết bị.
  - **Bảo vệ chống trễ nhập liệu (Keystroke Input Lag Protection)**: Bọc các component phụ (`ContributionGraph`, `RecurringTasks`, `SmartInsights`) bằng `React.memo` và bọc toàn bộ thuật toán xử lý dữ liệu nặng trong `useMemo`. Giúp tránh tình trạng re-render và tính toán thừa khi người dùng gõ từ khóa tìm kiếm môn thi trên Dashboard.
  - **Tối ưu hóa bộ đếm trong Lịch (CalendarView)**: Đồng hồ đếm ngược chỉ chạy khi mở popup xem chi tiết ngày thi, tự động dọn dẹp (clear) khi đóng popup giúp lịch không bị re-render định kỳ mỗi giây.
  - **Tối ưu hóa soundboard & phát nhạc**: Thêm cơ chế cache `noiseBufferCache` cho các bộ tạo tiếng ồn ngẫu nhiên (White, Pink, Brown Noise) trong `AmbientSoundboard.jsx` để tránh tạo mới mảng float khi tắt/bật; bọc cả `AmbientSoundboard` và `SpotifyPlayer` trong `React.memo` để tránh bị re-render từng giây một theo nhịp đếm ngược của đồng hồ Pomodoro.
  - **Tối ưu hóa năng lượng tối đa (Low Power Mode & 30 FPS Lock)**:
    - Bổ sung tùy chọn gạt *"🔋 Tiết kiệm pin tối đa (Tắt Canvas hạt)"* vào menu Cài đặt Pomodoro, lưu cấu hình vào `localStorage` dưới tên `pomodoro_low_power`. Khi chế độ này được kích hoạt, Canvas hạt trong `ThemeParticles.jsx` sẽ được tắt hoàn toàn và không khởi tạo tài nguyên hay chạy vòng lặp vẽ.
    - Giới hạn tốc độ hoạt ảnh hạt cố định ở tối đa **30 FPS** (thay vì tự chạy 60/120/144 FPS theo tần số quét màn hình) bằng kỹ thuật Delta-time throttling khi chế độ tiết kiệm pin bị tắt, giúp giảm tải GPU tối đa cho các màn hình ProMotion/high-refresh-rate.
    - Tích hợp đồng bộ khóa `pomodoro_low_power` vào bộ Backup & Restore JSON để dễ dàng phục hồi cấu hình.
- **Game hóa & Trải nghiệm học tập (Gamification & Study UX)**:
  - **Lời chào động & Tên inline**: Lời chào buổi sáng/chiều/tối kết hợp tên tùy chỉnh cho phép chỉnh sửa trực tiếp (inline edit) tại Header.
  - **Hệ thống cấp độ Scholar & Tích lũy XP**: Nhận điểm kinh nghiệm từ các hoạt động học tập (Pomodoro/Stopwatch, hoàn thành task môn thi hoặc mục tiêu định kỳ), thăng cấp tự động kèm âm thanh Level-Up và thông báo chúc mừng.
  - **Chế độ Bấm giờ (Stopwatch Mode)**: Hỗ trợ đếm giờ xuôi bắt đầu từ `00:00` thay vì Pomodoro đếm ngược, giúp giảm áp lực thời gian cho học sinh.
  - **Ước lượng quả cà chua 🍅**: Bổ sung ước tính số phiên học dự kiến cho từng task ôn thi và hiển thị huy hiệu trực quan.
  - **Bảng Huy hiệu Thành tích (Focus Badges)**: Tự động mở khóa các danh hiệu như Cú Đêm🦉, Sơn Ca🌅, Siêu Chiến Binh⚔️, Kỷ Lục Gia🏆, Dọn Sạch Đề Cương🧹 dựa trên hành vi học tập thực tế.
  - **Chuông hoàn thành việc (Success Chime)**: Kích hoạt âm thanh "Ding" Dopamine tổng hợp qua Web Audio API (hoàn toàn offline) khi check-off việc cần làm.
  - **Khung danh ngôn truyền động lực**: Hiển thị châm ngôn ôn thi dạng kính mờ, click để đổi câu danh ngôn ngẫu nhiên.
  - **Tối ưu hóa trải nghiệm người dùng nâng cao (UX Upgrades)**:
    - **Welcome Onboarding Tour**: Tự động hiển thị thẻ kính mờ giới thiệu 4 bước với giao diện carousel khi người dùng truy cập lần đầu.
    - **Bảng phím tắt Pomodoro**: Nút hỗ trợ phím tắt ở header Pomodoro, hiển thị cheatsheet các phím (Space, Esc, S, L). Bổ sung phím tắt `L`/`l` để kích hoạt nhanh chế độ tiết kiệm pin.
    - **Soundboard Presets**: Hàng nút chọn nhanh preset âm thanh (Tập trung sâu, Quán Cafe, Vũ trụ, Rừng mưa) tự động kích hoạt tổ hợp loa môi trường và sóng não.
    - **Nâng cấp hoạt ảnh Hover**: Cải tiến hoạt ảnh 3D-tilt nhẹ khi hover các thẻ môn thi `ExamCard`.

- **Tối Ưu Hóa Toàn Diện & Tính Năng Nâng Cao**:
  - **Tối ưu năng lượng (Page Visibility API)**: Tự động dừng vòng lặp Canvas hạt của `ThemeParticles` khi tab ẩn để tiết kiệm 100% tài nguyên CPU/GPU và khôi phục khi tab hiển thị lại.
  - **Phím tắt nhanh trong Pomodoro**: Phím `Space` để tạm dừng/chạy tiếp, `Esc` để đóng panel, và `S` để bỏ qua phiên tập trung (chặn kích hoạt khi đang gõ phím).
  - **Sao lưu & Khôi phục (JSON Export/Import)**: Tích hợp component `BackupRestore` tại thanh tiêu đề để tải về (Export) và tải lên (Import) dữ liệu LocalStorage an toàn.
  - **Liên kết Pomodoro với Task**: Thêm bộ chọn nhiệm vụ (Task Focus Selector) khi chọn môn ôn tập để lưu log học tập chứa chi tiết `taskId` và `taskText`.
- **Tối Ưu Hóa Trình Phân Tích & Cảnh Báo Ôn Thi (Smart Insights)**:
  - Giới hạn thời gian khuyên học ôn tập hàng ngày không vượt quá thời gian thực tế còn lại trước giờ thi (`minutesLeftUntilExam`), loại bỏ các gợi ý học tập phi thực tế khi sát kỳ thi.
  - Nâng cấp nhãn hiển thị thành thời lượng **còn cần ôn tập** động trong ngày (tự động khấu trừ số phút đã học của môn đó trong ngày hôm nay).
  - Thêm cấp độ cảnh báo đỏ khẩn cấp `🚨 THI TRONG 24H - ÔN GẤP!` cho các môn còn dưới 1 ngày thi mà chưa đạt 85% tiến độ ôn tập.
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
- **Hiển thị thời gian đếm ngược Pomodoro & favicon động trên thanh tab/taskbar**:
  - Thiết lập hook đồng bộ hóa thời gian đếm ngược của Pomodoro lên tiêu đề trang (`document.title`) và favicon của trình duyệt theo thời gian thực.
  - Tự động thay đổi biểu tượng (favicon SVG) và emoji theo trạng thái của bộ đếm: `⚡` (Tập trung), `☕` (Nghỉ ngắn), `🍃` (Nghỉ dài).
  - Hỗ trợ hiển thị ký hiệu tạm dừng `⏸️` trước tiêu đề khi người dùng tạm dừng đếm ngược.
  - Tự động khôi phục tiêu đề gốc `Đồng Hồ Đếm Ngược Lịch Thi - Theo Dõi Lịch Thi Thời Gian Thực` và biểu tượng mặc định `⏱️` khi reset hoặc  - **Đồng bộ màu sắc toàn bộ Tab & Giao diện (Dynamic Theme Adaption)**: Khi chọn chủ đề Tùy chỉnh, màu sắc trích xuất được dùng để nhuộm tối toàn bộ hình nền, các tấm kính mờ (glass panels) và viền phản chiếu. Đồng thời, hệ thống dịch chuyển màu gốc đi -40 độ (màu tương đồng - analogous) để tạo ra tông màu nhấn rực rỡ và hài hòa nhất (ví dụ nền hồng đen đi với tab màu tím hoa oải hương phát sáng), thay thế cho màu tương phản trực tiếp dễ gây chói mắt. Các biến CSS `--color-primary`, `--bg-primary`, `--bg-secondary`, `--bg-glass` được đồng bộ động lập tức.
  - **Đồng bộ hóa & Hiệu ứng hạt**: Hỗ trợ đầy đủ tính năng xóa ảnh tùy chỉnh. Khi sử dụng hình nền tùy chỉnh, hệ thống tự động ánh xạ hiển thị các hạt bụi sáng ấm (lofi cozy sun dust) chuyển động mượt mà để tăng chiều sâu nghệ thuật.
  - **Sao lưu hoàn chỉnh**: Cả mã ảnh base64 (`pomodoro_custom_bg`) và dữ liệu màu sắc dạng HSL (`pomodoro_custom_theme_data`) đều được tích hợp vào mảng `keysToBackup` của bộ Backup JSON để đồng bộ hóa và khôi phục khi cần thiết.
 
## 3. Trạng Thế Git Hiện Tại
- Mã SHA commit / Message gần nhất: `88ecf94` / `style: shift custom theme color matching from complementary to analogous for artistic dual-tone look`��), Q2 (Lên lịch - Tím), Q3 (Làm nhanh - Xanh lá), Q4 (Loại bỏ - Xám) với hiệu ứng bóng mờ và viền màu neon tinh tế.
  - **Nhiệm vụ chung (General Tasks)**: Bổ sung state `generalTasks` và bộ nhớ LocalStorage riêng biệt để người học có thể tạo các đầu việc độc lập không gắn với môn thi nào.
  - **Form thêm nhanh & Đổi quadrant**: Cho phép thêm trực tiếp công việc mới vào bất kỳ góc phần tư nào, cũng như di chuyển linh hoạt công việc giữa các góc phần tư qua menu select mini.
  - **Chấm chỉ báo độ ưu tiên**: Hiển thị chấm tròn phát sáng màu tương ứng bên cạnh tên nhiệm vụ trong danh sách việc cần làm của từng Exam Card.
  - **Đồng bộ Pomodoro**: Cho phép chọn và ghi nhận việc tập trung cho các Nhiệm vụ chung ngay trong sidebar Pomodoro Timer.
- **Thói Quen Hằng Ngày (Daily Habits)**:
  - **Định nghĩa danh sách việc**: Cho phép người học tự định nghĩa và tùy chỉnh các thói quen lặp lại hàng ngày (thêm, xóa, nhấp đúp để chỉnh sửa).
  - **Tự động đặt lại trạng thái**: Sử dụng LocalStorage (`daily_tasks_list`, `daily_tasks_last_reset`) để tự động reset toàn bộ checkbox về trạng thái chưa hoàn thành vào lúc 00:00 hàng ngày dựa trên múi giờ thực tế, trong khi giữ nguyên nội dung công việc.
  - **Gamification & Dopamine Chime**: Kết nối trực tiếp với hệ thống XP học tập (+25 XP cho mỗi đầu việc hoàn thành kèm theo chuông Dopamine âm nhạc tổng hợp bằng Web Audio API) và tự động cộng dồn vào Bản đồ đóng góp (Study Commits Map).
- **Tối Ưu Hóa Bố Cục Tránh Chồng Chéo (Dashboard Layout Decoupling)**:
  - **Cấu trúc 3 tab chuyên biệt**: Tái kiến trúc giao diện Dashboard cuộn dọc dài (>4200px) thành 3 không gian làm việc tập trung cao ở Header:
    - **Lịch Thi (Exams)**: Chỉ hiển thị Stats Bar, bộ lọc Filter Panel và danh sách thi. Tích hợp thanh chọn tab phụ "Thẻ 📇" / "Lịch 📅" ngay bên trong Filter Panel giúp thao tác cực nhanh.
    - **Kế Hoạch & Thói Quen (Tasks & Habits)**: Chứa Ma trận ưu tiên Eisenhower, Mục tiêu Rule of 3 và Thói quen hàng ngày Daily Habits ở vị trí dễ nhìn, rộng rãi.
    - **Phân Tích & Tiến Độ (Analytics & Commits)**: Chứa Smart Insights học tập và Bản đồ đóng góp GitHub Heatmap để người dùng chuyên tâm phân tích hiệu suất học mà không bị xao nhãng bởi bộ đếm thời gian.
  - **Bảo vệ tiêu điểm**: Nút "Thêm môn thi" chỉ hiển thị khi người dùng đang mở tab Lịch Thi, giảm thiểu diện tích thừa trên Header.
- **Tải Ảnh Nền Tùy Chỉnh & Đổi Màu Giao Diện (Custom Background & Dynamic Theme)**:
  - **Tải ảnh ngoại tuyến (Offline Upload)**: Bổ sung tùy chọn "Tùy chỉnh" vào thanh lựa chọn chủ đề Pomodoro. Cho phép người dùng tải lên bất kỳ hình ảnh nào từ máy tính (`.jpg`, `.png`).
  - **Nén ảnh bằng HTML5 Canvas**: Để tránh lỗi tràn bộ nhớ LocalStorage (giới hạn 5MB), ảnh tải lên sẽ tự động được vẽ lại trên một Canvas ẩn để điều chỉnh độ phân giải tối đa về 1280px và nén JPEG chất lượng 0.65. Ảnh sau nén thường chỉ nặng khoảng 80KB-150KB, lưu trữ cực kỳ an toàn.
  - **Tự động trích xuất màu chủ đạo (Color Extraction)**: Phân tích pixel của ảnh nền trên canvas 16x16. Chuyển đổi mã RGB sang HSL để chọn ra màu sắc có độ rực rỡ (saturation > 30%) và độ sáng phù hợp nhất cho giao diện tối (lightness từ 40% đến 75%), giúp màu sắc hiển thị vừa khớp tông nền vừa giữ tính thẩm mỹ cao.
  - **Đồng bộ màu sắc toàn bộ Tab & Giao diện (Dynamic Theme Adaption)**: Khi chọn chủ đề Tùy chỉnh, màu sắc trích xuất được sẽ ghi đè lên các biến CSS `--color-primary` và `--color-primary-glow` toàn cục. Toàn bộ tab ở Header, viền hộp và nút bấm lập tức đổi màu đồng bộ với hình nền. Nếu đổi sang chủ đề mặc định, giao diện tự động khôi phục lại tông màu xanh nước biển gốc.
  - **Đồng bộ hóa & Hiệu ứng hạt**: Hỗ trợ đầy đủ tính năng xóa ảnh tùy chỉnh. Khi sử dụng hình nền tùy chỉnh, hệ thống tự động ánh xạ hiển thị các hạt bụi sáng ấm (lofi cozy sun dust) chuyển động mượt mà để tăng chiều sâu nghệ thuật.
  - **Sao lưu hoàn chỉnh**: Cả mã ảnh base64 (`pomodoro_custom_bg`) và dữ liệu màu sắc dạng HSL (`pomodoro_custom_theme_data`) đều được tích hợp vào mảng `keysToBackup` của bộ Backup JSON để đồng bộ hóa và khôi phục khi cần thiết.

## 3. Trạng Thế Git Hiện Tại
- Mã SHA commit / Message gần nhất: `64fcca5` / `feat: implement Peak Theme Engine to dynamically tint app and compute complementary accent colors`
- Tên Branch hiện tại: `main`
- GitHub Remote: `https://github.com/supli6669/exam-count-timer.git`

## 4. Các Steps Tiếp Theo (Kế hoạch thực hiện hiện tại)
- [x] **Làm lớn đồng hồ Pomodoro & Đưa thanh tiến trình xuống dưới**: (Trạng thái: Đã xong)
  - Loại bỏ vòng tròn SVG đếm ngược.
  - Tăng kích thước số đếm ngược Pomodoro lên cực lớn (`font-size: 6.5rem` trên desktop, in đậm, trắng).
  - Đặt thanh tiến trình ngang mini nằm bên dưới số đếm ngược này (giống phong cách flocus).
- [x] **Tối ưu hóa Smart Insights (Trình phân tích ôn thi)**: (Trạng thái: Đã xong)
  - Loại bỏ thanh tiến trình nhiệm vụ (checklist) riêng biệt ở dưới.
  - Loại bỏ nhãn tiến độ checklist nhiệm vụ ôn thi, giữ giao diện gọn gàng chỉ hiển thị tiến độ học tập thực tế.

## 5. Lỗi Hiện Tại / Điểm Nghẽn / Khó Khăn Kỹ Thuật
- **Đã khắc phục lỗi ReferenceError khởi động**: Sửa lỗi tham chiếu `studyLogs` trước khi khởi tạo trong `PomodoroTimer.jsx` bằng cách chuyển các hàm tính toán thống kê xuống dưới phần khai báo các React hooks và state. Hiện tại trang web khởi chạy hoàn hảo không còn lỗi runtime.
