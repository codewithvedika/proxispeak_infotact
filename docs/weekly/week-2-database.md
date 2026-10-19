# Week 2 report — Database (progress through 19 Oct)

**Branch:** `feature/database` · **Week:** 12–18 Oct 2026 · **Updated:** 19 Oct 2026

## Work completed

- Added the MongoDB connection module and Atlas-backed Mongoose schemas for users, rooms, and live presence.
- Seeded the `main` office room and verified its five obstacles in Atlas.
- Created the Presence unique socket, TTL, and 2d geospatial indexes; the 2d index uses the flat pixel map.
- Added room and user route modules plus a batched presence service.
- Merged the backend branch and added Mongoose and the seed command.
- Added and ran a repeatable `$near`/`$geoWithin` benchmark against Atlas with 50 and 500 temporary users; both runs cleaned up their test records.

## Commits

| Date | Commit | Change |
|---|---|---|
| 13 Oct | `52fc15c` | MongoDB connection, models, and geospatial service |
| 16 Oct | `b17b16f` | Database seeding, room/presence models, and routes |
| 17 Oct | `77f71f8` | Merge backend server branch into database branch |
| 17 Oct | `f5465ec` | Add Mongoose dependency and seed package command |

## Evidence still to attach

- Atlas screenshot showing the `rooms` and `presences` collections and Presence indexes.
- Benchmark terminal screenshots for the 50- and 500-user runs; measured values are recorded in `docs/benchmarks/geo-benchmark-1.md`.
- GitHub link to the `feature/database` commit history.

## Issue encountered and resolution

Node initially could not resolve the Atlas SRV record with the default DNS resolver. After updating the laptop's DNS settings, a direct Mongoose connection succeeded without an in-process DNS override.

## What I learned

MongoDB's `2d` index is appropriate for this office's pixel coordinates; `2dsphere` is for geographic coordinates. Round-trip query times include internet latency, while `executionTimeMillis` measures database-side execution.

## Next

Capture the required Atlas and terminal screenshots, finish Socket.IO presence integration once the client movement event contract is available, then record the video using `docs/database-demo-video-script.md` and confirm the posting format with the mentor.
