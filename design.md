# FashionSphere — Product & UI Design

## 1. Product vision

FashionSphere is a premium fashion destination that brings shopping, personal styling, wardrobe planning, virtual try-on, and fashion community into one coherent experience. It should feel like a calm, considered fashion publication with the warmth of a personal stylist—not a crowded marketplace.

The product pairs the editorial clarity and polish of Apple, Zara, and Nike with Pinterest's visual discovery, Airbnb's approachable planning, and Instagram's social expression. Those are directional references: FashionSphere should have its own recognizable voice, visual language, and interaction patterns.

**Design principles**

- **Personal, not prescriptive:** AI makes useful suggestions while leaving the user in control.
- **Editorial before transactional:** Lead with inspiration and visual storytelling; keep purchase actions easy to find.
- **A wardrobe is a collection:** Treat owned clothing as valuable personal content, not just inventory.
- **Share with intention:** Privacy and audience are visible anywhere a wardrobe item or look can be shared.
- **Quietly intelligent:** Explain why recommendations appear and make automated analysis reviewable.
- **Accessible by default:** Clear contrast, keyboard access, reduced-motion support, descriptive labels, and responsive touch targets.

## 2. Audience and core journeys

### Primary audience

Style-conscious shoppers who want help finding quality pieces, getting more wear from clothing they own, and sharing looks with trusted friends or a broader fashion community.

### Core journeys

1. **Discover → shop → evaluate → purchase:** Browse editorial collections, search or filter products, open a product detail, explore styling suggestions, optionally try the item on, and add it to the bag or wishlist.
2. **Add → understand → style wardrobe:** Upload clothing, review AI-detected attributes, select privacy, filter the collection, and ask the stylist for outfit ideas.
3. **Try → compare → save or share:** Choose a profile photo and garment, review an AI-generated preview beside the original, assess the stylist's scores and suggestions, then save or share the result.
4. **Connect → converse → inspire:** Browse community looks, react or comment, share wardrobe items and try-on cards in direct or group messages, and retain control over the audience.
5. **Manage → revisit:** Use the profile to return to orders, wishlist, wardrobe, try-ons, saved outfits, posts, and settings.

## 3. Brand and visual direction

FashionSphere's visual identity is **warm editorial minimalism with a subtle digital glow**. Photography carries most of the color and emotion. Interface color is restrained and purposeful: purple for AI and primary brand interactions, pink for expressive social moments, and cyan for occasional status or freshness cues.

### Palette

| Token | Value | Intended use |
|---|---|---|
| Primary | `#7C3AED` | AI controls, active navigation, primary links and selected states |
| Secondary | `#EC4899` | Reactions, expressive accents, select promotional moments |
| Accent | `#06B6D4` | Informational accents, freshness, secondary status |
| Light background | `#F8FAFC` | Main canvas and negative space |
| Dark background | `#0F172A` | Dark-mode canvas |
| Light surface | `#FFFFFF` | Cards, panels, modals |
| Dark surface | `#172033` | Elevated dark-mode cards and panels |
| Primary text | `#1E293B` | Light-mode headings and body text |
| Dark-mode text | `#F1F5F9` | Dark-mode headings and body text |
| Muted text | `#64748B` | Supporting information and metadata |
| Border | `#E2E8F0` | Separators and subtle component boundaries |

Use tints of purple, pink, and cyan for soft gradients rather than large, highly saturated color fields. Check all text and interactive states for WCAG AA contrast; do not rely on color alone to convey status.

### Typography

- **Editorial headings:** A high-contrast serif with expressive, measured scale. Use italics sparingly to highlight an idea or phrase.
- **Interface and body:** A clean sans serif with readable counters and strong small-size legibility.
- **Hierarchy:** Large editorial page titles; medium section headings; concise card titles; compact uppercase eyebrow labels used selectively.
- **Numerals:** Tabular numerals for prices, counts, and rating scores where alignment matters.

Avoid long all-caps passages, overly tight leading, and text smaller than 12px for essential mobile content.

### Shape, surfaces, and motion

- Use large radii—generally 20–24px—for feature panels and hero surfaces, and 10–16px for compact controls and cards.
- Apply glassmorphism selectively to floating labels, media controls, and overlays. Keep text legible against every image.
- Use soft, diffuse shadows to communicate elevation; reserve strong shadows for overlays and modals.
- Keep transitions subtle: approximately 160–240ms for hover, selection, and navigation; use gentle easing and avoid unnecessary movement.
- Respect `prefers-reduced-motion`; no interaction or information should depend on animation.

### Photography and imagery

