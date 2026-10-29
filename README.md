# AIVOICE Frontend

React + Vite + SCSS frontend for AIVOICE.

## Run locally
1. Install Node.js 18 or newer.
2. Run \`npm install\`.
3. Copy \`.env.example\` to \`.env\` and set \`VITE_API_BASE_URL\` to the backend API base URL (for example \`http://localhost:5000/api\`).
4. Run \`npm run dev\`.

## Build
Run \`npm run build\`.

## Authentication and API integration
- Login uses \`POST /api/auth/login\`; the returned JWT is sent as \`Authorization: Bearer <token>\`.
- The dashboard validates the current identity with \`GET /api/auth/me\`.
- Session values are held in \`sessionStorage\` and cleared after a 401 response. Do not store secrets or passwords in frontend code.
- Role mapping follows the documented backend values: \`SUPERADMIN\`, \`BUSINESS_ADMIN\`, and \`STAFF\`. Dashboard routes redirect to login or the matching workspace when unauthenticated or in the wrong role.
- The Super Admin Businesses view includes onboarding through \`POST /api/admin/businesses\`.
- Resource navigation requests documented collections: \`/businesses\`, \`/staff\`, \`/services\`, \`/customers\`, \`/appointments\`, \`/availability\`, and \`/conversations\`. Staff availability uses \`/staff/me/availability\`.
- API response envelopes with a \`data\` property are unwrapped. API errors display the backend message when available.
- Tenant isolation must be enforced by the backend. The frontend does not treat a client-supplied business ID as authorization.

## Known limitations
- Overview cards and legacy preview tables remain clearly marked sample UI; they are not analytics and should not be used as production metrics.
- CRUD forms for all resources are not yet implemented; live list views and Super Admin business onboarding are wired.
- Plan/subscription management, AI phone configuration, FAQs/policies, and call analytics are not connected because the supplied API documentation does not define those endpoints.
- Confirm CORS, the production API URL, and the backend's exact resource schemas before deployment.
