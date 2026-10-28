# Persistence test (26 Oct)

| Test | Expected | Result |
|---|---|---|
| PUT new layout → restart server → GET | Same layout returned | Passed: the `main` room lounge at `(760, 470)` was returned by `GET /api/rooms/main` after restarting the local server. The documented sample layout was restored after the check. |
| Stop server with users connected → wait 2–3 min | Stale `presences` are deleted by TTL | Passed: a test socket's Presence record remained immediately after shutdown, then was removed by the 120-second TTL after waiting beyond its expiry. |
| Run `npm run seed` again | Default layout restored | Passed: the seed command restored the default lounge position `(700, 420)`. The documented sample layout `(750, 480)` was restored after this check. |

## Notes
- After the server restart, a new test socket joined `main` successfully and received an `{ ok: true }` acknowledgement. This verifies a fresh presence can be written after restart; automatic reconnection of a real frontend client was not tested.
- Test layout used a temporary lounge position `(760, 470)`. The persisted room was restored to the sample layout from `docs/sample-layout.json` after the persistence check.
- The disconnected test Presence was removed by TTL. No test Presence records were intentionally left behind.

## 28 Oct — live site
- Render logs and the deployed `/health` endpoint were not checked because the service URL/log access was not available in this workspace; no live-site MongoServerError is claimed.
- Local bug found and fixed: Mongoose deprecated the `new` option in the room `findOneAndUpdate`. Changed it to `returnDocument: 'after'` in `server/src/routes/rooms.js`.
- Result: the local server connected to MongoDB and `PUT /api/rooms/main` returned the persisted layout without the previous deprecation warning.
- Remaining finding: the room-layout `PUT` endpoint has no authorization middleware. See `docs/issues-database.md`; resolving it requires the team's authentication/authorization contract.
