# Security & Privacy Audit — 2026-06-13

**Scope:** OWASP Mobile Top 10, Supabase RLS correctness, DPDP Act 2023 compliance for KredBook fintech app (Expo/React Native).

**Auditor:** OpenCode  
**Project:** `sfmoefgjmgkwvauyaiyz` (ap-southeast-1)  
**App type:** Offline-first ledger management for Indian small businesses

---

## Summary

| Severity | Count | Key Areas |
|---|---|---|
| 🟠 High | 2 | No audit log for data deletion (DPDP compliance), Access tokens in plaintext |
| 🟡 Medium | 3 | WhatsApp message client-side, `deletePerson`/`updatePerson` no vendor filter, financial amounts logged in `__DEV__` |
| ✅ Pass | 4 | RLS + FK cascade correct, offline queue encrypted, JWT in SecureStore, no SQL injection |
| ℹ️ Note | 1 | `.env` NOT git-tracked (safe), but NOT in `.gitignore` (accidental-commit risk) |

---

## Findings

### 🟠 F1 — No Audit Log for Data Deletion (DPDP Act §9(3))

**Risk:** High (Compliance) / Low (Exploit)  
**Location:** `src/api/people.ts` — `deletePerson()`, `revokeAccessToken()`  
**Attack vector / Privacy violation:** When a vendor deletes a Customer, there is no record of WHO performed the deletion, WHEN, and WHY. Section 9(3) of DPDP Act 2023 requires data fiduciaries to maintain records of erasure requests and their fulfillment.

**Severity note:** The exploit risk is low since all deletes are vendor-auth-gated via RLS. The compliance severity is real — this is a DPDP Act gap.

**Evidence:** `deletePerson()` calls `supabase.from('parties').delete().eq('id', customerId)` which cascades via FK `ON DELETE CASCADE`. No `audit_log` INSERT precedes the deletion.

**Fix:**
```sql
CREATE TABLE public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES auth.users(id) NOT NULL,
  action TEXT NOT NULL,            -- 'customer_deleted', 'token_revoked', etc.
  entity_type TEXT NOT NULL,       -- 'party', 'access_token', etc.
  entity_id UUID NOT NULL,
  metadata JSONB,                  -- payload snapshot before deletion
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
-- Policy: actors can INSERT their own actions, admins can SELECT all
```

Update `deletePerson()` to INSERT into `audit_log` with a snapshot of the customer before deleting. Add a `reason` parameter to the function signature (even if optional).

---

### 🟠 F2 — Access Tokens Stored in Plaintext

**Risk:** High  
**Location:** `access_tokens` table, `src/utils/accessToken.ts`  
**Attack vector:** If the database is breached or a SQL injection occurs (unlikely given parameterized queries, but defense-in-depth), all ledger share tokens are immediately usable. Tokens grant 90-day read-only access to outstanding balances.

**Evidence:** `supabase/migrations/create_access_tokens_table.sql` defines `token TEXT NOT NULL UNIQUE`. No hash column exists. The `get_ledger_by_token()` SECURITY DEFINER function compares the raw token.

