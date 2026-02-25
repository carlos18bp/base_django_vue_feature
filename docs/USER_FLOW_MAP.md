# User Flow Map

Version: 1.0.0
Last Updated: 2026-02-23
Description: End-to-end user flows for the Base Feature frontend, grouped by role with branches for form variants and alternate outcomes.
Sources: frontend/e2e/flow-definitions.json, frontend/e2e/helpers/flow-tags.js, frontend/e2e specs, frontend/src/router/index.js.

## System Roles
- Guest: Unauthenticated visitor. Can access public pages, sign in, sign up.
- User: Authenticated customer. Can access dashboard, backoffice, and all public pages.
- Admin: No dedicated frontend flows found in the current app or E2E suite.

## Shared Flows (Public or Guest + User)

### auth-login-email: Login with email/password
- Module: auth
- Priority: P1
- Route: /sign_in
- Roles: shared
- Description: User signs in with email and password credentials.
- E2E Coverage: Covered (frontend/e2e/auth/auth-login.spec.js)

**Steps**
1. Open /sign_in.
2. Verify the email and password fields are visible.
3. Fill in email and password.
4. Click the Sign In button.
5. Wait for navigation away from /sign_in (redirect to /dashboard).

**Branches / Variations**
- Empty form submission stays on /sign_in (HTML5 required validation prevents navigation).
- Already-authenticated visitors are redirected to /dashboard by the guest route guard.

---

### auth-login-invalid: Login with invalid credentials
- Module: auth
- Priority: P1
- Route: /sign_in
- Roles: shared
- Description: User sees error when submitting invalid credentials.
- E2E Coverage: Covered (frontend/e2e/auth/auth-login.spec.js)

**Steps**
1. Open /sign_in.
2. Fill in an invalid email and password.
3. Click the Sign In button.
4. Wait for network response.
5. Verify the page stays on /sign_in (login rejected).

**Branches / Variations**
- Server returns 401 for invalid credentials — SweetAlert2 notification shows "Invalid credentials".
- Server returns other error — SweetAlert2 notification shows "Error signing in".

---

### auth-register: Register new account
- Module: auth
- Priority: P1
- Route: /sign_up
- Roles: shared
- Description: User registers a new account via sign-up form.
- E2E Coverage: Covered (frontend/e2e/auth/auth-register.spec.js)

**Steps**
1. Open /sign_up.
2. Verify the URL resolves to /sign_up.
3. Verify email, password, and submit button are visible.
4. Fill in first name, last name, email, password, and confirm password.
5. Click Sign Up button.

**Branches / Variations**
- Empty form submission stays on /sign_up (HTML5 required validation).
- Password less than 8 characters shows a warning notification.
- Passwords that don't match show a warning notification.
- Server error (e.g., duplicate email) surfaces error message via SweetAlert2.
- Already-authenticated visitors are redirected to /dashboard by the guest route guard.

---

### auth-logout: Sign out
- Module: auth
- Priority: P2
- Route: / (logout action in header)
- Roles: shared
- Description: User signs out and session/localStorage is cleared.
- E2E Coverage: Covered (frontend/e2e/auth/auth-logout.spec.js)

**Steps**
1. Set authenticated state in localStorage (access_token, user).
2. Open / (home page).
3. Verify the Sign Out button is visible in the header.
4. Click the Sign Out button.
5. Wait for network idle.
6. Verify access_token is removed from localStorage.
7. Verify the Sign In link reappears in the header.

**Branches / Variations**
- Desktop header shows the Sign Out button; mobile uses the mobile menu.
- After sign-out, the user is redirected to / (home).

---

### auth-protected-redirect: Protected route redirect
- Module: auth
- Priority: P1
- Route: /dashboard, /backoffice
- Roles: shared
- Description: Unauthenticated user is redirected to sign_in when accessing protected routes.
- E2E Coverage: Covered (frontend/e2e/auth/auth-protected-redirect.spec.js)

**Steps**
1. Clear cookies and localStorage (ensure unauthenticated state).
2. Navigate to /dashboard (or /backoffice).
3. Router guard detects no authentication.
4. User is redirected to /sign_in.

**Branches / Variations**
- /dashboard access without session redirects to /sign_in.
- /backoffice access without session redirects to /sign_in.
- Any route with `meta.requiresAuth` triggers the same guard.

---

### auth-guest-redirect: Guest route redirect
- Module: auth
- Priority: P2
- Route: /sign_in, /sign_up
- Roles: shared
- Description: Authenticated user is redirected away from guest-only routes (sign_in, sign_up).
- E2E Coverage: Covered (frontend/e2e/auth/auth-guest-redirect.spec.js)

**Steps**
1. Set authenticated state in localStorage (access_token, user).
2. Navigate to /sign_in.
3. Router guard detects authentication.
4. User is redirected to /dashboard.

**Branches / Variations**
- /sign_in redirects authenticated users to /dashboard.
- /sign_up redirects authenticated users to /dashboard.
- Any route with `meta.requiresGuest` triggers the same guard.

