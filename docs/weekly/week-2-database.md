# Week 2 report — Database

**Name:** Avinash Manohar Pednekar · **Branch:** `feature/database` · **Week:** 2 (14–18 Oct)

## What I built this week
- MongoDB Atlas cluster (M0 Free, AWS Mumbai), database user, network access and connection module (`src/db/connect.js`)
- User, Room and Presence schemas with 2d geospatial index (flat pixel plane, bounds 0–1100) and 120 s TTL
- REST routes for rooms (`GET`/`PUT` with validation) and users (`POST`/`GET`)
- Presence service with throttled bulk writes (every 300 ms), heartbeat (every 30 s) and TTL cleanup
- Seed script to initialise the default office layout
- Geospatial benchmark (`$near` and `$geoWithin`) at 50 and 500 users

## My commits this week
| Date | Commit message | What it changed |
|---|---|---|
| 14 Oct | Initial Atlas setup and connection module | `src/db/connect.js`, `.env.example` |
| 15 Oct | Add User, Room and Presence models with 2d index and seed script | Models, defaultRoom config, seed script |
| 16 Oct | Add REST routes and throttled presence service | Routes, presence service, server integration |
| 17 Oct | Add geospatial benchmark script and first results | `scripts/benchmark-geo.js`, `docs/benchmarks/geo-benchmark-1.md` |

## Evidence
- `docs/benchmarks/geo-benchmark-1.md` — benchmark results at 50 and 500 users
- GitHub branch commits: `feature/database`

## Problems I faced and how I solved them
- Atlas connection initially timed out due to DNS resolution issues; switching to a public DNS resolver resolved it
- The `2d` index `min`/`max` bounds must cover the full map (0–1100) or insertions fail with a coordinate out-of-range error

## What I learned
- A `2d` index is correct for a flat pixel grid; `2dsphere` is for latitude/longitude on a globe
- Batch writes (`bulkWrite`) prevent database overload from per-keystroke position updates
- TTL indexes let MongoDB automatically clean up stale documents without application-level cron jobs

## Plan for next week
- Higher-load benchmarks (500 / 5000 users), load test with Mongo-backed proximity
- Layout API testing, index verification, database documentation and social-media video

