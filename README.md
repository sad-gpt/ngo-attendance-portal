# Prajakirana Seva Charitable Trust — Attendance Management System

A full-stack web application for managing children, staff, attendance, exit/entry tracking, and volunteer logging at the NGO campus.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Database Schema](#database-schema)
- [API Reference](#api-reference)
- [Frontend Pages](#frontend-pages)
- [Default Credentials](#default-credentials)

---

## Overview

This system replaces a previous class-based, dual-role attendance setup. The redesign introduces:

- **Admin-only login** — volunteer login has been removed
- **Age-based child grouping** — children are organized by age, not class
- **Live status tracking** — every child and staff member has a real-time `In Campus / Outside` status
- **Logbook** — records exit and return events for children and staff with timestamps and reasons
- **Volunteer Log** — tracks daily ad-hoc volunteer arrivals and departures
- **Split attendance** — separate attendance sheets for children and staff, with optional absence reasons

---

## Features

### Dashboard
- Three stat cards: **Children**, **Staff**, **Volunteers Today**
- Hover over a card to see **In / Out** sub-counts
- Click a card to open a detail modal:
  - **Children** — two-level drill-down: age group cards → list of children with live status badges
  - **Staff** — flat list with In Campus / Outside badges
  - **Volunteers** — today's volunteer log with arrival and departure times
- Auto-refreshes every 30 seconds

### Children Management
- Children grouped into **age cards** (e.g., Age 8, Age 10, Age 12)
- Click an age card to view all children in that group with their live status
- Add children manually (name, age, gender) or **bulk import from Excel** (.xlsx / .xls)
- Edit, delete, or toggle status (In Campus / Outside) per child
- Delete an entire age group with one click (cascades attendance records)
- Search across all children by name or age

### Staff Management
- Table view of all permanent staff with name, email, age, and live status badge
- Add, edit, or delete staff members
- Toggle **In Campus / Outside** status from the profile modal
- Search by name or email

### Attendance
Three sections on a single page:

1. **Student Attendance** — date picker, all children sorted by age, click to toggle Present/Absent, optional inline reason field for absent students
2. **Staff Attendance** — same UI pattern for staff members
3. **Volunteer Log Card** — log a volunteer's arrival (name + reason), view today's entries, log departure per entry

**LOG button** (fixed at the bottom of the page) opens the **Logbook panel**:
- Tabs: Students | Staff
- Search by name
- **Mark Going Out** — opens a reason field, logs the exit, sets status to Outside
- **Mark Returned** — logs return time, sets status back to In Campus

### Reports
Three tabs with a shared date picker:

- **Children tab** — age-group cards showing present %, present count, absent count, and a progress bar. Click a card for a detailed child-by-child breakdown.
- **Staff tab** — table with present/absent status and reason per staff member, plus a summary bar
- **Volunteers tab** — table of volunteer log entries for the selected date with arrival and departure times

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS 4, React Router 7 |
| Backend | Node.js, Express 5 |
| Database | SQLite via better-sqlite3 |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| HTTP client | Axios |
| Excel import | xlsx |

---

## Project Structure

```
ngo-work/
├── client/                         # React frontend (Vite)
│   └── src/
│       ├── App.jsx                 # Route definitions
│       ├── components/
│       │   ├── Layout.jsx          # Page wrapper (sidebar + navbar + outlet)
│       │   ├── Navbar.jsx          # Top bar with theme toggle and logout
│       │   ├── Sidebar.jsx         # Navigation links
│       │   └── ProtectedRoute.jsx  # Auth guard
│       ├── context/
│       │   ├── AuthContext.jsx     # JWT + user state
│       │   └── ThemeContext.jsx    # Dark/light mode
│       ├── pages/
│       │   ├── Login.jsx           # Admin login (email + password)
│       │   ├── Dashboard.jsx       # Live stats + modals
│       │   ├── Children.jsx        # Age-based child management
│       │   ├── Staff.jsx           # Staff CRUD + status
│       │   ├── Attendance.jsx      # Student/staff attendance + logbook
│       │   └── Reports.jsx         # Tabbed reports (children/staff/volunteers)
│       └── services/
│           └── api.js              # Axios instance with JWT interceptor
│
└── server/                         # Express backend
    ├── server.js                   # App entry point, route registration
    ├── seed.js                     # Seeds admin user and sample staff
    ├── config/
    │   └── database.js             # SQLite schema creation
    ├── middleware/
    │   └── authMiddleware.js       # JWT verification middleware
    └── routes/
        ├── auth.js                 # POST /api/auth/login
        ├── children.js             # Children CRUD + status
        ├── staff.js                # Staff CRUD + status
        ├── attendance.js           # Children + staff attendance
        ├── logbook.js              # Exit / return tracking
        ├── volunteersLog.js        # Daily volunteer arrival/departure
        └── reports.js              # Dashboard stats + attendance summaries
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm

### 1. Clone and install

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Configure environment

Create `server/.env`:

```env
JWT_SECRET=your_secret_key_here
```

### 3. First-time database setup

> **Important:** If you are migrating from the old system, delete `server/database.sqlite` before starting the server. The new schema is incompatible with the old one.

```bash
# Delete old database (if upgrading)
rm server/database.sqlite

# Start the server — this creates all tables automatically
cd server
node server.js

# In a separate terminal, seed the admin user and sample staff
cd server
node seed.js
```

### 4. Start the application

```bash
# Terminal 1 — backend
cd server
node server.js
# Server runs on http://localhost:5000

# Terminal 2 — frontend
cd client
npm run dev
# App opens at http://localhost:5173
```

---

## Database Schema

### `users`
Stores admin accounts only.

| Column | Type | Notes |
|---|---|---|
| id | INTEGER | Primary key |
| name | TEXT | Display name |
| email | TEXT | Unique |
| password | TEXT | bcrypt hash |
| role | TEXT | Always `'admin'` |

### `children`
| Column | Type | Notes |
|---|---|---|
| id | INTEGER | Primary key |
| name | TEXT | |
| age | INTEGER | Used for grouping |
| gender | TEXT | |
| status | TEXT | `'in'` or `'out'` (live tracking) |
| createdAt | TEXT | Date string |

### `staff`
| Column | Type | Notes |
|---|---|---|
| id | INTEGER | Primary key |
| name | TEXT | |
| age | INTEGER | |
| email | TEXT | Unique |
| status | TEXT | `'in'` or `'out'` |
| createdAt | TEXT | |

### `attendance_children`
| Column | Type | Notes |
|---|---|---|
| id | INTEGER | Primary key |
| childId | INTEGER | FK → children.id (cascade delete) |
| date | TEXT | YYYY-MM-DD |
| status | TEXT | `'present'` or `'absent'` |
| reason | TEXT | Nullable — absence reason |

Unique constraint on `(childId, date)`.

### `attendance_staff`
Same structure as `attendance_children` but references `staff.id`.

### `logbook`
Tracks individual exit and return events.

| Column | Type | Notes |
|---|---|---|
| id | INTEGER | Primary key |
| personId | INTEGER | ID of the child or staff member |
| type | TEXT | `'child'` or `'staff'` |
| reason | TEXT | Why they left |
| exitTime | TEXT | ISO timestamp |
| returnTime | TEXT | ISO timestamp or NULL if still outside |

When an entry is created, the person's `status` is set to `'out'`. When `returnTime` is logged, status is set back to `'in'`.

### `volunteers_log`
Tracks daily ad-hoc volunteers (not permanent staff).

| Column | Type | Notes |
|---|---|---|
| id | INTEGER | Primary key |
| name | TEXT | Volunteer's name |
| reason | TEXT | Purpose of visit |
| arrivalTime | TEXT | ISO timestamp |
| departureTime | TEXT | ISO timestamp or NULL |

---

## API Reference

All routes except `/api/auth/login` require a `Authorization: Bearer <token>` header.

### Auth
| Method | Endpoint | Body | Description |
|---|---|---|---|
| POST | `/api/auth/login` | `{ email, password }` | Returns JWT and user object |

### Children
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/children` | All children, sorted by age |
| POST | `/api/children` | Add child `{ name, age, gender }` |
| PUT | `/api/children/:id` | Update child |
| DELETE | `/api/children/:id` | Delete child (cascades attendance + logbook) |
| DELETE | `/api/children/by-age?age=N` | Delete all children of given age |
| PUT | `/api/children/:id/status` | Set status `{ status: 'in' \| 'out' }` |

### Staff
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/staff` | All staff |
| POST | `/api/staff` | Add staff `{ name, age, email }` |
| PUT | `/api/staff/:id` | Update staff |
| DELETE | `/api/staff/:id` | Delete staff |
| PUT | `/api/staff/:id/status` | Set status `{ status: 'in' \| 'out' }` |

### Attendance
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/attendance/children` | All children attendance records |
| GET | `/api/attendance/children/today` | Today's children attendance |
| POST | `/api/attendance/children/mark` | Bulk upsert `{ records: [{ childId, date, status, reason }] }` |
| GET | `/api/attendance/staff` | All staff attendance records |
| GET | `/api/attendance/staff/today` | Today's staff attendance |
| POST | `/api/attendance/staff/mark` | Bulk upsert `{ records: [{ staffId, date, status, reason }] }` |

### Logbook
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/logbook` | All entries, newest first |
| GET | `/api/logbook/active` | Entries where `returnTime` is NULL |
| POST | `/api/logbook` | New exit `{ personId, type, reason, exitTime }` — also sets person status to `'out'` |
| PUT | `/api/logbook/:id/return` | Log return `{ returnTime }` — sets person status to `'in'` |

### Volunteers Log
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/volunteers-log` | All volunteer log entries |
| GET | `/api/volunteers-log/today` | Today's entries only |
| POST | `/api/volunteers-log` | Log arrival `{ name, reason, arrivalTime }` |
| PUT | `/api/volunteers-log/:id/departure` | Log departure `{ departureTime }` |

### Reports
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/reports/dashboard-stats` | `{ children: {total, in, out}, staff: {total, in, out}, volunteers: {totalToday} }` |
| GET | `/api/reports/attendance/children?date=YYYY-MM-DD` | Age-wise summary `[{ age, total, present, absent, percentage }]` |
| GET | `/api/reports/attendance/staff?date=YYYY-MM-DD` | Staff attendance `[{ staffId, name, status, reason }]` |
| GET | `/api/reports/volunteers-log?date=YYYY-MM-DD` | Volunteer entries for a date |

---

## Frontend Pages

| Route | Page | Description |
|---|---|---|
| `/` | Login | Email + password login, redirects to dashboard |
| `/dashboard` | Dashboard | Live stats, modals, 30-second auto-refresh |
| `/children` | Children | Age-group cards, child list, add/edit/delete, Excel import |
| `/staff` | Staff | Staff table with live status, profile modal |
| `/attendance` | Attendance | Student + staff attendance, volunteer log, logbook panel |
| `/reports` | Reports | Tabbed reports: Children / Staff / Volunteers |

---

## Default Credentials

After running `node seed.js`:

| Field | Value |
|---|---|
| Email | `admin@ngo.com` |
| Password | `admin123` |

> Change the password after first login by updating the database directly or adding a change-password route.

---

## Excel Import Format

When bulk importing children via the Excel upload on the Children page, the spreadsheet must have these column headers (case-insensitive):

| Column | Required | Example |
|---|---|---|
| name | Yes | Aarav Sharma |
| age | Yes | 10 |
| gender | Yes | Male |
