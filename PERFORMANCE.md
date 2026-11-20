# Performance Testing

## Objective

Evaluate API performance under controlled traffic using k6.

## Target Application

Restful Booker API:

https://restful-booker.herokuapp.com

## Load Profile

| Stage | Duration | Virtual Users |
|---|---|---|
| Ramp-up | 5 seconds | 1 |
| Ramp-up | 15 seconds | 2 |
| Steady state | 20 seconds | 2 |
| Ramp-down | 5 seconds | 0 |

## Performance Thresholds

| Metric | Target |
|---|---|
| p95 response time | Below 500 ms |
| HTTP failure rate | Below 1% |
| Successful checks | Above 99% |

## Why These Thresholds?

The 500 ms p95 target is an initial project performance objective.

The 1% error-rate limit helps identify unreliable API behaviour.

These values are project-specific targets, not universal industry standards.

## Test Execution

```bash
npm run performance
```

## Understanding Results

- p95: Response time within which 95% of requests complete.
- Average: Average response time.
- HTTP failures: Percentage of failed HTTP requests.
- Checks: Percentage of successful response checks.
- VUs: Number of active virtual users.

## Test Results

Record actual measurements from the generated GitHub Actions performance report.

Do not assume that meeting the thresholds on one run guarantees future performance.