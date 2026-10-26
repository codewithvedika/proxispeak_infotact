# Week 3 report — Database

**Name:** Member 4 · **Branch:** `feature/database` · **Week:** 3 (19–25 Oct)

## What I built this week
- Ran higher-count geospatial benchmarks at 500 and 5,000 simulated presences; documented results in `docs/benchmarks/geo-benchmark-2.md`.
- Added a Mongo-backed Socket.IO proximity load test for 50 simulated users over 20 seconds. The final run connected 50/50 users and recorded 1,298 successful proximity acknowledgements with 0 failed acknowledgements.
- Tested `PUT /api/rooms/main` and read the saved sample layout back; added `docs/sample-layout.json`.
- Added an index verification script and confirmed the `2d` index bounds are 0–1100 and the `updatedAt` TTL is 120 seconds.
- Added database integration findings in `docs/issues-database.md`. The social-media video script exists, but publication was not verified.

## My commits this week
| Date | Commit message | What it changed |
|---|---|---|
| 19 Oct | `feat: add database documentation, benchmark scripts, and update server configuration` | Database reference, benchmark tooling, and server configuration |
| 20 Oct | `Benchmark geospatial queries at higher user counts` | Higher-load geospatial benchmark evidence |
| 20 Oct | `feat: add Week 1 work report for database, including benchmarks and resolved issues` | Week 1 write-up |
| 21 Oct | `Add load test results with Mongo proximity` | Socket.IO/Mongo proximity load runner and result report |
| 21 Oct | `Record Atlas load metrics for 21 Oct` | Atlas Opcounters sample added to the load report |
| 22 Oct | `Add sample room layout for persistence test` | Sample persisted room layout |
| 24 Oct | `Add script to verify geospatial and TTL indexes` | Index verification script and npm command |
| 24 Oct | `Add database issues from team test` | Local integration findings and test evidence caveat |

## Evidence
- `docs/benchmarks/geo-benchmark-2.md`
- `docs/benchmarks/load-test-mongo.md` (Atlas Metrics screenshot was shared in chat, not saved in the repo)
- `docs/sample-layout.json`
- `docs/issues-database.md`
- GitHub branch commits: `feature/database`

## Problems I faced and how I solved them
- The machine's default DNS path intermittently refused MongoDB SRV lookups. Using Node's explicit public DNS resolver during local test commands allowed the Atlas operations to complete; no machine-wide DNS setting was committed.
- The first load-runner pass issued overlapping movements and timed out. I changed it to apply per-client backpressure, then reran it with 0 failed acknowledgements.
- No notes from the four-person team test were available, so the issue log distinguishes verified local findings from team-run observations.

## What I learned
- A `2d` index is appropriate for the office's flat pixel coordinates; the configured bounds must cover the map.
- MongoDB TTL cleanup is asynchronous, so expiration should be verified after allowing the TTL monitor time to run.
- Atlas Opcounters use a one-minute sample here; their displayed rate is not an instantaneous 20-second peak.

## Plan for next week
- Verify room layout persistence across server restarts and check stale-presence TTL cleanup.
- Document Atlas network settings and deployment latency, then address integration issues found in testing.
- Add the layout editing utility and database code walkthrough materials.
