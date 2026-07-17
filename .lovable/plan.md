
# ERP Overhaul Plan — Ain Al-Mutakamila Ltd.

The scope you described (dashboards, full accounting, HR with automated Saudi-Labor-Law penalties, CRM, projects with Gantt, tenders, document expiry workflows, RBAC, admin audit) is at least 4–6 weeks of work. It cannot be shipped in one turn without breaking the existing app. I'll deliver it in **6 sprints**, each self-contained, tested, and merged before the next starts. I need one confirmation before Sprint 1.

Assumptions (correct me if wrong):
- Keep current stack: React + Vite + Tailwind + shadcn + Supabase (already connected). No framework swap.
- Keep existing DB tables; extend with migrations, don't drop. All new tables get GRANTs + RLS + `company_id`.
- Charcoal + Emerald design tokens (already in place) stay; no re-theming.
- Arabic-first with English toggle (i18n already wired) stays.
- "Saudi Labor Law penalties" = codified in a configurable `hr_penalty_rules` table (grace mins, warning thresholds, deduction formulas) with sensible defaults, not hardcoded — so HR can tune without redeploy.
- Emails go through the existing `send-email` edge function (Resend). If a domain isn't verified, warnings will be logged only until it is.

## Sprint 1 — Foundation & Executive Dashboard (this sprint, ~1 turn)
1. **Executive Dashboard** (`/dashboard/executive`, role-gated to owner/admin/finance_manager):
   - KPI strip: Cash position, MTD revenue, MTD expenses, Net margin %, AR aging > 60d, Headcount, Attendance anomaly count, Active projects, At-risk projects.
   - Charts (Recharts): 12-mo cash flow (already exists — reuse), revenue vs expense bar, project profitability scatter, headcount trend.
   - Drill-down: each KPI links to its module with a pre-filtered view.
2. **General Dashboard** cleanup: pending approvals widget (leaves, journal entries, document renewals), recent activity feed from `system_activity`, quick-action bar.
3. **Shared primitives**: `<KpiCard>`, `<DrillDownLink>`, `<ApprovalQueueWidget>`, `<EmptyState>`, `<TableToCards>` responsive wrapper.

## Sprint 2 — Finance & Accounting UX
1. **Journal Entry Wizard** (4 steps: type → header → lines with live debit=credit indicator → review). Blocks save until balanced. Replaces current form.
2. **Financial Reports**: fix PDF (Arabic font already handled), add Trial Balance + Balance Sheet + P&L + Cash Flow with date-range picker and Excel/PDF export.
3. **Bank Reconciliation**: auto-match by amount+date±3d, side-by-side unmatched panel, one-click "create JE" resolution.
4. **Commissions**: rules engine (% of project value / tiered), auto-generate commission records on project milestone completion, push to payroll cycle.
5. **Capital**: partner equity ledger view, capital injection/withdrawal form with auto-JE.

## Sprint 3 — HR Automation & Saudi Labor Law Compliance
1. **HR ↔ Finance sync**: DB triggers already exist for salary changes; extend to bonuses/deductions/violations → auto-create JE on approval.
2. **Attendance engine** (edge function `attendance-monitor` already scaffolded — complete it):
   - Nightly cron reads `attendance_records` → applies `hr_penalty_rules` → creates `employee_violations` + optional `salary_deductions`.
   - Grace period, warning ladder (verbal → written → final → deduction), configurable per company.
   - Emails via `send-email` on each escalation step.
3. **Employee Handbook PDF**: on employee create, generate personalized handbook (job desc, salary breakdown, benefits, manager, dept, leave entitlement per Saudi Law) → upload to `employee-documents` bucket → email link.
4. **Self-service portal** (`/account`): payslips, leave requests, view violations/warnings, download handbook.

## Sprint 4 — Operations, CRM, Projects, Tenders
1. **Projects**: Gantt (using `gantt-task-react` or lightweight custom SVG), budget-vs-actual card, milestone billing → auto-invoice draft.
2. **CRM (Clients)**: 360° drawer (contact, interaction log, open invoices, credit limit, projects), credit-limit enforcement on invoice creation.
3. **Partners**: profit-share distribution runner (period → allocates by % → creates JEs).
4. **Tenders**: pipeline board (kanban by stage — already have `handle_tender_stage_change` trigger), evaluation matrix table, award → auto-create project (trigger already exists).

## Sprint 5 — Document Mgmt, Calendar, Notifications
1. **Document expiry**: cron scans `company_documents.expiry_date`, emits notifications at 90/60/30/7 days to owner + admin; renewal request workflow with approval.
2. **Unified calendar**: aggregates leaves, project milestones, document expiries, payroll cycles.
3. **Notification center**: in-app bell already exists; add email channel + user preferences (which events to email).

## Sprint 6 — Auth, RBAC, Admin
1. **Auth polish**: registration with T&C checkbox (required), password recovery flow verification, session timeout.
2. **RBAC**: granular permissions matrix UI in Admin → maps to `user_roles.permissions` (jsonb) + `has_permission()` already exists.
3. **Admin panel**: audit log viewer with filters, user impersonation (audit-logged), system health card (DB size, edge function error rate via `supabase--edge_function_logs`).

## Technical Rules (enforced every sprint)
- Every new `public` table: `CREATE TABLE` → `GRANT` (authenticated + service_role) → `ENABLE RLS` → policies scoped by `company_id` via `users_companies`.
- No hardcoded colors — semantic tokens only.
- All forms: `react-hook-form` + `zod` schemas.
- All edge functions: CORS headers, zod input validation, structured error responses.
- Every module change: verify with a screenshot via Playwright before declaring done.
- No business-logic rewrites outside the requested scope; existing triggers and calculations preserved.

## What I need from you before starting Sprint 1
1. Confirm the sprint order above, or reorder.
2. Confirm: HR penalties default to **1 warning → 2nd warning → deduction of ½ day wage → deduction of 1 day wage → escalation to HR review** (customizable in UI). Adjust if your bylaws differ.
3. Confirm: use existing Resend/`send-email` for all automated emails (no new provider).

Reply "ابدأ Sprint 1" (or "start sprint 1") and I'll execute Sprint 1 end-to-end in the next turns, one focused change at a time, with verification after each.
