# Contributing to WebOS Process Manager

Thank you for your interest in contributing to WebOS Process Manager! This document provides guidelines and instructions for contributing.

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.11+
- MongoDB 6+
- Git

### Development Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/webOS-processMGR.git
   cd webOS-processMGR
   ```

2. **Set up the frontend:**
   ```bash
   npm install
   ```

3. **Set up the backend:**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

4. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your local settings
   ```

5. **Start MongoDB:**
   ```bash
   # Using Docker:
   docker run -d -p 27017:27017 --name mongodb mongo:6

   # Or install MongoDB locally
   ```

## Development Workflow

### Running the Development Servers

**Frontend (in project root):**
```bash
npm run dev
```

**Backend (in backend directory):**
```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8888 --reload
```

### Code Style

#### TypeScript/React
- We use ESLint for linting
- Run `npm run lint` before committing
- Follow the existing code style in the project

#### Python
- We use type hints for all function signatures
- Follow PEP 8 style guidelines
- Use meaningful variable and function names

### Running Tests

**Frontend:**
```bash
npm run lint    # Lint check
npm run build   # Type check + build
```

**Backend:**
```bash
cd backend
source venv/bin/activate
python -m pytest app/tests -v
```

## Making Changes

### Branch Naming

- `feature/` - New features (e.g., `feature/restart-policy`)
- `fix/` - Bug fixes (e.g., `fix/validation-error`)
- `docs/` - Documentation changes (e.g., `docs/api-reference`)
- `refactor/` - Code refactoring (e.g., `refactor/process-service`)

### Commit Messages

Use clear, descriptive commit messages:

```
fix: validate ObjectId before database query

- Add ObjectId format validation to prevent crashes
- Return 400 Bad Request for invalid IDs
- Add regression tests for validation
```

Format:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `chore:` - Maintenance tasks

### Pull Requests

1. Create a feature branch from `master`
2. Make your changes
3. Run tests and linting
4. Push your branch
5. Open a Pull Request with:
   - Clear description of changes
   - Any breaking changes noted
   - Screenshots for UI changes
   - Test results

## Code Review

All submissions require review. We use GitHub pull requests for this purpose.

### Review Checklist

- [ ] Code follows project style guidelines
- [ ] Tests pass
- [ ] New tests added for new features
- [ ] Documentation updated if needed
- [ ] No security vulnerabilities introduced

## Reporting Issues

When reporting issues, please include:

1. **Description**: Clear description of the issue
2. **Steps to Reproduce**: How to reproduce the behavior
3. **Expected Behavior**: What you expected to happen
4. **Actual Behavior**: What actually happened
5. **Environment**: OS, Node/Python version, browser
6. **Screenshots**: If applicable

## Security

Please see [SECURITY.md](SECURITY.md) for reporting security vulnerabilities.

## Questions?

Feel free to open an issue for questions or discussions.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
