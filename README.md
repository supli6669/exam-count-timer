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

## Thông tin Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
