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

## 2 Nov — freeze checklist (verified 3 Nov 2026)

- [x] `2d` and TTL indexes exist: `npm.cmd run check:indexes` confirmed `position_2d_roomId_1` with bounds 0–1100 and `updatedAt_1` with expiry 120 seconds.
- [x] `$near` server-side time under 20 ms: the fresh 50-document benchmark reported 0 ms (integer explain precision), with the spatial index in the winning plan. See [final benchmark](benchmarks/geo-benchmark-3-final.md) for both sizes.
- [x] GET/PUT room works and invalid PUT returns 400: a temporary room received a valid PUT (200), GET returned the saved obstacle, and a malformed obstacle PUT returned 400.
- [x] Presence documents appear and disappear correctly: a Socket.IO client joined the temporary room, its record appeared, movement to `[120, 120]` persisted, a Mongo proximity acknowledgement succeeded, and disconnect removed the record.
- [x] Local `.env` is ignored and absent from all fetched Git history; a credential-URI scan of 26 reachable commits found no non-template MongoDB credential URIs. This is a scoped repository check, not proof that no secret was ever published elsewhere or in deleted history.

### Verification scope and cleanup

Checks ran on 3 November against Atlas from this laptop. A temporary local server used port 15003 with `USE_MONGO_PROXIMITY=true`. Only a uniquely named `freeze-*` room and its test presence were used; both were removed and the temporary server was stopped. The `main` room was not edited. TTL expiry was previously verified on 26 October; the fresh lifecycle check verifies normal disconnect removal, not another timed TTL-expiry run.

PowerShell blocked `npm.ps1`, so commands used `npm.cmd`. Atlas checks and Git fetch succeeded with network access enabled. No branch merge was performed.

Freeze scope: database feature development is complete for this checklist; remaining authorization and deployment findings in the issue log are still open. This does not certify the public deployment as ready.
