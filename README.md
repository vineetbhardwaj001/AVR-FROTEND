# AIVOICE Frontend

Fresh React + Vite + SCSS frontend for AIVOICE. The backend repository has not yet been provided, so the UI is deliberately not pretending to have live authentication or live data.

## Run locally
1. Install Node.js 18+
2. Run `npm install`
3. Copy `.env.example` to `.env` and set `VITE_API_BASE_URL` to your backend API base URL.
4. Run `npm run dev`

## Build
Run `npm run build`.

## Included
- Responsive marketing landing page
- Login UI with Super Admin, Business Owner, and Staff workspace choices
- Separate role-specific dashboard shells and navigation
- Shared SCSS styles and a configurable API request helper

## Integration status
Backend/API integration is pending until the backend repository and API documentation are available. Login currently shows an explicit integration notice instead of pretending to authenticate. Dashboard numbers and table rows are sample preview data, not live records. Before production, wire real endpoints and role authorization to the documented backend schemas, confirm cookie/token handling and CORS settings, and test the production build. Do not put secrets or permanent passwords in frontend code.
