# Final geospatial benchmark — 3 November 2026

Database: MongoDB Atlas `proxispeak`. Source: `server/scripts/benchmark-geo.js` on `feature/database`. Measurements were made from the developer laptop, not a deployed server.

## Results

| Users | `$near` average (ms) | `$near` p95 (ms) | Server-side `$near` (ms) |
|---:|---:|---:|---:|
| 50 | 56.20 | 90.93 | 0 |
| 5,000 | 87.22 | 119.38 | 2 |

| Users | `$near` max (ms) | `$geoWithin` average (ms) | `$geoWithin` p95 (ms) | `$geoWithin` max (ms) |
|---:|---:|---:|---:|---:|
| 50 | 137.35 | 42.99 | 65.05 | 111.89 |
| 5,000 | 150.02 | 88.81 | 119.52 | 173.47 |

Both explain plans used `GEO_NEAR_2D -> FETCH -> IXSCAN` and index `position_2d_roomId_1`. Both server-side samples were below the guide's 20 ms threshold. A reported 0 ms reflects integer precision, not zero computation.

## Method and reproduction

From `server` in PowerShell:

```powershell
npm.cmd run check:indexes
npm.cmd run bench -- 50
npm.cmd run bench -- 5000
```

- Random positions on a 1000 × 600 pixel plane; query radius 100 pixels.
- Each query type used 20 warm-up queries followed by 200 timed queries.
- Average, p95 and maximum are application round-trip times including network and result transfer.
- Server-side time comes from a separate `$near` explain query at the map centre, not the average of the 200 measured queries.
- The benchmark returns all matches; the application's proximity service separately limits peers. These measurements do not directly establish end-to-end UI latency or concurrent client capacity.
- Runs were sequential and each used a unique temporary room. Cleanup reported all 50 and all 5,000 test documents removed, respectively; no shared room layout was changed.
- Spatial index bounds were confirmed as 0–1100 and TTL expiry as 120 seconds. No application DNS override was used for these successful checks.

## Interpretation

At 5,000 records, the observed `$near` average was 87.22 ms compared with 85.63 ms on 20 October; p95 was 119.38 ms compared with 109.02 ms. The server-side sample remained 2 ms. These are separate random-data sessions with network variability, so the differences alone do not establish a performance regression. This final session is evidence of successful indexed queries at the requested sizes, not a sustained-load guarantee.

Related evidence: [freeze checklist](../persistence-test.md), [20 October benchmark](geo-benchmark-2.md), and [50-client load test](load-test-mongo.md).

## Final social-media video

Publication remains unverified: no final video URL is present in the available project records. The existing [demo video script](../database-demo-video-script.md) can be used to prepare the recording. Add the actual publication URL when available; no video publication is claimed here.
