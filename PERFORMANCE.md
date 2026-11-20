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

## Actual Test Execution Results

The following results were recorded during a local
k6 performance test.

| Metric | Result |
|---|---:|
| Total requests | 46 |
| Average response time | 463.5 ms |
| p90 response time | 544.48 ms |
| p95 response time | 587.6 ms |
| Failed requests | 0% |
| Successful checks | 100% |
| Maximum virtual users | 2 |

### Analysis

The API returned successful responses for all 46
requests, with no HTTP failures.

However, the p95 response time was 587.6 ms,
exceeding the configured 500 ms target.

Therefore, the performance threshold failed.

The target remains unchanged. Results from a
public demo API can vary depending on network
conditions and server load.