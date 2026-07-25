## BloodBridgeAI — Lean 1-Week Prototype

A frontend-only PWA prototype with stubbed integrations. All data lives in localStorage; matching, SMS, maps, and certificates are simulated so the demo runs without any backend or API keys.

### Scope (in)
- Three roles: **Donor**, **Hospital**, **Admin** with a simple role switcher (mock auth — pick role + name, no real passwords)
- Donor: profile (blood type, city, phone), see nearby requests, accept/decline, donation history, download PDF certificate
- Hospital: inventory table (blood type → units), post emergency request (type, units, urgency), see donor responses, mark donation complete (auto-updates inventory)
- Admin: list of users, requests, donations, basic stats
- Stubbed matching: filter donors by compatible blood type + same city, ranked by mock distance
- Stubbed notifications: in-app toast + a "Notifications" inbox (no real SMS)
- Stubbed map: static SVG/city grid placeholder (no Google Maps)
- Stubbed certificate: client-side generated PDF (jsPDF) with donor name, date, hospital
- i18n: **English + Hindi + Spanish** via `react-i18next`, language switcher in header
- Installable PWA: web app manifest + icons + theme color (no service worker / offline — per PWA skill guidance for manifest-only)
- Seeded demo data (5 donors, 2 hospitals, 1 open request) so the app is usable immediately

### Scope (out, deferred)
- Real backend, database, auth (Lovable Cloud)
- Twilio SMS, Google Maps, real geolocation
- Offline support / service worker
- Analytics, email, admin verification workflows

### Routes (TanStack Start)
```
/                       Landing + role picker (Donor / Hospital / Admin)
/donor                  Donor dashboard (profile + open requests near me)
/donor/history          Donation history + certificate downloads
/hospital               Hospital dashboard (inventory + my requests)
/hospital/new-request   Post emergency request form
/hospital/requests/$id  Request detail: matched donors, responses, mark complete
/admin                  Admin overview (users, requests, donations, stats)
```
Each route gets a unique `head()` (title/description/og).

### Data model (localStorage, typed)
```ts
User        { id, role: 'donor'|'hospital'|'admin', name, lang }
Donor       { id, userId, bloodType, city, phone, lastDonation, donationCount }
Hospital    { id, userId, name, city, address, inventory: Record<BloodType, number> }
BloodRequest{ id, hospitalId, bloodType, units, urgency, status, createdAt, responses:[{donorId, status, at}] }
Donation    { id, donorId, hospitalId, requestId, bloodType, units, date, certificateId }
Notification{ id, userId, message, read, at }
```
A single `useStore()` Zustand store persists to localStorage, with a `seedIfEmpty()` on first load.

### Key components
- `RoleSwitcher`, `LanguageSwitcher`, `AppShell` (header + sidebar), `BloodTypeBadge`, `UrgencyPill`
- `DonorRequestCard` (accept/decline), `InventoryTable`, `RequestForm`, `MatchedDonorsList`, `StatsCards`, `CertificatePreview`
- shadcn/ui for forms, tables, dialogs, toasts

### Matching logic (client-side)
`getMatches(request)` → donors where `compatible(donor.bloodType, request.bloodType)` and same city, sorted by `donor.lastDonation` (freshness) with a fake distance number.

### Design
Medical/urgent feel: bold red accent (`--primary` warm crimson), clean neutrals, generous whitespace, urgent tags in amber/red. Custom tokens in `src/styles.css` (no hardcoded colors). Mobile-first — I'll set preview to mobile.

### Tech notes
- `react-i18next` + JSON dictionaries in `src/i18n/{en,hi,es}.json`
- `jspdf` for certificate PDF
- `public/manifest.webmanifest` + icons + `<link rel="manifest">` + theme-color in root head
- No service worker (Lovable preview safety per PWA skill)
- Zustand for state (already lightweight)
- Custom favicon generated to match brand

### Build order
1. Design tokens + AppShell + role switcher + i18n scaffolding
2. Zustand store + seed data + types
3. Landing + Donor dashboard + accept/decline
4. Hospital dashboard + inventory + new request + request detail
5. Donation completion + certificate PDF + history
6. Admin overview
7. PWA manifest + icons + per-route head metadata
8. Polish + demo data tuning

### Out-of-scope reminders for later phases
Everything backend, real integrations, offline PWA, and admin verification is explicitly deferred to the 2-week and 4-week phases from your blueprint.
