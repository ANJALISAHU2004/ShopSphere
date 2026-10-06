# ShopSphere — Frontend Requirements

| Field               | Value                                                                 |
| ------------------- | --------------------------------------------------------------------- |
| Version             | 1.0                                                                   |
| Date                | 06 October 2026                                                       |
| Audience            | The three developers and GitHub Copilot                               |
| Companion documents | `SRS.md`, `api-contract.md`, `service-boundaries.md`, `collaborate.md` |
| Source of truth     | **`api-contract.md` wins** over the ER and class diagrams for every field name and shape |

How to use this file: give Copilot this file plus `.github/instructions/frontend.instructions.md`. Build one page at a time using the prompts in `docs/copilot-prompts.md`. Do not ask Copilot to "build the whole frontend" in one go.

---

## 0. Scope: real shop vs demo modules

The frontend has two parts. Keep them separate.

| Part                | Pages                                                                 | Data                          | Graded by SRS |
| ------------------- | --------------------------------------------------------------------- | ----------------------------- | ------------- |
| **Core shop**       | The 14 routes in §4                                                   | Real, through the gateway     | Yes           |
| **Demo modules**    | Wardrobe, Virtual try-on, AI stylist, Community, Messages (§16)       | **Dummy data, no backend**    | No            |

Rules that keep this safe:

- Build the core shop first. The SRS acceptance checklist (§15) is about the core. Demo modules come after, or in parallel by a different developer.
- Demo code lives only in `src/demo/` and `public/demo/`. It never imports Axios, never adds anything to `api-contract.md`, and never calls the gateway, except the stylist's read-only product lookup (§16.4).
- Every demo screen says it is a demo (§16.1). Nothing may suggest real AI, real storage or real messaging.
- The look and design system (§9) is shared by both parts.

---

## 1. Non-negotiables (from the SRS)

| ID           | Rule                                                                                         |
| ------------ | -------------------------------------------------------------------------------------------- |
| C-2          | React single-page app.                                                                       |
| C-5          | The browser talks to the **gateway on port 8080 only**. No code mentions ports 8081–8088.    |
| C-11         | Every input field is validated on the client (and the server validates again).               |
| C-12         | Every backend error is shown to the user as a readable message.                              |
| C-13         | Visually uniform pages, with routing to all pages.                                           |
| UI-01        | Shared header, navigation and footer on every page.                                          |
| UI-02        | One shared style definition: typography, spacing, colour, buttons, form controls.            |
| UI-03        | Protected routes redirect unauthenticated users to `/login`.                                 |
| UI-04        | Every async operation shows a loading state.                                                 |
| UI-05        | Never show a raw stack trace or a bare status code. Always a readable sentence.              |
| UI-06        | Client-side validation before submit; server `fieldErrors` shown against the right field.    |
| UI-07        | JWT attached by one shared Axios interceptor.                                                |
| UI-08        | Expired or rejected token clears the session and redirects to `/login`.                      |

---

## 2. Stack

| Concern        | Choice                                  | Notes                                                              |
| -------------- | --------------------------------------- | ------------------------------------------------------------------ |
| Language       | JavaScript + JSX                        | JSDoc typedefs for API shapes. TypeScript is a fine swap if the team prefers. |
| Framework      | React 19, Vite                          | Node 20.19+ (22 LTS recommended). The SRS says 18+, but current Vite needs 20+. |
| Routing        | `react-router-dom` v6                   | `createBrowserRouter` + `RouterProvider`. Import from `react-router-dom`. |
| HTTP           | Axios                                   | One instance in `src/api/httpClient.js`.                           |
| Server state   | TanStack Query v5                       | Gives loading, error and retry states uniformly (UI-04, UI-05).    |
| Forms          | React Hook Form + Zod                   | Zod schemas mirror the API rules (§8).                             |
| Styling        | Tailwind CSS v4 (`@tailwindcss/vite`)   | **v4 has no `tailwind.config.js`.** Tokens live in `@theme` in `src/styles/theme.css`. |
| Fonts          | `@fontsource-variable/newsreader`, `@fontsource-variable/figtree` | Installed from npm, so no external font CDN. |
| Icons / toasts | `lucide-react`, `sonner`                |                                                                    |
| Quality        | ESLint, Prettier                        | Satisfies C-10 (naming, indentation, comments).                    |
| Tests          | Vitest + React Testing Library          | Optional. The graded coverage target is backend-only (C-8, C-9).   |

Do not add Redux, Next.js, a component-library theme (MUI, Chakra) or any CSS-in-JS. One styling system keeps UI-02 true.

### Dev server and gateway

Vite runs on 5173. `vite.config.js` proxies `/api` to `http://localhost:8080` (the gateway). Axios uses a relative base URL, so the browser only ever sees its own origin.

Why: in a browser-based Codespace, `http://localhost:8080` typed into page code points at the *user's laptop*, not the Codespace. A proxy avoids that and CORS problems. It still targets only port 8080, so C-5 holds.

`.env.example`:

```env
# Leave empty to use the Vite proxy (recommended). Set only to call a gateway URL directly.
VITE_API_BASE_URL=
```

---

## 3. Folder structure

