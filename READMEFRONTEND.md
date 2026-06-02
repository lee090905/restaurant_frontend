# 🍽️ Restaurant Management System - Frontend

Hệ thống Quản lý Nhà hàng (Frontend) là một ứng dụng SPA (Single Page Application) hiện đại, được thiết kế để tối ưu hóa quy trình vận hành từ khâu bán hàng tại quầy (POS), đặt bàn đến quản trị hệ thống. Ứng dụng tập trung vào trải nghiệm người dùng mượt mà với kỹ thuật xử lý dữ liệu tiên tiến.

---

## ✨ Tính năng cốt lõi

*   **⚡ Point of Sale (POS):** Hệ thống bán hàng tại quầy với kỹ thuật **Optimistic Updates** (Cập nhật lạc quan), giúp nhân viên gọi món và thao tác gần như không có độ trễ (Zero-latency).
*   **📊 Admin Dashboard:** Trang quản trị tập trung giúp quản lý thực đơn (Menu), nhân sự (Users), doanh thu và lịch sử ca làm việc một cách trực quan qua các biểu đồ thống kê.
*   **📅 Reservation Management:** Hệ thống quản lý đặt bàn thông minh, tích hợp sơ đồ bàn ăn hiển thị trạng thái thời gian thực (Trống/Đang sử dụng/Đã đặt).
*   **📱 Responsive Design:** Hỗ trợ đầy đủ giao diện cho Máy tính bảng và Thiết bị di động (Mobile POS), giúp nhân viên có thể gọi món linh hoạt ngay tại bàn khách.
*   **🖨️ Printing & Payment:** Hỗ trợ in hóa đơn tạm tính và tích hợp mã QR thanh toán động (VietQR) chuẩn EMV Co.

---

## 🛠️ Tech Stack

Dự án được xây dựng trên nền tảng công nghệ hiện đại, đảm bảo tính ổn định và khả năng mở rộng:

*   **Core:** [React 18.2.0](https://reactjs.org/)
*   **Language:** [TypeScript](https://www.typescriptlang.org/) (Type-safe development)
*   **Build Tool:** [Vite](https://vitejs.dev/) (Siêu nhanh cho môi trường phát triển)
*   **Data Fetching:** [TanStack Query v4](https://tanstack.com/query/latest) (Xử lý Caching, Polling real-time và Background Fetching)
*   **HTTP Client:** [Axios](https://axios-http.com/) (Sử dụng Interceptors để quản lý JWT Token tự động)
*   **Routing:** [React Router v7](https://reactrouter.com/)
*   **Styling:** [Vanilla CSS](https://developer.mozilla.org/en-US/docs/Web/CSS) (Tối ưu hiệu năng và tùy biến cao)

---

## 💻 Yêu cầu môi trường

Trước khi bắt đầu, hãy đảm bảo máy tính của bạn đã cài đặt:
*   **Node.js**: Phiên bản `>= 14.0.0` (Khuyến nghị dùng bản LTS mới nhất)
*   **Trình quản lý gói**: `npm` hoặc `yarn`

---

## 📁 Cấu trúc thư mục

Sơ đồ tổ chức mã nguồn của dự án:

```text
src/
├── api/             # Cấu hình Axios Client, Queries và Mutations (TanStack Query)
├── components/      # Các UI Components dùng chung (Button, Modal, TableGrid, QR...)
├── constants/       # Định nghĩa các biến hằng số, cấu hình hệ thống
├── pages/           # Chứa các trang chính của ứng dụng
│   ├── admin/       # Module Quản trị (Dashboard, Dishes, Orders, Users...)
│   └── POS/         # Module Bán hàng (POS PC, Mobile POS, Shift Management...)
├── routes/          # Cấu hình định tuyến và phân quyền (PrivateRoute, AdminRoute)
├── App.tsx          # File cấu hình Root Component và Routes
└── main.tsx         # Điểm khởi đầu của ứng dụng (Cấu hình QueryClientProvider)
```

---

## 🚀 Hướng dẫn cài đặt

**1. Clone mã nguồn:**
```bash
git clone <repository-url>
cd restaurant-frontend
```

**2. Cài đặt các thư viện phụ thuộc:**
```bash
npm install
```

**3. Cấu hình biến môi trường:**
Tạo file `.env` tại thư mục gốc của dự án (hoặc copy từ `.env.example`):
```bash
cp .env.example .env
```
Sau đó cấu hình địa chỉ API của Backend:
```env
VITE_API_URL=http://localhost:3000/api
```

---

## 🏃 Chạy ứng dụng

**Chế độ phát triển (Development):**
```bash
npm run dev
```
Ứng dụng sẽ chạy tại: `http://localhost:5173`

**Xây dựng bản Production (Build):**
```bash
npm run build
```
Mã nguồn sau khi build sẽ nằm trong thư mục `/dist`.

**Xem thử bản Build (Preview):**
```bash
npm run preview
```

---

## 🐳 Deployment với Docker

Dự án đã được cấu hình sẵn Docker để triển khai nhanh chóng:

**1. Build Docker Image:**
```bash
docker build -t restaurant-frontend .
```

**2. Khởi chạy Container:**
```bash
docker run -p 80:80 restaurant-frontend
```
Ứng dụng sẽ khả dụng tại địa chỉ `http://localhost`.

---

## 📄 Giấy phép

Dự án được phát hành dưới giấy phép **MIT**.

---
*Phát triển bởi Đội ngũ kỹ thuật Restaurant System - 2026*
