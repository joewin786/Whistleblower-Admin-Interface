# 💻 Whistleblower Web & Admin Portal (Frontend)

A modern web application built with **Next.js 16 (App Router)** and **React 19** serving as both the **Whistleblower User Portal** and the **Whistleblower Admin Dashboard**.

This application facilitates secure report filing (anonymous or authenticated), real-time communication with reporters, analytics data visualization, feedback submission, and dynamic workflow & report category configuration.

---

## 🚀 Key Features

### 👤 Whistleblower User Portal
- 📝 **Report Submission**:
  - Support for both **Anonymous** and **Authenticated** reporting.
  - Interactive submission form with evidence upload capabilities.
- 🔍 **Status Tracking & History**:
  - Monitor report progress and handling history in real time.
- 💬 **Interactive Live Chat**:
  - Direct real-time discussion with handling administrators via WebSocket & Pusher.
- 💡 **User Feedback**:
  - Service feedback submission form.

### 🛡️ Whistleblower Admin Dashboard
- 📊 **Executive Analytics Dashboard**:
  - Charts and summary statistics for reports by status, category, and date range (powered by **Recharts**).
- 📋 **Report Management**:
  - Detailed report inspection and evidence file review.
  - Status updates (In Review, Investigating, Resolved, Rejected).
  - Assign handling administrators and investigator teams.
- 🤖 **AI Summary & Risk Assessment**:
  - Automatic report summarization and risk weight estimation powered by Google Gemini AI.
- 👥 **Admin & Role Management (RBAC)**:
  - Administrator accounts, Roles & Permissions, and SuperAdmin access controls.
- ⚙️ **Dynamic System Configurations**:
  - **Category Config**: Manage violation categories and sub-categories.
  - **Workflow Config**: Configure handling stages and report workflows.
  - **Settings Config**: Configure system parameters and notification preferences.
- 💬 **Messaging Center & Push Notifications**:
  - Real-time chat with reporters and Firebase Cloud Messaging (FCM) push notifications.

---

## 🛠️ Tech Stack

- **Frontend Framework**: [Next.js 16](https://nextjs.org/) (App Router), [React 19](https://react.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling & UI**: [Tailwind CSS v4](https://tailwindcss.com/), [Framer Motion](https://www.framer.com/motion/), [Radix UI](https://www.radix-ui.com/), [Lucide Icons](https://lucide.dev/)
- **Data Visualization**: [Recharts](https://recharts.org/)
- **Real-Time Messaging**: [Pusher JS](https://pusher.com/) & WebSockets
- **Notifications**: Firebase FCM Client SDK & `react-hot-toast`
- **Deployment & Container**: Docker, Docker Compose, & Kubernetes

---

## 📂 Project Structure

```text
wb-web/
├── app/
│   ├── (auth)/                   # User & Admin Authentication Pages (Login/Register)
│   ├── admin/                    # Admin Panel Specific Pages & Components
│   │   ├── components/           # Admin Config Components (Category, Role, Settings, Workflow)
│   │   ├── layout.tsx            # Main Admin Layout
│   │   └── page.tsx              # Admin Landing Page / Entry Point
│   ├── dashboard/                # Main Dashboard for Reporters & Administrators
│   │   ├── admins/               # Admin Account Management
│   │   ├── ai/                   # Gemini AI Features & Insights
│   │   ├── chat-agent/           # AI Chatbot Interface
│   │   ├── feedback_types/       # Feedback Type Management
│   │   ├── feedbacks/            # User Feedback Management
│   │   ├── notifications/        # Notification Center
│   │   └── reports/              # Report Management & Tracking
│   ├── globals.css               # Global Tailwind CSS & Design Tokens
│   ├── layout.tsx                # Root App Layout
│   └── page.tsx                  # User Portal Landing Page
├── components/                   # Reusable UI Components (Dialog, Select, Popover, etc.)
├── lib/                          # Utility Helpers, API Clients, & Firebase/Pusher Setup
├── public/                       # Static Assets (Images, Icons)
├── Dockerfile                    # Multi-stage Dockerfile
├── docker-compose.yml            # Local Docker Compose setup
├── k8s/                          # Kubernetes Deployment Manifests
└── package.json                  # Dependencies & NPM Scripts
```

---

## 📋 System Prerequisites

Ensure you have the following installed before running the web application:

- **Node.js**: `20.x` or later.
- **npm** (v10+), **yarn**, **pnpm**, or **bun**.
- **Whistleblower REST API (`wb-api`)**: Running locally on `http://localhost:8080` (or your configured backend URL).

---

## ⚙️ Environment Setup (`.env.local`)

Create a `.env.local` file in the root of `wb-web/` (you can copy from `.env.example`):

```env
# Backend API Connection
NEXT_PUBLIC_API_URL=http://localhost:8080

# Firebase FCM Push Notification Config
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your-vapid-key

# Pusher Real-Time Service Config
NEXT_PUBLIC_PUSHER_KEY=your-pusher-key
NEXT_PUBLIC_PUSHER_CLUSTER=ap1
```

---

## 🏃 Running the Application

### 1. Local Development

```bash
# Navigate to web directory
cd wb-web

# Install dependencies
npm install
# or
yarn install
# or
pnpm install
# or
bun install

# Start Next.js development server
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open your browser and navigate to:
- **User Portal**: `http://localhost:3000`
- **Admin Dashboard**: `http://localhost:3000/admin` or `http://localhost:3000/dashboard`

### 2. Production Build

```bash
# Build production bundle
npm run build

# Start production server
npm run start
```

### 3. Docker Compose

```bash
# Build and run containers
docker-compose up -d --build
```

---

## 📄 License & Copyright

Copyright © 2026 PTFIC Whistleblower Team.
