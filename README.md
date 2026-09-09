# Nhịp học

Ứng dụng học theo tín chỉ, không cần deadline. Nhập môn và tín chỉ, chọn số buổi mỗi tuần, quỹ phút mỗi buổi (gồm nghỉ), và phiên 25/30/45/50 phút.

## Cách chia lịch

App trừ 5 phút nghỉ giữa các phiên, bỏ khoảng cuối dưới 15 phút để chuyển tiếp. Mỗi phiên được giao cho môn đang thiếu thời gian nhiều nhất so với tỷ lệ tín chỉ. Vì làm tròn theo phiên, tỷ lệ có thể lệch một ít; phần phân bổ hiển thị phút thực tế. Nếu quỹ giờ quá nhỏ để mọi môn có lượt, app báo rõ.

Ví dụ 4–3–2 tín chỉ, 6 buổi × 100 phút, phiên 30 phút: 240–180–120 phút học và 60 phút nghỉ.

Các buổi là thứ tự học linh hoạt, không gắn cứng ngày trong tuần. Phiên chưa học được giữ lại, không tự xóa hoặc tăng quỹ giờ. Khi hoàn tất, tạo vòng học mới. Đổi cấu hình sau khi đã học cần xác nhận đặt lại tiến độ.

## Đồng hồ và dữ liệu

Đồng hồ dùng thời điểm kết thúc tuyệt đối, hỗ trợ tạm dừng, tải lại và tab nền. Hết phiên tự đánh dấu hoàn thành; giờ nghỉ và phiên tiếp theo cần bấm bắt đầu. Dừng giữa chừng không đánh dấu hoàn thành. Đồng hồ báo bằng giao diện và tiêu đề tab, không có âm báo.

Lịch mới lưu trong `credit_study_plan_v1`, danh sách môn nhập dở trong `credit_study_draft_v1`. Có tải và khôi phục bản sao JSON trong Môn & thời gian. Dữ liệu chỉ nằm trên trình duyệt, chưa đồng bộ nhiều thiết bị; dùng một tab để tránh ghi đè tiến độ.

Lần đầu chuyển từ bản cũ, app lấy tên môn và tín chỉ từ `exams_countdown_list`, kể cả môn có ngày thi đã qua. Các khóa dữ liệu cũ không bị thay đổi. Các màn lịch thi, XP, streak, analytics, thói quen và tiện ích phụ không còn được tải vào giao diện chính. Mã cũ còn trong kho để tham khảo.

## Chạy và kiểm tra

```sh
npm install
npm run dev
npm test
npm run lint
npm run build
```

Dev server mặc định ở cổng 5174. Bản PWA cập nhật cache `credit-study-v5`.
