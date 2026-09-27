# Repository AI Operating Contract

This repository is authoritative for project-specific product, architecture, implementation and evidence. `jeremytheva/project-master` supplies reusable standards/templates only.

## Continue semantics
On Continue / Proceed / Next, inspect current repository and GitHub state, select the highest-priority dependency-correct task, prefer validation/integration when WIP approaches limits, bypass only non-critical blockers with independent work, update durable state, and do not invent speculative work.

## PR and WIP policy
Use normal non-draft PRs by default. Lifecycle metadata is `IMPLEMENTING → VALIDATING → READY FOR REVIEW → MERGE READY → MERGED`, with `BLOCKED` as an overlay.

Default limits: dependent stack <= 2; ordinary open implementation PRs <= 3. If exceeded, stop overlapping implementation and validate/reconcile/merge first.

## Validation
Prefer the canonical repository executor. Fallback: canonical executor → trusted alternate → exact-commit equivalent deployment/build → `VALIDATION WAITING`. Never record an unexecuted check as PASS. Zero-step CI is infrastructure evidence only.

## Status and evidence
`STATUS.md` is the continuity source. Validation, deployment, runtime and browser evidence remain distinct. Reconcile obvious GitHub/status drift before new work.

## Data/provider governance
Firebase is a provider-managed/non-SQL substrate. Do not invent authoritative SQL. Domain/application semantics belong in project documentation and code; provider collection/schema contracts and migration evidence must be represented explicitly when persistence changes.

Provider claims distinguish `IMPLEMENTED`, `PROVIDER VERIFIED` and `APPLICATION VERIFIED`. Irreversible production data/provider changes require a migration approval package covering affected data, before/after contract, backup/restore, backfill/conflicts, rollback/roll-forward and post-change verification.

## Template use
Reuse Project Master patterns before shared runtime packages. Record adoption in `.project-master/manifest.yaml`.

## Owner intervention and reporting
Escalate only for inaccessible credentials/secrets, external account/billing configuration, destructive/irreversible operations, third-party approvals, unavailable manual verification, genuinely unresolved product decisions, or material security/privacy/provider/cost choices not already governed.

Routine responses:
```text
Done
- <1–3 material outcomes>
Next
- <single best next action>
You
- Nothing required.
```
Add `Blocked`, `Problem` or `Decision needed` only when materially necessary. Detailed evidence stays in repository/GitHub.