---

### shopping-catalog-browse: Browse product catalog
- Module: shopping
- Priority: P1
- Route: /catalog
- Roles: shared
- Description: User browses the product catalog page and sees products.
- E2E Coverage: Covered (frontend/e2e/shopping/shopping-catalog.spec.js)

**Steps**
1. Open /catalog.
2. Wait for page load and API response.
3. Verify the page URL is /catalog.
4. Verify the page body has content (products rendered).

**Branches / Variations**
- Category filter is visible and clickable — clicking it filters products by category.
- Product links (a[href*="/product/"]) are present — clicking one navigates to /product/:id.
- Empty catalog (no products from API) still renders the page structure.

---

### shopping-product-detail: View product detail
- Module: shopping
- Priority: P1
- Route: /product/:product_id
- Roles: shared
- Description: User navigates to and views a product detail page.
- E2E Coverage: Covered (frontend/e2e/shopping/shopping-product-detail.spec.js)

**Steps**
1. Open /catalog.
2. Find product links on the page.
3. Navigate to the first product's detail URL.
4. Wait for page load.
5. Verify the URL matches /product/:id.

**Branches / Variations**
- Product detail page shows an "Add to Cart" button when the product exists.
- Non-existent product (e.g., /product/999999) stays on the URL but does not show an "Add to Cart" button.
- Product detail page loads gallery images, price, and description from the API.

---

### shopping-cart-add: Add product to cart
- Module: shopping
- Priority: P1
- Route: /product/:product_id
- Roles: shared
- Description: User adds a product to the shopping cart from the detail page.
- E2E Coverage: Covered (frontend/e2e/shopping/shopping-cart.spec.js)

**Steps**
1. Open /catalog.
2. Navigate to a product detail page.
3. Wait for the "Add to Cart" button to be visible.
4. Click the "Add to Cart" button.
5. Verify the page stays on the product detail URL.

**Branches / Variations**
- Cart state is persisted in Pinia store (localStorage via pinia-plugin-persistedstate).
- The header cart icon badge updates to show the cart count.
- Adding the same product multiple times increases the quantity.

---

### shopping-cart-persist: Cart persists across pages
- Module: shopping
- Priority: P2
- Route: /product/:product_id, /catalog
- Roles: shared
- Description: Cart items persist when navigating between pages.
- E2E Coverage: Covered (frontend/e2e/shopping/shopping-cart.spec.js)

**Steps**
1. Open /catalog and navigate to a product detail page.
2. Add a product to the cart.
3. Navigate to /catalog.
4. Wait for page load.
5. Check if the cart counter badge is visible with count > 0.

**Branches / Variations**
- Cart counter badge ([data-testid="cart-count"]) is visible when items are in the cart.
- If the cart counter element is not rendered (component variant), the test verifies the page stayed on /catalog.
- Cart persists across page reloads via localStorage-backed Pinia store.

---

### shopping-checkout-complete: Complete checkout flow
- Module: shopping
- Priority: P1
- Route: /checkout
- Roles: shared
- Description: User completes checkout with items in cart.
- E2E Coverage: Covered (frontend/e2e/shopping/shopping-checkout.spec.js)

**Steps**
1. Open /catalog and navigate to a product detail page.
2. Add a product to the cart.
3. Navigate to /checkout.
4. Verify the Pay button is visible.
5. Fill in checkout form fields: email, card number, expiry, CVV, address, city, state, zip.
6. Click Pay.
7. Wait for navigation away from /checkout (success page or confirmation).

**Branches / Variations**
- Submitting with empty required fields keeps the user on /checkout (form validation).
- Successful payment redirects away from /checkout.
- Checkout page without cart items may show an empty cart state.

---

### blog-list-view: View blog listing
- Module: blog
- Priority: P2
- Route: /blogs
- Roles: shared
- Description: User views the blog listing page with blog entries.
- E2E Coverage: Covered (frontend/e2e/blog/blog-list.spec.js)

**Steps**
1. Open /blogs.
2. Wait for page load and API response.
3. Verify the URL is /blogs.
4. Verify the page body has content (blog entries rendered).

**Branches / Variations**
- Blog links (a[href*="/blog/"]) are present — clicking one navigates to /blog/:id.
- Empty blog list (no blogs from API) still renders the page structure.

---

### blog-detail-view: View blog detail
- Module: blog
- Priority: P2
- Route: /blog/:blog_id
- Roles: shared
- Description: User navigates to and views a blog detail page.
- E2E Coverage: Covered (frontend/e2e/blog/blog-detail.spec.js)

**Steps**
1. Open /blog/1 (or any valid blog ID).
2. Wait for page load.
3. Verify the page body has content (blog title, text, image).

**Branches / Variations**
- User can navigate from /blogs list to a blog detail by clicking a blog link, then return to /blogs.
- Blog detail page renders title, content, and image from the API.

---

