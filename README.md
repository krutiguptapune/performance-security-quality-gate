# Performance and Security Quality Gate

## Project Overview

This project is an automated quality gate that checks application performance and security before code is merged.

It combines k6 performance testing, OWASP ZAP security scanning, Docker and GitHub Actions.

## Technology Stack

- TypeScript
- JavaScript
- Node.js
- Vitest
- k6
- OWASP ZAP
- OWASP Juice Shop
- Docker
- GitHub Actions

## Main Features

### Performance Testing
- Controlled virtual users
- Ramp-up, steady-state and ramp-down stages
- p95 response time threshold below 500 ms
- HTTP failure rate below 1%

### Security Testing
- Automated OWASP ZAP baseline scan
- Local Juice Shop application using Docker
- JSON and HTML security reports
- Custom TypeScript security report parser
- High-risk finding allowlist

### API Framework
- Reusable API client
- Automatic retries for server errors
- Exponential backoff
- Correlation IDs
- Structured logging
- Unit tests using Vitest

## CI/CD Pipeline

GitHub Actions runs two independent jobs:

1. Performance Testing
2. Security Testing

The pipeline reports failures when configured quality requirements are not met.

## Project Structure

```text
performance-security-quality-gate/
├── .github/
│   └── workflows/
├── performance/
├── security/
├── src/
├── tests/
├── reports/
├── README.md
├── PERFORMANCE.md
└── SECURITY_TESTING.md
```

## Running the Project

Install dependencies:

```bash
npm ci
```

Run unit tests:

```bash
npm test
```

Run performance tests:

```bash
npm run performance
```

Run security checks:

```bash
npm run security:check
```

## What I Learned

- Performance testing with k6
- Security testing with OWASP ZAP
- Docker container management
- API automation using TypeScript
- Retry mechanisms and exponential backoff
- CI/CD automation using GitHub Actions
- Automated quality gates