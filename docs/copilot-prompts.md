# ShopSphere Frontend — Copilot Prompts

Paste these into Copilot Chat in **Agent mode**, one at a time, in order. Prompts 0–9 build the real shop. Prompts **D0–D5** build the frontend-only demo modules (wardrobe, try-on, stylist, community, messages) with dummy data. Do D0–D5 only after the core shop works. After each one: run the app, check the result, commit, then move on.

## How to use them

1. Open the repo in the Codespace and make sure `frontend/` exists.
2. In Copilot Chat, switch to **Agent** mode and pick the strongest model available to you.
3. Each prompt starts with `#file:` references. These attach the spec so Copilot reads it. If your Copilot version does not support `#file:`, drag the files into the chat instead.
4. One prompt per chat session. Start a **new chat** for each prompt so the context stays clean.
5. If Copilot does something outside the prompt (adds a library, invents an endpoint), say: "Revert that. Follow `docs/frontend-requirements.md` §2 and §11."
6. Before every commit, run `npm run lint` and `npm run build` inside `frontend/`.

---

## Prompt 0 — Scaffold

```text
#file:docs/frontend-requirements.md
#file:.github/instructions/frontend.instructions.md

Create the frontend project in a new `frontend/` folder at the repo root.

1. Scaffold with Vite (React, JavaScript). Install exactly the packages in §2: react-router-dom@6, axios,
   @tanstack/react-query, react-hook-form, zod, @hookform/resolvers, tailwindcss, @tailwindcss/vite,
   lucide-react, sonner, @fontsource-variable/newsreader, @fontsource-variable/figtree, plus ESLint and Prettier.
2. Configure vite.config.js with the React and Tailwind plugins and a dev-server proxy: `/api` → http://localhost:8080.
3. Create the exact folder structure from §3, with empty or placeholder files where a file is listed.
4. Create `.env.example` as in §2.
5. Create `src/routes/index.jsx` with all 14 routes from §4. Each page is a placeholder that renders its name inside AppLayout.
   Add ProtectedRoute and AdminRoute exactly as described in §4 (they can read a stub session for now).
6. Add npm scripts: dev, build, lint, format.

Do not build any real page yet. Do not add any package not listed in §2.
When finished, tell me the commands to run and what I should see in the browser.
```

---

## Prompt 1 — Design tokens and the UI kit (the aesthetic foundation)

This is the prompt that decides how good the site looks. Do it before any page.

```text
#file:docs/frontend-requirements.md
#file:.github/instructions/frontend.instructions.md

Build the design system for ShopSphere: §9 (design system) and §10 (UI states).

Design direction: calm editorial minimalism. The store should feel like a well-edited catalogue, not a crowded
marketplace. Product images carry the colour; the interface stays quiet around them. Serif headings (Newsreader),
clean sans body (Figtree), restrained purple primary, generous whitespace, soft diffuse elevation.

Step 1 — Plan first, no code yet. In 10 lines or fewer, show me:
  - the final colour tokens (use the §9.1 table), type scale, spacing scale, radius scale
  - the header layout and the product card layout, as small ASCII sketches
  - the ONE memorable element of the design (it should be the home hero built from real product data)
Then check your plan against the "Avoid" lists in §9 and the instructions file. If any part looks like a generic
template (identical cards, eyebrow labels, gradient decoration, animation on everything), change it and say what you changed.

Step 2 — Build:
  - src/styles/theme.css with every token as a CSS variable in @theme, including dark-mode values.
  - src/styles/index.css with the Tailwind import, base typography, a single :focus-visible ring, and a
    prefers-reduced-motion rule.
  - Every component listed in §9.6 under src/components/ui/, each with variants, a loading/disabled state where it applies,
    and full keyboard and ARIA support.
  - AppLayout, Header (logo, search, nav, wishlist and cart icons with count badges, account menu, mobile menu) and Footer
    under src/components/layout/. Use placeholder data for badges until the API is wired.
  - A temporary /design-check route (remove it later) showing every component and every state.

Rules: no hardcoded hex values or arbitrary pixel values in components; token classes only. Check text contrast
for each colour pairing against WCAG AA and fix any that fail. Works at 360px wide.
```

