# Data Layer — The Halal Hue

## Current Setup (Dummy Data)
Perfume data lives in `src/data/perfumes.ts` as a static array.
The API route at `src/app/api/perfumes/route.ts` imports and serves this array
with a simulated ±3% price fluctuation on each request.

## How Data Flows
dummy data (data/perfumes.ts)
  → API route (app/api/perfumes/route.ts)
    → useLivePrices hook (hooks/useLivePrices.ts)
      → PerfumesSection → PerfumeGrid → PerfumeCard

## To Connect a Real API (when admin panel is ready)
You only need to change ONE file: `src/app/api/perfumes/route.ts`

Replace the import of DUMMY_PERFUMES with a fetch to your backend:
```ts
// BEFORE (dummy)
import { DUMMY_PERFUMES } from '@/data/perfumes'
// serve DUMMY_PERFUMES with random fluctuation

// AFTER (real API)
const res = await fetch('https://your-backend.com/api/perfumes', {
  headers: { Authorization: `Bearer ${process.env.API_SECRET}` },
  cache: 'no-store'
})
const perfumes: Perfume[] = await res.json()
return NextResponse.json(perfumes)
```

The `useLivePrices` hook, all components, and all types remain UNCHANGED.
Only the route handler is swapped. The Perfume type is the contract.

## Environment Variables (add to .env.local when going live)
API_BASE_URL=https://your-backend.com
API_SECRET=your_secret_token
