# WebOS - Web-Based Operating System with Process Monitoring

A full-featured web-based operating system emulation with a rich Task Manager and persistent file system.

![WebOS Screenshot](https://via.placeholder.com/800x400?text=WebOS+Screenshot)

## Features

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

## Tech Stack

### Frontend
- React 19 + TypeScript
- Zustand (state management)
- Framer Motion (animations)
- Recharts (charts)
- WebSockets (real-time updates)

### Backend
- FastAPI (Python)
- Motor (async MongoDB driver)
- psutil (system monitoring)
- python-jose (JWT)
- bcrypt (password hashing)
- WebSockets

### Database
- MongoDB

## Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- MongoDB 6+
- Docker (optional)

### Option 1: Docker Compose (Recommended)

```bash
# Clone the repository
git clone https://github.com/your-repo/webos.git
cd webos

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

#### Backend

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

#### Frontend

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

## Environment Variables

### Backend (.env)

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017` |
| `MONGO_DB_NAME` | Database name | `webos` |
| `JWT_SECRET` | JWT signing secret | (required) |
| `JWT_EXPIRE_MINUTES` | Token expiration time | `1440` (24h) |
| `ADMIN_USER` | Initial admin username | `admin` |
| `ADMIN_PASS` | Initial admin password | `admin123` |
| `CORS_ORIGINS` | Allowed CORS origins | `http://localhost:5173` |
| `LOG_LEVEL` | Logging level | `INFO` |

### Frontend (.env)

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:8888` |
| `VITE_WS_URL` | WebSocket URL | `ws://localhost:8888/ws` |

## API Reference

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

## Project Structure

```
webos/
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
├── .env.example              # Environment template
└── README.md
```

## Development

### Running Tests

```bash
# Backend tests
cd backend
pytest

# Frontend type check
npm run lint
```

### Building for Production

```bash
# Frontend
npm run build

# Backend (Docker)
docker build -f docker/backend.Dockerfile -t webos-backend .
```

## Security Considerations

- Change `JWT_SECRET` in production
- Use HTTPS in production
- Review CORS_ORIGINS settings
- Host process termination is admin-only
- Critical PIDs (0, 1, self) are protected

## License

MIT

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request
