# Login Screen

> **Version:** v3.1  
> **Last Updated:** 2026-07-04  
> **Status:** Audited — fixes pending redesign (4.3.2b)

---

## Screen Purpose

Entry point for returning users. Email + password authentication with Google OAuth fallback.

**Primary Goals:**
1. Sign in — email + password authentication
2. Social login — Google OAuth
3. Password recovery — forgot password flow

---

## Route

`app/(auth)/login.tsx` — accessed from welcome screen `"Log In"` link or direct redirect when `hasSeenWelcome` is set.

---

## States

### Default
```
[←] (back to welcome/signup)

  Welcome Back
  Sign in to continue tracking customers, entries, and payments

  ┌─────────────────────────────────────┐
  │ Email Address                       │
  │ [____________________________]      │
  │                                     │
  │ Password                            │
  │ [____________________________] [👁] │
  │                                     │
  │              Forgot password?       │
  │                                     │
  │ [         Sign In          ]        │
  │                                     │
  │ ─────────── or ────────────         │
  │                                     │
  │ [  G  Continue with Google  ]       │
  └─────────────────────────────────────┘

  New to KredBook? Sign Up
```

### Loading (Sign In)
- Sign In button shows spinner, inputs stay editable
- Google button disabled during sign-in

### Loading (Google)
- Google button shows "Signing in…"
- Sign In button stays enabled (known issue C2 — both should be disabled)

### Validation Errors
- Email: "Enter a valid email" / "Email is required"
- Password: "Password too short" / "Password is required"
- Errors shown inline below each field

### Error Banner
- Red-tinted pill banner below auth card
- Shows either login or Google error message
- Priority: loginMutation.error > googleSignIn.error
- Fallback: "Invalid email or password"

---

## Component Tree

```
SafeAreaView
└── KeyboardAvoidingView
    └── ScrollView
        └── View (flex-1, px-6)
            ├── BackButton (ArrowLeft, circular border)
            ├── AuthHeader (title + subtitle)
            ├── AuthCard
            │   └── Formik
            │       ├── Label "Email Address"
            │       ├── Input (email, white variant)
            │       ├── Label "Password"
            │       ├── Input (password, white variant, eye toggle)
            │       ├── ForgotPassword link
            │       ├── Button (Sign In)
            │       ├── AuthDivider ("or")
            │       └── GoogleButton
            ├── ErrorBanner (conditional)
            └── SignUp link
```

---

## Shared Components Used

| Component | Location | Notes |
|---|---|---|
| `AuthCard` | `src/components/ui/AuthCard.tsx` | White card, shadow, rounded-2xl |
| `AuthHeader` | `src/components/ui/AuthHeader.tsx` | Centered title/subtitle |
| `AuthDivider` | `src/components/ui/AuthDivider.tsx` | "or" divider |
| `GoogleButton` | `src/components/ui/GoogleButton.tsx` | Google sign-in |
| `Input` | `src/components/ui/Input.tsx` | "white" variant for auth |
| `Button` | `src/components/ui/Button.tsx` | Primary variant |

---

## Data Flow

1. User fills email + password → Formik validates against `LoginSchema`
2. On submit → `loginMutation.mutate(values)` → `loginApi(values)` → `supabase.auth.signInWithPassword`
3. On success → `onAuthStateChange` fires → `setAuth` updates store → `_layout.tsx` routes to dashboard
4. On error → `loginMutation.isError` → error banner shown

Google sign-in follows the same pattern via `googleSignIn.mutate()`.

---

## Edge Cases

| Case | Behavior |
|---|---|
| Invalid credentials | Error banner: "Invalid email or password" |
| No network | Supabase client returns error, banner shows message |
| Google cancelled | Silently suppressed (no console.error, no banner) |
| PASSWORD_RECOVERY event | Redirect to `set-new-password` |
| Both mutations error | Show login error, fallback to Google error |
| Long email/password | TextInput truncates with ellipsis |

---

## Keyboard Handling

- `KeyboardAvoidingView`: `behavior="padding"` (iOS) / `"height"` (Android)
- `keyboardVerticalOffset`: 60 (iOS)
- `keyboardShouldPersistTaps`: "handled"
- No `returnKeyType` configured (see M4)

---

## Auth Guard Integration

`_layout.tsx` handles all routing:
- No user + no hasSeenWelcome → welcome screen (`/`)
- No user + hasSeenWelcome → login (`/(auth)/login`)
- User + no profile → profile-error
- User + profile + no phone → phone-setup
- User + profile + phone + no onboarding → onboarding flow
- User + profile + phone + onboarding → dashboard

---

## Dark Mode

- Background: `bg-background` → maps to `dark:bg-background-dark`
- AuthCard: `bg-surface` → maps to `dark:bg-surface-dark`
- Text: uses token classes (`text-textPrimary`, `text-textSecondary`)
- Shadow: AuthCard uses `colors.textPrimary` — in dark mode this is near-white (H4)
- Error banner: uses `colors.dangerBg` — verify dark mode token exists (M1)

---

## Accessibility

| Element | Status |
|---|---|
| Email input | VoiceOver label via `label` prop |
| Password input | VoiceOver label via `label` prop |
| Show/hide toggle | No `accessibilityLabel` (missing) |
| Touch targets | ≥44pt via `hitSlop` on back button and eye toggle |
| Error links | `AlertCircle` icon + colored text |
| Keyboard dismiss | `keyboardShouldPersistTaps="handled"` |

---

## Performance

| Metric | Current |
|---|---|
| Screen render | < 200ms (lightweight, no images) |
| Login submission | < 1s perceived (React Query optimistic not used) |
| Google sign-in | Native OAuth (not measured) |
| Re-renders | Formik isolates field updates |

---

## Related Files

| File | Purpose |
|---|---|
| `app/(auth)/login.tsx` | Screen implementation |
| `src/hooks/useAuth.ts` | useLogin, useGoogleSignIn |
| `src/api/auth.ts` | loginApi, signInWithGoogleApi |
| `src/utils/schemas.ts` | LoginSchema |
| `src/types/auth.ts` | LoginValues, User, AuthState |
| `src/store/authStore.ts` | Auth store |
| `src/components/ui/Input.tsx` | Shared input |
| `src/components/ui/Button.tsx` | Shared button |
| `docs/flows/login.md` | Flow specification |

---

## Audit History

- 2026-07-04: 4.3.2a — Initial audit. 13 items found (3 critical, 5 high, 5 moderate). See `docs/audits/login-2026-07-04.md`.
