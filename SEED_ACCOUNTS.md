# FaceBase — Seed Accounts & Auth

## How Authentication Works

1. **Supabase Auth** holds real credentials (`auth.users` table — email + hashed password)
2. **Frontend** calls `supabase.signInWithPassword(email, password)` → receives a JWT
3. **JWT** is forwarded to the NestJS backend (`Authorization: Bearer <token>`) for protected routes
4. **user_profiles** table links to Supabase users via `user_id` (= Supabase `auth.users.id`)

---

## Seed Accounts

All accounts were created via `npm run seed` in `facebase-backend/`.  
Password for every account: **`password123`**

| Role | Email | Dashboard |
|------|-------|-----------|
| Customer (Attendee) | `customer@facebase.dev` | `/main` |
| Vendor | `vendor@facebase.dev` | `/vendor` |
| Organiser | `organiser@facebase.dev` | `/organiser` |
| Admin | `admin@facebase.dev` | `/admin` |
| Super Admin | `superadmin@facebase.dev` | `/admin` |

### Additional seeded users (no mock login buttons)

| Role | Email | Password |
|------|-------|----------|
| Customer | `priya@example.com` | `password123` |
| Customer | `rohan@example.com` | `password123` |
| Customer | `ananya@example.com` | `password123` |
| Customer | `vikram@example.com` | `password123` |
| Vendor | `meera@vendorcorp.com` | `password123` |

---

## Seeded Data Summary

| Table | Count | Notes |
|-------|-------|-------|
| `auth.users` | 10 | Real Supabase auth — email confirmed |
| `user_profiles` | 10 | Linked to auth users via `user_id` |
| `organisations` | 2 | EventsPro India, FaceBase Internal |
| `vendors` | 4 | 2 approved, 1 pending, 1 rejected |
| `events` | 5 | 2 active, 1 draft, 1 completed, 1 cancelled |
| `event_vendors` | 5 | With tablet tokens for active events |
| `event_attendee_consents` | 10 | Mix of opted-in and revoked |
| `scan_logs` | 12 | Across 3 events |
| `lead_scores` | 12 | One per scan log |
| `audit_logs` | 7 | Admin actions |
| `in_app_notifications` | 8 | For customer, vendor, admin |
| `user_consents` | 10 | ToS, privacy, face data |

---

## Running the Seed

```bash
cd facebase-backend
npm run seed
```

The script is idempotent — re-running it is safe:
- Auth users: if already exist, their IDs are reused
- DB rows: inserted with `ON CONFLICT DO NOTHING`

---

## Mock Auth (Development Shortcut)

Set `NEXT_PUBLIC_MOCK_AUTH=true` in `frontend/.env` to enable the **DevLoginPanel** on the login screen. This bypasses Supabase entirely and logs you in instantly with one click — useful when the backend is offline.

Set back to `false` to use real Supabase auth with the seeded credentials above.

---

## Seed Script Location

```
facebase-backend/src/database/seed.ts
```
