# Database integration issues and observations (24 Oct)

No notes or results from a four-person team run were present in the workspace. The items below are reproducible local integration findings, not claims that they were observed in that team run.

| # | What happened | How to reproduce | Severity | Fixed? |
|---|---|---|---|---|
| 1 | A successful room-layout update emits Mongoose's deprecation warning for the `new` option in `findOneAndUpdate()`. The response still succeeds, but the option should be changed to `returnDocument: 'after'`. | Start the server and send a valid `PUT /api/rooms/main` request; observe the server warning. | low | no |
| 2 | `PUT /api/rooms/:roomId` accepts and persists a layout without authentication. A temporary room was created through localhost without credentials and immediately deleted after verification. If this API is reachable by untrusted clients, they can alter persisted room layouts. | With the server running, send a valid `PUT /api/rooms/<new-id>` request without an Authorization header; it returns 200. | medium | no |

The 21 Oct 50-client Mongo proximity load test recorded 0 failed movement acknowledgements; no database failure was observed in that run. The 23 Oct Atlas index verification also passed for the `2d` geospatial index and 120-second TTL index.