Use art-directed, high-quality fashion photography with natural poses, varied bodies and identities, and consistent color treatment. Mix full looks, fabric details, accessories, and lived-in personal style. Preserve image aspect ratios when they aid editorial composition; crop consistently in product cards. Provide meaningful alternative text for informative images and empty alt text for purely decorative images.

## 4. Global application shell

### Desktop

- Persistent left navigation groups the user's personal space (Discover, Explore fashion, My wardrobe, Virtual try-on, Community) and social space (Messages, My profile).
- An unobtrusive top bar shows contextual location/date, global search, notifications, and profile access.
- Main content uses generous horizontal gutters and a flexible maximum width. Editorial surfaces can span the canvas; dashboard content uses aligned columns.
- An AI Stylist entry remains easy to find, but must not obscure primary navigation or content.

### Mobile

- Replace the fixed desktop sidebar with a compact bottom navigation for the highest-frequency destinations. Keep all other areas reachable through profile or a clearly labeled secondary menu.
- Use a compact top bar with search and profile access; provide a dedicated full-screen search experience on narrow viewports.
- Stack multi-column layouts, retain comfortable image proportions, and make filters, chat controls, and purchase actions touch-friendly.
- Keep important actions visible without covering image content; use sticky actions only when there is a clear task benefit.

### Shared interaction conventions

- Use clear active, hover, focus-visible, pressed, disabled, loading, and error states.
- Provide descriptive accessible names for icon-only controls.
- Use confirmation and undo for consequential actions such as removing a saved item or deleting content.
- Keep toast feedback brief and non-blocking; use inline validation for form errors.
- Preserve scroll position and user input when moving between related screens where practical.

## 5. Screen specifications

### 5.1 Discover / landing page

**Purpose:** Inspire the user, establish personal relevance, and create clear paths into browsing, styling, and try-on.

**Structure**

1. Welcome message and personalized daily-edition context.
2. Large photographic hero with seasonal editorial headline, collection name, and a clear “Explore the edit” action. Provide restrained previous/next controls if the hero rotates.
3. A compact AI style-report feature, showing a brief match insight and a route to the Stylist.
4. Three visual discovery categories, each with a clear label and link.
5. New arrivals product row with price, brand, category, color options, wishlist, and quick view.
6. AI virtual try-on banner with a direct entry point and privacy reassurance.
7. Personalized recommendations with a concise explanation of why they were selected.
8. Featured brands, customer testimonial, and a compact footer with account and community links.

**Behavior:** On mobile, show the hero first, stack the AI feature, use horizontal scrolling only for deliberate card carousels, and keep product cards legible in a two-column grid.

### 5.2 Product listing / Explore fashion

**Purpose:** Make a large catalog easy to search and refine without losing the visual pleasure of browsing.

**Structure**

- Search field with natural-language examples and a clear submit action.
- Result count, removable active filter chips, sort menu, and a filter drawer on smaller screens.
- Desktop sidebar filters for category, price, color, size, and style. Add season, occasion, availability, and brand when supported by catalog data.
- Product grid with consistent image treatment, brand, product name, price, available color cues, and a discreet new/featured badge.
- Wishlist control and quick-view action on each card.

**Behavior:** Search and filters should update results, count, and selected chips together. Sorting must preserve applied filters. Empty results provide a clear reset action and helpful next step. On mobile, open filters in an accessible drawer or full-screen sheet.

### 5.3 Product detail

**Purpose:** Answer purchase questions, communicate quality, and connect a product to a personal style decision.

**Structure**

- Large image gallery with thumbnails, position indicator, optional motion/video, and accessible previous/next controls.
- Product brand, name, review score, price, concise description, color variants, size selection, and fit/size guidance.
- Prominent Add to bag and Try on actions, with wishlist as an equally understandable secondary action.
- Delivery, returns, stock/availability, and material/care details.
- An AI styling card that explains wardrobe compatibility and provides a route to ask the Stylist.
- Reviews and similar products below the main purchase information.

**Behavior:** Keep size and color selection state explicit. Do not add to bag until required options are selected. The quick-view modal is a preview, not a replacement for the complete detail page; support escape-to-close, focus management, and return focus to the trigger.

### 5.4 Smart Wardrobe

**Purpose:** Turn clothing the user owns into a searchable, private, useful style resource.

**Structure**

- Collection header with item count and useful collection-level insights.
- Add-to-wardrobe upload action with clear accepted formats and privacy explanation.
- Filters for category, occasion, season, color, style type, and privacy visibility.
- Responsive Pinterest-style masonry layout. Each card includes garment photo, name/category, AI-detected attributes, privacy badge, and an item menu.
- A floating or adjacent AI outfit assistant with wardrobe-aware recommendations and visible links to the items used.

