# Viva & Interview Preparation Guide: Project 1

Prepared for the **Arrowstack Full Stack Development 1-Month Internship** viva examination, based on Section 16 of the official project specification.

---

### Q1: What business or user problem does the project solve, and how did you define success?
**Model Answer:**
> "The project solves the operational breakdown and revenue leakage common in mid-sized B2B distributors who rely on disconnected spreadsheets, manual email purchase orders, and decoupled invoicing. In wholesale distribution, stock levels change rapidly and corporate buyers operate under credit terms (e.g., Net 30 or Net 60) rather than immediate credit card payments.
>
> I defined success along three quantitative criteria:
> 1. **100% End-to-End Traceability:** Every purchase order is deterministically linked from cart to order, snapshot pricing, stock deduction, and tax invoice generation.
> 2. **Zero Inconsistent States:** Elimination of overselling and negative inventory through atomic database transactions.
> 3. **100% Automated Test Clearance:** Verifying all 8 clearance edge cases specified in the system design without unhandled 500 runtime crashes."

---

### Q2: Which design, technical, analytical or research decision had the biggest impact on the result?
**Model Answer:**
> "The decision to implement an **atomic database transaction (`prisma.$transaction`) combined with historical unit price snapshotting** had the single greatest impact on system reliability.
>
> In wholesale commerce, if two buyers concurrently checkout the last unit of an industrial component, non-transactional code creates race conditions that lead to negative warehouse stock. By running the stock check, stock decrement, order item snapshot, and invoice generation inside an atomic transaction, the database engine enforces serialization. Furthermore, snapshotting the price at checkout ensures that future price inflation by admins never alters historical financial records or issued tax invoices."

---

### Q3: How did you validate the quality or correctness of your work?
**Model Answer:**
> "Validation was conducted across a multi-tier testing clearance strategy:
> 1. **Service-Layer Unit Tests:** Tested the state machine rules (validating transitions `PENDING` -> `CONFIRMED` -> `FULFILLED` while rejecting illegal transitions like `PENDING` -> `FULFILLED`) and stock status calculations.
> 2. **Clearance E2E Integration Suite:** Wrote automated tests specifically verifying all 8 clearance edge cases:
>    - Race condition handling (concurrent checkout on last stock unit).
>    - Stock boundary limits (`qty > stock` rejection).
>    - Token expiration (401 on expired JWT).
>    - Multi-tenant tenant isolation (403 when accessing another company's order).
>    - Price snapshot integrity under mid-checkout price updates.
>    - DTO validation and standardized error shape `{ statusCode, message, code }`.
>    - Unique invoice number constraints.
> 3. **Compilation & Packaging:** Verified clean production builds (`npm run build` on Next.js and NestJS) and multi-container Docker compose orchestration."

---

### Q4: What edge cases, limitations or risks did you identify?
**Model Answer:**
> "Key edge cases identified and resolved include:
> - **Concurrent Checkout Collision:** Handled via database transaction isolation where the second order is gracefully rolled back and returns a 400 Bad Request.
> - **Cross-Tenant Data Leakage:** Prevented through backend multi-tenant scoping guards that enforce company-level boundaries regardless of API tampering.
> - **Cascade Deletion Corruption:** Avoided by implementing soft-deletes (`isActive: false`) rather than hard deletes, preserving historical order and invoice foreign keys.
>
> **Known Limitations:**
> - In this MVP, credit terms (Net 30/60) are tracked for compliance, but integration with external automated ERP credit rating bureaus (e.g. Dun & Bradstreet) is simulated.
> - Stock deduction is immediate upon checkout rather than two-phase 'reserve then ship'."

---

### Q5: What would you change if this solution had to support 10× the users/data/workload?
**Model Answer:**
> "To scale to 10× throughput (e.g., thousands of concurrent checkout operations during flash distributor sales):
> 1. **Asynchronous Order Queue:** Decouple order intake from database writes using a message broker like Redis Streams or RabbitMQ. Orders would be ingested with an immediate HTTP 202 Accepted and processed by a dedicated worker pool.
> 2. **Redis Distributed Caching & Locks:** Implement Redis distributed locks (Redlock) or Redis inventory counters (`DECRBY`) to validate stock in memory with sub-millisecond latency before committing to PostgreSQL.
> 3. **Read/Write DB Splitting:** Introduce PostgreSQL read replicas for catalog browsing, search queries, and historical reporting, reserving the primary master instance strictly for order transactions.
> 4. **CDN Edge Caching:** Cache the product catalog at the CDN edge (Cloudflare/Fastly) with cache tags invalidated via webhooks whenever an admin updates prices."

---

### Q6: How would you explain the project to a non-technical stakeholder?
**Model Answer:**
> "Think of this platform as an automated digital operations manager for an industrial supply distributor. Previously, a client company would email a purchase order, an employee would check warehouse shelves by hand, update an Excel sheet, and manually create an invoice in accounting software. If two customers wanted the last pump, both might be promised it, causing an expensive fulfillment failure.
>
> Our platform connects the customer, sales rep, and warehouse in real-time. When a buyer submits an order with their approved credit terms, the system instantly validates warehouse stock, deducts the inventory, creates a tax-compliant invoice, and notifies the sales team for one-click fulfillment—eliminating human error and inventory disputes completely."

---

### Q7: Which part of the project required the most independent problem-solving?
**Model Answer:**
> "Designing the **transactional order state machine and multi-tenant authorization layer** required the deepest independent problem-solving.
>
> Because B2B commerce involves multiple companies sharing one platform, authorization cannot rely on simple 'is authenticated' checks. I engineered custom decorators and guards that inspect both user identity and company affiliation, ensuring strict data compartmentalization. In addition, choreographing the sequential order states (`PENDING` -> `CONFIRMED` -> `FULFILLED` / `CANCELLED`) with automatic inventory restocking upon cancellation required careful handling of database rollback semantics to guarantee that stock is restored without leaving orphan invoice records."
