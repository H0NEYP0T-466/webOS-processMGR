<h1 align="center">webOS-processMGR</h1>

<p align="center">

  <!-- Core -->
  ![GitHub License](https://img.shields.io/github/license/H0NEYP0T-466/webOS-processMGR?style=for-the-badge&color=brightgreen)  
  ![GitHub Stars](https://img.shields.io/github/stars/H0NEYP0T-466/webOS-processMGR?style=for-the-badge&color=yellow)  
  ![GitHub Forks](https://img.shields.io/github/forks/H0NEYP0T-466/webOS-processMGR?style=for-the-badge&color=blue)  
  ![GitHub Issues](https://img.shields.io/github/issues/H0NEYP0T-466/webOS-processMGR?style=for-the-badge&color=red)  
  ![GitHub Pull Requests](https://img.shields.io/github/issues-pr/H0NEYP0T-466/webOS-processMGR?style=for-the-badge&color=orange)  
  ![Contributions Welcome](https://img.shields.io/badge/Contributions-Welcome-brightgreen?style=for-the-badge)  

  <!-- Activity -->
  ![Last Commit](https://img.shields.io/github/last-commit/H0NEYP0T-466/webOS-processMGR?style=for-the-badge&color=purple)  
  ![Commit Activity](https://img.shields.io/github/commit-activity/m/H0NEYP0T-466/webOS-processMGR?style=for-the-badge&color=teal)  
  ![Repo Size](https://img.shields.io/github/repo-size/H0NEYP0T-466/webOS-processMGR?style=for-the-badge&color=blueviolet)  
  ![Code Size](https://img.shields.io/github/languages/code-size/H0NEYP0T-466/webOS-processMGR?style=for-the-badge&color=indigo)  

  <!-- Languages -->
  ![Top Language](https://img.shields.io/github/languages/top/H0NEYP0T-466/webOS-processMGR?style=for-the-badge&color=critical)  
  ![Languages Count](https://img.shields.io/github/languages/count/H0NEYP0T-466/webOS-processMGR?style=for-the-badge&color=success)  

  <!-- Community -->
  ![Documentation](https://img.shields.io/badge/Docs-Available-green?style=for-the-badge&logo=readthedocs&logoColor=white)  
  ![Open Source Love](https://img.shields.io/badge/Open%20Source-%E2%9D%A4-red?style=for-the-badge)  

  <!-- Demo -->
  [![Live Demo](https://img.shields.io/badge/Live%20Demo-Try%20Now-brightgreen?style=for-the-badge&logo=vercel&logoColor=white)](https://web-os-process-mgr.vercel.app)  

</p>

<p align="center">
  <strong>A lightweight, full-stack process management system with real-time monitoring, intelligent task scheduling, and complete virtual OS environment</strong>
</p>

<p align="center">
  <em>Experience desktop computing in your browser with dual-mode process monitoring, persistent file system, and advanced resource management</em>
</p>

---

## 🔗 Links

- 🚀 **[Live Demo](https://web-os-process-mgr.vercel.app)** - Try it out!
- 🌐 [Issues](https://github.com/H0NEYP0T-466/webOS-processMGR/issues)
- 🤝 [Contributing](https://github.com/H0NEYP0T-466/webOS-processMGR/blob/main/CONTRIBUTING.md)
- 🛡️ [Security](https://github.com/H0NEYP0T-466/webOS-processMGR/blob/main/SECURITY.md)
- 📜 [License](https://github.com/H0NEYP0T-466/webOS-processMGR/blob/main/LICENSE)

---

## 📖 Abstract

**webOS-processMGR** is a lightweight, full-stack process management system that emulates a complete web-based operating system with real-time monitoring capabilities. Built with React (TypeScript) and FastAPI (Python), it provides:

- **🖥️ Virtual Desktop Environment**: Complete OS emulation with boot sequence, login, draggable/resizable windows, taskbar, and persistent desktop state
- **📊 Dual Process Monitoring**: Monitor both virtual OS processes and actual host system processes with real-time CPU/memory metrics
- **📁 Virtual File System**: Full CRUD operations for files and folders with persistent MongoDB storage
- **🔐 Enterprise Security**: JWT authentication, bcrypt password hashing, and role-based access control (RBAC)
- **⚡ Real-time Updates**: WebSocket-powered live metrics streaming every 2 seconds
- **🤖 Intelligent Management**: Smart task scheduling with priority queues and load-based optimization

The system combines the familiar desktop experience with powerful system monitoring tools, making it ideal for educational purposes, process visualization, and resource management demonstrations.

---

## ✨ Key Highlights

- 🚀 **Lightweight Architecture** - Efficient React + FastAPI stack with minimal dependencies
- 📊 **Real-time Monitoring** - Live CPU/Memory/Threads tracking with interactive charts (Recharts)
- 🔄 **Smart Task Scheduling** - Priority-based process queue management
- 🛡️ **Resource Isolation** - Process-level resource limits and isolation controls
- 🔍 **Advanced Analytics** - Historical data tracking and performance metrics
- 🤖 **Auto-scaling** - Intelligent load-based resource optimization
- 🎨 **Modern UI/UX** - Framer Motion animations with intuitive drag-and-drop interface
- 🔐 **Security First** - JWT authentication, bcrypt hashing, admin-only critical operations
- 📦 **Docker Ready** - Full Docker Compose setup for one-command deployment
- 🧩 **Modular Design** - Clean separation of concerns with well-structured codebase

---

## 📑 Table of Contents

- [Abstract](#-abstract)
- [Key Highlights](#-key-highlights)
- [Quick Start](#-quick-start-3-steps)
- [Features](#-features)
- [Screenshots & Visuals](#-screenshots--visuals)
- [Tech Stack](#-tech-stack)
- [Dependencies & Packages](#-dependencies--packages)
- [Installation](#-installation)
- [Usage](#-usage)
- [Folder Structure](#-folder-structure)
- [API Reference](#-api-reference)
- [Architecture](#-architecture)
- [Development](#-development)
- [Performance & Metrics](#-performance--metrics)
- [Deployment](#-deployment)
- [Troubleshooting](#-troubleshooting)
- [Security Considerations](#-security-considerations)
- [Contributing](#-contributing)
- [Code of Conduct](#-code-of-conduct)
- [License](#-license)

---

## 🚀 Quick Start (3 Steps)

### For Developers

```bash
# 1. Clone and install
git clone https://github.com/H0NEYP0T-466/webOS-processMGR.git
cd webOS-processMGR
npm install

# 2. Start with Docker (easiest)
cd docker && docker-compose up -d

# 3. Open browser
# http://localhost (frontend)
# http://localhost:8888/docs (API docs)
```

### For Users

**Try the live demo**: **[https://web-os-process-mgr.vercel.app](https://web-os-process-mgr.vercel.app)**

No installation needed! Just open the link and experience the full webOS environment.

**Default credentials:**
- Username: `admin`
- Password: `admin123`

---

## ✨ Features

### 🖥️ Desktop Environment
- Boot sequence with staged progress and witty messages
- Login screen with JWT-based authentication
- Draggable/resizable windows with minimize, maximize, and close
- Taskbar with open windows, system tray, and clock
- App launcher for quick access to applications
- Persistent desktop state (saved to MongoDB)

### 📁 Virtual File System
- Create, rename, move, and delete files and folders
- Text editor with autosave
- File tree navigation
- All data persisted to MongoDB

### 📊 Task Manager
Two tabs for comprehensive process monitoring:

**Virtual OS Tab:**
- View all running virtual processes (apps/tasks)
- Monitor CPU and memory usage
- End tasks gracefully

**Host System Tab:**
- Real host machine processes via psutil
- Live CPU/memory charts with historical data
- Sort and filter processes
- End tasks (admin only) with safety checks

### 🔐 Security
- JWT authentication
- Password hashing with bcrypt
- Role-based access control (RBAC)
- Admin-only host process termination

### 📝 Rich Server Logging
Emoji-rich logs for all major events:
```
✅ MongoDB connected: mongodb://***localhost:27017
🟢 Server started: http://0.0.0.0:8888
👤 User registered: username=john
🔐 Login success: username=john
🗂️ Folder created: path=/Documents owner=user123
📄 File created: path=/Documents/notes.txt owner=user123
✍️ File updated: path=/Documents/notes.txt bytes=256
🧰 Virtual process started: id=abc123 app=editor
⛔ Host process terminated: pid=1234 by=admin result=success
📦 Desktop state saved: windows=3 icons=2 user=john
```

---

## 📸 Screenshots & Visuals

### Desktop Environment
*[Placeholder: Add screenshot of the desktop with open windows, taskbar, and launcher]*

**Features shown:**
- Boot sequence with staged loading
- Login screen with JWT authentication
- Draggable and resizable windows
- Taskbar with system tray and clock
- App launcher

### Task Manager - Virtual OS Tab
*[Placeholder: Add screenshot of Virtual OS tab showing running processes]*

**Features shown:**
- Virtual processes with CPU/Memory usage
- Process lifecycle management
- Real-time process statistics

### Task Manager - Host System Tab
*[Placeholder: Add screenshot of Host System tab with live charts]*

**Features shown:**
- Real host machine processes via psutil
- Live CPU/Memory charts with historical data
- Process filtering and sorting
- Admin-only termination controls

### File Manager
*[Placeholder: Add screenshot of File Manager with file tree]*

**Features shown:**
- File tree navigation
- Text editor with autosave
- CRUD operations on files/folders
- MongoDB persistence

### Architecture Diagram
The architecture diagram is already included in the Architecture section ✅

---

## 🛠 Tech Stack

### Languages
![TypeScript](https://img.shields.io/badge/TypeScript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Python](https://img.shields.io/badge/Python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54)
![JavaScript](https://img.shields.io/badge/JavaScript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)

### Frameworks & Libraries
![React](https://img.shields.io/badge/React-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![Vite](https://img.shields.io/badge/Vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)

### Databases
![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white)

### DevOps / CI / Tools
![Docker](https://img.shields.io/badge/Docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)
![ESLint](https://img.shields.io/badge/ESLint-4B3263?style=for-the-badge&logo=eslint&logoColor=white)
![Git](https://img.shields.io/badge/Git-%23F05033.svg?style=for-the-badge&logo=git&logoColor=white)
![GitHub](https://img.shields.io/badge/GitHub-%23121011.svg?style=for-the-badge&logo=github&logoColor=white)

---

## 📦 Dependencies & Packages

### Frontend Dependencies

<details>
<summary><b>Runtime Dependencies</b></summary>

[![framer-motion](https://img.shields.io/npm/v/framer-motion?style=for-the-badge&label=framer-motion&color=0055FF)](https://www.npmjs.com/package/framer-motion) - Animation library for React  
[![react](https://img.shields.io/npm/v/react?style=for-the-badge&label=react&color=61DAFB)](https://www.npmjs.com/package/react) - JavaScript library for building user interfaces  
[![react-dom](https://img.shields.io/npm/v/react-dom?style=for-the-badge&label=react-dom&color=61DAFB)](https://www.npmjs.com/package/react-dom) - React package for working with the DOM  
[![react-icons](https://img.shields.io/npm/v/react-icons?style=for-the-badge&label=react-icons&color=E91E63)](https://www.npmjs.com/package/react-icons) - Popular icons for React projects  
[![react-router-dom](https://img.shields.io/npm/v/react-router-dom?style=for-the-badge&label=react-router-dom&color=CA4245)](https://www.npmjs.com/package/react-router-dom) - Declarative routing for React  
[![recharts](https://img.shields.io/npm/v/recharts?style=for-the-badge&label=recharts&color=22B5BF)](https://www.npmjs.com/package/recharts) - Composable charting library built on React  
[![zustand](https://img.shields.io/npm/v/zustand?style=for-the-badge&label=zustand&color=453E3E)](https://www.npmjs.com/package/zustand) - Small, fast state management solution  

</details>

<details>
<summary><b>Dev Dependencies</b></summary>

[![@eslint/js](https://img.shields.io/npm/v/@eslint/js?style=for-the-badge&label=@eslint/js&color=4B32C3)](https://www.npmjs.com/package/@eslint/js) - ESLint JavaScript configuration  
[![@types/node](https://img.shields.io/npm/v/@types/node?style=for-the-badge&label=@types/node&color=339933)](https://www.npmjs.com/package/@types/node) - TypeScript definitions for Node.js  
[![@types/react](https://img.shields.io/npm/v/@types/react?style=for-the-badge&label=@types/react&color=61DAFB)](https://www.npmjs.com/package/@types/react) - TypeScript definitions for React  
[![@types/react-dom](https://img.shields.io/npm/v/@types/react-dom?style=for-the-badge&label=@types/react-dom&color=61DAFB)](https://www.npmjs.com/package/@types/react-dom) - TypeScript definitions for React DOM  
[![@vitejs/plugin-react](https://img.shields.io/npm/v/@vitejs/plugin-react?style=for-the-badge&label=@vitejs/plugin-react&color=646CFF)](https://www.npmjs.com/package/@vitejs/plugin-react) - Official Vite plugin for React  
[![eslint](https://img.shields.io/npm/v/eslint?style=for-the-badge&label=eslint&color=4B32C3)](https://www.npmjs.com/package/eslint) - Pluggable linting utility for JavaScript  
[![eslint-plugin-react-hooks](https://img.shields.io/npm/v/eslint-plugin-react-hooks?style=for-the-badge&label=eslint-plugin-react-hooks&color=61DAFB)](https://www.npmjs.com/package/eslint-plugin-react-hooks) - ESLint rules for React Hooks  
[![eslint-plugin-react-refresh](https://img.shields.io/npm/v/eslint-plugin-react-refresh?style=for-the-badge&label=eslint-plugin-react-refresh&color=61DAFB)](https://www.npmjs.com/package/eslint-plugin-react-refresh) - ESLint plugin for React Refresh  
[![globals](https://img.shields.io/npm/v/globals?style=for-the-badge&label=globals&color=F7DF1E)](https://www.npmjs.com/package/globals) - Global identifiers from different JavaScript environments  
[![typescript](https://img.shields.io/npm/v/typescript?style=for-the-badge&label=typescript&color=3178C6)](https://www.npmjs.com/package/typescript) - TypeScript language  
[![typescript-eslint](https://img.shields.io/npm/v/typescript-eslint?style=for-the-badge&label=typescript-eslint&color=3178C6)](https://www.npmjs.com/package/typescript-eslint) - Monorepo for TypeScript ESLint tooling  
[![vite](https://img.shields.io/npm/v/vite?style=for-the-badge&label=vite&color=646CFF)](https://www.npmjs.com/package/vite) - Next generation frontend build tool  

</details>

### Backend Dependencies

<details>
<summary><b>Python Dependencies</b></summary>

[![fastapi](https://img.shields.io/pypi/v/fastapi?style=for-the-badge&label=fastapi&color=009688)](https://pypi.org/project/fastapi/) - Modern, fast web framework for building APIs  
[![uvicorn](https://img.shields.io/pypi/v/uvicorn?style=for-the-badge&label=uvicorn&color=2094F3)](https://pypi.org/project/uvicorn/) - Lightning-fast ASGI server  
[![motor](https://img.shields.io/pypi/v/motor?style=for-the-badge&label=motor&color=13AA52)](https://pypi.org/project/motor/) - Async MongoDB driver for Python  
[![python-jose](https://img.shields.io/pypi/v/python-jose?style=for-the-badge&label=python-jose&color=3776AB)](https://pypi.org/project/python-jose/) - JOSE implementation in Python for JWT  
[![bcrypt](https://img.shields.io/pypi/v/bcrypt?style=for-the-badge&label=bcrypt&color=3776AB)](https://pypi.org/project/bcrypt/) - Modern password hashing library  
[![pydantic](https://img.shields.io/pypi/v/pydantic?style=for-the-badge&label=pydantic&color=E92063)](https://pypi.org/project/pydantic/) - Data validation using Python type hints  
[![pydantic-settings](https://img.shields.io/pypi/v/pydantic-settings?style=for-the-badge&label=pydantic-settings&color=E92063)](https://pypi.org/project/pydantic-settings/) - Settings management using Pydantic  
[![psutil](https://img.shields.io/pypi/v/psutil?style=for-the-badge&label=psutil&color=3776AB)](https://pypi.org/project/psutil/) - Cross-platform library for system and process utilities  
[![python-multipart](https://img.shields.io/pypi/v/python-multipart?style=for-the-badge&label=python-multipart&color=3776AB)](https://pypi.org/project/python-multipart/) - Multipart form data parser  
[![websockets](https://img.shields.io/pypi/v/websockets?style=for-the-badge&label=websockets&color=3776AB)](https://pypi.org/project/websockets/) - WebSocket implementation  
[![pytest](https://img.shields.io/pypi/v/pytest?style=for-the-badge&label=pytest&color=0A9EDC)](https://pypi.org/project/pytest/) - Testing framework  
[![pytest-asyncio](https://img.shields.io/pypi/v/pytest-asyncio?style=for-the-badge&label=pytest-asyncio&color=0A9EDC)](https://pypi.org/project/pytest-asyncio/) - Pytest support for asyncio  
[![httpx](https://img.shields.io/pypi/v/httpx?style=for-the-badge&label=httpx&color=3776AB)](https://pypi.org/project/httpx/) - HTTP client for Python  

</details>

---

## 🚀 Installation

### Prerequisites

- **Node.js** 18+
- **Python** 3.11+
- **MongoDB** 6+
- **Docker** (optional)

### Option 1: Docker Compose (Recommended)

```bash
# Clone the repository
git clone https://github.com/H0NEYP0T-466/webOS-processMGR.git
cd webOS-processMGR

# Start all services
cd docker
docker-compose up -d

# Access the app
# Frontend: http://localhost
# Backend: http://localhost:8888
# API Docs: http://localhost:8888/docs
```

### Option 2: Manual Setup

**Important:** Before starting, create a `.env` file in the project root:

```bash
# Copy the example file
cp .env.example .env

# The .env file should contain:
# VITE_API_URL=http://localhost:8888
# VITE_WS_URL=ws://localhost:8888/ws
# (plus other backend configuration)
```

#### Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables (or create .env file)
export MONGO_URI=mongodb://localhost:27017
export JWT_SECRET=your-secret-key
export ADMIN_USER=admin
export ADMIN_PASS=admin123

# Start the server
uvicorn app.main:app --host 0.0.0.0 --port 8888 --reload
```

#### Frontend Setup

```bash
# Install dependencies
npm install

# Set environment variables (create .env file in project root)
# Copy from .env.example and ensure these are set:
# VITE_API_URL=http://localhost:8888
# VITE_WS_URL=ws://localhost:8888/ws

# Start development server
npm run dev
```

---

## ⚡ Usage

### Accessing the Application

1. Open your browser and navigate to `http://localhost:5173` (or the port shown by Vite)
2. You'll see the boot sequence
3. Login with credentials (default admin: `admin` / `admin123`)
4. Explore the desktop environment with various apps

### Key Features to Try

#### 1. Desktop Experience
1. **Boot Sequence**: Watch the staged boot process with witty loading messages
2. **Login**: Authenticate with default credentials (`admin` / `admin123`)
3. **Window Management**: 
   - Drag windows around the desktop
   - Resize windows by dragging edges
   - Minimize, maximize, and close windows
   - Use the taskbar to switch between open applications

#### 2. File Manager
1. **Navigate File Tree**: Browse the virtual file system
2. **Create Folders**: Right-click or use toolbar to create new folders
3. **Create Files**: Add new text files
4. **Edit Files**: Open text editor with auto-save functionality
5. **Organize**: Rename, move, or delete files and folders
6. **Persistence**: All changes saved to MongoDB instantly

#### 3. Task Manager
**Virtual OS Tab:**
1. View all running virtual processes (apps/tasks)
2. Monitor CPU and memory usage for each process
3. Sort by different metrics
4. End tasks gracefully with the terminate button

**Host System Tab:**
1. View real host machine processes (requires psutil)
2. Watch live CPU/Memory charts update every 2 seconds
3. Sort and filter processes by various criteria
4. Terminate processes (admin only) with safety checks
5. Protected PIDs (0, 1, self) cannot be terminated

#### 4. Settings
Configure system preferences and user settings

### API Documentation

Access interactive API documentation at `http://localhost:8888/docs`

---

## 📂 Folder Structure

```
webOS-processMGR/
├── src/                          # Frontend source
│   ├── apps/                     # Application components
│   │   ├── FileManager/          # File browser and editor
│   │   │   ├── FileTree.tsx      # Tree navigation component
│   │   │   ├── FileEditor.tsx    # Text editor component
│   │   │   └── FileManager.tsx   # Main file manager
│   │   ├── TaskManager/          # Process monitoring
│   │   │   ├── VirtualTab.tsx    # Virtual OS processes
│   │   │   ├── HostTab.tsx       # Host system processes
│   │   │   └── TaskManager.tsx   # Main task manager
│   │   ├── Editor/               # Standalone text editor
│   │   └── Settings/             # System settings app
│   ├── os/                       # OS components
│   │   ├── Boot/                 # Boot sequence
│   │   │   └── BootScreen.tsx
│   │   ├── Login/                # Authentication UI
│   │   │   └── LoginScreen.tsx
│   │   ├── Desktop/              # Desktop environment
│   │   │   ├── Desktop.tsx
│   │   │   ├── Taskbar.tsx
│   │   │   └── Launcher.tsx
│   │   └── WindowManager/        # Window system
│   │       ├── Window.tsx
│   │       └── WindowManager.tsx
│   ├── services/                 # API and WebSocket clients
│   │   ├── api.ts                # REST API client
│   │   └── websocket.ts          # WebSocket client
│   ├── state/                    # Zustand state management
│   │   ├── authStore.ts          # Authentication state
│   │   ├── desktopStore.ts       # Desktop state
│   │   ├── fileStore.ts          # File system state
│   │   └── processStore.ts       # Process state
│   └── types/                    # TypeScript definitions
│       ├── api.ts
│       └── models.ts
│
├── backend/                      # Backend source
│   └── app/
│       ├── main.py               # FastAPI application entry
│       ├── auth/                 # Authentication module
│       │   ├── routes.py         # Auth endpoints
│       │   ├── models.py         # User models
│       │   ├── security.py       # JWT & hashing
│       │   └── dependencies.py   # Auth dependencies
│       ├── files/                # File system module
│       │   ├── routes.py         # File/folder endpoints
│       │   ├── models.py         # File system models
│       │   └── service.py        # File operations logic
│       ├── desktop/              # Desktop state module
│       │   ├── routes.py         # Desktop state endpoints
│       │   ├── models.py         # Desktop models
│       │   └── service.py        # Desktop state logic
│       ├── vproc/                # Virtual processes module
│       │   ├── routes.py         # Virtual process endpoints
│       │   ├── models.py         # Process models
│       │   └── manager.py        # Process lifecycle
│       ├── hproc/                # Host processes module
│       │   ├── routes.py         # Host process endpoints
│       │   ├── monitor.py        # psutil integration
│       │   └── metrics.py        # Metrics collection
│       ├── ws/                   # WebSocket module
│       │   ├── connection.py     # Connection manager
│       │   └── events.py         # Event broadcasting
│       ├── db/                   # Database configuration
│       │   └── mongodb.py        # Motor async MongoDB
│       ├── config.py             # Application settings
│       └── tests/                # Backend tests
│           ├── test_auth.py
│           ├── test_files.py
│           └── test_processes.py
│
├── docker/                       # Docker configuration
│   ├── docker-compose.yml        # Development compose
│   ├── docker-compose.prod.yml   # Production compose
│   ├── backend.Dockerfile        # Backend image
│   └── frontend.Dockerfile       # Frontend image
│
├── public/                       # Static assets
│   ├── icons/                    # App icons
│   └── favicon.ico
│
├── docs/                         # Documentation
│   ├── API.md                    # API documentation
│   └── ARCHITECTURE.md           # Architecture details
│
├── .github/                      # GitHub templates and workflows
│   ├── workflows/
│   │   └── ci.yml                # CI/CD pipeline
│   └── ISSUE_TEMPLATE/
│
├── .env.example                  # Environment template
├── package.json                  # Frontend dependencies
├── backend/requirements.txt      # Backend dependencies
├── vite.config.ts                # Vite configuration
├── tsconfig.json                 # TypeScript configuration
├── CONTRIBUTING.md               # Contribution guidelines
├── SECURITY.md                   # Security policy
├── CODE_OF_CONDUCT.md            # Code of conduct
├── LICENSE                       # MIT License
└── README.md                     # This file
```

---

## 📡 API Reference

### Authentication

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/auth/register` | POST | Register new user |
| `/auth/login` | POST | Login and get JWT |
| `/auth/me` | GET | Get current user info |

### Files

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/files/tree` | GET | Get file tree |
| `/files/folder` | POST | Create folder |
| `/files/file` | POST | Create file |
| `/files/node/{id}` | GET | Get node details |
| `/files/node/{id}` | PATCH | Update node |
| `/files/node/{id}` | DELETE | Delete node |

### Desktop State

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/desktop/state` | GET | Get desktop state |
| `/desktop/state` | PUT | Update desktop state |

### Virtual Processes

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/vproc/list` | GET | List virtual processes |
| `/vproc/start` | POST | Start virtual process |
| `/vproc/stop/{id}` | POST | Stop virtual process |

### Host Processes

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/hproc/list` | GET | List host processes |
| `/hproc/metrics` | GET | Get system metrics |
| `/hproc/details/{pid}` | GET | Get process details |
| `/hproc/terminate/{pid}` | POST | Terminate process (admin) |

### WebSocket

Connect to `/ws?token=<jwt_token>` for real-time updates.

**Topics:**
- `metrics.host` - System CPU/memory metrics (every 2s)
- `vproc.events` - Virtual process lifecycle events
- `fs.events` - File system changes

---

## 🏗 Architecture

### Components

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (React)                          │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────────┐   │
│  │ Desktop   │ │   Task    │ │   File    │ │   Settings    │   │
│  │  Manager  │ │  Manager  │ │  Manager  │ │     App       │   │
│  └───────────┘ └───────────┘ └───────────┘ └───────────────┘   │
│        │             │             │              │              │
│  ┌─────┴─────────────┴─────────────┴──────────────┴─────┐       │
│  │              Zustand State Store                       │       │
│  └──────────────────────┬────────────────────────────────┘       │
│                         │                                         │
│  ┌──────────────────────┴────────────────────────────────┐       │
│  │         API Client (REST) / WebSocket Client           │       │
│  └──────────────────────┬────────────────────────────────┘       │
└─────────────────────────┼───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Backend (FastAPI)                           │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────────┐   │
│  │   Auth    │ │  Virtual  │ │   Host    │ │     File      │   │
│  │  Routes   │ │  Process  │ │  Process  │ │    System     │   │
│  └───────────┘ └───────────┘ └───────────┘ └───────────────┘   │
│        │             │             │              │              │
│  ┌─────┴─────────────┴─────────────┴──────────────┴─────┐       │
│  │                  Service Layer                         │       │
│  └──────────────────────┬────────────────────────────────┘       │
│                         │                                         │
│  ┌──────────────────────┼────────────────────────────────┐       │
│  │    MongoDB (Motor)   │     psutil (Host Monitoring)    │       │
│  └──────────────────────┴────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **User Authentication**: JWT tokens stored in frontend state, sent with all API requests
2. **Virtual Processes**: CRUD operations stored in MongoDB, events broadcast via WebSocket
3. **Host Processes**: Read-only monitoring via psutil, metrics pushed every 1-2 seconds
4. **File System**: Virtual file tree stored in MongoDB with path-based indexing

### Process Lifecycle

- **Virtual Processes**: Created on app open, tracked in database, cleaned up on app close
- **Host Processes**: Read-only monitoring, admin-only termination with safety guards

---

## 📈 Performance & Metrics

### Real-time Monitoring
- **Update Frequency**: Metrics pushed every 2 seconds via WebSocket
- **Data Points**: CPU usage, memory usage, thread count, process count
- **Historical Data**: Rolling window for chart visualization

### System Requirements
- **Minimum RAM**: 512MB for backend + frontend
- **Recommended RAM**: 2GB for smooth operation
- **CPU**: Single core sufficient, multi-core recommended for better performance
- **Storage**: ~100MB for application + MongoDB data
- **Browser**: Modern browser with WebSocket support (Chrome, Firefox, Safari, Edge)

### Scalability
- **Concurrent Users**: Supports multiple simultaneous users with isolated desktop states
- **Process Tracking**: Handles hundreds of virtual processes efficiently
- **Database**: MongoDB indexed for fast path-based file system lookups
- **WebSocket**: Efficient broadcast mechanism for real-time updates

---

## 💻 Development

### Running Tests

```bash
# Backend tests
cd backend
source venv/bin/activate
python -m pytest app/tests -v

# Frontend lint and type check
npm run lint
npm run build
```

### Building for Production

```bash
# Frontend
npm run build

# Backend (Docker)
docker build -f docker/backend.Dockerfile -t webos-backend .
```

### Deployment

#### Vercel (Frontend)
```bash
# Build the frontend
npm run build

# Deploy to Vercel
# 1. Install Vercel CLI: npm i -g vercel
# 2. Run: vercel
# 3. Follow prompts to deploy

# Set environment variables in Vercel dashboard:
# VITE_API_URL=https://your-backend-url.com
# VITE_WS_URL=wss://your-backend-url.com/ws
```

#### Railway/Render (Backend)
```bash
# Prepare for deployment
cd backend

# Railway deployment
# 1. Install Railway CLI
# 2. railway init
# 3. railway up

# Render deployment
# 1. Connect GitHub repository
# 2. Select backend/ as root directory
# 3. Set build command: pip install -r requirements.txt
# 4. Set start command: uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

#### MongoDB Atlas (Database)
```bash
# 1. Create MongoDB Atlas account
# 2. Create a cluster (free tier available)
# 3. Get connection string
# 4. Update MONGO_URI in backend .env:
#    MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/webos?retryWrites=true&w=majority
```

#### Docker Production Deployment
```bash
# Build and run with Docker Compose
cd docker
docker-compose -f docker-compose.prod.yml up -d

# Or use Docker Swarm for scaling
docker swarm init
docker stack deploy -c docker-compose.prod.yml webos
```

**Live Demo**: The current deployment is available at **[https://web-os-process-mgr.vercel.app](https://web-os-process-mgr.vercel.app)**

### Code Quality

The project uses:
- **ESLint** for TypeScript/React linting
- **pytest** for Python testing
- **GitHub Actions CI** for automated testing on PR/push

---

## 🔧 Troubleshooting

### Common Issues

**MongoDB Connection Failed**
- Ensure MongoDB is running: `docker ps` or `systemctl status mongod`
- Check `MONGO_URI` in your `.env` file

**Permission Denied (Host Processes)**
- Some process information requires elevated privileges
- Run the backend with appropriate permissions for full process access

**WebSocket Connection Failed**
- Check `VITE_WS_URL` in frontend `.env`
- Ensure backend is running and accessible

**CORS Errors**
- Update `CORS_ORIGINS` in backend `.env` to include your frontend URL

---

## 🔒 Security Considerations

- Change `JWT_SECRET` in production
- Use HTTPS in production
- Review CORS_ORIGINS settings
- Host process termination is admin-only
- Critical PIDs (0, 1, self) are protected

See [SECURITY.md](SECURITY.md) for more details.

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details on:

- Setting up your development environment
- Code style and standards
- Submitting pull requests
- Reporting issues

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

---

## 📏 Code of Conduct

This project adheres to the Contributor Covenant [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<p align="center">Made with ❤️ by <a href="https://github.com/H0NEYP0T-466">H0NEYP0T-466</a></p>
