# 001 - Backend Architecture

## Overview

Build a scalable, secure Node.js/Express/TypeScript backend with MongoDB, JWT auth (access + refresh tokens), multi-tenant data isolation, Zod validation, Vitest testing, and Swagger API docs -- replacing the frontend's localStorage mock services with a real API.

## Architecture: Module-Based Layered Design

Each feature lives in its own module folder with a consistent internal structure. Layers are strictly separated: **Routes -> Controllers -> Services -> Models**.

```
Frontend (React) --HTTP + JWT--> Routes -> Middleware (auth, validate, rateLimit) -> Controllers -> Services -> Models -> MongoDB
```

## Folder Structure

```
herd-manager-backend/
  src/
    config/
      db.ts              # Mongoose connection (Atlas URI vs local)
      env.ts             # Env var loading + validation
      swagger.ts         # Swagger/OpenAPI setup
    middleware/
      auth.ts            # JWT verification, attach user to req
      validate.ts        # Generic Zod validation middleware
      errorHandler.ts    # Centralized error handling
      rateLimiter.ts     # express-rate-limit config
    modules/
      auth/
        auth.controller.ts
        auth.service.ts
        auth.routes.ts
        auth.validation.ts
        auth.test.ts
      user/
        user.model.ts
        user.controller.ts
        user.service.ts
        user.routes.ts
        user.validation.ts
      sheep/
        sheep.model.ts
        sheep.controller.ts
        sheep.service.ts
        sheep.routes.ts
        sheep.validation.ts
        sheep.test.ts
      matching/
        matching.controller.ts
        matching.service.ts
        matching.routes.ts
        matching.test.ts
    shared/
      types/
        index.ts          # Shared TS interfaces (Request extensions, etc.)
      utils/
        apiError.ts       # Custom error class with status codes
        asyncHandler.ts   # Wraps async route handlers
      constants/
        index.ts          # Breeding ages, gestation period, fertility map
    app.ts               # Express app assembly (middleware, routes, swagger)
    server.ts            # Entry point: connect DB then listen
  tests/
    setup.ts             # Vitest global setup (in-memory MongoDB)
  .env.example
  tsconfig.json
  vitest.config.ts
  package.json
  README.md
```

Why module-based? Adding a new feature (e.g., "veterinary visits") means adding one folder under `modules/` without touching anything else.

## Data Models

### User
- `username` (unique, required)
- `email` (unique, required)
- `password` (bcrypt hashed)
- `farmName`
- `refreshTokens` (array of hashed tokens with expiry)
- Timestamps

### Sheep
- `tagNumber` (unique per user)
- `gender` (enum: male/female)
- `birthDate`
- `mother` / `father` (ObjectId refs to Sheep, nullable)
- `weight`, `breed`, `fertility` (enum: AA/B+/BB)
- `isPregnant`, `pregnancyStartDate`
- `healthStatus` (enum: healthy/needs attention)
- `notes`
- **`owner`** (ObjectId ref to User -- multi-tenancy key)
- Timestamps

Compound index on `{ owner: 1, tagNumber: 1 }` for uniqueness per farm.

## API Endpoints

- **Auth**
  - POST `/api/auth/signup` -- Register new user + farm
  - POST `/api/auth/login` -- Returns access + refresh tokens
  - POST `/api/auth/refresh` -- Rotate refresh token
  - POST `/api/auth/logout` -- Invalidate refresh token
  - GET `/api/auth/me` -- Current user profile

- **User**
  - PUT `/api/users/profile` -- Update email/farmName

- **Sheep**
  - GET `/api/sheep` -- List all (with filter/search query params)
  - GET `/api/sheep/:id` -- Get one
  - POST `/api/sheep` -- Create
  - PUT `/api/sheep/:id` -- Update
  - DELETE `/api/sheep/:id` -- Delete (blocked if has offspring)
  - GET `/api/sheep/:id/family` -- Mother, father, siblings, offspring

- **Matching**
  - GET `/api/matching/:sheepId` -- Compatible matches for a sheep
  - GET `/api/matching/stats` -- Breeding statistics

## Security Layers

- **helmet** -- secure HTTP headers
- **cors** -- whitelist frontend origin
- **express-rate-limit** -- 20 req/15min for auth routes, 300 for general
- **bcrypt** -- password hashing (12 salt rounds)
- **JWT** -- access token (15min, in Authorization header) + refresh token (7 days, rotated on use, hashed in DB)
- **Zod** -- request body/params/query validation on every route
- **Owner scoping** -- every sheep query includes `{ owner: req.user.id }` to enforce data isolation

## Key Dependencies

- `express`, `mongoose`, `zod`, `bcrypt`, `jsonwebtoken`
- `helmet`, `cors`, `express-rate-limit`, `cookie-parser`
- `swagger-jsdoc`, `swagger-ui-express`
- `dotenv`
- Dev: `typescript`, `tsx` (for dev server), `vitest`, `mongodb-memory-server`, `supertest`

## Environment Config

`.env.example` with:
- `PORT=3000`
- `MONGODB_URI=mongodb://localhost:27017/herd-manager` (local Compass)
- `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`
- `JWT_ACCESS_EXPIRES_IN=15m`, `JWT_REFRESH_EXPIRES_IN=7d`
- `CORS_ORIGIN=http://localhost:5173`
- `NODE_ENV=development`

## Testing Strategy

- **Vitest** + **mongodb-memory-server** for isolated DB per test suite
- **supertest** for HTTP integration tests
- Test files co-located with their modules (`auth.test.ts`, `sheep.test.ts`, etc.)
- Focus on: auth flows, CRUD operations, ownership scoping, matching logic, validation rejection

## Progress

- [x] Project initialization (package.json, tsconfig, vitest, .env, .gitignore, README)
- [x] Config layer (env validation, MongoDB connection, Swagger setup)
- [x] Shared utilities (ApiError, asyncHandler, constants, types)
- [x] Middleware (auth JWT, validate Zod, errorHandler, rateLimiter)
- [x] User model + auth module (signup, login, refresh, logout, me)
- [x] Sheep module (model, CRUD, search/filter, family, owner-scoped)
- [x] Matching module (compatibility scoring, breeding stats)
- [x] User profile update endpoint
- [x] Swagger/OpenAPI docs (inline in route files)
- [x] App + server entry points
- [x] Tests passing -- 31/31 (fixed: Zod .issues, Mongoose async hooks, Express read-only req.query, bcrypt 72-byte truncation for JWT hashing)
