# Geospatial benchmark 2 (20 Oct 2026)

**Database:** MongoDB Atlas (`proxispeak`) · **Index:** `{ position: "2d", roomId: 1 }` · **Radius:** 100 pixels  
**Method:** 200 timed queries after 20 warm-up queries per query type. Round-trip averages and p95 include network latency. Server-side times are from `$near` explain plans.

| Users | `$near` avg (ms) | `$near` p95 (ms) | `$geoWithin` avg (ms) | `$near` server-side (ms) |
|---:|---:|---:|---:|---:|
| 50 | 43.61 | 65.73 | 44.60 | 0 |
| 500 | 50.73 | 63.31 | 53.25 | 0 |
| 5000 | 85.63 | 109.02 | 119.86 | 2 |

## Result

The `$near` plan used `position_2d_roomId_1` at every size. Its reported server-side execution remained 0–2 ms as the dataset grew from 50 to 5000 documents. Round-trip latency rose at 5000 documents (85.63 ms average), and `$geoWithin` rose to 119.86 ms average; those timings include transferring results and network latency. Each run used a unique temporary room and removed all test documents afterward.

The 50-user baseline is from 19 Oct. The 500- and 5000-user measurements were run on 20 Oct. This is one benchmark session per size, so treat timings as a sample rather than a long-term performance guarantee.
