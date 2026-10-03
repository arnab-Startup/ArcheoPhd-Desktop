# ArchaeoPhD — Subscription Architecture & Offline License Security

> **Document Status**: Architecture Specification (Not yet implemented; scheduled for commercial release phase).  
> **Target Platform**: Windows C++ Native Workstation + Web Billing Backend.  
> **Core Principle**: Protect subscription revenue without compromising the **100% offline, air-gapped fieldwork experience** for researchers.

---

## 1. Commercial Context & Philosophy

ArchaeoPhD is designed as a subscription-based research workstation for archaeology PhD students, postdocs, university labs, and cultural heritage management (CRM) firms.

### The Offline Desktop Dilemma
Traditional SaaS products verify active subscriptions on every web request. For a field archaeologist working in an excavation trench, desert survey, or flight with zero internet access, **an online-only check is unacceptable**. 

ArchaeoPhD solves this by using an **Offline Cryptographic Lease System**:
- The user activates the workstation online once (or via an institutional license key).
- The workstation receives a cryptographically signed license file.
- The user can work completely offline for their billing period plus a **30-day grace period**.
- When internet connectivity is restored, the workstation silently renews the lease in the background.

---

## 2. Subscription Tiers & Feature Matrix

| Tier | Target Audience | Pricing Model | Features Unlocked |
| :--- | :--- | :--- | :--- |
| **Free Trial** | Prospective researchers | 14-day full access | All features enabled, local benchmark corpus, export enabled |
| **PhD Pro (Individual)** | PhD students, postdocs, independent scholars | Monthly / Annual ($12–$19/mo) | Unlimited projects, full local vector search (LanceDB), contradiction engine, thesis audit, unlimited PDF ingestion |
| **Institutional / Lab** | University departments, museum labs, CRM firms | Annual per-seat ($499–$1,200/yr per lab) | Multi-seat license keys, centralized university billing, air-gapped offline key generator for field teams |

---

## 3. The 3-Layer Security Architecture

To prevent users from manually editing local files in Notepad (e.g. changing `"expires_at": "2099"` or `"tier": "pro"`), the workstation uses three complementary layers of defense:

```text
Server (Stripe / Auth Backend)
   │
   │  [Layer 1] Signs payload with Server Private Key (Ed25519)
   ▼
Signed License Payload
   │
   │  [Layer 2] Desktop encrypts via Windows DPAPI (CryptProtectData)
   │            bound to CPU + Windows MachineGuid
   ▼
%LOCALAPPDATA%\ArchaeoPhD\license.dat (Encrypted Binary Blob)
   │
   │  [Layer 3] Validates machine ID, monotonic clock, and grace period
   ▼
Workstation Engine Unlocks Features
```

---

### Layer 1: Asymmetric Cryptographic Signatures (Anti-Tampering)

* **Algorithm**: Ed25519 or ECDSA (secp256k1 / SHA-256).
* **Private Key**: Held securely on the server (never deployed to client devices).
* **Public Key**: Hardcoded directly into the compiled C++ executable (`release/ArchaeoPhD.exe`).
* **Protection Mechanism**:
  1. The server signs the JSON license payload.
  2. The desktop app verifies the signature using the embedded public key.
  3. If a user modifies even a single character in the license file (such as the expiration date, tier, or user email), the digital signature **mathematically fails** and the license is instantly rejected.

---

### Layer 2: Windows DPAPI Machine-Bound Encryption (Anti-Copying)

