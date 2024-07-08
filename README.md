# PULSE
[Project Plan](https://docs.google.com/document/d/1U9uEtUsyl6Beo5HP-gf2QxNXOfDI54W2FzqRf2XchrI/edit#heading=h.hzjrfh6fsp6b)

## How to Use
### Frontend
```npm install react-router-dom axios ```

.env file should have VITE_BACKEND_URL which is the base URL for localhost (use localhost:3000) and API key for retrieving news data from [newsdata.io](newsdata.io) called NEWSDATA_API_KEY

```npm run dev``` to start frontend server

### Backend
```npm install @prisma/client express cors bcrypt @supabase/supabasejs ```

.env file should have SUPABASE_URL which is postgres uri for database, SUPABASE_KEY which is client key for database, and SUPA_URL which is the https URL to database.

```node index.js``` to run backend server

