# Database demo video plan (30–60 seconds)

Record only after two clients can join the same room and their movement updates are wired to the Presence service.

1. **0–10 s:** Show the office with two connected clients. Say: “This is ProxiSpeak's shared office. User positions are stored in MongoDB Atlas as temporary Presence documents.”
2. **10–25 s:** Move both clients and show the `presences` documents changing in Atlas. Point out `roomId`, `socketId`, and `[x, y]` `position`.
3. **25–40 s:** Show Atlas's Presence indexes. Say: “The 2d index finds nearby avatars on our flat pixel map; the TTL index removes stale positions after 120 seconds.”
4. **40–55 s:** Show the `rooms` collection. Say: “The room document stores the office dimensions and obstacles so the layout persists.”
5. **55–60 s:** Close with the benchmark result, once the real Atlas run has been captured.

Before posting, replace the last step with actual benchmark output, confirm the required tagging and format with the mentor, and never show `.env`, credentials, or the Atlas connection string on screen.
