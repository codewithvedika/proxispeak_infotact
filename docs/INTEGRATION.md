# Integration log

## Merge order
1. `feature/database` → models, routes, presence service (no one depends on it)
2. `feature/voice` → `client/src/audio`, `client/src/voice`
3. `feature/frontend` → imports the voice module
4. `feature/server` → Lead's code, last

## Daily routine
Lead merges every evening; members run `git merge origin/main` every morning.

## Checklist (Sat 17 Oct)
- [ ] `GET /health` returns status ok
- [ ] `npm run test:movement` passes
- [ ] `npm run test:signaling` passes
- [ ] Two tabs see each other and move
- [ ] Voice connects when close
- [ ] Volume drops when moving away; silent beyond 100 px
- [ ] Mute button works

## Problems found
- [write what failed and who is fixing it]
