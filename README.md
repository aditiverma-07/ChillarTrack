# 💸 ChillarTrack – Teen-Friendly Pocket Money Micro-Budgeter & Goal Saver

> A full-stack personal finance platform designed for teenagers and college students to track daily expenses, manage budgets, and save toward personal goals.

![Tech Stack](https://img.shields.io/badge/Frontend-React%2019%20%2B%20TypeScript-blue)
![Backend](https://img.shields.io/badge/Backend-Spring%20Boot%203%20%2B%20Java%2021-green)
![Database](https://img.shields.io/badge/Database-MySQL%208-orange)
![License](https://img.shields.io/badge/License-MIT-purple)

---

## ✨ Features

- 📊 **Visual Analytics** – Daily, weekly, and monthly spending charts (Recharts)
- 🎯 **Savings Goals** – Track progress toward laptops, trips, gadgets, and more
- 🔔 **Smart Alerts** – Auto-generated notifications when you overspend
- 🏆 **Gamification** – Earn badges (Budget Master, Goal Crusher, No-Spend Ninja)
- 🌙 **Dark / Light Mode** – System-preference aware theme toggle
- 📱 **Mobile First** – Fully responsive, touch-friendly design
- 🔐 **Secure Auth** – JWT access tokens + refresh tokens + BCrypt passwords
- 📅 **Weekly Analytics Scheduler** – Runs every Sunday at 8 PM

---

## 🗂️ Project Structure

```
chillartrack/
├── frontend/          # React 19 + Vite + Tailwind + Recharts
├── backend/           # Spring Boot 3 + Spring Security + JWT
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites

| Tool | Version |
|------|---------|
| Node.js | 18+ |
| npm | 9+ |
| Java | 21 |
| Maven | 3.8+ |
| MySQL | 8.0+ |

---

### 1️⃣ Database Setup

```sql
-- Connect to MySQL and run:
CREATE DATABASE IF NOT EXISTS chillartrack;
-- Then run the schema and seed files:
-- backend/src/main/resources/db/schema.sql
-- backend/src/main/resources/db/seed.sql
```

Or let Spring Boot auto-create the schema via `spring.jpa.hibernate.ddl-auto=update` (default).

---

### 2️⃣ Backend Setup

```bash
cd backend

# Configure database credentials
# Edit: src/main/resources/application.properties
# Change: spring.datasource.username and spring.datasource.password

# Install dependencies and run
mvn clean install -DskipTests
mvn spring-boot:run
```

Backend runs on: **http://localhost:8080**
Swagger UI: **http://localhost:8080/swagger-ui.html**

---

### 3️⃣ Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on: **http://localhost:5173**

> The Vite proxy forwards `/api` requests to `http://localhost:8080`.

---

### 🪟 Windows-specific notes

- Use PowerShell or Windows Terminal
- If `mvn` is not recognized, add Maven's `bin/` directory to your PATH
- Ensure MySQL service is running via Services (`services.msc`)
- If MySQL port is blocked, check Windows Firewall rules

### 🍎 macOS-specific notes

```bash
brew install mysql openjdk@21 maven node
brew services start mysql
```

### 🐧 Linux-specific notes

```bash
sudo apt install mysql-server openjdk-21-jdk maven nodejs npm
sudo systemctl start mysql
```

---

## 🔑 Demo Credentials

After running the seed.sql file:

| Email | Password | Role |
|-------|----------|------|
| priya@example.com | Password123 | USER |
| arjun@example.com | Password123 | USER |
| admin@chillartrack.app | Password123 | ADMIN |

---

## 📋 API Documentation

Full Swagger/OpenAPI docs available at: **http://localhost:8080/swagger-ui.html**

### Key Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/logout` | Logout |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password` | Reset password |
| GET | `/api/dashboard/summary` | Dashboard summary |
| GET | `/api/dashboard/analytics` | Analytics data |
| GET | `/api/transactions` | Get transactions (paginated) |
| POST | `/api/transactions` | Create transaction |
| PUT | `/api/transactions/{id}` | Update transaction |
| DELETE | `/api/transactions/{id}` | Delete transaction |
| GET | `/api/goals` | Get all goals |
| POST | `/api/goals` | Create goal |
| PUT | `/api/goals/{id}` | Update goal |
| DELETE | `/api/goals/{id}` | Delete goal |
| GET | `/api/notifications` | Get notifications |
| PUT | `/api/notifications/{id}/read` | Mark as read |
| GET | `/api/profile` | Get profile |
| PUT | `/api/profile` | Update profile |

---

## 🏗️ Tech Stack

### Frontend
- React 19 + TypeScript
- Vite 5
- Tailwind CSS 3
- React Router 6
- TanStack Query (React Query)
- Axios
- React Hook Form + Zod
- Recharts
- Framer Motion
- Lucide React Icons

### Backend
- Java 21
- Spring Boot 3.2
- Spring Security + JWT (jjwt 0.12)
- Spring Data JPA + Hibernate
- Spring Validation
- Spring Scheduler
- MapStruct 1.5
- Lombok
- SpringDoc OpenAPI (Swagger)

### Database
- MySQL 8
- UUID primary keys
- Full foreign key constraints

---

## 🧪 Running Tests

```bash
# Backend tests
cd backend
mvn test

# Frontend build check
cd frontend
npm run build
```

---

## 📧 Email / Verification

By default, ChillarTrack uses a **console stub** for email. Verification tokens and password reset tokens are printed to the Spring Boot logs:

```
📧 Email verification token for user@example.com: abc-token-123
🔑 Password reset token for user@example.com: def-token-456
```

To verify email: `GET /api/auth/verify-email?token=<token>`
To reset password: Use the token in the reset form at `/reset-password?token=<token>`

To enable real SMTP (e.g., Gmail), update `application.properties` with your SMTP credentials.

---

## 🔒 Security

- BCrypt password hashing (strength 12)
- JWT access tokens (15 min expiry)
- JWT refresh tokens (7 day expiry, stored in DB)
- Token revocation on logout
- CORS restricted to localhost origins
- Global exception handler prevents stack trace leakage
- Input validation via Spring Validation + Zod (frontend)

---

## 🎮 Gamification Badges

| Badge | Trigger |
|-------|---------|
| 🎯 Goal Crusher | Complete a savings goal |
| 🥷 No-Spend Ninja | Zero entertainment spend for a week |
| 💰 Budget Master | Stay within monthly budget |
| 💡 Smart Saver | Save ₹500 in a week |
| 🔥 Streak Starter | 7-day saving streak |
| 🏦 Thrifty Teen | Total savings exceed ₹5000 |

---

## 📁 Environment Variables

### Backend (`application.properties`)
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/chillartrack
spring.datasource.username=root
spring.datasource.password=password
app.jwt.secret=<64-char-hex-string>
app.jwt.expiration-ms=900000
app.jwt.refresh-expiration-ms=604800000
```

### Frontend (`.env.local`)
```env
VITE_API_BASE_URL=http://localhost:8080/api
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit: `git commit -m 'Add amazing feature'`
4. Push: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

MIT License – see [LICENSE](LICENSE) for details.

---

Built with ❤️ for Gen-Z India 🇮🇳
