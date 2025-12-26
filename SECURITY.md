# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |

## Reporting a Vulnerability

We take security seriously. If you discover a security vulnerability, please report it responsibly.

### How to Report

1. **Do NOT** open a public GitHub issue for security vulnerabilities
2. Email security concerns to the repository maintainers
3. Include as much detail as possible:
   - Type of vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

### What to Expect

- Acknowledgment within 48 hours
- Initial assessment within 7 days
- Regular updates on progress
- Credit in security advisories (if desired)

## Security Best Practices

When deploying WebOS Process Manager:

### Environment Variables

- **Change `JWT_SECRET`**: Use a strong, random secret in production
- **Set `CORS_ORIGINS`**: Restrict to your specific domains
- **Use HTTPS**: Always use HTTPS in production

### Database

- **Secure MongoDB**: Enable authentication and use TLS
- **Network isolation**: Limit database access to application servers only
- **Regular backups**: Implement backup procedures

### Process Management

- **Admin access**: Only grant admin role to trusted users
- **Host process termination**: Disabled by default in UI for safety
- **Critical process protection**: System processes are protected from termination

### Authentication

- **Strong passwords**: Enforce minimum password length (6+ characters)
- **Token expiration**: JWT tokens expire after 24 hours by default
- **Session management**: Implement proper logout handling

## Security Features

### Input Validation

All user inputs are validated:
- Username: 3-32 alphanumeric characters
- Password: 6-128 characters
- File names: No path traversal, reserved names blocked
- Object IDs: MongoDB format validated

### Process Safety

- Critical PIDs (0, 1, self, parent) cannot be terminated
- Critical process names (init, systemd, etc.) are protected
- Graceful termination with SIGTERM, escalation to SIGKILL

### API Security

- JWT authentication required for all endpoints (except health checks)
- Admin role required for host process termination
- Rate limiting recommended for production

## Known Limitations

1. **Host process monitoring**: Requires appropriate system permissions
2. **Virtual processes**: Simulated, not actual OS processes
3. **File system**: Virtual file system stored in MongoDB

## Updates

Security updates will be released as patch versions. Monitor:
- GitHub releases
- Security advisories
- CHANGELOG.md

## Acknowledgments

We thank all security researchers who help improve WebOS Process Manager's security.
