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

## Kiểm tra và triển khai

```sh
npm run lint
npm test
npm run build
```

Vercel tự triển khai từ nhánh `main`. Mỗi đợt phát hành tăng phiên bản cache trong `public/sw.js` để PWA nhận bản mới.