```text
frontend/
├─ index.html
├─ package.json
├─ vite.config.js              # React + Tailwind plugins, /api proxy → :8080
├─ eslint.config.js
├─ .prettierrc
├─ .env.example
├─ public/
│  ├─ favicon.svg
│  └─ demo/                    # dummy images for the demo modules (§17)
└─ src/
   ├─ main.jsx                 # mounts <App />
   ├─ App.jsx                  # providers: QueryClient, Auth, Theme, Toaster, Router
   │
   ├─ routes/
   │  ├─ index.jsx             # the full route table (§4)
   │  ├─ ProtectedRoute.jsx    # needs a session, else → /login?redirect=…
   │  └─ AdminRoute.jsx        # needs role ADMIN, else → /
   │
   ├─ api/                     # the ONLY place that calls Axios
   │  ├─ httpClient.js         # axios instance + request/response interceptors
   │  ├─ apiError.js           # normalises any failure into { status, message, fieldErrors }
   │  ├─ types.js              # JSDoc typedefs for every response in api-contract.md
   │  ├─ authApi.js
   │  ├─ userApi.js            # profile + addresses
   │  ├─ productApi.js
   │  ├─ categoryApi.js
   │  ├─ cartApi.js
   │  ├─ wishlistApi.js
   │  ├─ orderApi.js           # includes admin order calls
   │  ├─ paymentApi.js
   │  └─ reviewApi.js
   │
   ├─ context/
   │  ├─ AuthContext.jsx       # session, login(), logout(), isAdmin
   │  └─ ThemeContext.jsx      # light / dark / system (optional, §9.8)
   │
   ├─ hooks/                   # TanStack Query hooks, one file per domain
   │  ├─ useAuth.js
   │  ├─ useProducts.js        # list, detail, categories
   │  ├─ useCart.js            # cart + add / update / remove / clear
   │  ├─ useWishlist.js
   │  ├─ useOrders.js
   │  ├─ useReviews.js
   │  ├─ useAddresses.js
   │  └─ useDebounce.js
   │
   ├─ components/
   │  ├─ ui/                   # generic, reusable, no API knowledge (§9.6)
   │  ├─ layout/               # AppLayout, Header, Footer, MobileMenu, AdminTabs
   │  ├─ product/              # ProductCard, ProductGrid, FilterPanel, SortSelect, SearchBar
   │  ├─ cart/                 # CartLine, CartSummary
   │  ├─ order/                # OrderStatusBadge, OrderTimeline, OrderItemsTable
   │  ├─ review/               # ReviewList, ReviewForm, RatingSummary
   │  └─ admin/                # ProductForm, CategoryManager, OrderStatusSelect
   │
   ├─ pages/                   # one thin file per route; compose components + hooks
   │  ├─ HomePage.jsx
   │  ├─ ProductListPage.jsx
   │  ├─ ProductDetailPage.jsx
   │  ├─ LoginPage.jsx
   │  ├─ RegisterPage.jsx
   │  ├─ CartPage.jsx
   │  ├─ WishlistPage.jsx
   │  ├─ CheckoutPage.jsx
   │  ├─ OrdersPage.jsx
   │  ├─ OrderDetailPage.jsx
   │  ├─ ProfilePage.jsx
   │  ├─ AdminProductsPage.jsx
   │  ├─ AdminOrdersPage.jsx
   │  └─ NotFoundPage.jsx
   │
   ├─ demo/                    # FRONTEND-ONLY modules with dummy data (§16)
   │  ├─ data/                 # seed data: wardrobe.js, looks.js, posts.js, conversations.js, stylistScripts.js, people.js
   │  ├─ api/                  # fake async APIs: latency + localStorage persistence (no Axios)
   │  ├─ hooks/                # TanStack Query hooks over the fake APIs
   │  ├─ components/           # wardrobe/, tryon/, stylist/, community/, messages/, DemoBadge, DemoNotice, DemoImage
   │  └─ pages/                # WardrobePage, TryOnPage, StylistPage, CommunityPage, MessagesPage, ConversationPage
   │
   ├─ validation/
   │  └─ schemas.js            # Zod schemas (§8)
   ├─ utils/
   │  ├─ format.js             # formatPrice(), formatDate() — the only formatters
   │  ├─ constants.js          # ORDER_STATUSES, PAYMENT_METHODS, STATUS_TRANSITIONS
   │  └─ session.js            # read / write / clear the stored session
   └─ styles/
      ├─ theme.css             # design tokens (@theme) — single source of truth
      └─ index.css             # Tailwind import, base styles, focus ring, reduced-motion
```

Rules for the structure:

- `pages/` stay thin. Data fetching goes in `hooks/`, markup in `components/`.
- Only `api/*.js` imports Axios. Components and pages never call Axios directly.
- `components/ui/` never imports from `api/`, `hooks/` or `context/`.
- One component per file. File name equals component name (PascalCase). Hooks start with `use`.

---

## 4. Routes

All 14 routes from SRS §5.1. A shared `AppLayout` (header + footer) wraps every one of them.

| Route             | Page                 | Access   | Main API calls                                                        |
| ----------------- | -------------------- | -------- | --------------------------------------------------------------------- |
| `/`               | HomePage             | Public   | `GET /api/products?sort=newest&size=8`, `GET /api/categories`         |
| `/products`       | ProductListPage      | Public   | `GET /api/products` (all filters), `GET /api/categories`              |
| `/products/:id`   | ProductDetailPage    | Public   | `GET /api/products/{id}`, `GET /api/reviews/product/{id}`             |
| `/login`          | LoginPage            | Public   | `POST /api/auth/login`                                                |
| `/register`       | RegisterPage         | Public   | `POST /api/users/register`                                            |
| `/cart`           | CartPage             | Customer | `GET/DELETE /api/cart`, `PUT/DELETE /api/cart/items/{itemId}`         |
| `/wishlist`       | WishlistPage         | Customer | `GET /api/wishlist`, `DELETE …/items/{id}`, `POST …/move-to-cart`     |
| `/checkout`       | CheckoutPage         | Customer | `GET /api/cart`, `GET/POST /api/users/me/addresses`, `POST /api/orders` |
| `/orders`         | OrdersPage           | Customer | `GET /api/orders`                                                     |
| `/orders/:id`     | OrderDetailPage      | Customer | `GET /api/orders/{id}`, `PATCH …/cancel`, `GET /api/payments/order/{id}` |
| `/profile`        | ProfilePage          | Customer | `/api/users/me`, `/api/users/me/addresses…`, `POST /api/auth/change-password` |
| `/admin/products` | AdminProductsPage    | Admin    | products + categories CRUD                                            |
| `/admin/orders`   | AdminOrdersPage      | Admin    | `GET /api/orders/admin/all`, `PATCH /api/orders/admin/{id}/status`    |
| `*`               | NotFoundPage         | Public   | none                                                                  |

Demo routes (frontend-only, dummy data, details in §16). They sit under the same `AppLayout` and `ProtectedRoute`:

| Route                     | Page             | Access   | Data          |
| ------------------------- | ---------------- | -------- | ------------- |
| `/wardrobe`               | WardrobePage     | Customer | Dummy         |
| `/try-on`                 | TryOnPage        | Customer | Dummy         |
| `/stylist`                | StylistPage      | Customer | Dummy         |
| `/community`              | CommunityPage    | Customer | Dummy         |
| `/messages`               | MessagesPage     | Customer | Dummy         |
| `/messages/:conversationId` | ConversationPage | Customer | Dummy       |

Route behaviour:

- `ProtectedRoute` with no session redirects to `/login?redirect=<original path>`. After login, go back to that path.
- `AdminRoute` with a non-admin session redirects to `/` and shows a toast: "You don't have access to that page."
- Administrators do not shop (SRS §2.2). For `ADMIN`, hide Cart, Wishlist and Orders in the header, show an **Admin** menu, and send them to `/admin/orders` after login.
- A logged-in user who opens `/login` or `/register` is redirected to `/`.
- After a successful checkout, navigate to `/orders/:id` with router state `{ justPlaced: true }` to show a confirmation banner. There is no separate success route.

---

## 5. API integration

### 5.1 The Axios client (`src/api/httpClient.js`)

```js
import axios from 'axios';
import { readSession, clearSession } from '../utils/session';
import { toApiError } from './apiError';

const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

let onUnauthorized = () => {};
export const setUnauthorizedHandler = (fn) => { onUnauthorized = fn; };

httpClient.interceptors.request.use((config) => {
  const session = readSession();
  if (session?.token) config.headers.Authorization = `Bearer ${session.token}`;
  return config;
});

httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const apiError = toApiError(error);
    const isLoginCall = error.config?.url?.includes('/api/auth/login');
    if (apiError.status === 401 && !isLoginCall) {
      clearSession();
      onUnauthorized(); // AuthContext redirects to /login with a message (UI-08)
    }
    return Promise.reject(apiError);
  },
);

export default httpClient;
```

Why the `isLoginCall` check: a wrong password returns 401 too. That must show "Invalid email or password" on the form, not log the user out and redirect.