* **Technology**: Windows Data Protection API ([`CryptProtectData`](https://learn.microsoft.com/en-us/windows/win32/api/dpapi/nf-dpapi-cryptprotectdata) and [`CryptUnprotectData`](https://learn.microsoft.com/en-us/windows/win32/api/dpapi/nf-dpapi-cryptunprotectdata) in `Crypt32.lib`).
* **Hardware Fingerprint**:
  - SHA-256 hash of `HKLM\SOFTWARE\Microsoft\Cryptography\MachineGuid` + primary system drive volume serial number.
* **Storage Location**: `%LOCALAPPDATA%\ArchaeoPhD\license.dat`.
* **Protection Mechanism**:
  1. The license is never stored in plaintext JSON. It is stored as an encrypted binary blob.
  2. DPAPI uses cryptographic keys derived from the user's Windows login credentials and machine-specific TPM secrets.
  3. If a user emails or copies their `license.dat` file to another computer, `CryptUnprotectData` fails to decrypt it.

---

### Layer 3: Anti-Clock Rollback & Grace Period Detection

A common piracy vector for offline desktop software is setting the Windows system clock back (e.g. rolling the clock back 5 years to keep an expired trial or subscription alive).

* **Monotonic High-Water Mark**:
  - The C++ engine maintains an encrypted timestamp record: `last_verified_timestamp`.
  - On every launch and every hour of operation, the engine writes `max(last_verified_timestamp, current_system_time)` into encrypted storage.
* **Tampering Trigger**:
  - If `current_system_time < last_verified_timestamp - 3600` (clock rolled back by more than 1 hour), the engine flags clock tampering:
    > ⚠️ *System Clock Inconsistency Detected: Please synchronize your system time to continue using ArchaeoPhD.*

---

## 4. Cryptographic License Schema

The server emits the following JSON structure before digital signing:

```json
{
  "schema_version": "1.0.0",
  "license_id": "lic_archaeo_84920194",
  "user_id": "usr_oxford_0482",
  "email": "researcher@oxford.ac.uk",
  "tier": "phd_pro",
  "capabilities": [
    "unlimited_projects",
    "lancedb_vector_search",
    "contradiction_engine",
    "thesis_auditor",
    "offline_llm_inference",
    "unlimited_pdf_ingest"
  ],
  "machine_fingerprint": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  "issued_at": 1759450000,
  "expires_at": 1790986000,
  "grace_period_days": 30,
  "signature": "3045022100e4b8...2e0220268a...7f1b"
}
```

---

## 5. User Activation Journeys

### Journey A: Web Checkout & 1-Click Desktop Activation
1. User visits `https://archaeophd.com/pricing` and subscribes via Stripe.
2. The user downloads `ArchaeoPhD.exe` (or clicks "Open in Desktop App" on the website).
3. The website triggers a registered Windows protocol: `archaeophd://activate?token=...`.
4. The desktop app receives the token, validates the signature, writes `%LOCALAPPDATA%\ArchaeoPhD\license.dat` using DPAPI, and immediately unlocks Pro.

### Journey B: Offline Institutional License Key (University Purchase)
1. An archaeology department purchases a 20-seat lab license.
2. The department administrator receives 20 offline activation codes (e.g. `APHD-PRO-98X2-K19F-44A2`).
3. In the desktop app, the student navigates to **Settings → Subscription → Enter License Key**.
4. The app verifies the key and locks it to that specific student laptop.

### Journey C: Fieldwork Offline Mode
1. The student travels to an excavation site in Crete with no cell service for 3 weeks.
2. Every day, the student opens `ArchaeoPhD.exe`.
3. The app decrypts `license.dat`, verifies the cryptographic signature against the embedded public key, confirms the machine ID, and checks `current_time < expires_at + grace_period_days`.
4. The workstation opens instantly with zero interruptions.

---

## 6. Implementation Checklist (For Future Build)

When ready to implement, the following components will be built:

### Backend Tasks (Web / Stripe API)
- [ ] Stripe Webhook listener for `checkout.session.completed` and `invoice.payment_succeeded`.
- [ ] Ed25519 signing service that generates signed license payloads.
- [ ] License renewal API endpoint (`POST /api/v1/license/renew`).
- [ ] Institutional bulk license key generator.

### Desktop Workstation Tasks (C++ & Win32)
- [ ] Implement `desktop/engine/src/license_manager.hpp`:
  - `CryptProtectData` / `CryptUnprotectData` wrappers.
  - Ed25519 public key verification routine.
  - Hardware fingerprint generator (`MachineGuid` + drive serial).
  - Clock rollback detector.
- [ ] Link `Crypt32.lib` (`-lcrypt32`) in `desktop/build.bat`.
- [ ] Add native IPC handlers to `main.cpp`:
  - `get_license_status`: returns tier, expiration date, days remaining, offline status.
  - `activate_license_key`: validates and encrypts a pasted license code.
- [ ] Add Subscription management UI card inside **Settings → Subscription**.