---

## Prompt 2 — API layer, session and auth

```text
#file:docs/frontend-requirements.md
#file:docs/api-contract.md
#file:docs/frontend.instructions.md

Implement §5 (API integration) and the Login and Register pages (§6.4, §6.5).

1. src/api/httpClient.js, apiError.js, types.js and src/utils/session.js exactly as specified in §5.1–5.3,
   including the rule that a 401 from /api/auth/login must NOT log the user out.
2. src/api/authApi.js and userApi.js (register, profile, addresses). Normalise register's `userId` to `id` (§5.5).
3. AuthContext with login(), logout(), session, isAdmin, expiry timer, and the unauthorized handler (UI-08).
   Logout also clears the TanStack Query cache.
4. Wire ProtectedRoute and AdminRoute to the real session. Redirect rules as in §4.
5. LoginPage and RegisterPage with Zod schemas from §8, a password rule checklist on register, field-level server errors,
   and loading states. Use the shared UI kit only.
6. Header shows Sign in / Create account for guests, and the account menu for users. Admins get the Admin menu.

Do not invent endpoints. If something is unclear, list it as a question at the end instead of guessing.
```

---

## Prompt 3 — Catalogue: home, product list, product detail

```text
#file:docs/frontend-requirements.md
#file:docs/api-contract.md
#file:.github/instructions/frontend.instructions.md

Implement §6.1, §6.2, §6.3 and the header search box.

- productApi.js, categoryApi.js, reviewApi.js (read endpoints only for now) and the hooks in src/hooks/useProducts.js, useReviews.js.
- HomePage: the hero uses the newest real product. New arrivals and category tiles from the API. No invented content.
- ProductListPage: the URL is the filter state (useSearchParams). Keyword (debounced), category, min/max price,
  in-stock, sort, pagination. Active filter chips, result count, Clear all. Filter column on desktop, bottom sheet on mobile.
- ProductDetailPage: image, details, stock text, quantity stepper clamped to stock, reviews loaded by a second request.
  Add to cart and wishlist buttons can be wired in the next step; render them now and disable with a tooltip until then.
- Skeletons, empty states and error states on all three pages. Product cards must not show ratings.

Make the pages look like the design plan from Prompt 1. After building, review your own work against §9 and remove one
decorative element that does not earn its place.
```

---

## Prompt 4 — Cart and wishlist

```text
#file:docs/frontend-requirements.md
#file:docs/api-contract.md
#file:.github/instructions/frontend.instructions.md

Implement §6.6 (cart) and §6.7 (wishlist), and wire every Add to cart and wishlist button built earlier.

- cartApi.js, wishlistApi.js, hooks/useCart.js, hooks/useWishlist.js. Update the query cache from the response of each mutation.
- Header badges read the real cart itemCount and wishlist count.
- Guests who click Add to cart or the heart go to /login?redirect=<current path>.
- CartPage: quantity stepper, remove, empty cart with confirmation, unavailable lines greyed and blocking checkout.
- WishlistPage: remove and move-to-cart. Handle 409 on duplicate add with a toast.
- Heart state on cards and detail page comes from the cached wishlist.
- Some response shapes are not in the contract (see §12). Use the stated assumptions and mark each with a
  `// ASSUMPTION: see frontend-requirements §12` comment so we can find them later.
```

---

## Prompt 5 — Checkout and orders

```text
#file:docs/frontend-requirements.md
#file:docs/api-contract.md
#file:docs/service-boundaries.md
#file:.github/instructions/frontend.instructions.md

Implement §6.8 (checkout), §6.9 (orders) and §6.10 (order detail).

- orderApi.js, paymentApi.js, hooks/useOrders.js, hooks/useAddresses.js.
- CheckoutPage: address radio list with an inline "add address" form, payment method radios (NO card or UPI fields),
  read-only summary, Place order disabled while pending.
- Handle every failure in the §6.8 table (400 empty cart, 400 address, 400 stock, 402 payment declined, 503 unavailable).
  Keep the user's selections after each failure. Never navigate away on failure.
- On 201: invalidate cart and orders, navigate to /orders/:id with router state { justPlaced: true } and show the banner.
- OrdersPage with pagination. OrderDetailPage with snapshot items, delivery address, payment info, status timeline,
  cancel with confirmation (only PENDING and CONFIRMED).

