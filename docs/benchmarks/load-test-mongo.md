# Load test with MongoDB proximity (21 Oct)

- Simulated users: 50 · Duration: 20 s · `USE_MONGO_PROXIMITY=true`
- Users connected: 50/50
- Successful Mongo-backed movement acknowledgements: 1,298
- Failed movement acknowledgements: 0
- Movement ticks skipped while each client had a query in flight: 652
- Approximate successful proximity query rate: 64.9 queries/second
- Server errors/warnings: none observed in the server output during the successful run
- Atlas operations per second (peak): not captured; take a screenshot from Atlas Metrics during a run and add it here
- Conclusion: all simulated users joined and Mongo-backed `$near` queries completed without failed acknowledgements. Per-client backpressure kept the load generator from queuing overlapping movement requests; it skipped 652 scheduled ticks while prior queries were pending. The app-level acknowledgement rate is approximately 64.9 successful proximity queries/second. Atlas's peak operations/second metric remains to be captured from the dashboard.
