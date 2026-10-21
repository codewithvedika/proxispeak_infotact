# Load test with MongoDB proximity (21 Oct)

- Simulated users: 50 · Duration: 20 s · `USE_MONGO_PROXIMITY=true`
- Users connected: 50/50
- Successful Mongo-backed movement acknowledgements: 1,298
- Failed movement acknowledgements: 0
- Movement ticks skipped while each client had a query in flight: 652
- Approximate successful proximity query rate: 64.9 queries/second
- Server errors/warnings: none observed in the server output during the successful run
- Atlas Opcounters on the primary at the hovered peak sample (21 Oct 2026, 12:28:28): query 24.1/s, command 1.88/s, delete 0.54/s, insert/update/getmore 0/s; approximately 26.52 total operations/s at that sample.
- Atlas granularity: 1 minute. The values above are the hovered Atlas sample, not an instantaneous 20-second peak.
- Conclusion: all simulated users joined and Mongo-backed `$near` queries completed without failed acknowledgements. Per-client backpressure kept the load generator from queuing overlapping movement requests; it skipped 652 scheduled ticks while prior queries were pending. The app-level acknowledgement rate was approximately 64.9 successful proximity queries/second. Atlas's primary-node Opcounters sample at the visible spike was approximately 26.52 operations/second (24.1 queries/s, 1.88 commands/s, 0.54 deletes/s).