Do not compute totals in the browser. Display the server's values.
```

---

## Prompt 6 — Profile and reviews

```text
#file:docs/frontend-requirements.md
#file:docs/api-contract.md
#file:.github/instructions/frontend.instructions.md

Implement §6.11 (profile) and the review form and edit/delete flow from §6.3.

- ProfilePage tabs: Details (email read-only with the explanation), Addresses (add, edit, delete with confirmation,
  set default, Default badge, last-address rule), Security (change password), My reviews.
- ReviewForm: rating 1–5 and optional comment. Show the server's 403 and 409 messages. If the user already has a review in the
  list (match userId), show Edit and Delete instead of the form.
- All forms use the Zod schemas from §8 and map server fieldErrors onto fields.
```

---

## Prompt 7 — Admin

```text
#file:docs/frontend-requirements.md
#file:docs/api-contract.md
#file:docs/frontend.instructions.md

Implement §6.12 (admin products and categories) and §6.13 (admin orders).

- Admin sub-navigation: Products | Categories | Orders. Categories live inside /admin/products.
- Products table with add, edit, delete. Fetch the product detail when opening Edit because the list lacks stockQuantity.
  Image is a URL text field, not an upload. Quick stock-adjust dialog.
- Admin orders table with a status select offering only the valid next statuses from §6.13. Confirm before cancelling.
  Show server 400 messages.
- Tables become stacked cards on mobile. Everything uses the shared UI kit.
```

---

## Prompt 8 — Aesthetic polish pass

Run this near the end, once every page exists.

```text
#file:docs/frontend-requirements.md
#file:docs/frontend.instructions.md

Do a design review of the whole app against §9. Do not add features.

1. Visit every route at 360px, 768px and 1280px. List every spot where spacing, type size, radius, colour or button style is inconsistent.
2. Find any hardcoded hex value or arbitrary pixel value in src/ and replace it with a token.
3. Check text contrast for every colour pairing used, against WCAG AA. Fix failures with tokens, not one-off colours.
4. Find any generic template patterns (ALL-CAPS eyebrow labels, identical cards with identical shadows, decorative gradients,
   fade-and-slide on every section, hover animation on every card) and remove them.
5. Make sure the home hero is the single memorable moment and everything else is quiet.
6. Check image handling: fixed aspect ratios, no layout jump, a placeholder for missing or broken images.
7. Make the copy consistent: sentence case, actions named by what they do, toasts that match button labels.

Make the fixes. Then give me a short list of what you changed and anything you left alone on purpose.
```

---

## Prompt 9 — Accessibility and failure-path check

```text
#file:docs/frontend-requirements.md
#file:docs/frontend.instructions.md

Audit the app against §9.7, §10 and §15. Do not add features.

- Walk the keyboard-only path: login → find a product → add to cart → checkout → order detail. Fix any step that cannot be done or has no visible focus.
- Check every dialog and drawer for focus trap, Escape to close and focus return.
- Check every form for visible labels, aria-describedby on errors, and role="alert" on form-level errors.
- Confirm that no source file contains "/internal/" or a service port (8081–8088).
- Confirm each data screen has loading, empty and error states.
- Confirm the four checkout failure paths and the session-expiry redirect behave as described.

Report a checklist of pass or fail with file names for each failure, then fix the failures.
```

---

## Demo modules (dummy data, no backend)

Run these after Prompt 9, in this order. D0 is required first. After that you can stop after any prompt and the app is still complete.

### Prompt D0 — Demo foundation

```text
#file:docs/frontend-requirements.md
#file:docs/frontend.instructions.md

Set up the frontend-only demo layer described in §16.1 and §17. Do not build any module page yet.

