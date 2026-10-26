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
