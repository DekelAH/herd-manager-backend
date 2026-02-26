# Herd Manager Backend

Backend API for the Herd Manager application — a sheep farm management system.

## Tech Stack

- **Runtime:** Node.js + TypeScript
- **Framework:** Express.js
- **Database:** MongoDB (Atlas for production, Compass for development)
- **Auth:** JWT (access + refresh tokens)
- **Validation:** Zod
- **Testing:** Vitest + Supertest + mongodb-memory-server
- **Docs:** Swagger/OpenAPI

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy environment variables:
   ```bash
   cp .env.example .env
   ```

3. Update `.env` with your MongoDB URI and JWT secrets.

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open Swagger docs at `http://localhost:3000/api-docs`

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm start` | Run compiled production build |
| `npm test` | Run tests |
| `npm run test:watch` | Run tests in watch mode |

## Project Structure

```
src/
  config/        # DB connection, env config, Swagger
  middleware/    # Auth, validation, error handling, rate limiting
  modules/       # Feature modules (auth, user, sheep, matching)
  shared/        # Types, utilities, constants
  app.ts         # Express app assembly
  server.ts      # Entry point
```
