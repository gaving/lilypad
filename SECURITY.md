# Security Policy

## Supported Versions

We release patches for security vulnerabilities for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 10.x    | :white_check_mark: |
| < 10.0  | :x:                |

## Reporting a Vulnerability

We take the security of Lilypad seriously. If you believe you have found a security vulnerability, please report it to us as described below.

### How to Report

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report security vulnerabilities via GitHub's private vulnerability reporting:

1. Go to the [Security tab](https://github.com/anomalyco/lilypad/security) of this repository
2. Click on "Report a vulnerability" under the "Private vulnerability reporting" section
3. Fill in the vulnerability details

Alternatively, you can email security concerns to: security [at] anomaly.co

### What to Include

Please include the following information in your report:

- **Type of vulnerability** (e.g., XSS, SSRF, injection, etc.)
- **Full paths of source file(s)** related to the vulnerability
- **Step-by-step instructions** to reproduce the issue
- **Proof-of-concept or exploit code** (if possible)
- **Impact of the issue**, including how an attacker might exploit it

### Response Timeline

We will respond to security reports within **72 hours**. Our process:

1. **Acknowledgment**: We'll confirm receipt of your vulnerability report within 72 hours
2. **Investigation**: We'll investigate and validate the vulnerability
3. **Fix Development**: We'll work on a fix and may reach out for additional information
4. **Disclosure**: Once fixed, we'll publicly disclose the vulnerability (with credit to the reporter if desired)

## Security Best Practices

When deploying Lilypad in production:

- **Do not expose the Docker socket** to untrusted networks
- **Use HTTPS** for all communications
- **Keep dependencies updated** - we use Dependabot to track vulnerabilities
- **Run with minimal privileges** - the container doesn't need root access
- **Use environment variables** for sensitive configuration, never commit secrets

## Security Features

Lilypad implements the following security measures:

- ✅ Input validation on all container/image IDs (prevents SSRF)
- ✅ Rate limiting on static file serving
- ✅ Dependency scanning with Dependabot
- ✅ Code scanning with CodeQL
- ✅ Container ID validation against injection attacks

## Known Limitations

- **No built-in authentication**: Lilypad is designed for trusted network environments. If you need authentication, consider placing it behind a reverse proxy with auth (e.g., nginx with basic auth, or OAuth2 proxy).
- **Docker socket access**: Lilypad requires access to the Docker socket for container management. This is inherently a privileged operation.

## Acknowledgments

We thank the following security researchers who have responsibly disclosed vulnerabilities:

- GitHub CodeQL team for automated security scanning
- Dependabot for dependency vulnerability alerts

## Security Updates

Security updates will be released as patch versions (e.g., 10.0.1). We recommend:

1. Watching this repository for releases
2. Enabling Dependabot alerts for your fork
3. Regularly updating to the latest version

## Related Resources

- [GitHub Security Advisories](https://github.com/anomalyco/lilypad/security/advisories)
- [Dependabot Alerts](https://github.com/anomalyco/lilypad/security/dependabot)
- [Code Scanning Alerts](https://github.com/anomalyco/lilypad/security/code-scanning)

---

*Last updated: February 2026*