### 5.2 Error normalisation (`src/api/apiError.js`)

Every rejected call becomes `{ status, message, fieldErrors }`. The backend envelope is:

```json
{ "timestamp": "…", "status": 400, "error": "Validation Failed", "message": "…", "path": "…", "fieldErrors": { "email": "…" } }
```

| Situation                         | What the user sees                                                                       |
| --------------------------------- | ---------------------------------------------------------------------------------------- |
| Body has `message`                | That message, as written by the backend.                                                 |
| No response (network down)        | "Can't reach the server. Check that the gateway is running, then try again."             |
| Timeout                           | "The server took too long to respond. Try again."                                        |
| 500 with no usable message        | "Something went wrong on our side. Try again in a moment."                               |
| `fieldErrors` present (400)       | Each message under its field. Keys with no matching field go in a form-level alert.      |

Never print `error.stack`, the raw Axios message, or "Request failed with status code 500".

### 5.3 Session

- Login response: `{ token, userId, email, firstName, role, expiresIn }` (`expiresIn` is in seconds).
- Store `{ token, userId, email, firstName, role, expiresAt }` in `localStorage` under `shopsphere.session`. `expiresAt = Date.now() + expiresIn * 1000`.
- On app start, if `expiresAt` has passed, clear it. While the app is open, a timer clears the session at expiry and shows "Your session has expired. Sign in again." (UI-08).
- Logout: call `POST /api/auth/logout`, ignore failure, then always clear the session client-side (FR-AUTH-07). Also clear the TanStack Query cache so the next user never sees the previous user's cart.
- `localStorage` is acceptable for this demo. It is readable by any XSS, so never use `dangerouslySetInnerHTML`. React escaping handles user-written text such as reviews and product descriptions.

### 5.4 Calls the frontend must never make

- Any URL containing `/internal/`. The gateway returns 404 for them by design.
- Any direct service port (8081–8088).
- Any `userId` in a request body or path for cart, wishlist, orders or addresses. The gateway derives it from the token.

### 5.5 Response quirks to handle on purpose

| Quirk                                                                                                   | What to do                                                                                    |
| ------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `POST /register` returns `userId`; `GET /users/me` returns `id`.                                        | Normalise in `userApi.js` so components only see `id`.                                        |
| Address uses `addressId` and `pincode`, with no `country`. The ER diagram says `postal_code` and `country`. | Follow `api-contract.md`.                                                                     |
| `isDefault` is not accepted in address create/update bodies.                                            | Never send it. Use `PATCH …/default`. The first address becomes default automatically.        |
| Product **list** items have `averageRating` and `reviewCount` as `null`.                                | Do not show ratings on cards.                                                                 |
| Product **detail** has no rating fields (the contract text and example disagree).                       | Take rating and count from `GET /api/reviews/product/{id}`, which returns both.              |
| Cart `unitPrice` is refreshed on every read. `available: false` means deleted or out of stock.          | Grey the row, show "No longer available", disable checkout until removed.                     |
| Cart has `itemId` (line) and `productId` (product). Wishlist is the same.                               | Use `itemId` for update/remove, `productId` for links.                                        |
| `itemCount` in the cart example equals total units (one line, quantity 2 → 2).                          | Use it for the header badge.                                                                  |
| Payment declined is `402` from `POST /api/orders`. Order unreachable service is `503`.                  | Show the backend `message` and keep the user's selections.                                    |
| A customer reading another customer's address gets `404`, never `403`.                                  | Treat as "not found".                                                                         |
| Timestamps look like `2026-09-01T14:32:10` with no timezone.                                            | Parse with `new Date(value)` (treated as local). Never append `Z`.                            |
| Money is a JSON number.                                                                                 | **Never do arithmetic on money in the UI.** Display `lineTotal`, `subtotal`, `totalAmount` as sent. Format only. |

### 5.6 Currency

Sample data uses Indian addresses and prices (₹145000.0). `formatPrice()` uses `Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' })`. It is the only price formatter. Multi-currency is out of scope.

---

## 6. Page specifications

Every page below also needs the four states in §10: loading, empty, error, success.

### 6.1 Home `/`
- Hero built from **real data**: the newest product (largest), with a plain headline and a "Browse all products" action. No stock photos, no invented slogans. If the API fails, fall back to category links.
- "New arrivals": 8 products from `?sort=newest&size=8`.
- "Shop by category": tiles from `GET /api/categories`, linking to `/products?categoryId=…`.
- There is no "featured" flag in the API. Do not invent one.

### 6.2 Product list `/products`
- **The URL is the state.** Use `useSearchParams` for `keyword`, `categoryId`, `minPrice`, `maxPrice`, `inStock`, `sort`, `page`. Back button and shared links must work.
- Filters apply in combination (FR-PRD-04): keyword search, category, price range, in-stock toggle.
- Sort: `newest` (default), `priceAsc`, `priceDesc`. Sorting keeps all filters.
- Debounce keyword input by 400 ms. Any filter change resets `page` to 0.
- Page size 12, which divides evenly into 2, 3 and 4 columns.
- Removable chips for active filters, a result count ("148 products"), and a "Clear all" action.
- Validate `minPrice <= maxPrice` before sending.
- Desktop: filters in a left column. Mobile: filters in a bottom sheet opened by a "Filters" button.
- Empty result: "No products match these filters" with a Clear filters button.
- Product card: image, name, category name, price, "Out of stock" badge when `inStock` is false, wishlist heart, and an Add to cart button. No rating.

### 6.3 Product detail `/products/:id`
- Image, name, category, price, description, stock status.
- Stock: `stockQuantity > 0` shows "In stock". At 5 or fewer, show "Only N left" as text. At 0, show "Out of stock" and disable Add to cart.
- Quantity stepper: minimum 1, maximum `stockQuantity`.
- Add to cart and Add to wishlist. For guests, redirect to `/login?redirect=…`.
- Reviews load in a second request (`GET /api/reviews/product/{id}`): average rating, count, and the list.
- Review form for logged-in customers: rating 1–5 (required), comment (optional, max 1000).
  - The client cannot check purchase eligibility. Submit and show the server's `403` message: "You can only review products you have received."
  - `409` means already reviewed. If a review in the list has `userId` equal to the session `userId`, show that review with Edit and Delete instead of the form.
- `404` product: a "Product not found" page with a link back to `/products`.

### 6.4 Login `/login`
- Email and password. Show the server's generic message ("Invalid email or password") as a form-level alert. Never say which one was wrong (FR-AUTH-03).
- After success go to the `redirect` param, else `/` (or `/admin/orders` for ADMIN).
- Link to Register. Support a `?registered=1` banner: "Account created. Sign in to continue."

### 6.5 Register `/register`
- Fields: firstName, lastName, email, phone, password, confirm password (client-only).
- Show a password rule checklist that ticks as the user types.
- `409` goes under the email field. `400` `fieldErrors` go under their fields.
- Success: redirect to `/login?registered=1`.