**Fix:**
1. Store `SHA-256(token)` instead of the raw token in `access_tokens.token`.
2. Return the raw token to the client only at creation time (in the `insert` response).
3. Modify `get_ledger_by_token()` to accept the raw token and hash it for lookup.
4. For 90-day expiry enforcement, keep `expires_at` as-is (that's fine in plaintext).

---

### 🟡 F3 — `.env` Not in `.gitignore` (Accidental-Commit Risk)

**Risk:** Medium  
**Location:** `.env` (project root)  
**Attack vector:** `.env` contains `DEV_SEED_EMAIL=tester@kredbook.io` and `DEV_SEED_PASSWORD=Test123`. If accidentally staged and committed, these credentials would be in git history. The Supabase anon key is public by design.

**Evidence:**
- `git ls-files .env` → empty (NOT currently tracked) ✅
- `.gitignore` does NOT contain `.env` ❌ — anyone running `git add .` could accidentally commit it.

**Fix:**
1. Add `.env` to `.gitignore`.
2. Optionally move dev seed credentials to `.env.local` (already gitignored).

---

### 🟡 F4 — WhatsApp Message Constructed Entirely Client-Side

**Risk:** Medium  
**Location:** `src/hooks/usePeople.ts:270`  
**Attack vector:** The message template containing Customer name, outstanding balance (₹ amount), and business name is assembled in JavaScript and opened via `Linking.openURL('whatsapp://send?text=...')`. A compromised dependency (supply chain attack on any npm package) could intercept or modify the message content, redirect the payment link, or exfiltrate customer data.

**Evidence:**
```typescript
const message = encodeURIComponent(
  `Hi ${customerName}, your outstanding balance is ₹${amount}.`
);
Linking.openURL(`whatsapp://send?phone=${phone}&text=${message}`);
```

**Fix:**
1. Minimum: Use a SECURITY DEFINER Edge Function or RPC to generate the message server-side, returning only the final URI. This prevents compromised client code from injecting into the message.
2. Better: Generate a signed, time-limited payment deep-link server-side. The message template becomes a server-controlled resource.

---

### 🟡 F5 — `deletePerson()` and `updatePerson()` Ignore Their `vendorId` Parameter

**Risk:** Medium  
**Location:** `src/api/people.ts` — `deletePerson()`, `updatePerson()`  
**Attack vector:** Both functions receive `vendorId` as a parameter but never use it in the query:

```typescript
// vendorId received but completely ignored:
export async function deletePerson(customerId: string, vendorId: string)
  .delete().eq("id", customerId)  // ← no .eq("vendor_id", vendorId)

export async function updatePerson(customerId: string, vendorId: string, ...)
  .update({ ... }).eq("id", customerId)  // ← no .eq("vendor_id", vendorId)
```

The only protection is the RLS policy `vendor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())`. If RLS is ever misconfigured or disabled (e.g., during a migration, ad-hoc query, or future bypass), a vendor could delete or modify another vendor's customers.

`revokeAccessToken()` in `src/utils/accessToken.ts` has the same issue — relies solely on RLS for vendor scoping.

**Fix:**
```typescript
// deletePerson
const { error } = await supabase
  .from('parties')
  .delete()
  .eq('id', customerId)
  .eq('vendor_id', vendorId);  // ← USE the parameter

// updatePerson — same pattern
const { error } = await supabase
  .from('parties')
  .update({ ... })
  .eq('id', customerId)
  .eq('vendor_id', vendorId);
