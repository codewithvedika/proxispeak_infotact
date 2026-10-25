# ProxiSpeak Contracts (owner: Team Lead — do not edit without asking)

## Constants
See `shared/constants.json`. Hearing radius = **100 px** (Infotact project doc). Map = 1000 × 600.

## User object
{ id: socketId, userId: string|null, name, color, roomId, x, y }

## Socket events
| Constant | Event | Direction | Payload |
|---|---|---|---|
| USERS_CURRENT | users:current | server → new client | User[] (includes self) |
| USERS_JOINED | users:joined | server → others | User |
| USERS_LEFT | users:left | server → room | { id } |
| MOVEMENT_UPDATE | movement:update | client → server | { x, y } |
| MOVEMENT_UPDATED | movement:updated | server → others | { id, x, y } |
| PROXIMITY_ENTER | proximity:enter | server → client | { peerId } |
| PROXIMITY_LEAVE | proximity:leave | server → client | { peerId } |
| WEBRTC_OFFER | webrtc:offer | client → server → client | { to, sdp } → { from, to, sdp } |
| WEBRTC_ANSWER | webrtc:answer | same | { to, sdp } → { from, to, sdp } |
| WEBRTC_ICE | webrtc:ice-candidate | same | { to, candidate } → { from, to, candidate } |

## WebRTC rule
When both users receive `proximity:enter` for each other, the one with the **smaller socket id** creates the offer.

## Audio formula (client)
d = hypot(x2 - x1, y2 - y1)
gain = d >= R ? 0 : 1 - d / R          (R = HEARING_RADIUS)
gain *= OBSTACLE_GAIN for each obstacle crossed by the line between the two avatars
pan = clamp((x2 - x1) / R, -1, 1)

## MongoDB
Collection `presences`: { socketId, roomId, name, color, position: [x, y], updatedAt }
Index: { position: "2d", roomId: 1 } with min 0, max MAP_WIDTH + 100  (flat pixel plane, NOT 2dsphere)
Collection `rooms`: { roomId, name, width, height, obstacles: [{ id, x, y, w, h, label }] }

## REST
GET /health · GET /api/rooms/:roomId · PUT /api/rooms/:roomId · POST /api/users · GET /api/users
