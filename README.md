# Wavechat

A project to proove that I can actually program complete products, not just scroll instagram and watch developer influencers on youtube arguing about the next big thing in node, AI or whatever else is the big thing right now.

### Tech stack

- **Frontend**: SvelteKit
- **Backend**: Express.js
- **Database**: SQLite using better-sqlite3
- **ORM**: Drizzle ORM
- **Auth**: better-auth
- **Real-time**: WebSockets

## Things I'd love to implement

_(but half of these probably won't get implemented)_

- [x] Basic auth
- [x] Private channels (direct messages, group chats)
- [x] Server channels
- [ ] Reasonable UI
- [ ] E2EE direct (one on one) messages _(maybe group chats in the future)_
- [ ] Voice calls
- [ ] Group voice calls
- [ ] Docker support
- [ ] Server member permissions
- [ ] OAuth (GitHub)
- [ ] Passkey auth
- [ ] 2FA

## Installation and stuff

### Structure

- `frontend/` SvelteKit app
- `backend/` Express / WebSocket server
- `shared/` Shared types

### Running the damn thing

1. `npm install` in `frontend/`, `backend/` and `shared/`
2. Copy and rename `.env.example` to `.env` in both back and frontend dirs and probably set your own `BETTER_AUTH_SECRET` but for local dev it's not really that important lol
3. `npm run build` in `shared/` to build the shared types
4. `npm run dev` in the frontend and backend