### 6.6 Cart `/cart`
- Lines: image, name, unit price, quantity stepper, line total, remove.
- Summary: `itemCount`, `subtotal`, Checkout button.
- Quantity change is a `PUT`; the server validates against stock (`400` shows its message and reverts the stepper).
- "Empty cart" with a confirmation dialog.
- Unavailable lines are greyed, flagged with text, and block checkout.
- Empty cart state: "Your cart is empty" + Browse products.

### 6.7 Wishlist `/wishlist`
- Grid of items: image, name, price, in-stock text, Move to cart, Remove.
- Move to cart is atomic on the server. On failure the item stays; show the message.
- `409` when adding a duplicate: toast "Already in your wishlist".
- The wishlist heart on cards and the detail page reads from the same cached wishlist so it shows the right filled/unfilled state.

### 6.8 Checkout `/checkout`
- Redirect to `/cart` if the cart is empty.
- Step 1, address: radio list from `GET /api/users/me/addresses`, default pre-selected. "Add a new address" opens an inline form (same schema as Profile).
- Step 2, payment method: radios for `CARD`, `UPI`, `NET_BANKING`, `CASH_ON_DELIVERY`. **No card number, CVV or UPI-ID fields.** Payment is simulated (SRS §2.5). Show a small note: "Payments are simulated in this demo."
- Order summary (read-only) from the cart. Place order button, disabled while pending to prevent double submit.
- Failure handling, keeping the user's selections each time:

| Status | Message source / UI                                                                                     |
| ------ | ------------------------------------------------------------------------------------------------------- |
| 400    | Show backend message. Empty cart → link to products. Invalid address → refetch addresses. Stock → name the product from the message and link to the cart. |
| 402    | "Payment failed. Your order has not been placed." Offer Try again and Change payment method.            |
| 503    | Show backend message with a Try again button.                                                            |

- Success `201`: invalidate cart and orders caches, go to `/orders/:id` with `{ justPlaced: true }`.

### 6.9 Orders `/orders`
- Paginated, newest first. Each row: order number, date, item count, total, status badge, "View" link.
- Empty state: "No orders yet" + Browse products.

### 6.10 Order detail `/orders/:id`
- Header: order number, placed date, status badge, total.
- Items table from the snapshot (`productName`, `unitPrice`, `quantity`, `lineTotal`). It shows what was bought at the price paid, even if the product has changed since.
- Delivery address (the copy stored on the order).
- Payment: method, status, transaction reference.
- Status timeline: PENDING → CONFIRMED → SHIPPED → DELIVERED. `CANCELLED` is shown as its own state, not a step. Do not fake dates for steps the API does not provide.
- Cancel button only for `PENDING` and `CONFIRMED`, behind a confirmation dialog. On `400`, show the message and refetch.
- With `justPlaced`, show a success banner: "Order placed. Your order number is #31."
- For `DELIVERED` orders, each item links to its product page so the customer can write a review.

### 6.11 Profile `/profile`
Tabs: **Details**, **Addresses**, **Security**, **My reviews** (optional).
- Details: edit `firstName`, `lastName`, `phone`. **Email is shown read-only** with the note "Your email is your sign-in and can't be changed." The API rejects it by design (it would lock the user out).
- Addresses: list, add, edit, delete, set default. A "Default" badge on one address. Delete asks for confirmation. If there is only one address, disable Delete and explain why ("You need at least one address"). The server also returns `400` for this; show its message if it ever happens.
- Security: current password, new password, confirm. New must differ from current. A wrong current password returns `400`; show it under the current-password field.
- My reviews: `GET /api/reviews/me` with edit and delete.

### 6.12 Admin products `/admin/products`
- Sub-navigation shared with admin orders: Products | Categories | Orders. (Categories live inside this route because the SRS lists only two admin routes.)
- Products table: image, name, category, price, stock status, Edit, Delete.
- **The list endpoint does not return `stockQuantity`.** Fetch `GET /api/products/{id}` when opening Edit. See §12.
- Add/Edit form in a side panel or dialog: name, description, price, stock quantity, category (select), image URL (text input, **not an upload**).
- "Adjust stock levels" is the same edit form. Offer a quick stock-only edit as a compact dialog.
- Delete behind a confirmation dialog.
- Categories: list, add, rename, delete, with confirmation.

### 6.13 Admin orders `/admin/orders`
- Paginated table of all orders. No status filter: the API does not offer one.
- Status control per row: a select that lists **only valid next statuses**:

```text
PENDING   → CONFIRMED, CANCELLED
CONFIRMED → SHIPPED, CANCELLED
SHIPPED   → DELIVERED
DELIVERED → (none)    CANCELLED → (none)
```

- Terminal orders show a plain badge, no control. Confirm before cancelling. Show the server's `400` message on a rejected transition.
- Mobile: rows become stacked cards.

### 6.14 Not found `*`
Friendly message, link home, link to products.

### 6.15 Global header and footer
- Header: logo, search box (submits to `/products?keyword=`), Products link, wishlist icon, cart icon with count badge, account menu (Profile, Orders, Admin items, Log out) or Sign in / Create account for guests. Collapses to a menu button on mobile.
- Footer: short links (Products, Cart, Orders, Profile) and a one-line project note. Same on every page.

---

## 7. Authorisation summary in the UI

| Who      | Sees                                                    | Cannot reach                                   |
| -------- | ------------------------------------------------------- | ---------------------------------------------- |
| Guest    | Home, products, product detail, login, register         | Everything marked Customer or Admin           |
| Customer | All Guest pages plus cart, wishlist, checkout, orders, profile | `/admin/*`                              |
| Admin    | Home, products, product detail, `/admin/*`              | Cart, wishlist, checkout, orders, profile pages |

Demo routes (§16) follow the Customer column. Admins do not see them.

Hiding links is convenience only. The gateway enforces roles; if it returns `403`, show its message and stay on the page.

---

## 8. Validation rules (Zod, in `src/validation/schemas.js`)

These mirror `api-contract.md`. The server remains the authority.

| Form              | Field                      | Rule                                                                                 |
| ----------------- | -------------------------- | ------------------------------------------------------------------------------------ |
| Register          | `firstName`, `lastName`    | Required, 2–50 characters, not blank                                                 |
|                   | `email`                    | Required, valid format, max 120                                                      |
|                   | `password`                 | 8–64 characters, at least one uppercase, one lowercase, one digit, one special       |
|                   | `confirmPassword`          | Must equal password (client-only)                                                    |
|                   | `phone`                    | Exactly 10 digits (`^\d{10}$`)                                                       |
| Login             | `email`, `password`        | Required                                                                             |
| Profile           | `firstName`, `lastName`    | 2–50 characters                                                                      |
|                   | `phone`                    | Exactly 10 digits                                                                    |
| Address           | `line1`                    | Required, max 120                                                                    |
|                   | `line2`                    | Optional, max 120                                                                    |
|                   | `city`, `state`            | Required, max 60                                                                     |
|                   | `pincode`                  | Required, exactly 6 digits (`^\d{6}$`)                                               |
| Change password   | `currentPassword`          | Required                                                                             |
|                   | `newPassword`              | Same rule as register password, and different from current                           |
| Add to cart       | `quantity`                 | Integer, at least 1, at most available stock                                         |
| Checkout          | `addressId`                | Required                                                                             |
|                   | `paymentMethod`            | One of `CARD`, `UPI`, `NET_BANKING`, `CASH_ON_DELIVERY`                              |
| Review            | `rating`                   | Required integer 1–5                                                                 |
|                   | `comment`                  | Optional, max 1000                                                                   |
| Admin product     | `name`                     | Required, 3–150                                                                      |
|                   | `description`              | Required, max 2000                                                                   |
|                   | `price`                    | Required, greater than 0, at most 2 decimal places                                   |
|                   | `stockQuantity`            | Required integer, 0 or more                                                          |
|                   | `categoryId`               | Required                                                                             |
|                   | `imageUrl`                 | Optional, valid URL if present (max 255)                                             |
| Admin category    | `name`                     | Required, max 80 (limits taken from the ER diagram; the contract has no rules)       |
|                   | `description`              | Optional, max 255                                                                    |

