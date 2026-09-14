# Exam Countdown Timer

Ứng dụng React/Vite cho lịch thi, danh sách việc, Pomodoro, ghi chú và thống kê học tập cơ bản. Flashcard, nhạc và âm thanh là các tiện ích tùy chọn.

## Chạy local

Yêu cầu Node.js 22.5 trở lên.

```sh
npm install
npm run dev
```

Vite chạy ở cổng 5174. Ứng dụng hoạt động trong trình duyệt, không cần máy chủ phòng học riêng.

## Dữ liệu

Lịch thi, việc cần làm, ghi chú và lịch sử học lưu trên thiết bị. Dùng Công cụ → Sao lưu để tải bản sao JSON hoặc khôi phục dữ liệu.

Việc chung và việc theo môn hiển thị trong cùng một danh sách. Các việc đã lưu ở mục hằng ngày và mục tiêu định kỳ được chuyển sang việc chung một lần, giữ trạng thái hoàn thành và không tự lặp lại. Dữ liệu nguồn cũ vẫn được giữ trong bản sao lưu; không tạo thêm nhiệm vụ mẫu. Khóa `tasks_consolidated_v1` giúp việc đã xóa không bị nhập lại khi tải trang.

Thống kê gồm thời gian hôm nay, bảy ngày gần nhất, thời gian theo môn và số việc hoàn thành. Lịch sử chi tiết giữ tối đa 180 ngày.

Sổ tay nhận các ghi chú cũ từ “Bãi đỗ suy nghĩ” một lần và giữ trạng thái đã xử lý dưới dạng nhãn. Khóa `notes_consolidated_v1` đi cùng bản sao lưu để ghi chú đã xóa không xuất hiện lại. Ghi chú được lưu ngay khi sửa; Pomodoro có nút mở Sổ tay. Lịch thi không yêu cầu tín chỉ và không tự chấm mức độ sẵn sàng thi.

## Giao diện học tập

Giao diện sáng/tối dùng chung bố cục, có lựa chọn theo thiết bị trong Công cụ. Nền phiên học được chọn riêng, không đổi màu toàn bộ ứng dụng. Các chủ đề cũ tiếp tục mở ở chế độ tối; lựa chọn hình nền Pomodoro đã lưu được giữ lại.

Đồng hồ mở trực tiếp từ thanh đầu trang. Thời gian, chuông báo và không gian/âm thanh nằm trong các mục riêng; chọn môn hoặc công việc là tùy chọn. Sổ tay mở cạnh đồng hồ trên máy tính, mở rộng trên điện thoại và dùng cùng dữ liệu với tab Sổ tay. Đổi tab giữ bản nháp công việc; đóng/mở Sổ tay giữ ghi chú đang chọn. Đồng hồ tiếp tục chạy khi mở ghi chú hoặc quay về trang chính trong cùng lần mở ứng dụng.

## Kiểm tra và triển khai

```sh
npm run lint
npm test
npm run build
```

Vercel tự triển khai từ nhánh `main`. Build tự sinh phiên bản cache và danh sách JS/CSS trong service worker. Bản mới kích hoạt khi các tab dùng bản cũ đã đóng, tránh trộn tài nguyên giữa hai bản.


## An toàn dữ liệu và bảo mật

Daily Plan tự chuyển task chưa hoàn thành từ ngày cũ sang hôm nay theo giờ địa phương, giữ ngày gốc để hiển thị nhãn. Môn thi có task không bị tự dọn khi hết giờ.

Backup tối đa 5 MB, kiểm tra các danh sách chính trước khi nhập và phục hồi dữ liệu cũ nếu ghi thất bại. Khi bộ nhớ đầy/bị chặn, thay đổi vẫn nằm trong bộ nhớ của phiên đang mở và có cảnh báo yêu cầu sao lưu. Không đóng trang trước khi xuất bản sao lưu nếu có cảnh báo này.

URL nhúng chỉ chấp nhận Spotify HTTPS hợp lệ. Ảnh nền chỉ chấp nhận PNG/JPEG/WebP/GIF tối đa 2 MB. Production dùng CSP chặn script inline và iframe ngoài Spotify; Vite dev bỏ CSP để Fast Refresh hoạt động. `vercel.json` bổ sung header chống nhúng trang, MIME sniffing và cache lại service worker; cần kiểm tra header thực tế sau deploy. Tham khảo [MDN CSP](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CSP) và [Vercel headers](https://vercel.com/docs/project-configuration/vercel-json).

Đây là ứng dụng lưu dữ liệu tại trình duyệt, chưa có đồng bộ tài khoản hoặc xử lý xung đột chỉnh sửa cùng dữ liệu ở nhiều tab. CSP vẫn cho phép inline CSS vì giao diện sử dụng React style. Kiểm tra dependency bằng `npm audit`; kết quả không thay thế kiểm thử bảo mật đầy đủ.