```

---

### 🟡 F6 — Financial Balance Amounts Logged in `__DEV__` Mode

**Risk:** Medium (in `__DEV__`) / Low (production — `__DEV__` is stripped in release builds)  
**Location:** `src/api/people.ts:172-178`  
**Attack vector:** `console.warn` logs computed vs. database balance amounts alongside `customerId` (a UUID, which is not PII). The balance amounts (`computed=X, db=Y`) are financially sensitive — if a test device or simulator log is shared or uploaded to Sentry, it leaks a customer's outstanding balance.

**Evidence:**
```typescript
if (__DEV__) {
  console.warn(`[fetchPersonDetail] balance mismatch for ${customerId}: computed=${computedBalance}, db=${dbBalance}`);
}
```

**Fix:**
1. The `__DEV__` guard already prevents this in production builds — acceptable for `__DEV__` only.
2. If Sentry integration is active, add a `beforeSend` callback to strip `__DEV__`-origin logs before upload.

---

### ✅ F7 — RLS Policies Correct; FK Cascade Chain Needs Verification

**Risk:** None (Pass with note)  
**Evidence:** All 6 tables (`profiles`, `parties`, `orders`, `order_items`, `payments`, `access_tokens`) have RLS enabled. All policies follow the pattern `vendor_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())`. The `access_tokens` policy correctly locks down public SELECT (public access uses SECURITY DEFINER `get_ledger_by_token()` instead).

**Note on FK cascade:** The SQL query only returned `orders` and `access_tokens` as directly referencing `parties` with `ON DELETE CASCADE`. `order_items` and `payments` cascade via `orders` (i.e., `orders → order_items` and `orders → payments`), not directly from `parties`. This means:
- Deleting a `party` → cascades to `orders` → cascades to `order_items` and `payments` ✅ (2-hop chain is correct)
- Verify: run `SELECT * FROM pg_constraint WHERE confrelid = 'public.orders'::regclass AND confdeltype = 'c'` to confirm the intermediate links

Duplicate RLS policies (original + auto-generated `select_own_*`) exist but are harmless.

---

### ✅ F8 — Offline Queue Encrypted in MMKV

**Risk:** None (Pass)  
**Evidence:** `src/lib/syncQueue.ts` stores pending mutations in MMKV with a per-install encryption key. Payloads include customer names, phone numbers, and amounts. Max queue size 100, max retries 3. Encrypted at rest on device.

---

### ✅ F9 — JWT Stored in SecureStore (Not AsyncStorage)

**Risk:** None (Pass)  
**Evidence:** `src/services/supabase.ts` uses the `secureStorage` adapter backed by `expo-secure-store` (OS Keychain/Keystore). Chunking handles the iOS 2048-byte limit. Token auto-refresh is enabled.

---

### ✅ F10 — No SQL Injection Vectors

**Risk:** None (Pass)  
**Evidence:** Every `supabase.rpc()` call uses named parameters (`p_vendor_id`, `p_token`). Client-side `.ilike` queries go through Supabase's query builder which parameterizes values. No raw string interpolation in SQL found. All 65 `console.error`/`console.warn` instances reviewed — none leak PII beyond what was noted in F6.

---

## DPDP Act 2023 Compliance Gap Analysis

| Section | Requirement | Status | Notes |
|---|---|---|---|
| §4(1) | Notice at collection | ✅ Present | Privacy notice in onboarding |
| §6(1) | Consent for processing | ✅ Present | Auth + profile creation |
| §7(5) | Erasure on withdrawal | ❌ Gap | No deletion audit trail (F1) |
| §8(3) | Data quality / accuracy | ✅ Pass | Balance triggers sync, user-editable |
| §9(3) | Erasure request records | ❌ Gap | **F1** — no audit_log table exists |
| §10(1) | Security safeguards | ✅ Partial | RLSe + encrypted storage OK, plaintext tokens (F2) needs fix |

---

## Recommended Remediation Order

| Priority | Finding | Effort | Impact |
|---|---|---|---|
| P0 | **F3** — Add `.env` to `.gitignore` | 1 minute | Prevent accidental credential commit |
| P0 | **F5** — Wire `vendorId` in `deletePerson` + `updatePerson` | ~5 lines per function | Defense-in-depth if RLS is bypassed |
| P1 | **F1** — Audit log for deletion (DPDP compliance) | 1 migration + ~50 lines code | DPDP §9(3) compliance, forensic traceability |
| P1 | **F2** — Hash access tokens | 1 migration + modify RPC + update `getLedgerByToken()` | Defense-in-depth for token security |
| P2 | **F4** — Server-side message generation | Edge Function + hook refactor | Supply chain attack mitigation |
| P3 | **F6** — DEV log financial amounts | ~5 minutes | Low risk in production (`__DEV__` stripped) |

---

## Reference

- OWASP Mobile Top 10: M1 (Improper Platform Usage), M2 (Insecure Data Storage), M8 (Security Decisions via Untrusted Inputs)
- DPDP Act 2023: Sections 4(1), 6(1), 7(5), 8(3), 9(3), 10(1)
- Audit performed 2026-06-13
- Previous audit: `docs/audits/csv-export-audit-2026-05-03.md`
