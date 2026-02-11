# QResto - Copilot Instructions

## Project Overview

**QResto** is a restaurant management system combining a QR-based digital menu with a real-time order management system. The architecture separates concerns across Express backend, Next.js frontend, and PostgreSQL database with real-time capabilities via Socket.io.

---

## Architecture & Data Flow

### Core Stack
- **Backend**: Express.js 5.x (CommonJS) + Prisma ORM + Socket.io
- **Frontend**: Next.js 14 with App Router + Zustand + Axios
- **Database**: PostgreSQL 16 with Prisma migrations
- **Deployment**: Docker Compose (local), Railway (production)

### Critical Business Rules
- **Location Validation**: 50m radius from restaurant GPS (stored in `Restaurant.locationRadius`)
- **Session Management**: 30-minute maximum table session (stored in `Restaurant.sessionTimeout`)
- **Treats System**: Inter-table "treat" gifts (desserts) with approval workflow

### Data Model Key Relations
```
Restaurant → Categories → MenuItems → OrderItems → Orders
                       ↓ Serves customers via Tables
Table → Sessions (customer table occupancy)
      → Treats (sent/received between tables)
```

---

## Backend Patterns (Express/Prisma)

### Route & Controller Pattern
Routes in `src/routes/*.routes.js` delegate to controllers in `src/controllers/*.controller.js`:
```javascript
// Example: /src/routes/menu.routes.js
router.get('/', authenticate, menuController.getItems);
router.post('/', authenticate, menuController.create);
```
Controllers inject Prisma queries and return either `res.json()` or `next(error)` (error handler catches all).

### Authentication
- **Middleware**: [authenticate.js](../../backend/src/middleware/authenticate.js) extracts JWT from `Authorization: Bearer <token>` header
- **Token Storage**: JWT verified with `JWT_SECRET`, decoded `restaurantId` attached to `req.restaurant`
- **Token Refresh**: Frontend handles 401 responses by calling `/auth/refresh-token` with refresh token

### Database Queries & Indexes
Key queries are optimized with indexes on:
- `Restaurant.email`, `Restaurant.slug`, `Restaurant.[latitude, longitude]`
- `Table.qrCode` (unique per restaurant, used in public menu access)
- `Order.restaurantId`, `Session.tableId`

### Socket.io Integration
Server initializes Socket.io in [index.js](../../backend/src/index.js) and exposes via `app.set('io', io)`. Controllers access via `req.app.get('io')` for broadcasting (e.g., new orders to kitchen display).

---

## Frontend Patterns (Next.js + Zustand)

### State Management with Zustand
Stores in `src/stores/*.ts` use the `persist` middleware to save state to localStorage:
```typescript
export const useAuthStore = create<AuthState>()(
    persist((set, get) => ({ ... }), { name: 'auth-store' })
);
```
Key stores: `authStore` (restaurant login), `orderStore`, `cartStore`, `kitchenStore`.

### API Layer Pattern
[api.ts](../../frontend/src/lib/api.ts) provides an Axios instance with:
- **Request Interceptor**: Auto-appends `accessToken` from localStorage to all requests
- **Response Interceptor**: Catches 401 errors and attempts token refresh before retry

### Real-time Socket Connection
[socket.ts](../../frontend/src/lib/socket.ts) exports a singleton `SocketService` class. Components call:
```typescript
socketService.connect();
socketService.joinRestaurant(restaurantId);  // Listen to events
```
Events emitted by backend include: `new-order`, `order-updated`, `treat-request`, etc.

### Page Organization
- `app/admin/` – Protected restaurant dashboard (uses auth middleware)
- `app/menu/[qrCode]/` – Public customer menu (no auth, location-validated by backend)
- `app/kitchen/` – Order display for kitchen staff (real-time via Socket.io)
- `app/order/[orderNumber]/` – Customer order status tracking

---

## Development Workflow

### Local Setup
```bash
# Backend
cd backend && npm install
cp .env.example .env
npx prisma generate
npx prisma db push
npm run dev  # Runs on http://localhost:3001

# Frontend
cd ../frontend && npm install
npm run dev  # Runs on http://localhost:3000
```

### Database Changes
1. Edit [schema.prisma](../../backend/prisma/schema.prisma)
2. Run `npx prisma migrate dev --name <migration_name>` to create/apply migration
3. Commit `prisma/migrations/<timestamp>_<name>/migration.sql`

### Docker Compose
```bash
docker-compose up  # Full stack: PostgreSQL + Backend + Frontend
```
Credentials in [docker-compose.yml](../../docker-compose.yml): `qresto` / `qresto123`, port `5433` → `5432`.

### Testing & Debugging
- Backend health check: `GET /health` returns `{ status: 'OK', timestamp, version, environment }`
- Prisma Studio: `npx prisma studio` (database browser)
- Debug scripts: [debug_login.js](../../backend/debug_login.js), [check_db.js](../../backend/check_db.js)
- Frontend E2E tests: `npm run cypress:headless` (Cypress in [cypress/e2e/](../../frontend/cypress/e2e/))

---

## Key Conventions & Gotchas

### Naming & Mapping
Prisma snake_case DB columns map to camelCase models (e.g., `password_hash` → `passwordHash`, `is_active` → `isActive`). Always use model property names in TypeScript/JavaScript, not column names.

### Error Handling
All errors pass to centralized [errorHandler.js](../../backend/src/middleware/errorHandler.js), which formats responses as `{ error: 'message' }`. Controllers call `next(error)` or throw; don't call `res.status(...).json({ error })` directly.

### Multi-tenancy
Every resource (Category, MenuItem, Order, etc.) belongs to exactly one `restaurantId`. Always filter queries by `restaurantId` from `req.restaurant.id` or `req.restaurantId` to prevent cross-restaurant data leaks.

### Rate Limiting
Applied globally to `/api` routes. Configurable via `RATE_LIMIT_WINDOW_MS` and `RATE_LIMIT_MAX_REQUESTS` env vars.

### Location Validation
Backend validates customer's GPS against `Restaurant.latitude`, `Restaurant.longitude`, `Restaurant.locationRadius` when serving public menu via `GET /api/v1/public/menu/:tableQR`.

---

## File Tree & Responsibilities

```
backend/src/
├── config/database.js           # Prisma client singleton
├── controllers/*.controller.js   # Business logic & DB queries
├── middleware/                   # authenticate.js, errorHandler.js
├── routes/*.routes.js            # Express route definitions
├── services/cloudinary.js        # Image upload/storage
└── utils/logger.js               # Winston logger

frontend/src/
├── app/                          # Next.js pages (App Router)
├── components/                   # Reusable React components
├── lib/api.ts                    # Axios instance + interceptors
├── lib/socket.ts                 # Socket.io singleton service
└── stores/*.ts                   # Zustand state + persist
```

---

## Common Tasks

**Add a new API endpoint**: Create route in `routes/`, controller in `controllers/`, add Prisma query, apply `authenticate` middleware if protected.

**Update database schema**: Edit `schema.prisma`, run `prisma migrate dev`, commit migration SQL file.

**Add Socket.io event**: Emit from backend controller via `req.app.get('io').to(...).emit()`, listen in frontend via `socketService.on()`.

**Fix multi-tenancy issue**: Add `.where({ restaurantId: req.restaurantId })` filter to Prisma queries; use `app.set('io', io).to(`restaurant-${restaurantId}`)` for Socket.io rooms.

**Deploy to production**: Build Docker images, push to Railway, update env vars (DATABASE_URL, JWT secrets must differ from dev).