Form behaviour: validate on blur and on submit. Show each error under its field with `aria-describedby`. Keep what the user typed after any failure. On a server `400` with `fieldErrors`, call `setError(field, { message })` for each key.

---

## 9. Design system

Visual direction: **calm editorial minimalism with a subtle digital glow.** The store should feel like a well-edited catalogue, not a crowded marketplace. Product images carry the colour and emotion; the interface stays quiet around them.

This direction is adapted from `design.md` (written for FashionSphere). The core shop uses its **look**. Its feature ideas (wardrobe, try-on, stylist, community, messaging) appear only as frontend-only demo modules in §16.

### 9.1 Colour tokens (`src/styles/theme.css`)

| Token                  | Light       | Dark        | Use                                                  |
| ---------------------- | ----------- | ----------- | ---------------------------------------------------- |
| `--color-primary`      | `#7C3AED`   | `#A78BFA`   | Primary buttons, links, active nav, selected states  |
| `--color-secondary`    | `#EC4899`   | `#F472B6`   | Wishlist heart (filled), small expressive moments    |
| `--color-accent`       | `#06B6D4`   | `#22D3EE`   | Informational accents and tints only                 |
| `--color-bg`           | `#F8FAFC`   | `#0F172A`   | Page canvas                                          |
| `--color-surface`      | `#FFFFFF`   | `#172033`   | Cards, panels, dialogs                               |
| `--color-text`         | `#1E293B`   | `#F1F5F9`   | Headings and body                                    |
| `--color-text-muted`   | `#64748B`   | `#94A3B8`   | Metadata and supporting text                         |
| `--color-border`       | `#E2E8F0`   | `#2A3652`   | Dividers and control borders                         |
| `--color-success`      | `#15803D`   | `#4ADE80`   | Success text and icons *(added, not in design.md)*   |
| `--color-warning`      | `#B45309`   | `#FBBF24`   | Warning text and icons *(added)*                     |
| `--color-danger`       | `#B91C1C`   | `#F87171`   | Errors and destructive actions *(added)*             |

Contrast rules, so the palette passes WCAG AA:

- Never use `--color-accent` or `--color-secondary` as **text** on light surfaces. They fail AA. Use them for icons, fills, and tinted backgrounds with dark text.
- White text is fine on `--color-primary` (about 5.7:1). It is not fine on secondary or accent.
- Muted text is only for 14px and above, on `--color-bg` or `--color-surface`.
- Soft gradients use tints of primary, secondary and accent at low opacity. No large saturated colour fields.
- Status is never colour alone: always an icon or a word beside it.

Dark-mode values above are suggested starting points. Check each pair for contrast before keeping it.

### 9.2 Typography

| Role                     | Font                           | Notes                                                              |
| ------------------------ | ------------------------------ | ------------------------------------------------------------------ |
| Headings, page titles    | Newsreader (variable serif)    | Weights 400–600. Real hierarchy through size and weight.           |
| Interface and body       | Figtree (variable sans)        | Strong small-size legibility.                                      |
| Prices, counts, ratings  | Figtree with `font-variant-numeric: tabular-nums` | Columns align.                                  |

Scale (px): 12 / 14 / 16 / 18 / 22 / 28 / 36 / 52. Body 16 with line-height 1.5; serif headings 1.15–1.25. Prose lines under 70 characters. No text under 12px; essential mobile text is 14px or larger.

Avoid: ALL-CAPS labels above every heading, one word per headline picked out in colour or italic, long all-caps passages.

### 9.3 Shape, surfaces, motion

- Radius: 20–24px for large panels and the hero; 10–16px for cards, inputs and buttons. Do not use one radius for everything.
- Elevation: soft, diffuse shadows. Stronger shadow only for dialogs and drawers. Do not put the same shadow on every card; use a border for most cards and save shadow for things that float.
- Glass blur: only on floating overlays such as the sticky header over scrolled content. Text must stay legible.
- Motion: 160–240 ms, gentle easing. Motion confirms an action (open, close, add, remove). **One** orchestrated moment is allowed: the home hero's load-in. No fade-and-slide on every section, no hover animation on every card.
- Respect `prefers-reduced-motion`. Nothing may depend on animation to be understood.

### 9.4 Layout

- Top header + footer (not a left sidebar). `design.md` describes an app-style sidebar for FashionSphere; SRS UI-01 asks for a header, navigation and footer, which suits a shop.
- Max content width 1200px. Gutters 16px (mobile), 24px (tablet), 40px (desktop).
- Product grid: 2 columns on mobile, 3 on tablet, 4 on desktop. 12 per page fits all three.
- Product images: square container, `object-contain` on a softly tinted surface so laptops and keyboards are never cropped. Reserve the space (fixed aspect ratio) so the page does not jump when images load.
- Missing or broken `imageUrl`: a neutral placeholder with an icon, never a broken-image icon.
- Left-align text. Centre only short hero or empty-state content.

### 9.5 Copy

- Sentence case. Plain verbs. Say what happens: "Add to cart", "Place order", "Save changes".
- The same action keeps one name through the flow: the button says "Add to cart", the toast says "Added to cart".
- Errors state what failed and what to do next. They do not apologise. Empty screens invite an action.
- Name things the way customers do, not the way the system is built. "Your orders", not "Order history endpoint".

### 9.6 Shared component kit (`components/ui/`)

Build these first, in one place, before any page. Define variants rather than one-off styles.

`Button` (primary, secondary, ghost, danger; sizes; loading), `IconButton` (requires `aria-label`), `Input`, `Textarea`, `Select`, `Checkbox`, `Radio`, `FormField` (label, hint, error, `aria-describedby`), `Badge`, `StatusBadge`, `Modal`, `ConfirmDialog`, `Drawer`, `Tabs`, `Pagination`, `Skeleton`, `Spinner` (inline only), `EmptyState`, `ErrorState` (message + retry), `RatingStars` (display and input), `QuantityStepper`, `PriceText`, `ProductImage`, `Table` (stacks into cards on mobile).

Component rules:
- Use real `button`, `a`, `input`, `select` elements. No clickable `div`s.
- Visible `:focus-visible` ring on every interactive element, defined once in `index.css`.
- Touch targets at least 44 × 44 CSS px.
- Dialogs and drawers trap focus, close on Escape, and return focus to the element that opened them.
- Icon-only controls have accessible names.

