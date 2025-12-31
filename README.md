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

</p>

<p align="center">A full-featured web-based operating system emulation with a rich Task Manager and persistent file system.</p>

---

## 🔗 Links

- 🌐 [Issues](https://github.com/H0NEYP0T-466/webOS-processMGR/issues)
- 🤝 [Contributing](https://github.com/H0NEYP0T-466/webOS-processMGR/blob/main/CONTRIBUTING.md)
- 🛡️ [Security](https://github.com/H0NEYP0T-466/webOS-processMGR/blob/main/SECURITY.md)
- 📜 [License](https://github.com/H0NEYP0T-466/webOS-processMGR/blob/main/LICENSE)

---

## 📑 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Dependencies & Packages](#-dependencies--packages)
- [Installation](#-installation)
- [Usage](#-usage)
- [Folder Structure](#-folder-structure)
- [API Reference](#-api-reference)
- [Architecture](#-architecture)
- [Development](#-development)
- [Troubleshooting](#-troubleshooting)
- [Security Considerations](#-security-considerations)
- [Contributing](#-contributing)
- [Code of Conduct](#-code-of-conduct)
- [License](#-license)

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

- **File Manager**: Create folders and files, edit text documents
- **Task Manager**: Monitor virtual and host processes
- **Settings**: Configure system preferences

### API Documentation

Access interactive API documentation at `http://localhost:8888/docs`

---

## 📂 Folder Structure

```
webOS-processMGR/
├── src/                      # Frontend source
│   ├── apps/                 # Application components
│   │   ├── FileManager/
│   │   ├── TaskManager/
│   │   ├── Editor/
│   │   └── Settings/
│   ├── os/                   # OS components
│   │   ├── Boot/
│   │   ├── Login/
│   │   ├── Desktop/
│   │   └── WindowManager/
│   ├── services/             # API and WebSocket clients
│   ├── state/                # Zustand store
│   └── types/                # TypeScript types
├── backend/                  # Backend source
│   └── app/
│       ├── auth/             # Authentication module
│       ├── files/            # File system module
│       ├── desktop/          # Desktop state module
│       ├── vproc/            # Virtual processes module
│       ├── hproc/            # Host processes module
│       ├── ws/               # WebSocket module
│       └── tests/            # Backend tests
├── docker/                   # Docker configuration
├── public/                   # Static assets
├── docs/                     # Documentation
├── .github/                  # GitHub templates and workflows
├── .env.example              # Environment template
├── package.json              # Frontend dependencies
├── requirements.txt          # Backend dependencies (in backend/)
├── CONTRIBUTING.md           # Contributing guidelines
├── SECURITY.md               # Security policy
├── CODE_OF_CONDUCT.md        # Code of conduct
├── LICENSE                   # MIT License
└── README.md                 # This file
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