**AI attributes:** Category, color, season, occasion, and style type are suggested automatically. Show them as editable values and communicate uncertainty; do not silently treat an inferred attribute as confirmed. Support manual correction and retry.

**Privacy:** Every item has one explicit state: **Private**, **Friends only**, or **Public**. Default newly uploaded items to Private. Show privacy where an item is displayed or shared and let users change it deliberately.

**Upload flow:** Validate file type and size, show progress, support retry/cancel, and provide a useful error if upload or analysis fails. Successful upload adds the item with editable AI suggestions. Masonry layout must remain keyboard accessible and reflow in a sensible reading order.

### 5.5 Virtual Try-On

**Purpose:** Help users imagine an outfit while being transparent about the generated preview and its limits.

**Structure**

- Main comparison canvas showing the source/profile image and generated preview with a draggable before/after divider.
- Clear labels for both sides, a keyboard-operable comparison control, and full-screen viewing.
- User photo selection and outfit upload/selection in a supporting panel.
- AI Stylist panel with overall outfit score, color-harmony score, occasion-match score, and suggested accessories.
- Save and share actions with clear privacy/audience selection.

**Behavior and trust:** Explain what images are used, where they are stored, who can see them, and how to delete them. Show progress and failure states while generation is underway. Label generated imagery as an AI preview; do not imply an exact fit, drape, sizing, or guaranteed product appearance. Provide a non-image alternative for users who do not wish to upload a profile photo.

### 5.6 AI Stylist Assistant

**Purpose:** Offer approachable, personalized guidance grounded in the user's stated preferences, wardrobe, and available products.

**Structure**

- Conversational thread with clear stylist identity, timestamps, accessible message grouping, and concise suggested prompts.
- Rich recommendation cards for outfits and products; wardrobe cards identify owned items and shopping cards link to product detail.
- A context panel summarizing the user's editable style profile and recent themes.
- Composer supporting text and, when implemented, attachments and voice.

**Behavior:** Explain recommendations in plain language and let users refine them (“more color,” “under $200,” “for dinner”). Distinguish generated suggestions from verified product/availability data. Provide clear loading, retry, and service-error states; never fabricate inventory or completed actions.

### 5.7 Social Fashion Community

**Purpose:** Support visual fashion discovery and friendly, consent-based sharing.

**Structure**

- Feed tabs for For you, Following, Outfit ideas, Try-ons, wardrobe sharing, and style polls.
- Responsive masonry feed of image/video posts, with creator, caption, location/time where shared, optional linked items, and post visibility.
- Reaction, comment, save, and share controls; polls offer clear choices and visible results.
- Create-post flow with media preview, caption, tagged products, alt text, and audience selector.

**Behavior:** Preserve media context and creator attribution. Make private/friends-only content visibly distinct and enforce audience settings when linking or resharing. Include reporting, blocking, and moderation entry points.

### 5.8 Fashion Messaging

**Purpose:** Make sharing outfit advice and fashion inspiration with friends feel as considered as the product itself.

**Structure**

- Inbox with direct and group conversations, requests, search, unread indicators, and presence only where appropriate.
- Conversation header, chronological message thread, and composer.
- Rich message cards for outfits, wardrobe items, and virtual try-on looks.
- Voice-message playback with duration and progress; read receipts and delivery states.

**Behavior:** Support sending, retrying, and removing failed attachments. Provide text alternatives for voice messages when transcription is available and ensure media cards have descriptive labels. Respect the sender's visibility settings when sharing wardrobe items.

### 5.9 User Profile dashboard

**Purpose:** Give the user one clear home for their identity, activity, purchases, and settings.

**Structure**

- Profile image, cover, display name, handle, location (if shared), editable bio, and follower/following counts.
- Tabs or sections for Overview, Orders, Wishlist, Smart Wardrobe, Virtual Try-On Gallery, Saved Outfits, Community Posts, and Settings.
- Overview cards for wardrobe and try-ons; recent orders with clear shipment states; optional style analytics.
- Privacy and account controls grouped accessibly under Settings.

**Behavior:** Analytics should be optional, explainable, and based on actual activity. Order states must reflect verified order data. Make settings discoverable and confirm sensitive account/privacy changes.

## 6. Design system and reusable components

### Components

- App shell, responsive navigation, page header, search field, buttons, filter chips, select menus, tabs, badges, and toasts.
- Product card, wishlist control, quick-view dialog, product image gallery, price/size selector, and review summary.
- Wardrobe card, privacy badge, upload dropzone, editable AI attribute chip, masonry collection, and outfit recommendation card.
- Before/after comparison, generation state, score meter, message bubble, rich message card, community post, reaction bar, and profile stat card.