### 9.7 Accessibility baseline (WCAG 2.2 AA)

- Keyboard reachable and operable everywhere; tab order follows the visual order.
- Every form control has a visible label. Errors are linked with `aria-describedby`; a form-level error uses `role="alert"`.
- Toasts and async results are announced through a live region.
- Meaningful images have alt text (product name). Decorative images have `alt=""`.
- Page `<title>` updates per route. One `<h1>` per page. Landmarks: `header`, `nav`, `main`, `footer`.
- Works at 360px wide and at 200% zoom without horizontal scrolling.

### 9.8 Theme (should-have)

Define every colour as a CSS variable from day one so dark mode costs almost nothing later. Follow the system setting by default and offer a manual toggle in the header. If time runs short, ship light mode only; the tokens are already in place.

---

## 10. UI states (every data-driven screen)

| State   | Requirement                                                                                                    |
| ------- | -------------------------------------------------------------------------------------------------------------- |
| Loading | Skeletons that match the final layout (UI-04). Spinner only inside buttons. Buttons disabled while submitting. |
| Empty   | Explain why it is empty and give one next action (Browse products, Clear filters, Add an address).             |
| Error   | Readable message from §5.2, a Retry button, and the user's input preserved (UI-05).                            |
| Success | Short specific toast: "Added to cart", "Address saved", "Order placed". Offer undo only where it truly exists. |

Confirm before anything destructive: remove address, delete product or category, empty cart, cancel order, delete review.

---

## 11. Out of scope

From SRS §9, plus shop features that `design.md` mentions but the product model lacks. Do not build, scaffold or mock any of these. (Wardrobe, try-on, stylist, community and messaging are **not** on this list: they are built as demo modules in §16.)

- Real payment gateway, card/UPI/bank fields
- Email, SMS or push notifications; password reset by email
- Coupons, discounts, promotional pricing
- Refunds, returns, exchanges
- Seller or multi-vendor accounts
- Image upload (product images are a URL string)
- Guest checkout
- Live delivery tracking
- Recommendations or personalisation; "featured" products
- Analytics dashboards or reports
- Multi-currency and translations
- Social login, live chat, support tickets, mobile app
- **From `design.md`, in the real shop:** size and colour variants, brands, multi-image product galleries, fashion-specific filters. The real product has none of these fields.

If the API does not provide a field, the UI does not show it and does not invent it.

---

## 12. Gaps in the API contract (resolve with the owner before coding)

The contract does not define these. Ask, then record the answer in `api-contract.md` so the response shape is agreed (the contract says changes need team sign-off).

| #  | Question                                                                                           | Owner  | My working assumption                                |
| -- | -------------------------------------------------------------------------------------------------- | ------ | ---------------------------------------------------- |
| 1  | `PUT /api/cart/items/{itemId}` request and response                                                | Dev B  | Body `{ "quantity": n }`, returns the full cart      |
| 2  | Responses of `DELETE /api/cart/items/{itemId}` and `DELETE /api/cart`                              | Dev B  | Return the updated (or empty) cart                   |
| 3  | `GET /api/orders/{id}` response                                                                    | Dev C  | Same shape as the checkout `201`, plus `status`      |
| 4  | `GET /api/orders/admin/all` row shape. The summary has no customer info                            | Dev C  | Resolved: standard paginated order summaries, no customer identity |
| 5  | Admin product list needs `stockQuantity`; the public summary only has `inStock`                    | Dev B  | Resolved: fetch product detail when opening Edit or stock adjustment |
| 6  | `GET /api/reviews/product/{id}/summary` response                                                   | Dev B  | `{ productId, averageRating, reviewCount }`          |
| 7  | `PUT /api/reviews/{id}` body                                                                       | Dev B  | `{ rating, comment }`                                |
| 8  | Category create/update body and validation rules                                                   | Dev B  | Resolved: `{ name, description }`, name max 80 and description max 255 |
| 9  | `GET /api/payments/order/{orderId}` response                                                       | Dev C  | Same as `PaymentResponseDto`                         |
| 10 | Product detail: do `averageRating` and `reviewCount` appear? The text says yes; the example says no | Dev B  | No. Use the reviews endpoint                         |
| 11 | Is `isDefault` returned as `isDefault` or `default` (Jackson often renames boolean `isX` getters)? | Dev A  | `isDefault`. Verify against a real response          |

---

## 13. Build order (5 days, C-15)

| Day | Deliver                                                                                                                         |
| --- | ------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Scaffold, theme tokens, UI kit, `AppLayout`, route table with placeholders, `httpClient`, `apiError`, session, Login, Register, `ProtectedRoute`/`AdminRoute` |
| 2   | Home, product list with all filters, product detail, header search                                                              |
| 3   | Cart, wishlist, header badges, Profile with addresses and change password                                                        |
| 4   | Checkout with all failure paths, order history, order detail, cancel, reviews                                                    |
| 5   | Admin products and categories, admin orders, accessibility pass, polish pass, demo rehearsal                                     |

Integrate against the real gateway as each page is built. Do not leave integration for the last day.

**Demo modules (§16) are extra and ungraded.** Start them only when the core pages work, or give them to a different developer. Suggested order, most impressive first: Virtual try-on → Wardrobe → AI stylist → Community → Messages. Each one has its own prompt (after the shared demo setup prompt), so you can stop after any of them and the app is still complete.

---

## 14. Environment and repo setup

- **Node must be added to the Dev Container.** The Dev Container provides Java 21, Docker and Compose, not Node. Add the Node feature (`ghcr.io/devcontainers/features/node:1`) to `.devcontainer/devcontainer.json` and forward port **5173**. Announce it to the team first, since it is shared config.
- `frontend/` is **not** a Maven module. Do not add it to the parent `pom.xml`.
- `.gitignore`: `frontend/node_modules/`, `frontend/dist/`, `frontend/.env`.
- `scripts/start-all.sh` starts the backend only. Run the frontend with `cd frontend && npm install && npm run dev`.
- Startup order: MySQL → Eureka → gateway and services → `npm run dev`.
- Branches follow `collaborate.md`: `feature/frontend-<area>` from `develop`, PR to `develop`, one approval, squash and merge. In the PR template, Java-only boxes are "N/A (frontend)". The box "every endpoint exercised through the gateway on 8080" still applies.
- Commit style: `feat: add product filter panel`, `fix: keep selections after payment failure`.

---

## 15. Definition of done

Maps to SRS §10 (Front-end) plus the extras above.

