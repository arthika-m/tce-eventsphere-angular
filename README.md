# 🎓 TCE EventSphere – Smart Event Management Portal

TCE EventSphere is a web-based **Smart Event Management Portal** developed for
Thiagarajar College of Engineering (TCE), Madurai.

The system provides a centralized platform for students and event coordinators
to discover, register, manage, and track college events.

---

## 📌 Project Overview

College events are often managed through different communication channels,
making it difficult for students to discover events, register for them, and
track their participation.

TCE EventSphere provides a single platform where:

- Students can view available events.
- Students can register for internal events.
- Students can register through external event links.
- Students can confirm their external registration.
- Students can view their registered events.
- Students can check attendance status.
- Students can access OD documents after attending an event.
- Coordinators can create and manage events.
- Coordinators can view registered participants.
- Coordinators can mark attendance.
- Coordinators can upload signed OD documents.
- Notifications can be provided to users.

---

## 🎯 Objectives

- Provide a centralized college event management platform.
- Simplify event discovery and registration.
- Separate department-specific and college-wide events.
- Support both internal and external event registration.
- Maintain student registration and attendance records.
- Provide secure access to event-related OD documents.
- Help coordinators manage participants efficiently.

---

## 👥 User Roles

### 👨‍🎓 Student

Students can:

- Register and login.
- View their department events.
- View college-wide events.
- View event details.
- Register for internal events.
- Open external registration links.
- Confirm external registration.
- View registered events.
- Cancel registrations where applicable.
- Check attendance status.
- View/download OD documents if marked present.
- View notifications.
- Manage their profile.

### 👨‍💼 Coordinator

Coordinators can:

- Login to the coordinator dashboard.
- Create events.
- Manage events.
- View event participants.
- Search participants.
- Mark attendance.
- View attendance status.
- Upload signed OD PDFs.
- View/download OD documents.
- Manage event-related information.

---

## ✨ Key Features

### 🔐 Authentication

- Student registration
- Student login
- Coordinator login
- JWT-based authentication
- Password hashing using bcrypt
- Role-based authorization

### 📅 Event Management

- Create events
- View events
- Update events
- Manage event information
- Department-specific events
- College-wide events
- Internal registration
- External registration

### 📝 Registration

Students can register for internal events directly through
TCE EventSphere.

For external events:

1. Student clicks **Register Externally**.
2. The external registration website opens.
3. Student completes the external registration.
4. Student returns to EventSphere.
5. Student clicks **I Registered Externally**.
6. The registration is recorded in EventSphere.

### 👥 Participant Management

Coordinators can:

- View registered students.
- Search participants.
- View student details.
- Identify internal/external registrations.
- Mark attendance.

### 📄 OD Management

The OD workflow supports:

1. Coordinator selects an event.
2. Coordinator marks student attendance.
3. Signed OD PDF is uploaded.
4. The document is stored securely.
5. Only students marked **Present** can access the OD document.

### 🔔 Notifications

The system supports notifications related to events and user activities.

---

## 🛠️ Technologies Used

### Frontend

- HTML5
- CSS3
- JavaScript
- AngularJS 1.8.x
- Bootstrap
- Font Awesome

### Backend

- Node.js
- Express.js
- REST API
- JWT Authentication
- Multer

### Database

- MongoDB
- Mongoose

### Development Tools

- Visual Studio Code
- Git
- GitHub
- MongoDB

---

## 🏗️ Project Structure

```text
tce-eventsphere-angular/
│
├── client/
│   ├── assets/
│   │   ├── images/
│   │   ├── videos/
│   │   └── logos/
│   │
│   ├── components/
│   │   ├── navbar/
│   │   ├── footer/
│   │   ├── event-card/
│   │   ├── notification/
│   │   └── loading/
│   │
│   ├── controllers/
│   │   ├── auth/
│   │   ├── student/
│   │   └── coordinator/
│   │
│   ├── services/
│   ├── filters/
│   ├── directives/
│   ├── layouts/
│   ├── views/
│   │   ├── landing/
│   │   ├── auth/
│   │   ├── student/
│   │   └── coordinator/
│   │
│   ├── partials/
│   ├── config/
│   ├── index.html
│   ├── app.js
│   └── app.css
│
├── server/
│   ├── config/
│   ├── models/
│   ├── controllers/
│   ├── routes/
│   ├── middleware/
│   ├── utils/
│   ├── uploads/
│   │   └── od-pdfs/
│   └── server.js
│
├── .env
├── .gitignore
├── package.json
└── README.md
