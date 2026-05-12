# PentaYuki BDS CRM - Backup Version

Đây là bản backup đầy đủ của hệ thống CRM Quản lý Bất động sản. Các tính năng cao cấp, xử lý ảnh Base64 và quản lý kho hàng đã được tích hợp đầy đủ.

## Hướng dẫn cài đặt

### 1. Cài đặt môi trường
- Cài đặt [Node.js](https://nodejs.org/) (Khuyên dùng v18 hoặc mới hơn).
- Giải nén thư mục này vào máy tính của bạn.

### 2. Cài đặt Dependencies
Mở terminal tại thư mục dự án và chạy:
```bash
npm install
```

### 3. Cấu hình Database
- Copy file `.env.example` thành `.env`:
  ```bash
  cp .env.example .env
  ```
- Mở file `.env` và cập nhật `DATABASE_URL` theo thông tin cơ sở dữ liệu PostgreSQL của bạn.

### 4. Đồng bộ Database (Prisma)
Chạy lệnh sau để tạo các bảng trong database:
```bash
npx prisma db push
```

### 5. Chạy dự án
- Chế độ phát triển (Development):
  ```bash
  npm run dev
  ```
- Build và chạy Production:
  ```bash
  npm run build
  ```
  ```bash
  npm run start
  ```

## Các lưu ý quan trọng
- **Hình ảnh**: Hệ thống hiện tại lưu ảnh dưới dạng chuỗi Base64 trực tiếp vào database để đảm bảo tính ổn định trên Vercel mà không cần cấu hình S3/Cloudinary phức tạp.
- **Phân quyền**: Nếu bạn muốn thêm bảo mật, hãy cấu hình NextAuth (đã có khung sẵn trong code).

Chúc bạn sử dụng hiệu quả!