- [ ] All 14 routes exist and are reachable; unknown paths show the not-found page
- [ ] Header, navigation and footer are identical on every page
- [ ] All colours, fonts, spacing and radii come from `theme.css`; no hardcoded hex values in components
- [ ] Every page is wired to the backend through the gateway; `grep -r "80[0-9][0-9]" src` finds only the proxy target in `vite.config.js`
- [ ] `grep -r "/internal/" src` finds nothing
- [ ] JWT attached by the interceptor only; 401 clears the session and redirects to login; wrong-password 401 does not
- [ ] Every async action has a loading state; every failure shows a readable message
- [ ] Every form validates on the client and shows server `fieldErrors` under the right field
- [ ] The four checkout failures work: empty cart (400), insufficient stock (400), payment declined (402, total ending `.99`), product service stopped (503)
- [ ] Order status controls only offer valid transitions
- [ ] Keyboard-only walkthrough of login → add to cart → checkout succeeds
- [ ] No horizontal scroll at 360px width
- [ ] ESLint and Prettier pass; components, hooks and `api/*.js` functions have JSDoc comments
- [ ] No secrets, tokens or `.env` committed
- [ ] Each developer can explain any page and how its data flows to the gateway (viva)
- [ ] Demo modules: no file under `src/demo/` imports Axios; the only import from `src/api/` is the stylist's `productApi` lookup; every demo page shows the demo notice; "Reset demo data" works
- [ ] Demo modules: nothing claims real AI, real generation or real delivery; the viva answer is "this part is a simulation"
- [ ] Demo images are local files in `public/demo/` (no hotlinks), each under 150 KB, with `CREDITS.md`

---

## 16. Demo modules (frontend-only, dummy data)

These five modules come from `design.md`. The backend has no services for them, so they run entirely in the browser on sample data. Their purpose is a convincing, honest demo.

### 16.1 Principles

1. **Label everything.** Each demo page has a `DemoBadge` chip ("Demo") beside the page title and a `DemoNotice` line near the top: "Demo mode: sample data. Nothing is sent to a server." This follows `design.md` §12.
2. **No fake claims.** Try-on results say "Demo preview". Stylist replies say "Scripted demo reply". Never write "AI-generated", "analysing your photo" or "message delivered to a server" as if it were real. Progress animations are fine as long as the label says demo.
3. **Fake APIs, real habits.** Each module has a file in `src/demo/api/` exporting async functions that return Promises after a 300–900 ms delay, so loading and error states are real and testable. Hooks use TanStack Query exactly like the core shop. If a real backend appears later, you replace the file in `demo/api/` and nothing else changes.
4. **No Axios, no gateway.** Files under `src/demo/` never import Axios or anything from `src/api/`, with one allowed exception: the stylist may read the real catalogue through `productApi` (§16.4).
5. **Persistence in the browser only.** User-created data (new wardrobe items, posts, comments, messages, saved looks) is saved in `localStorage` under keys `shopsphere.demo.<module>`, wrapped in try/catch. A **Reset demo data** action clears all of it and restores the seed data. Put it in the footer's demo notice.
6. **Demonstrate failure too.** Adding `?fail=1` to a demo URL makes that page's fake API reject, so you can show error and retry states during the viva.
7. **Identity.** New posts and messages use the real logged-in user's first name from the session. Every other person is a fictional invented profile (§17).
8. **Priority order:** Virtual try-on, Wardrobe, AI stylist, Community, Messages.

### 16.2 Smart Wardrobe `/wardrobe`

Purpose: turn owned clothing into a searchable, private collection.

- Header with item count and simple insights computed from the data (for example "12 tops, 5 bottoms"). Only show insights you can honestly calculate.
- Filters: category, occasion, season, colour, style type, privacy. Filters update the grid and a count together.
- Masonry grid made with CSS columns (no library). DOM order must equal reading order so keyboard and screen-reader order make sense. 2 columns on mobile, 3–5 on desktop.
- Each card: photo, name, category, attribute chips, **privacy badge**, and an item menu (Edit attributes, Change privacy, Style this item, Delete).
- **Add item flow:**
  1. Dropzone that accepts JPG, PNG, WebP up to 5 MB. Reject others with a clear message.
  2. Fake upload progress with Cancel.
  3. Fake "suggestions" step (about 1.5 s). The suggested category, colour, season, occasion and style type appear as **editable chips marked "Suggested"**, with a confidence hint. They are not treated as confirmed until the user confirms.
  4. New items default to **Private**. Save adds the item.
  5. Downscale uploaded images to 800px on the long edge before storing, and catch storage-full errors.
- Change privacy: three explicit states **Private**, **Friends only**, **Public**. Moving to Public asks for confirmation.
- Delete asks for confirmation and offers Undo in the toast.
- "Style this item" links to `/stylist?item=<id>`.
- Empty state: "Add your first piece to start your wardrobe."

### 16.3 Virtual Try-On `/try-on`

Purpose: compare a source photo with a sample preview, and read sample style scores.

- **Outfit picker:** 6 sample outfits. Each outfit is pre-paired with its own model photo and a pre-made result image (§17). The user cannot upload their own photo in the demo; show the upload button disabled with the reason: "Photo upload isn't available in the demo."
- **Generate preview** runs a 3-step fake progress (about 3 s) labelled "Preparing demo preview…", then shows the result. A retry state exists for `?fail=1`.
- **Before/after comparison:** a native `<input type="range">` drives a clip on the result image, so it works with mouse, touch and arrow keys. Both sides are labelled ("Original" and "Demo preview"). Include a full-screen view.
- **Scores panel** (overall, colour harmony, occasion match) and suggested accessories, from the sample data. Show scores as number plus bar, never colour alone.
- Always show: "This is a sample preview, not a prediction of fit, drape or sizing."
- **Trust panel** (design.md §5.5), adapted honestly: "In the demo, no photo is uploaded or stored."
- **No-photo alternative:** a "Just show style suggestions" button that shows scores and accessories without any image.
- **Save** puts the look in a local gallery. **Share** opens an audience selector (default **Private**) and, if shared, adds a Try-ons post to the community feed locally.

### 16.4 AI Stylist `/stylist`

Purpose: a scripted conversation that feels like a stylist.

- Chat thread with a clear stylist identity, timestamps, a typing indicator (1–2 s), and a "Scripted demo" label.
- **Suggested prompts** as chips: "Dinner outfit", "Office look", "Weekend casual", "Something under ₹3,000", "Add more colour".
- **Scripted replies** live in `demo/data/stylistScripts.js`. Match by lowercase keywords (`dinner`, `date`, `work`, `office`, `weekend`, `casual`, `under`, `budget`, `colour`, `color`). If nothing matches, reply with a short clarifying question and show the chips again. The matcher is a plain function you can explain in the viva.
- Each reply includes a plain-language "Why this" line and rich cards:
  - **Wardrobe cards** for owned items (from the demo wardrobe), labelled "From your wardrobe".
  - **Shopping cards**: read real products from the catalogue (`productApi`, `GET /api/products?keyword=…&size=3`) and link to their real `/products/:id` pages. If the call fails or returns nothing, show three clearly labelled **Sample** cards instead. Never invent stock or prices for real products.
- Refinement chips after each reply ("More colour", "Under ₹3,000", "For dinner") send a new scripted turn.
- Context panel: editable style profile (preferred styles, colours, budget) saved locally, and recent themes.
- Error state with Retry (for `?fail=1`). Never claim an action happened that did not.
- Opening with `?item=<id>` pre-fills "Style my <item name>".

### 16.5 Community `/community`

Purpose: a visual feed with consent-aware sharing.