### blog-detail-not-found: Blog detail handles non-existent entry
- Module: blog
- Priority: P3
- Route: /blog/999999
- Roles: shared
- Description: User navigates to a non-existent blog and the app handles it gracefully.
- E2E Coverage: Covered (frontend/e2e/blog/blog-detail.spec.js)

**Steps**
1. Open /blog/999999.
2. Wait for page load and API response.
3. Verify the URL stays on /blog/999999 (no crash or redirect).

**Branches / Variations**
- The API returns 404 for non-existent blogs — the page handles this without crashing.
- The page may show an empty state or error message depending on implementation.

---

### home-carousel-navigate: Navigate home page carousels
- Module: home
- Priority: P3
- Route: /
- Roles: shared
- Description: User navigates product and blog carousels on the home page.
- E2E Coverage: Partial (frontend/e2e/home/home-carousels.spec.js) — skips when no backend data loaded.

**Steps**
1. Open / (home page).
2. Wait for page load and API data.
3. Verify product carousel items are present.
4. Click the Next button on the product carousel.
5. Verify the carousel transform changes (items slide).
6. Click Previous button to return.
7. Repeat for the blog carousel.

**Branches / Variations**
- Product carousel skips if no products are loaded from the backend (test.skip guard).
- Blog carousel skips if no blogs are loaded from the backend (test.skip guard).
- Carousel navigation uses GSAP CSS transforms for sliding animation.
- Carousel items link to /product/:id and /blog/:id respectively.

---

### header-search: Search modal open/close
- Module: navigation
- Priority: P2
- Route: / (header component)
- Roles: shared
- Description: User opens the search modal, types a query, and closes it.
- E2E Coverage: Covered (frontend/e2e/navigation/navigation-search.spec.js)

**Steps**
1. Set viewport to desktop (1280x720) — search button is hidden on mobile.
2. Open / (home page).
3. Click the search icon button ([data-testid="header-search"]).
4. Verify the search overlay ([data-testid="search-overlay"]) appears.
5. Type a query in the search input.
6. Clear the search input.
7. Close the modal by clicking the overlay background.
8. Verify the overlay is removed from the DOM.

**Branches / Variations**
- Search input filters products by name in real time via the product store.
- Search results show product images and names in a grid layout.
- "See all products" link navigates to /catalog.
- Close modal triggers GSAP exit animation before removing from DOM.
- Search button is only visible on desktop viewport (hidden lg:flex).

---

### header-cart-overlay: Cart overlay open/close
- Module: navigation
- Priority: P2
- Route: / (header component)
- Roles: shared
- Description: User opens and closes the shopping cart overlay from the header.
- E2E Coverage: Covered (frontend/e2e/navigation/navigation-cart-overlay.spec.js)

**Steps**
1. Set viewport to desktop (1280x720) — cart button is hidden on mobile.
2. Open / (home page).
3. Click the cart icon button ([data-testid="header-cart"]).
4. Verify the cart overlay ([data-testid="cart-overlay"]) appears.
5. Close the cart by clicking the overlay background.
6. Verify the overlay is removed from the DOM.

**Branches / Variations**
- Cart overlay shows "No products" and "Continue Shopping" link when empty.
- Cart overlay shows cart items, subtotal, and "Checkout" button when items exist.
- Cart button badge shows item count when cart has products.
- Close cart triggers GSAP exit animation before removing from DOM.
- Cart button is only visible on desktop viewport (hidden lg:flex).

---

### static-about: View About Us page
- Module: static
- Priority: P4
- Route: /about_us
- Roles: shared
- Description: User views the About Us page content.
- E2E Coverage: Covered (frontend/e2e/static/static-pages.spec.js)

**Steps**
1. Open /about_us.
2. Wait for page load.
3. Verify the URL is /about_us.
4. Verify the h1 heading is visible.

**Branches / Variations**
- Page is publicly accessible without authentication.
- Content is static — no API calls required.

---

### static-contact: View Contact page
- Module: static
- Priority: P4
- Route: /contact
- Roles: shared
- Description: User views the Contact page content.
- E2E Coverage: Covered (frontend/e2e/static/static-pages.spec.js)

**Steps**
1. Open /contact.
2. Wait for page load.
3. Verify the URL is /contact.
4. Verify the h1 heading is visible.

**Branches / Variations**
- Page is publicly accessible without authentication.
- Content is static — no API calls required.

---

### not-found-page: 404 not found page
- Module: navigation
- Priority: P3
- Route: /:pathMatch(.*)*
- Roles: shared
- Description: User navigates to an unknown route and sees the 404 page.
- E2E Coverage: Covered (frontend/e2e/navigation/navigation-not-found.spec.js)

**Steps**
1. Open a non-existent route (e.g., /this-route-does-not-exist-xyz).
2. Wait for page load.
3. Verify the page body contains "404".

**Branches / Variations**
- Any route not matching defined routes falls through to the catch-all /:pathMatch(.*)* route.
- The NotFound.vue component renders a 404 message.
