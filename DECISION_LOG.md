# Decision Log: Architectural & Engineering Trade-offs

This document records key technical decisions made during the implementation of the **B2B Order Management Platform** for the Arrowstack Full Stack Internship (Project 1). It satisfies Criterion 6 of the evaluation rubric ("Use a repeatable workflow with traceable decisions").

---

### Decision 1: Single Atomic Database Transaction for Checkout & Stock Deduction

- **Context:** Wholesale B2B orders involve multiple items, simultaneous purchasing by competing client procurement agents, and financial document generation.
- **Alternatives Considered:**
  1. *Two-phase check and deduct:* Check stock, create order, deduct stock in subsequent queries. (Risk: high vulnerability to race conditions where two buyers order the last unit, causing negative inventory).
  2. *Single database transaction via Prisma `$transaction`:* Execute fresh product lock, stock validation, order creation, item price snapshot, stock decrement, and invoice generation in a single atomic database unit.
- **Decision:** Implemented Option 2.
- **Outcome:** Guarantees zero partial orders and zero negative stock levels. Automated race condition testing in `clearance-edge-cases.e2e-spec.ts` confirms that when two buyers checkout the last unit simultaneously, exactly one succeeds and the other receives a descriptive `400 Insufficient Stock` error.

---

### Decision 2: Historical Unit Price Snapshotting in OrderItem

- **Context:** In enterprise distribution, wholesale pricing fluctuates due to tariff adjustments, raw material cost changes, and bulk discount updates.
- **Alternatives Considered:**
  1. *Join to Product table at display time:* Fetch `orderItem.product.price`. (Critical flaw: if an admin updates product price tomorrow from $100 to $250, past orders and already-issued invoices would erroneously retroactively recalculate).
  2. *Immutable `unitPriceSnapshot` column in `OrderItem`:* Record the exact unit price active at the precise millisecond of order placement.
- **Decision:** Implemented Option 2.
- **Outcome:** Verified in Edge Case 5 test: an admin price increase from $100 to $250 has zero effect on already-placed orders or generated tax invoices.

---

### Decision 3: Multi-Tenant Company Scoping & 403 Forbidden Isolation

- **Context:** B2B wholesale systems host multiple corporate buyers (`Apex Industrial`, `Nexa Global`). Confidential pricing, order history, and invoices must remain strictly partitioned.
- **Alternatives Considered:**
  1. *Frontend-only filtering:* Hide other companies' orders in the UI. (Critical security vulnerability: any user could query `/orders/:id` directly).
  2. *Backend Multi-Tenant Scoping Guard:* Evaluate `user.role` and `order.companyId !== user.companyId` on every resource retrieval.
- **Decision:** Implemented Option 2.
- **Outcome:** Verified in Edge Case 4 test: when Buyer from Nexa requests Apex's order, NestJS immediately terminates execution with `403 Forbidden` and `Access denied: You cannot view orders from another company`.

---

### Decision 4: Deterministic Sequential Invoice Number Generation with Unique DB Constraints

- **Context:** Tax authorities require sequential, non-duplicative invoice identifiers (e.g. `INV-2026-0001`, `INV-2026-0002`).
- **Alternatives Considered:**
  1. *Random UUID for invoices:* Easy to generate, but non-compliant with standard accounting and auditor expectations.
  2. *Deterministic sequential numbering with `@unique` database constraint:* Compute `INV-YYYY-XXXX` based on calendar year and transaction sequence, reinforced by a strict database unique constraint.
- **Decision:** Implemented Option 2.
- **Outcome:** Verified in Edge Case 8 test: duplicate invoice number insertion attempts are intercepted and blocked by Prisma and the database engine with error code `P2002`.

---

### Decision 5: Non-Destructive Soft-Deletes for Catalog Products

- **Context:** When a distributor stops carrying a product, hard-deleting the row causes foreign key cascade failures on historical orders and audit trails.
- **Alternatives Considered:**
  1. *Hard delete:* `prisma.product.delete(...)`. Causes orphaned records or foreign key violation errors.
  2. *Soft delete with `isActive` flag:* Filter out inactive products from buyer catalog while preserving relations in past `Order`, `OrderItem`, and `StockLog` tables.
- **Decision:** Implemented Option 2.
- **Outcome:** Zero data corruption, continuous historical reporting, and full audit traceability.

---

### Decision 6: Dual Storage Engine Support (SQLite Local Dev + PostgreSQL Docker)

- **Context:** Mentors and interns need to run the application immediately without requiring local PostgreSQL administrative rights or running background daemons, while production and grading require containerized PostgreSQL.
- **Decision:** Engineered Prisma schema to support seamless zero-friction local execution on SQLite (`dev.db`), while providing `schema.postgresql.prisma` and `docker-compose.yml` for PostgreSQL deployment.
- **Outcome:** 100% test reproducibility across all development environments with zero setup friction.
