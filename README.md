# Exam Countdown Timer

Ứng dụng học tập React/Vite gồm lịch thi, Focus Loop, Pomodoro/Animedoro, thống kê, không gian widget và Study Together.

## Chạy local

```bash
npm install
npm run dev
```

Study Together dùng WebSocket và SQLite cục bộ:

```bash
npm run dev:rooms
```

Backend mặc định chạy tại `http://localhost:8787`, tự tạo identity token ẩn danh trong 30 ngày và lưu snapshot phòng ở `server/data/study-rooms.sqlite`. Có thể cấu hình frontend bằng `VITE_STUDY_ROOM_API_URL` và `VITE_STUDY_ROOM_WS_URL`; đặt `VITE_STUDY_ROOMS_ENABLED=false` để ẩn tính năng.

## Kiểm tra

```bash
npm run lint
npm test
npm run build
```
