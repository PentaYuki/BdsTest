# 🚀 BdsTest - Hệ Thống Quản Trị Bất Động Sản Toàn Diện (Next.js + Android)

![Banner](https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80)

**BdsTest** là một giải pháp CRM (Customer Relationship Management) hiện đại, được thiết kế chuyên biệt cho các đơn vị kinh doanh bất động sản. Hệ thống hỗ trợ quản lý đa nền tảng từ Web Dashboard đến Ứng dụng di động Android, giúp tối ưu hóa quy trình tiếp cận khách hàng và quản lý tài sản.

---

## ✨ Tính Năng Nổi Bật

### 🖥️ Web Dashboard (Premium UI)
*   **Quản lý Khách hàng & Chủ nhà:** Lưu trữ thông tin chi tiết, lịch sử tương tác và nhu cầu thực tế.
*   **Quản lý Tài sản (Property):** Theo dõi tình trạng căn hộ, nhà riêng, đất nền với hệ thống lọc thông minh theo khu vực (Quận 7, Nhà Bè, Bình Chánh...).
*   **KPI & Chiến dịch:** Theo dõi hiệu suất làm việc của nhân viên và quản lý các chiến dịch gọi điện, khảo sát.
*   **Hệ thống Tài liệu:** Lưu trữ hồ sơ pháp lý, ảnh thực tế tài sản với giao diện hiện đại.
*   **Lịch làm việc:** Quản lý Task thông minh theo phong cách Google Calendar.

### 📱 Ứng dụng Android (Capacitor Hybrid)
*   **Đồng bộ 100%:** Dữ liệu được cập nhật thời gian thực từ Web lên Mobile.
*   **Thông báo tức thì:** Không bỏ lỡ bất kỳ yêu cầu nào từ khách hàng.
*   **Tiện lợi:** Nhân viên có thể tra cứu thông tin tài sản ngay tại thực địa.

---

## 🛠️ Công Nghệ Sử Dụng

| Thành phần | Công nghệ |
| :--- | :--- |
| **Frontend** | [Next.js 16](https://nextjs.org/), [Tailwind CSS](https://tailwindcss.com/), [Shadcn UI](https://ui.shadcn.com/) |
| **Database** | [PostgreSQL (Neon.tech)](https://neon.tech/), [Prisma ORM](https://www.prisma.io/) |
| **Mobile** | [Capacitor JS](https://capacitorjs.com/) (Android Bridge) |
| **Deployment** | [Vercel](https://vercel.com/) |
| **State Mgmt** | [Zustand](https://github.com/pmndrs/zustand), [TanStack Query](https://tanstack.com/query/latest) |

---

## 🚀 Hướng Dẫn Cài Đặt

### 1. Chạy Locally (Máy tính cá nhân)
```bash
# Cài đặt thư viện
npm install

# Cấu hình biến môi trường trong file .env
DATABASE_URL="your_postgresql_url"

# Đồng bộ database
npx prisma generate
npx prisma db push

# Chạy server phát triển
npm run dev
```

### 2. Triển khai lên Vercel
1. Kết nối Repository này với dự án trên Vercel.
2. Thêm các Biến môi trường: `DATABASE_URL` và `DATABASE_URL_UNPOOLED`.
3. Vercel sẽ tự động Build và Deploy mỗi khi bạn Push code mới.

### 3. Xuất App Android
1. Mở thư mục `android/` bằng **Android Studio**.
2. Chọn **Build > Build APK(s)** để xuất file cài đặt.

---

## 📸 Giao Diện Dự Án
*(Gợi ý: Anh có thể chụp ảnh màn hình web và app rồi chèn vào đây để README thêm sinh động!)*

---

## 🤝 Liên Hệ & Hỗ Trợ
Dự án được phát triển bởi **PentaYuki**. Mọi thắc mắc vui lòng liên hệ qua GitHub Issue.

---
⭐ **Nếu bạn thấy dự án này hữu ích, hãy tặng nó 1 Star nhé!**
