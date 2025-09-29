# Chattapp-HUIT-Intern

> Ứng dụng Chat HUIT Intern là một ứng dụng trò chuyện thời gian thực được phát triển trong khuôn khổ chương trình thực tập tại HUIT.

## 📋 Mục lục

- [Giới thiệu](#giới-thiệu)
- [Tính năng chính](#tính-năng-chính)
- [Công nghệ sử dụng](#công-nghệ-sử-dụng)
- [Yêu cầu hệ thống](#yêu-cầu-hệ-thống)
- [Cài đặt](#cài-đặt)
- [Cấu hình](#cấu-hình)
- [Chạy ứng dụng](#chạy-ứng-dụng)
- [Cấu trúc thư mục](#cấu-trúc-thư-mục)
- [API Documentation](#api-documentation)
- [Đóng góp](#đóng-góp)
- [License](#license)

## 🎯 Giới thiệu

Chattapp-HUIT-Intern là một ứng dụng chat thời gian thực được phát triển nhằm tạo ra một nền tảng giao tiếp hiệu quả cho sinh viên và giảng viên HUIT. Ứng dụng cung cấp khả năng nhắn tin trực tiếp, tạo nhóm chat, và chia sẻ tệp tin một cách dễ dàng và bảo mật.

## ✨ Tính năng chính

- **Đăng nhập/Đăng ký**: Hệ thống xác thực người dùng an toàn
- **Chat 1-1**: Nhắn tin trực tiếp giữa hai người dùng
- **Chat nhóm**: Tạo và quản lý các nhóm chat với nhiều thành viên
- **Chia sẻ file**: Hỗ trợ gửi và nhận các loại tệp tin
- **Thông báo real-time**: Nhận thông báo tức thì khi có tin nhắn mới
- **Trạng thái online/offline**: Hiển thị trạng thái hoạt động của người dùng

## 🛠️ Công nghệ sử dụng

### Frontend
- **React 18** - Framework UI chính
- **Vite** - Build tool
- **TailwindCSS** - Framework CSS
- **Socket.io-client** - WebSocket client
- **Redux Toolkit** - State management

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **Socket.io** - WebSocket server
- **MongoDB** - Database
- **JWT** - Authentication

### DevOps & Tools
- **Git** - Version control
- **GitHub Actions** - CI/CD
- **Docker** - Containerization

## 💻 Yêu cầu hệ thống

- Node.js >= 18.x
- npm >= 9.x
- MongoDB >= 6.0
- Docker (tùy chọn)

## 📦 Cài đặt

### 1. Clone repository

```bash
git clone https://github.com/hdhq1504/Chatapp-HUIT-Intern.git
cd Chatapp-HUIT-Intern
```

### 2. Cài đặt dependencies

#### Frontend
```bash
cd client
npm install
```

#### Backend
```bash
cd server
npm install
```

## ⚙️ Cấu hình

### Frontend

Tạo file `.env` trong thư mục `client/`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### Backend

Tạo file `.env` trong thư mục `server/`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/chat-app
JWT_SECRET=your-secret-key
NODE_ENV=development
```

## 🚀 Chạy ứng dụng

### Development Mode

#### Terminal 1 - Backend
```bash
cd server
npm run dev
```

#### Terminal 2 - Frontend
```bash
cd client
npm run dev
```

### Production Build

#### Frontend
```bash
cd client
npm run build
```

#### Backend
```bash
cd server
npm start
```

## 📁 Cấu trúc thư mục

```
Chatapp-HUIT-Intern/
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── store/
│   │   ├── services/
│   │   └── App.jsx
│   └── package.json
│
├── server/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── socket/
│   └── server.js
│
└── README.md
```

## 📚 API Documentation

### Authentication

#### POST `/api/auth/register`
Đăng ký người dùng mới

**Request Body:**
```json
{
  "email": "user@student.huit.edu.vn",
  "password": "password123",
  "name": "Nguyen Van A"
}
```

#### POST `/api/auth/login`
Đăng nhập vào hệ thống

**Request Body:**
```json
{
  "email": "user@student.huit.edu.vn",
  "password": "password123"
}
```

## 🤝 Đóng góp

Mọi đóng góp đều được hoan nghênh! Vui lòng:

1. Fork dự án
2. Tạo branch mới (`git checkout -b feature/NewFeature`)
3. Commit thay đổi (`git commit -m 'Add NewFeature'`)
4. Push lên branch (`git push origin feature/NewFeature`)
5. Tạo Pull Request

## 📝 License

Dự án được phân phối dưới giấy phép [MIT License](LICENSE).

## 👥 Tác giả

- GitHub: [@hdhq1504](https://github.com/hdhq1504)

## 🙏 Acknowledgments

- Cảm ơn HUIT đã tạo cơ hội thực tập
- Cảm ơn các mentor đã hướng dẫn trong quá trình phát triển

---

⭐ Nếu thấy dự án hữu ích, hãy cho một star nhé!