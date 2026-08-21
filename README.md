# CampaignHQ Mobile (React Native / Expo)

Mobile companion app for the CampaignHQ contact module: **Login**, **Signup**,
and a full **Contacts** flow (list, search, details, create, edit, delete).
Built with Expo so it runs on iOS, Android, and web from a single codebase.

It reuses the same branding assets, types, validation rules, and mock-API
behavior as the web app (`../campaignhq`), so the two front ends can
eventually share a real backend:

| Concern         | Web (`campaignhq`)                     | Mobile (`campaignhq-mobile`)         |
|------------------|-----------------------------------------|----------------------------------------|
| Branding         | `public/brand/*.png` via `CampaignHQLogo` | `assets/brand/*.png` via `src/components/CampaignHQLogo.tsx` (same files, same component API) |
| Auth types       | `types/auth.ts`                        | `src/types/auth.ts` (identical)        |
| Auth validation  | `schemas/login.schema.ts`, `signup.schema.ts` (Zod) | `src/schemas/*` (same Zod rules) |
| Auth API contract| `services/auth.service.ts` via MSW mocks | `src/services/auth.service.ts` (same demo login/signup logic) |
| Contact types    | `types/contact.ts`                     | `src/types/contact.ts` (identical)     |
| Contact validation | `features/contacts/schemas/contact-schema.ts` | `src/schemas/contact.schema.ts` (same Zod rules) |
| Contact API contract | `services/contact.service.ts` via MSW mocks (`mocks/data/contacts.ts`, `mocks/handlers/contact.ts`) | `src/services/contact.service.ts` (same seed data, same CRUD behavior) |
| Global state     | Zustand (`stores/auth-store.ts`)        | Zustand + AsyncStorage persistence (`src/store/auth-store.ts`, `src/store/contact-store.ts`) |

## Getting started

```bash
cd "Frontend Engineering/campaignhq-mobile"
npm install
npm start        # opens Expo Dev Tools - press i / a / w for iOS / Android / web
```

Requires the Expo Go app (iOS/Android) or a simulator, and Node 18+.

## Demo credentials

The login screen is pre-filled with the same demo account used by the web
app's mocked API:

- **Email:** `admin@campaignhq.com`
- **Password:** `password123`

Signup accepts any valid work email, a password of 6+ characters, and a
company/workspace name between 2–60 characters, then logs the user straight
in (same behavior as the web app's mocked `/api/signup`).

## Contacts module

After logging in you land on the **Contacts** list, seeded with the same
three demo contacts as the web app (John Doe, Jane Smith, Alex Johnson).
From there you can:

- Search contacts by name, email, or company
- Tap a contact to view full details and tags
- Add a new contact (`+ Add` button)
- Edit or delete an existing contact from its details screen

All changes are held in memory via `src/store/contact-store.ts` and will
reset on app restart until `src/services/contact.service.ts` is pointed at
a real backend.

## Project structure

```
campaignhq-mobile/
├── App.tsx                     # Entry point, wraps RootNavigator
├── assets/
│   └── brand/                  # Same PNG logo assets as the web app
├── src/
│   ├── navigation/
│   │   └── RootNavigator.tsx   # Auth stack ⇄ Contacts stack, switches on auth state
│   ├── screens/
│   │   ├── LoginScreen.tsx
│   │   ├── SignupScreen.tsx
│   │   ├── ContactsScreen.tsx        # List + search
│   │   ├── ContactDetailsScreen.tsx  # View, edit, delete
│   │   └── ContactFormScreen.tsx     # Shared create/edit form
│   ├── components/
│   │   └── CampaignHQLogo.tsx  # Renders the real brand assets (mark, wordmark, cream tile)
│   ├── store/
│   │   ├── auth-store.ts       # Zustand store, persisted to AsyncStorage
│   │   └── contact-store.ts    # Zustand store for contact list + CRUD
│   ├── services/
│   │   ├── auth.service.ts     # Swap for real axios/fetch calls when a backend exists
│   │   └── contact.service.ts  # Same seed data/behavior as the web app's MSW mocks
│   ├── schemas/
│   │   ├── login.schema.ts
│   │   ├── signup.schema.ts
│   │   └── contact.schema.ts
│   ├── types/
│   │   ├── auth.ts
│   │   └── contact.ts
│   └── theme/
│       └── colors.ts
├── app.json
├── babel.config.js
├── tsconfig.json
└── package.json
```

## Next steps

- Point `src/services/auth.service.ts` and `src/services/contact.service.ts`
  at the real API once it exists (the payload/response shapes already match
  the web app, so no other files need to change).
- Add contact tags editing to `ContactFormScreen.tsx` (currently tags are
  only shown on the details screen and set to `[]` on create).
- Add `expo-secure-store` instead of `AsyncStorage` if the auth token should
  be stored more securely than persisted app state.