- Tabs: For you, Following, Outfit ideas, Try-ons, Wardrobe, Polls. They filter the seed posts by `type` and `following`.
- Masonry feed (CSS columns again) of image posts. Each shows creator, caption, time, audience badge, and linked items if any.
- Actions: **react** (pink heart, `aria-pressed`, count updates), **comment** (inline list plus a form that adds a local comment), **save**, **share** (toast "Link copied" is acceptable as a simulation).
- **Polls:** choose an option, then results show as numbers and bars. A vote can be made once; the user's choice is marked with text, not colour only.
- **Create post:** pick an image from sample images or upload a local one (downscaled), caption, **required alt text**, optional product tags, **audience selector** (Public, Friends only, Private). Preview before posting. The new post appears at the top.
- Audience: Private and Friends-only posts show a visible badge. A Private post is only ever shown to its owner.
- Menu on each post: Report and Block. They open a confirmation and show a toast, but change nothing real. Label "Demo".

### 16.6 Messages `/messages` and `/messages/:conversationId`

Purpose: friends sharing outfit advice.

- Inbox: 5 seeded conversations (3 direct, 2 group) with unread indicators and client-side search by name. No presence dots (design.md says only where appropriate).
- Thread: chronological messages, composer, and an auto-scroll that only follows if the user is already at the bottom.
- **Sending text:** appends the message, then status moves Sent → Delivered → Read on short timers. About 2 s later a scripted friend reply may appear. Messages are saved locally.
- **Rich cards:** share an outfit (try-on look) or a wardrobe item via a picker. **Private wardrobe items cannot be shared**: show "Private items can't be shared. Change visibility first." with a link.
- **Voice messages:** seeded ones show duration, a play button and a simulated progress bar (no real audio), plus a "Show transcript" toggle with sample text. Recording is not available in the demo; show the mic button disabled with a reason.
- **Failed attachment:** one seeded message is in `FAILED` state with Retry and Remove, so the state is demonstrable.
- Mobile: conversation-first. `/messages` is the list; tapping opens `/messages/:id` with a back button.

### 16.7 Navigation and entry points

- Header: add a **Style** menu (desktop dropdown, section in the mobile menu) with Wardrobe, Try-on, Stylist, Community, Messages. Hide it for Admin. Show it to guests as a link that leads to login.
- Home: an optional "Try it on" teaser band linking to `/try-on`, with the privacy line "In the demo, no photo is uploaded or stored."
- Profile: optional extra tabs for Wardrobe, Try-on gallery, Saved outfits and Community posts that show small previews from local data. Skip if short on time.

---

## 17. Dummy data and images

### 17.1 Seed data

| File (`src/demo/data/`) | Contents                                                                                      | Amount      |
| ----------------------- | --------------------------------------------------------------------------------------------- | ----------- |
| `people.js`             | Fictional users: handle, display name, avatar. **Invented names only.**                       | 12 people   |
| `wardrobe.js`           | Wardrobe items                                                                                | 24 items    |
| `looks.js`              | Try-on outfits with model photo, result image, scores, accessories                            | 6 looks     |
| `posts.js`              | Community posts, mixed types, 2 polls, a few with comments                                    | 18 posts    |
| `conversations.js`      | Conversations and messages, including voice, cards, one failed message                        | 5 threads   |
| `stylistScripts.js`     | Keyword → reply definitions, suggested prompts                                                | 6 scripts   |

Data shapes (JSDoc typedefs in `demo/data/types.js`):

```js
// WardrobeItem
{ id: 'w01', name: 'White oxford shirt', category: 'Tops', colors: ['White'],
  season: 'All-season', occasions: ['Work', 'Casual'], styleType: 'Classic',
  privacy: 'PRIVATE',            // PRIVATE | FRIENDS | PUBLIC
  imageUrl: '/demo/wardrobe/w01.jpg', suggested: false, addedAt: '2026-09-12T10:20:00' }

// TryOnLook
{ id: 'look1', name: 'Linen blazer and tee', sourceImage: '/demo/tryon/look1-source.jpg',
  resultImage: '/demo/tryon/look1-result.jpg',
  scores: { overall: 84, colorHarmony: 90, occasionMatch: 78 },
  accessories: ['Brown leather belt', 'Simple watch'] }

// Post
{ id: 'p01', type: 'LOOK',        // LOOK | TRYON | WARDROBE | POLL | IDEA
  author: 'mira.k', image: '/demo/community/p01.jpg', aspect: '4/5', alt: 'Camel coat over denim',
  caption: 'Layering for the first cold week.', audience: 'PUBLIC', following: true,
  reactions: 42, reactedByMe: false, saved: false, comments: [], createdAt: '2026-09-30T18:05:00',
  poll: null }                    // poll: { question, options: [{ id, label, votes }], myVote: null }

// Conversation
{ id: 'c1', type: 'DIRECT', title: 'Mira K.', participants: ['mira.k'], unread: 2,
  messages: [{ id: 'm1', from: 'mira.k', kind: 'TEXT', text: 'Which jacket for Friday?',
              status: 'READ', sentAt: '2026-10-04T09:12:00' }] }
              // kind: TEXT | OUTFIT_CARD | WARDROBE_CARD | VOICE (with durationSec, transcript)
              // status: SENT | DELIVERED | READ | FAILED
```

Use plausible, varied, inclusive data: different body types, ages, styles and names. Use ₹ prices in any shopping examples. Dates should fall within a few weeks before today.

### 17.2 Images

Folder layout in `public/demo/`:

```text
public/demo/
├─ CREDITS.md          # source and licence for every image
├─ wardrobe/           # w01.jpg … w24.jpg      garment photos, mixed aspect ratios
├─ tryon/              # look1-source.jpg, look1-result.jpg … look6-*   (6 pairs)
├─ community/          # p01.jpg … p18.jpg      mixed aspect ratios (3:4, 4:5, 1:1, 2:3)
└─ avatars/            # a01.jpg … a12.jpg      small square faces or illustrations
```

Rules:

- **Local files only.** Do not hotlink Unsplash, Pexels or random-image URLs. They break, slow the demo, and may disappear.
- Use images you may legally use: free-licence stock (Unsplash, Pexels, Pixabay), your own photos, or generated images. Record every source in `CREDITS.md`.
- Do not use photos of celebrities or of real people you know as "users" or "models".
- Each file is at most 1200px on the long edge and about 150 KB. Prefer WebP or optimised JPG.
- Give every image meaningful alt text in the data (`alt` field or the item name). Decorative avatars use `alt=""` when the name is shown beside them.
- **Missing images must not break the page.** A `DemoImage` component takes a path and, on load error or when the file does not exist, shows a generated placeholder: tinted block, category icon and the item name. That means the app works before the real photos are added, and you can drop them in later without code changes.

### 17.3 What this module set must never do

- Send or store a real photo anywhere outside the browser.
- Call any AI service, or pretend to.
- Add endpoints, fields or tables to `api-contract.md` or ask the backend team for changes.
- Block or slow the core shop. Demo code is lazy-loaded (`React.lazy`) so it does not affect the main bundle.

---

_End of document._
