# PeopleSpace: architecture and application flow

## 1. End-to-end flow

1. The browser checks `/api/auth/session`. A valid session opens the directory; otherwise the login page is shown.
2. Login verifies a salted scrypt password hash, stores the SHA-256 hash of a random session token in SQLite, and returns only the opaque token in an HTTP-only, SameSite cookie.
3. The authenticated browser opens the directory and `useDirectoryFilters` parses the URL query string.
4. Search input is debounced by 350 ms to avoid sending a request for every keystroke.
5. React Query concurrently requests page 1 from `/api/users` and live filter options from `/api/users/facets`. Both endpoints reject unauthenticated requests.
6. Express validates and normalizes every parameter. Unsupported sort fields fall back to `first_name`, page sizes are capped, and search wildcard characters are escaped.
7. The service builds parameterized SQLite queries. No user value is interpolated into SQL; the sort column comes from a strict allow-list.
8. Results return with `page`, `limit`, `total`, `totalPages`, and `hasMore`. Facets return the top 20 `{ value, count }` pairs.
9. The client renders only visible rows using TanStack Virtual and displays numbered page controls from the returned pagination metadata.
10. Choosing a page updates the URL. Changing search, filters, or sorting removes that page parameter, returns to page 1, refreshes facets, and updates the URL. Reloading or sharing that URL restores the same view after login.
11. Logout deletes the persisted session, clears the cookie, and returns the browser to the login page.

## 2. Data model

`users` stores identity, avatar, age, and nationality. `hobbies` stores each normalized hobby once. `user_hobbies` is a many-to-many join table with a composite primary key. `accounts` stores login identity and password hashes, while `sessions` stores hashed opaque tokens with expiration timestamps.

This normalized model avoids hobby strings or JSON blobs, supports indexed hobby lookup, and makes “has all selected hobbies” correct and efficient. Indexes cover names, nationality, age, and the hobby-to-user join direction. SQLite WAL mode improves read concurrency and `synchronous=NORMAL` gives a practical local-app performance balance.

## 3. Filter semantics

- Text: case-insensitive partial match on first name, last name, or the combined full name.
- Nationalities: `IN (...)`, so selecting several means nationality A **or** B.
- Hobbies: a grouped subquery counts distinct selected hobbies and requires the count to equal the number selected, so selecting several means hobby A **and** B.
- Categories combine with `AND`.
- Sorting always adds `id` in the same direction as the final tie-breaker. Stable ordering prevents duplicates or omissions across offset pages.

Facet queries are “self-excluding”: hobby counts retain text and nationality constraints but omit selected hobbies; nationality counts retain text and hobby constraints but omit selected nationalities. This common faceted-search behavior keeps alternative choices discoverable while ensuring counts always reflect the rest of the active result context.

## 4. Client architecture (Feature-Sliced Design)

- `app`: providers, router boundary, entry point, and design tokens.
- `pages/directory`: orchestrates the directory screen and its async states.
- `widgets/directory-list`: virtualized result region.
- `features/directory-pagination`: numbered page navigation and compact ellipsis behavior.
- `features/directory-filters`: URL-backed filter state and filter panel.
- `features/directory-sort`: sort interaction.
- `features/auth`: session state and login/logout orchestration.
- `pages/login`: responsive sign-in experience.
- `entities/account`: account contract and authentication API.
- `entities/user`: user contract, API access, and reusable card.
- `shared`: generic fetch client, debounce utility, button, and spinner.

This keeps domain representation separate from user actions and page composition. A feature can import entities/shared, while entities never depend on pages or widgets.

## 5. Performance choices

- Virtual rendering limits mounted cards even after many pages are fetched.
- Seven-row overscan prevents blank flashes during fast scrolling.
- Page requests contain 30 records; the API enforces a maximum of 50.
- Debounced search, request cancellation signals, 30-second query freshness, and retained previous facet data reduce network churn and visual flicker.
- SQLite uses prepared statements, normalized relations, useful indexes, WAL mode, and a single aggregate query for hobbies per page.
- Avatars use native lazy loading and graceful initial fallbacks.
- The production build is static and served by Express; hashed assets receive long-lived caching.

## 6. UI and failure flow

The desktop layout keeps discovery filters beside results. On small screens, filters move into an accessible drawer and active selections remain visible as removable chips. Search and sorting stay above the list.

Initial loading uses structural skeletons; background refresh uses a small non-blocking indicator; pagination has an inline loading message; no matches provide a recovery action; API failures preserve a retry action. Images degrade to initials. Motion is reduced when the operating system requests it.

## 7. Validation and tests

Run `npm test`. Server tests cover stable cross-page IDs, AND hobby matching, OR nationality matching, and filter-sensitive facets. Client strict TypeScript checking catches contract and component errors. `npm run build` validates the full optimized bundle.

Suggested future additions are API schema validation with Zod, cursor pagination for continuously mutating data, component/E2E tests with Playwright, image proxying, and OpenAPI generation. Offset pagination is appropriate here because the exercise dataset is local and effectively immutable while browsing.
