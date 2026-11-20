# Security Testing

## Objective

Identify potential security issues using OWASP ZAP.

## Target Application

OWASP Juice Shop:

http://localhost:3000

The application runs locally using Docker.

## Tools

- Docker
- OWASP Juice Shop
- OWASP ZAP

## Scan Type

OWASP ZAP Baseline Scan.

The baseline scan primarily uses passive scanning to identify common security issues.

It is not a full penetration test.

## Running Juice Shop

```bash
docker run -d \
  --name juice-shop \
  -p 3000:3000 \
  bkimminich/juice-shop
```

## Running ZAP

The GitHub Actions workflow automatically starts Juice Shop and runs the ZAP baseline scan.

## Security Reports

Two reports are generated:

- zap-report.json
- zap-report.html

## Security Quality Gate

A custom TypeScript parser reads the JSON report.

The pipeline fails when unaccepted High-risk findings exist.

## Allowlist

Accepted findings must include:

- ZAP plugin ID
- Alert name
- Exact affected URL
- Documented reason

Allowlisting does not fix a vulnerability. It records a reviewed exception.

## Risk Levels

| Level | Meaning |
|---|---|
| High | Serious security concern |
| Medium | Important security concern |
| Low | Lower security concern |
| Informational | Additional security information |

Only unaccepted High-risk findings block this project's security gate.