### Component requirements

- Define visual and semantic variants rather than creating visually similar one-off controls.
- Use semantic HTML and accessible names; ensure focus is visible and keyboard order follows visual intent.
- Use real `button`, `a`, `input`, and `select` elements as appropriate; do not rely on clickable non-semantic containers.
- Ensure controls are comfortable to operate on touchscreens (target at least 44 × 44 CSS px where practical).
- Keep success, warning, and error states distinguishable without relying only on hue.

## 7. Responsive behavior

| Area | Desktop | Tablet | Mobile |
|---|---|---|---|
| Navigation | Fixed left sidebar and top utility bar | Collapsible/narrow sidebar | Bottom navigation and compact top bar |
| Product results | Filters beside 3–4 column grid | Collapsible filters, 2–3 columns | Filter sheet, 2 columns |
| Product detail | Gallery beside purchase panel | Balanced stacked or side-by-side layout | Gallery, sticky purchase actions, then detail |
| Wardrobe/community | 3–5 responsive masonry columns | 2–3 columns | 2 columns with readable cards |
| Try-on | Canvas beside control panel | Canvas above compact controls | Canvas first, controls in a scrollable panel |
| Messaging | Inbox beside conversation | Narrower inbox and conversation | Conversation-first navigation with inbox route |
| Profile | Main column and supporting rail | Stacked dashboard panels | Single column and horizontally scrollable tabs |

Prevent horizontal page overflow. Test the smallest supported viewport, browser zoom, landscape orientation, and long translated labels.

## 8. Accessibility, inclusion, and trust

- Target WCAG 2.2 AA for contrast, focus appearance, keyboard access, and form feedback.
- Provide alt text for meaningful fashion images and captions/transcripts for media where available.
- Support screen readers in galleries, filters, chat, masonry, sliders, dialogs, and live feedback.
- Respect reduced motion and system theme preferences; preserve an obvious manual theme control.
- Avoid gender-exclusive categories as the only discovery path; provide inclusive sizing and useful fit notes.
- Do not use body-shape judgments or stigmatizing language in AI descriptions.
- Explain AI-generated content and analysis, allow users to correct inferences, and provide controls to delete uploaded/generated imagery.
- Make sharing audience and visibility explicit before a public action.

## 9. Product states and content design

Every data-driven screen must account for:

- **Loading:** Use reserved image/card geometry and restrained skeletons; do not shift the page unnecessarily.
- **Empty:** Offer a human, useful next step (upload the first wardrobe item, clear filters, invite a friend).
- **Error:** Explain what failed, preserve entered data, and offer retry or another route.
- **Success:** Confirm completed action and expose undo where appropriate.
- **Offline or unavailable:** Identify content that may be stale and disable actions that cannot safely complete.

Use warm, concise copy. Prefer specific language (“Saved to your wardrobe”) over generic success text. Do not imply a backend or AI action succeeded unless it actually did.

## 10. Motion and interaction details

- Product image hover: subtle scale (around 1.02–1.04) and reveal quick view without hiding product information on touch devices.
- Cards and buttons: small lift or color transition on hover; clear pressed state on activation.
- Navigation: quick fade/short vertical transition; preserve reduced-motion setting.
- Modals and drawers: fade backdrop and gently scale/translate the surface; trap focus and close with Escape.
- Try-on comparison: continuous pointer/touch slider plus keyboard arrow support and a clearly visible handle.
- Chat: append messages without jumping focus; keep the newest message visible when the user is already at the bottom.

Motion must reinforce cause and effect, not simulate AI certainty or delay essential actions.

## 11. Success criteria

- A new user can identify the core value proposition and begin discovering fashion immediately.
- A shopper can search, refine, inspect a product, select options, and understand the next purchase step.
- A user can add a wardrobe item, review AI-suggested attributes, and see its privacy status.
- A user can understand that virtual try-on is generated imagery, compare it with the source, and control sharing.
- Community and messaging content clearly identify author, audience, and interaction state.
- All core journeys are usable on mobile, keyboard, and screen reader with clear loading, empty, error, and success states.
- Light and dark themes retain hierarchy, contrast, photography quality, and legible focus states.

## 12. Implementation note

This document specifies the intended product and design behavior, not backend guarantees. Catalog search, purchases, inventory, persistence, AI classification, try-on generation, social moderation, message delivery, and privacy enforcement require corresponding product services. Frontend demonstrations must be labeled or implemented so they do not suggest real processing or persistence where none exists.
