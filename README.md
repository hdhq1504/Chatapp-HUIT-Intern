# Chattapp-HUIT-Intern

## 📋 Mục lục

- [Giới thiệu](#giới-thiệu)
- [Tính năng chính](#tính-năng-chính)
- [Công nghệ sử dụng](#công-nghệ-sử-dụng)
- [Yêu cầu hệ thống](#yêu-cầu-hệ-thống)
- [Cài đặt](#cài-đặt)
- [Chạy ứng dụng](#chạy-ứng-dụng)

## 🎯 Giới thiệu

Ứng dụng chat thời gian thực gồm các chức năng cơ bản như tạo phòng và nhắn tin; Đăng nhập/Đăng ký; Xem hồ sơ người dùng.

## ✨ Tính năng chính

- **Đăng nhập/Đăng ký**: Hệ thống xác thực người dùng an toàn
- **Chat 1-1**: Nhắn tin trực tiếp giữa hai người dùng
- **Tạo phòng**: Tạo và quản lý các phòng và tin nhắn
- **Hồ sơ người dùng**: Xem và cập nhật hồ sơ người dùng

## 🛠️ Công nghệ sử dụng

### Frontend

- **React 19** - Framework UI chính
- **Vite** - Build tool
- **TailwindCSS** - Framework CSS
- **Socket.io-client** - WebSocket client

### Backend

- **Spring Boot** - Web framework
- **Socket.io** - WebSocket server
- **PostgreSQL** - Database
- **JWT** - Authentication

### DevOps & Tools

- **Git** - Version control
- **GitHub Actions** - CI/CD
- **Docker** - Containerization

## 💻 Yêu cầu hệ thống

- Java JDK = 17.x
- npm >= 9.x
- gradle <= 8.x
- Docker (tùy chọn)

## 📦 Cài đặt

### 1. Clone repository

```bash
git clone https://github.com/hdhq1504/Chatapp-HUIT-Intern.git
cd Chatapp-HUIT-Intern
```

### 2. Cài đặt dependencies

### Frontend

```bash
cd client
npm install
```

### Backend

```bash
cd server
gradle bootRun
```

## 🚀 Chạy ứng dụng

### Backend

```bash
cd server
gradle bootRun
```

### Frontend

```bash
cd client
npm run dev
```

---

⭐ Nếu thấy dự án hữu ích, hãy cho một star nhé!
