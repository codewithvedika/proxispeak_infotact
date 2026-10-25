# API reference

## REST (base `http://localhost:5000`)
| Method | Path | Body | Response |
|---|---|---|---|
| GET | `/` | – | `{ app, message }` |
| GET | `/health` | – | `{ status, users, mongo, hearingRadius }` |
| GET | `/api/rooms/:roomId` | – | room with `obstacles[]` (default layout if none stored) |
| PUT | `/api/rooms/:roomId` | `{ name, obstacles:[{id,x,y,w,h,label}] }` | saved room |
| POST | `/api/users` | `{ name }` | created user |
| GET | `/api/users` | – | latest 100 users |

## Socket.IO
Connection query: `name`, `roomId`, `userId`.

| Event | Direction | Payload |
|---|---|---|
| `users:current` | server → new client | user list |
| `users:joined` | server → others | user |
| `users:left` | server → room | `{ id }` |
| `movement:update` | client → server | `{ x, y }` (validated, clamped to 1000×600) |
| `movement:updated` | server → others | `{ id, x, y }` |
| `proximity:enter` | server → client | `{ peerId }` (within 100 px) |
| `proximity:leave` | server → client | `{ peerId }` |
| `webrtc:offer` / `webrtc:answer` | client ↔ client via server | `{ to, sdp }` → `{ from, to, sdp }` |
| `webrtc:ice-candidate` | client ↔ client via server | `{ to, candidate }` → `{ from, to, candidate }` |

Signaling is only relayed if the sender and target are currently within the hearing radius.