1. Create src/demo/ with data/, api/, hooks/, components/ and pages/ as in §3.
2. Create these shared pieces:
   - DemoBadge (small "Demo" chip) and DemoNotice ("Demo mode: sample data. Nothing is sent to a server." plus a
     "Reset demo data" button).
   - DemoImage: renders an <img> from a path under /public/demo and, if the file is missing or fails to load,
     shows a generated placeholder (tinted block with a category icon and the item's name). Must keep a fixed
     aspect ratio so layout does not jump.
   - demo/api/storage.js: read/write helpers for localStorage keys `shopsphere.demo.<module>`, wrapped in try/catch,
     plus resetAllDemoData().
   - demo/api/fakeApi.js: a helper `simulate(fn, { minMs: 300, maxMs: 900 })` that waits, then runs fn, and rejects with a readable
     error when the URL contains ?fail=1.
3. Create the seed data files from §17.1 with the typedefs in demo/data/types.js. Fill people.js (12 invented people) now.
   Leave the other data files exporting empty arrays; later prompts fill them.
4. Add the 6 demo routes from §4 under AppLayout and ProtectedRoute, lazy-loaded with React.lazy. Each page is a placeholder
   showing DemoBadge, DemoNotice and the page name.
5. Add the "Style" menu to the Header (desktop dropdown, section in the mobile menu), hidden for Admin.
6. Create public/demo/ with the folders from §17.2 and a CREDITS.md template. Do not add images.

Only the demo layer. Do not change any core shop page except Header.
```

### Prompt D1 — Virtual try-on

```text
#file:docs/frontend-requirements.md
#file:.github/instructions/frontend.instructions.md

Implement §16.3 Virtual Try-On at /try-on, in src/demo only.

- Fill demo/data/looks.js with 6 outfits (names, source and result image paths under /demo/tryon/, scores, accessories).
  Paths may point to files that do not exist yet; DemoImage will show placeholders.
- demo/api/tryOnApi.js: list looks, generate preview (3-step fake progress, about 3 seconds), save look, list saved looks,
  share look (audience Private, Friends only or Public; default Private).
- TryOnPage: outfit picker, disabled photo-upload button with the reason, Generate preview with progress and Cancel,
  before/after comparison driven by a native <input type="range"> (keyboard accessible) with "Original" and "Demo preview"
  labels, full-screen view, scores panel (number plus bar), accessories, the "sample preview" disclaimer, the trust panel,
  a "Just show style suggestions" no-photo option, Save and Share with an audience selector.
- Loading, error (?fail=1) and empty states. Use the shared UI kit and tokens only.
- Add the optional home-page "Try it on" teaser band linking to /try-on.

Never write that a photo was uploaded, stored or analysed.
```

### Prompt D2 — Smart wardrobe

```text
#file:docs/frontend-requirements.md
#file:.github/instructions/frontend.instructions.md

Implement §16.2 Smart Wardrobe at /wardrobe, in src/demo only.

- Fill demo/data/wardrobe.js with 24 items using the shape in §17.1 (varied categories, colours, seasons, occasions, styles;
  mix of PRIVATE, FRIENDS and PUBLIC; image paths under /demo/wardrobe/).
- demo/api/wardrobeApi.js: list, add, update attributes, change privacy, delete (with undo), all persisted in localStorage.
- WardrobePage: header with count and honest computed insights, filters (category, occasion, season, colour, style, privacy)
  that update grid and count together, a CSS-columns masonry grid with DOM order equal to reading order, cards with privacy badge
  and item menu.
- Add-item flow: dropzone (JPG, PNG, WebP up to 5 MB, clear rejection messages), fake progress with Cancel, fake suggestion step with
  editable chips marked "Suggested" (not treated as confirmed), default privacy Private, downscale to 800px before storing,
  catch storage-full errors.
- Privacy change with a confirmation when moving to Public. Delete with confirmation and Undo.
- "Style this item" links to /stylist?item=<id>.
- Empty, loading and error (?fail=1) states.
```

### Prompt D3 — AI stylist

```text
#file:docs/frontend-requirements.md
#file:.github/instructions/frontend.instructions.md

Implement §16.4 AI Stylist at /stylist, in src/demo only.

- demo/data/stylistScripts.js: 6 scripted replies keyed by lowercase keywords (dinner/date, work/office, weekend/casual,
  under/budget, colour/color, plus a fallback that asks a clarifying question). Each reply has text, a "Why this" line,
  wardrobe item ids and a search keyword for shopping cards.
- demo/api/stylistApi.js: a plain, well-commented function `matchScript(message)` and an async `sendMessage()` that waits 1–2 seconds.
- StylistPage: chat thread with stylist identity, timestamps, typing indicator and a "Scripted demo" label; suggested prompt chips;
  wardrobe cards labelled "From your wardrobe"; shopping cards loaded from the REAL catalogue with productApi
  (GET /api/products?keyword=...&size=3), linking to /products/:id, falling back to three clearly labelled "Sample" cards when the call
  fails or returns nothing; refinement chips; a context panel with an editable style profile saved locally; Retry on error (?fail=1);
  support /stylist?item=<id> to pre-fill the first message.
- Never invent stock or prices for real products. Never claim an action happened that did not.
```

### Prompt D4 — Community

```text
#file:docs/frontend-requirements.md
#file:.github/instructions/frontend.instructions.md

Implement §16.5 Community at /community, in src/demo only.

- Fill demo/data/posts.js with 18 posts (mixed types, 2 polls, some comments, audiences Public and Friends only, alt text on every image).
- demo/api/communityApi.js: list by tab, react, save, comment, vote in poll (once), create post. Persist in localStorage.
- CommunityPage: tabs (For you, Following, Outfit ideas, Try-ons, Wardrobe, Polls); CSS-columns masonry feed; reaction heart
  with aria-pressed; inline comments; poll results as numbers and bars after voting; visible audience badges.
- Create-post dialog: choose a sample image or upload locally (downscaled), caption, REQUIRED alt text, optional product tags,
  audience selector (default Public), preview, then post to the top of the feed.
- Report and Block menu items that open a confirmation and show a toast labelled Demo.
- A Private post is only ever shown to its owner. Loading, empty and error (?fail=1) states.
```

### Prompt D5 — Messages

```text
#file:docs/frontend-requirements.md
#file:.github/instructions/frontend.instructions.md

Implement §16.6 Messages at /messages and /messages/:conversationId, in src/demo only.

- Fill demo/data/conversations.js with 5 conversations (3 direct, 2 group) including text, outfit cards, wardrobe cards, two
  voice messages (durationSec and transcript) and one FAILED message.
- demo/api/messagesApi.js: list conversations, get thread, send text (status Sent, then Delivered, then Read on timers; a scripted
  friend reply about 2 seconds later), share a card, retry failed, remove failed. Persist in localStorage.
- Inbox with unread indicators and client-side name search. Thread with composer and auto-scroll that only follows when the user
  is already at the bottom. Mobile is conversation-first with a back button.
- Share picker for outfits and wardrobe items. A Private wardrobe item cannot be shared: show "Private items can't be shared.
  Change visibility first." with a link to /wardrobe.
- Voice messages: play button, simulated progress bar (no audio), transcript toggle. Recording is a disabled mic with a reason.
- Loading, empty and error (?fail=1) states.
```

### Prompt D6 — Dummy images checklist (do this yourself, no Copilot)

1. Pick free-licence sources (Unsplash, Pexels, Pixabay) or use your own or generated images.
2. Download and resize to at most 1200px on the long edge, about 150 KB each.
3. Name and place them as in `docs/frontend-requirements.md` §17.2: 24 wardrobe photos, 6 try-on source and result pairs, 18 community images, 12 avatars.
4. Record every source and licence in `public/demo/CREDITS.md`.
5. Reload the app. Placeholders should be replaced by the real photos. Any file you did not add still shows a placeholder, so nothing breaks.

---

## Handy one-liners

| When                                 | Say                                                                                                           |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| Copilot added a library              | "Remove that dependency. Use only the stack in §2 of the requirements."                                       |
| Copilot invented an API field        | "That field is not in api-contract.md. Remove it, and add it to §12 as a question if we need it."             |
| UI looks generic                     | "Re-read §9. Remove template patterns and make the design match our token set. Show the changes."             |
| Page is getting long                 | "Split this page. Move data logic into a hook and markup into components, as in §3."                          |
| Copilot calls the backend from a demo page | "Demo modules must not call the gateway. Use src/demo/api with the fake delay helper, as in §16.1." |
| You want to understand code          | "Explain this file line by line for a viva, and list the three questions an examiner might ask about it."     |
