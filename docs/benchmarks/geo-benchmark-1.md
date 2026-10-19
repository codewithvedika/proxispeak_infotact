# Geospatial benchmark 1

**Run date:** 19 Oct 2026 · **Database:** MongoDB Atlas (`proxispeak`) · **Index:** `{ position: "2d", roomId: 1 }` · **Radius:** 100 pixels  
**Measurements:** 200 timed queries after 20 warm-up queries; round-trip values include network latency. `executionTimeMillis` comes from the MongoDB explain plan.

The script uses a unique temporary room for each run and removes only its own documents afterward. Both runs completed and removed their test documents.

| Users in test room | Query | Average round trip (ms) | p95 (ms) | Server execution (ms) |
|---:|---|---:|---:|---:|
| 50 | `$near` | 43.61 | 65.73 | 0 |
| 50 | `$geoWithin` | 44.60 | 67.62 | — |
| 500 | `$near` | 42.19 | 64.77 | 1 |
| 500 | `$geoWithin` | 42.60 | 63.82 | — |

**Observed plan:** `GEO_NEAR_2D` used `position_2d_roomId_1` for both `$near` explain runs. Server-side query time was under 2 ms in these two runs; the roughly 42–45 ms round-trip average includes Atlas network latency.

**Evidence to attach:** capture a terminal screenshot showing each run and an Atlas screenshot of the Presence collection's Indexes tab.
