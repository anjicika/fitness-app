# System Architecture – FitnesERI

## 1. Overview

FitnesERI is a web and mobile fitness application developed as a group project by a team of seven members.
The primary goal of the project is to develop a functional prototype that demonstrates the use of modern
web technologies, teamwork, and proper software development organization.

The application provides functionalities such as user management, workout tracking, progress monitoring,
AI-supported nutrition recommendations, coach booking, forum communication, subscription tiers with an AI trainer,
and a basic mobile application. The system is designed as a modular and extensible solution that allows future
feature expansion.

The project was developed using an Agile (Scrum-like) methodology over a four-week period, with iterative
development, regular reviews, and continuous integration of completed tasks.

---

## 2. Technology Stack

### Backend

- **Runtime:** Node.js 18

  - Enables full-stack JavaScript development and asynchronous processing using async/await.

- **Framework:** Express.js

  - Lightweight and flexible framework with extensive ecosystem and documentation.

- **Database:** PostgreSQL 15

  - Relational database providing ACID compliance, robustness, and support for complex relationships.

- **ORM:** Sequelize

  - Simplifies database interactions and supports migrations and schema evolution.

- **Authentication:** JWT + bcrypt

  - Stateless authentication suitable for scalable architectures with secure password hashing.

- **Cache:** Redis

  - Used for rate limiting, caching frequently accessed data, and temporary AI-related responses.
  - Primarily intended for caching and rate limiting in future iterations.

- **AI Integration:** Groq API (Llama 3)
  - Free-tier API using open-source large language models.
  - Used for nutrition and workout recommendations.

---

### Frontend

- **Framework:** React 18

  - Component-based UI development with strong community support.

- **Build Tool:** Vite

  - Fast development server with Hot Module Replacement (HMR).

- **Styling:** Tailwind CSS

  - Utility-first CSS framework enabling rapid UI prototyping.

- **HTTP Client:** Axios

  - Centralized request handling with interceptors and error management.

- **Charts:** Recharts
  - Used for visualizing user progress and workout statistics.

---

### Mobile Application

- **Technology:** React Native
  - Cross-platform mobile development using existing React knowledge.

---

### DevOps & CI/CD

- **Containerization:** Docker Compose

  - Ensures reproducible and isolated development environments.

- **CI/CD:** GitHub Actions
  - Automated testing and integration, fully integrated with GitHub.

---

## 3. API Architecture

The system follows a RESTful API architecture with JSON-based communication over HTTP.
The backend acts as a centralized API consumed by both the web and mobile applications.

Authentication is handled using JWT tokens. Protected endpoints require a valid token
sent via the Authorization header.

### Example API Endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/users/profile`
- `POST /api/workouts`
- `GET /api/workouts`
- `POST /api/progress`
- `GET /api/progress`
- `GET /api/nutrition/recommendation`
- `GET /api/forum/posts`

---

## 4. System Architecture Diagram

The system is structured using a client–server architecture:

- Web Client (React)
- Mobile Client (React Native)
- Backend API (Node.js + Express)
- Database (PostgreSQL)
- Cache Layer (Redis)
- External AI Services

A high-level system architecture diagram is available in:
`/diagrams/system-architecture.png`

---

## 5. Database Design

The database is designed using a relational model and managed via Sequelize ORM.

### User

- `id` (PK)
- `email`
- `password_hash`
- `role`
- `subscription_tier`
- `created_at`

### Workout

- `id` (PK)
- `user_id` (FK → User.id)
- `name`
- `created_at`

### Exercise

- `id` (PK)
- `workout_id` (FK → Workout.id)
- `name`
- `repetitions`
- `sets`

### Progress

- `id` (PK)
- `user_id` (FK → User.id)
- `metric`
- `value`
- `recorded_at`

### ForumPost

- `id` (PK)
- `user_id` (FK → User.id)
- `content`
- `created_at`

### AIResponse

- `id` (PK)
- `user_id` (FK → User.id)
- `request_type` (nutrition / workout)
- `request_data` (JSON)
- `response_text` (TEXT)
- `created_at`

### Relationships

- One User can have multiple AI responses
- One User can have multiple Workouts, Progress records, and Forum posts.
- Each Workout consists of multiple Exercises.

---

## 6. Subscription Tiers and AI Trainer

The system supports multiple subscription tiers that determine the level of access
to application features.

- **Basic Tier**

  - Workout tracking
  - Progress monitoring

- **Advanced Tiers**
  - AI trainer
  - Advanced workout recommendations
  - AI-supported nutrition guidance

Payment processing is not implemented as part of the prototype.
Instead, a mock payment mechanism is provided to simulate subscription upgrades
and allow testing of advanced tier functionality.

---

## 7. Non-functional Requirements

- **Scalability:** Stateless backend architecture enables horizontal scaling.
- **Security:** JWT-based authentication and password hashing with bcrypt.
- **Maintainability:** Modular architecture and clear separation of concerns.
- **Extensibility:** Designed to support future feature expansion.

---

## 8. Project Scope Limitations

The project does not include:

- Real payment processing
- Medically certified health recommendations
- Integration with external fitness devices
- Production-grade AI models
- Advanced production security mechanisms
