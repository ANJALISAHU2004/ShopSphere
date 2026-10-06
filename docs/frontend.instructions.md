---
applyTo: "frontend/**"
---

# ShopSphere frontend — Copilot instructions

Full spec: `docs/frontend-requirements.md`. API shapes: `docs/api-contract.md`. Read the relevant section before generating a page. If the two disagree, `api-contract.md` wins.

## Stack (do not substitute)

React 19 + Vite, JavaScript/JSX, `react-router-dom` v6, Axios, TanStack Query v5, React Hook Form + Zod, Tailwind CSS v4, `lucide-react`, `sonner`.
Tailwind v4 has **no `tailwind.config.js`**. Design tokens live in `@theme` in `src/styles/theme.css`.
Do not add Redux, MUI, Chakra, styled-components or any other UI or CSS library.

## Architecture rules

- Only files in `src/api/` import Axios. Pages and components call hooks (`src/hooks/`, or `src/demo/hooks/` for demo modules).
- `src/pages/*` are thin: compose hooks and components. No fetch logic or large markup inside a page.
- `src/components/ui/*` are generic and never import from `api/`, `hooks/` or `context/`.
- One component per file; file name equals component name. Hooks start with `use`.
- All price and date display goes through `utils/format.js`. Never do arithmetic on money; display `lineTotal`, `subtotal`, `totalAmount` as the server sends them.

## Backend rules that must never be broken

- The browser calls the gateway only, through the relative `/api/...` path (Vite proxies it to port 8080). Never write 8081–8088 or any `localhost:PORT` in source.
- Never call any URL containing `/internal/`.
- Never send `userId` in a request body or path; the gateway derives it from the JWT.
- The JWT is attached in exactly one place: the Axios request interceptor. A 401 clears the session and redirects to `/login`, **except** on `/api/auth/login`, where it is a wrong password and shows on the form.
- Never send `isDefault` when creating or updating an address. Use `PATCH …/default`.
- Do not show ratings on product list cards (the API returns null there).

## Every screen must have

1. A loading state (skeleton matching the final layout; spinner only inside buttons).
2. An empty state with one next action.
3. An error state with a readable message and a Retry button. Never show a stack trace, a raw Axios message or a bare status code.
4. Client-side validation using the Zod schemas in `src/validation/schemas.js`, with server `fieldErrors` mapped onto the matching fields.

## Styling and design rules

- Use token classes only (`bg-surface`, `text-muted`, `border-border`, `text-primary` and so on). **No hardcoded hex values, no arbitrary pixel values** in components.
- Direction: calm editorial minimalism. Newsreader serif for headings, Figtree for UI and body. Product images carry the colour; the interface stays quiet.
- Radius: 20–24px for large panels and hero, 10–16px for cards and controls. Not one radius for everything.
- Do **not** use `--color-accent` or `--color-secondary` as text on light backgrounds (fails contrast).
- Avoid generic AI-looking patterns: ALL-CAPS eyebrow labels above every heading; identical rounded cards with the same shadow; gradient washes as decoration; fade-and-slide-up on every section; hover animation on every card; one word of a headline picked out in colour.
- Motion is 160–240 ms and only confirms an action. Respect `prefers-reduced-motion`.
- Copy: sentence case, plain verbs, buttons say what happens ("Add to cart", "Place order"). Errors say what failed and what to do next, and do not apologise.

## Accessibility (required, not optional)

- Real `button`, `a`, `input`, `select` elements. No clickable `div`.
- Visible `:focus-visible` ring; touch targets at least 44×44px.
- Every input has a visible `<label>`; errors linked with `aria-describedby`.
- Dialogs trap focus, close on Escape, and return focus to the trigger.
- Icon-only buttons need `aria-label`. Meaningful images get alt text; decorative ones `alt=""`.
- Must work at 360px width with no horizontal scroll.

## Out of scope — do not build or mock

Real payments or card fields, notifications, password reset, coupons, refunds, image upload to a server, guest checkout, recommendations in the real shop, "featured" flags, analytics, multi-currency, translations, social login. In the real shop also no size/colour variants, brands or multi-image galleries (the product model has none).

## Demo modules (frontend-only, dummy data)

Wardrobe, Virtual try-on, AI stylist, Community and Messages have **no backend**. Build them as demos, in `src/demo/` and `public/demo/` only. Spec: `docs/frontend-requirements.md` §16 and §17.

- Never import Axios or call the gateway from `src/demo/`. The one exception is the stylist's read-only product lookup through `productApi`.
- Data comes from `src/demo/data/*` through async functions in `src/demo/api/*` with a 300–900 ms delay. Hooks use TanStack Query like the rest of the app.
- Persist user-created demo data in `localStorage` (`shopsphere.demo.<module>`), wrapped in try/catch. Provide a "Reset demo data" action.
- Every demo page shows `DemoBadge` and `DemoNotice`. Never claim real AI, real generation, real uploads or real delivery. Labels say "Demo preview", "Scripted demo reply".
- Support `?fail=1` to make a demo API reject, so error and retry states can be shown.
- Images are local files under `public/demo/`. Never hotlink. Always render them through `DemoImage`, which shows a generated placeholder when a file is missing or fails to load.
- Use only invented names and handles. No real people, no celebrities.
- Keep privacy visible: wardrobe items default to Private, a Private item can never be shared, and the audience is shown wherever something is shared.
- Lazy-load demo routes with `React.lazy`. Do not touch `docs/api-contract.md` or ask for backend changes for demo features.

## Code standards

- JSDoc comment on every component, hook and `api/*.js` function: one line stating its purpose.
- camelCase for variables and functions, PascalCase for components, UPPER_SNAKE_CASE for constants.
- Prettier formatting; ESLint must pass. No `console.log` left in committed code.
- Never log or display the JWT. Never use `dangerouslySetInnerHTML`.
- If the API does not return a field, do not display it or invent it. If something is unclear, ask instead of guessing a response shape.
