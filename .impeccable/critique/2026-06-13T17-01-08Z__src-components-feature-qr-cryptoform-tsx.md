---
target: Crypto content type
total_score: 35
p0_count: 0
p1_count: 0
timestamp: 2026-06-13T17-01-08Z
slug: src-components-feature-qr-cryptoform-tsx
---
## Crypto Content Type — Design Critique

### Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 4 | Live QR + "Wallets open a payment of X BTC" confirmation + aria-live EC announcement |
| 2 | Match System / Real World | 3 | Plain labels, but crypto is intrinsically technical (network choice, address format) |
| 3 | User Control and Freedom | 3 | Free network/mode switching, draft persistence, no traps |
| 4 | Consistency and Standards | 4 | Reuses Input/PillGroup and the exact 8-sibling form pattern |
| 5 | Error Prevention | 3 | Per-network address validation + forced Highest EC; no checksum, no label-length guard |
| 6 | Recognition Rather Than Recall | 4 | Everything visible/labeled; format placeholders |
| 7 | Flexibility and Efficiency | 3 | Optional amount/label, persistence; no accelerators (consistent with siblings) |
| 8 | Aesthetic and Minimalist Design | 4 | Progressive (label hidden for ETH), terracotta economy intact |
| 9 | Error Recovery | 4 | Plain-language inline errors at source + preview, input preserved |
| 10 | Help and Documentation | 3 | Mode hint, placeholders, caution, preview confirmation; no formal docs |
| **Total** | | **35/40** | **Good (top of band)** |

### Anti-Patterns Verdict
Not AI slop. Reuses the committed "Potter's Atelier" terracotta system, exact sibling consistency, no SaaS-cream/blue/card-grid/gradient-text tells. Deterministic detector on CryptoForm.tsx: **0 findings**.

### What's Working
- Cross-network validation: a Bitcoin address under the Ethereum network surfaces an inline error AND the preview placeholder hint (verified live).
- Progressive disclosure: the BIP-21 Label field is hidden for Ethereum rather than collected and silently dropped from the payload.
- Brand discipline: 9-pill mode row wraps cleanly; terracotta confined to active pill + active network + EC + Generate.

### Priority Issues
- **[P2] No payload-length guard on the Bitcoin label.** Email/SMS/vEvent warn past a threshold; crypto's free-text label has no cap or warning, so a long label silently yields a dense, hard-to-scan QR. Fix: reuse the Callout payload-warning pattern or cap the label. Command: /impeccable harden
- **[P2] No address checksum validation.** A format-valid but mistyped address passes and encodes a QR to nowhere — high stakes since crypto is irreversible. Fix: EIP-55 (ETH mixed-case) + bech32 checksum (BTC). The standing caution mitigates but does not catch. Command: /impeccable harden
- **[P3] First-timer network ambiguity.** No hint about which network a user's wallet uses; a true novice may pick wrong. Command: /impeccable clarify
- **[P3] Silent label drop on BTC→ETH switch.** The label is retained in state but dropped from the payload with no indication (reappears on switch back). Minor.

### Persona Red Flags
- **Jordan (First-Timer)**: "Which network is my wallet?" is unguided. Placeholders and the mode hint help, but Bitcoin-vs-Ethereum carries no inline explanation.
- **Sam (Accessibility)**: Strong — labeled inputs, role=alert errors with aria-describedby, aria-pressed/aria-labelledby pills, live-announced preview. Verify text-secondary caution hits 4.5:1 (shared token, AA-claimed).
- **Riley (Stress Tester)**: Wrong-network paste caught; empty stays quiet. Gap: an essay-length label produces a dense QR with no warning (the P2 above).

### Minor Observations
- Amount accepts unbounded decimal precision; wallets tolerate it, so cosmetic only.
- The irreversibility caution is always shown, even before an address — a deliberate quiet choice; appropriate for the stakes.

### Questions to Consider
- Should a payments surface validate checksums, given a wrong address means lost funds?
- Is a quiet always-on caution enough, or should it elevate once a valid address is entered?
