# week-1

**Objective: Build the WebSocket server that broadcasts avatar X/Y coordinates, and set up the team repository and branches.**

#### What I did

Created the GitHub repository and the branch plan: main, feature/server, feature/frontend, feature/voice, feature/database. I assigned one branch per team member.
Installed and verified Git, Node.js, npm and VS Code.
Initialised the Node.js and Express backend with express, cors, dotenv and socket.io. I tested the welcome endpoint at GET /.
Built the movement handler, sockets/movement.js. It keeps connected users in memory and checks that coordinates are valid numbers. It also keeps positions inside the 1000×600 map.
Added the real-time events users:current, users:joined, movement:update, movement:updated and users:left.
Pushed the backend to GitHub on feature/server.



# week-2

**Objective: Proximity calculation within a 100-pixel radius, signaling only for users in range, and integration of the team’s work.**

#### What I did

Created the shared files for the whole team: shared/constants.json (hearing radius 100, map size, limits), shared/events.json, docs/CONTRACTS.md, .gitignore and server/.env.example.
Built the proximity engine, sockets/proximity.js. It finds users within 100 px of each other and sends proximity:enter and proximity:leave when that changes. 
Built the signaling relay, sockets/signaling.js. It forwards webrtc:offer, webrtc:answer and webrtc:ice-candidate only between users who are in range.
Wrote three test scripts. A movement test passed. A signaling test passed: offers go through when users are near and are blocked when they are far. A 50-user load test connected [n]/50 users .
Merged teammates’ branches into main and set up the team’s daily merge routine. 
Documented the API and events in docs/API.md.