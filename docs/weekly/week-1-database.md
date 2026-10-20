# Week 1 Work Report — Database

**Reporting period:** 13–20 October 2026  
**Role:** Member 4 — Database  
**Branch:** `feature/database`

## Summary

Built the MongoDB database layer for ProxiSpeak, connected the database and REST route modules to the Express server, and measured geospatial queries in MongoDB Atlas at up to 5,000 temporary presence records.

## Work completed

- Added the Mongoose connection module and `User`, `Room`, and `Presence` models.
- Added the default `main` room layout with five obstacles and a seed script.
- Created the Presence unique socket ID, 120-second TTL, and flat-plane 2d geospatial indexes.
- Added room and user REST route modules and a presence service that batches queued writes every 300 ms and supports heartbeats.
- Merged the backend server branch and added Mongoose, the seed command, and the benchmark command.
- Connected MongoDB at server startup and mounted the room and user routes.
- Added the database reference, benchmark notes, and a video recording plan.
- Resolved the laptop's MongoDB Atlas SRV lookup problem by correcting Windows DNS settings; a direct MongoDB connection then worked without a Node DNS override.
- Ran Atlas geospatial benchmarks with 50, 500, and 5,000 temporary presence records. Every run used the `position_2d_roomId_1` index and removed its temporary records afterward.

## Benchmark results

Each query type used 20 warm-up queries followed by 200 measured queries. Round-trip values include network latency and result transfer. Server-side values come from the `$near` explain plan.

| Run date | Users | `$near` average / p95 (ms) | `$geoWithin` average (ms) | `$near` server-side (ms) |
|---|---:|---:|---:|---:|
| 19 Oct | 50 | 43.61 / 65.73 | 44.60 | 0 |
| 19 Oct | 500 | 42.19 / 64.77 | 42.60 | 1 |
| 20 Oct | 500 | 50.73 / 63.31 | 53.25 | 0 |
| 20 Oct | 5,000 | 85.63 / 109.02 | 119.86 | 2 |

The `$near` plan used the geospatial index for all measured sizes. Reported server-side execution was 0–2 ms; the 5,000-record round-trip averages were higher, particularly for `$geoWithin`. These measurements represent one run per size, not a long-term performance guarantee.

Detailed results are in [benchmark 1](../benchmarks/geo-benchmark-1.md) and [benchmark 2](../benchmarks/geo-benchmark-2.md).

## Commits

| Date | Commit | Summary |
|---|---|---|
| 13 Oct | `52fc15c` | MongoDB connection, models, and geospatial service |
| 16 Oct | `b17b16f` | Database seeding, room/presence models, and routes |
| 17 Oct | `77f71f8` | Merge backend server branch into database branch |
| 17 Oct | `f5465ec` | Add Mongoose dependency and seed command |
| 19 Oct | `11dc806` | Database documentation, benchmark scripts, and server configuration |
| 20 Oct | `7a4a270` | Benchmark geospatial queries at higher user counts |

## Remaining work

- Capture and attach the benchmark terminal and Atlas index screenshots.
- Connect Socket.IO movement events to the presence service after the client and its movement event contract are available. The current repository snapshot does not include the client.
- Record the planned 30–60 second demo and confirm its posting format and tagging with the mentor.

## Next week

Prepare the Mongo-backed load test and continue the presence integration when the client movement event contract is available.
