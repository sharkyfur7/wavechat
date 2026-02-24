# wavechat

Backend and frontend are pretty self explanitory.  
Tech stack right now is Sveltekit frontend, Express.js backend, Drizzle and SQLite for db stuff and better-auth for auth.

## Running

- Clone and `npm install` in the root dir (unnecessary), `frontend` and `backend`
- Copy and rename `.env.example` in both dirs and probably set your own `BETTER_AUTH_SECRET` in the backend but for local dev it's not really needed lol
- Then either `npm run dev` if you've npm installed the root dir or cd into the frontend separately and backend and `npm run dev` in both
