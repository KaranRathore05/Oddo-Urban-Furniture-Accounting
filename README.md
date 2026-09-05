# 🏠 Urban Furniture — Odoo-Style Accounting System

A **full-stack, double-entry accounting web application** inspired by Odoo ERP, built specifically for an urban furniture business. The system handles the complete **Procure-to-Pay** and **Order-to-Cash** cycles with automatic journal posting, financial reports, and role-based access.

> **Live Demo Credentials**  
> Email: `admin@urbanfurniture.com` · Password: `Demo@1234`

---

## 📑 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Database Schema](#database-schema)
- [Features & Modules](#features--modules)
- [Accounting Workflow](#accounting-workflow)
- [Auto-Posting Engine](#auto-posting-engine)
- [API Reference](#api-reference)
- [Project Structure](#project-structure)
- [Setup & Installation](#setup--installation)
- [NPM Scripts](#npm-scripts)
- [Environment Variables](#environment-variables)
- [Screenshots](#screenshots)

---

## Overview

This project is a **production-grade accounting application** for "Urban Furniture" — a fictional furniture company. It replicates the core accounting workflows found in Odoo ERP:

1. **Master Data Management** — Contacts (Customers/Vendors), Products, Chart of Accounts, Journals
2. **Purchase Cycle** — Purchase Orders → Vendor Bills → Payments to Vendors
3. **Sales Cycle** — Sales Orders → Customer Invoices → Payments from Customers
4. **Auto-Posting Engine** — Every financial transaction automatically generates balanced, double-entry journal entries
5. **Financial Reports** — Real-time Balance Sheet and Profit & Loss statements
6. **Authentication** — Signup/Login with JWT tokens and role-based access (Admin/Accountant)

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | [Next.js 16.3.4](https://nextjs.org/) (App Router) | Full-stack React framework with Server Components |
| **Language** | TypeScript 5 | Type-safe JavaScript |
| **UI** | React 19.2.8 + Server Components | UI library with streaming SSR |
| **Styling** | Tailwind CSS 4 + Custom CSS Variables | Dark-themed, premium UI design system |
| **ORM** | Prisma 6.19 | Type-safe database client and migration tool |
| **Database** | SQLite (dev) → **PostgreSQL (production)** | Relational database |
| **Auth** | bcryptjs + jsonwebtoken (JWT) | Password hashing and session tokens |
| **Validation** | Zod 4 | Runtime schema validation for all inputs |
| **Middleware** | Next.js Edge Middleware | Route protection and auth guard |

### Key Design Decisions

- **Server Components First** — All dashboard pages are React Server Components (RSC), fetching data directly from the database at the server level with zero client-side waterfall.
- **No External State Management** — The app relies on Next.js server-side data fetching and `router.refresh()` for mutations, avoiding Redux/Zustand complexity.
- **Convention-Based Auto-Posting** — Financial transactions don't require manual journal entry creation. The posting engine automatically generates balanced entries following standard accounting rules.
- **Custom Dark Theme** — A fully custom CSS design system using CSS variables (no off-the-shelf component library) with gold accent colors, glassmorphism effects, and micro-animations.

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    BROWSER                          │
│   Login / Signup / Dashboard (React 19 + RSC)       │
└─────────────┬───────────────────────┬───────────────┘
              │ Page Requests         │ API Calls
              ▼                       ▼
┌─────────────────────────────────────────────────────┐
│               NEXT.JS APP ROUTER                    │
│                                                     │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────┐ │
│  │  Middleware  │  │   Pages      │  │ API Routes │ │
│  │ (Auth Guard) │  │   (RSC)      │  │  (REST)    │ │
│  └──────┬──────┘  └──────┬───────┘  └─────┬──────┘ │
│         │                │                 │        │
│         ▼                ▼                 ▼        │
│  ┌──────────────────────────────────────────────┐   │
│  │              LIB (Business Logic)            │   │
│  │                                              │   │
│  │  auth.ts          → JWT + bcrypt sessions    │   │
│  │  postingEngine.ts → Double-entry auto-post   │   │
│  │  validations.ts   → Zod schemas             │   │
│  │  numberGenerator.ts → Sequential numbering   │   │
│  │  db.ts            → Prisma singleton client  │   │
│  └──────────────────────┬───────────────────────┘   │
│                         │                           │
│                         ▼                           │
│  ┌──────────────────────────────────────────────┐   │
│  │            PRISMA ORM                        │   │
│  │  schema.prisma → 14 models, relations        │   │
│  │  seed.ts       → Master data bootstrapping   │   │
│  └──────────────────────┬───────────────────────┘   │
│                         │                           │
└─────────────────────────┼───────────────────────────┘
                          │
                          ▼
              ┌───────────────────────┐
              │   SQLite / PostgreSQL │
              │      Database         │
              └───────────────────────┘
```

### Request Flow

1. **Browser** makes a request to a Next.js route
2. **Middleware** (`middleware.ts`) intercepts every non-public route, checking for `auth-token` cookie
3. **Server Component** (for pages) or **API Route** (for mutations) runs server-side
4. **Prisma Client** queries the database directly
5. **Posting Engine** auto-creates journal entries when financial events occur
6. **Response** is sent back (SSR HTML for pages, JSON for API calls)

---

## Database Schema

The Prisma schema defines **14 models** organized into 6 domains:

### Entity Relationship Diagram

```
┌──────────┐     ┌───────────────┐     ┌──────────────┐
│   User   │     │    Contact    │     │   Product    │
│──────────│     │───────────────│     │──────────────│
│ id       │     │ id            │     │ id           │
│ fullName │     │ name          │     │ name         │
│ email    │     │ type (C/V/B)  │     │ type (G/S)   │
│ mobile   │     │ email/mobile  │     │ salesPrice   │
│ password │     │ city/state    │     │ cost         │
│ role     │     │ archived      │     │ category     │
└──────────┘     └───────┬───────┘     └──────┬───────┘
                         │                     │
          ┌──────────────┼─────────────────────┤
          │              │                     │
          ▼              ▼                     ▼
  ┌───────────────┐  ┌────────────────┐  ┌─────────────────┐
  │ PurchaseOrder │  │  SalesOrder    │  │ PurchaseOrderLine│
  │───────────────│  │────────────────│  │/SalesOrderLine   │
  │ number (auto) │  │ number (auto)  │  │─────────────────│
  │ vendor (FK)   │  │ customer (FK)  │  │ product (FK)    │
  │ status (D/C/B)│  │ status (D/C/I) │  │ qty, unitPrice  │
  │ lines[]       │  │ lines[]        │  │ taxPct (sales)  │
  └───────┬───────┘  └───────┬────────┘  └─────────────────┘
          │                  │
          ▼                  ▼
  ┌───────────────┐  ┌──────────────────┐
  │  VendorBill   │  │ CustomerInvoice  │
  │───────────────│  │──────────────────│
  │ number (auto) │  │ number (auto)    │
  │ PO (1:1 FK)   │  │ SO (1:1 FK)      │
  │ totalAmount   │  │ totalAmount      │
  │ amountPaid    │  │ amountPaid       │
  │ status (U/P/P)│  │ status (U/P/P)   │
  │ payments[]    │  │ payments[]       │
  └───────┬───────┘  └───────┬──────────┘
          │                  │
          ▼                  ▼
  ┌───────────────┐  ┌──────────────────┐
  │ BillPayment   │  │ InvoicePayment   │
  │───────────────│  │──────────────────│
  │ method (C/B)  │  │ method (C/B)     │
  │ amount        │  │ amount           │
  │ journalEntry  │  │ journalEntry     │
  └───────────────┘  └──────────────────┘

  ┌──────────┐    ┌────────────────┐    ┌──────────────────┐
  │ Account  │    │   Journal      │    │  JournalEntry    │
  │──────────│    │────────────────│    │──────────────────│
  │ name     │    │ name           │    │ journal (FK)     │
  │ type     │    │ type (S/P/B/C) │    │ reference        │
  │ isSeeded │    │ defaultAccount │    │ partner (FK)     │
  └──────────┘    └────────────────┘    │ sourceType/Id    │
                                        │ lines[]          │
                                        └────────┬─────────┘
                                                 │
                                        ┌────────▼─────────┐
                                        │ JournalEntryLine │
                                        │──────────────────│
                                        │ account (FK)     │
                                        │ debit            │
                                        │ credit           │
                                        └──────────────────┘

  ┌───────────────────┐    ┌──────────┐
  │ AnalyticAccount   │    │  Budget  │
  │───────────────────│    │──────────│
  │ name, type        │◄───│ planned  │
  │                   │    │ period   │
  └───────────────────┘    └──────────┘
```

### Chart of Accounts (Seeded)

| Account | Type | Purpose |
|---------|------|---------|
| Cash | ASSET | Cash-in-hand |
| Bank | ASSET | Bank account balance |
| Debtors | ASSET | Accounts receivable (money owed by customers) |
| Creditors | LIABILITY | Accounts payable (money owed to vendors) |
| Sales Income | INCOME | Revenue from product sales |
| Purchase Expense | EXPENSE | Cost of goods purchased |

### Journals (Seeded)

| Journal | Type | Default Account |
|---------|------|----------------|
| Sales Journal | SALES | Sales Income |
| Purchase Journal | PURCHASE | Purchase Expense |
| Bank Journal | BANK | Bank |
| Cash Journal | CASH | Cash |

---

## Features & Modules

### 🔐 Authentication & Authorization
- **Signup** with full name, email, mobile, and strong password validation (8+ chars, 1 letter, 1 number, 1 special char)
- **Login** with email/password → JWT token stored as httpOnly cookie (24h expiry)
- **Middleware** protects all `/dashboard/*` and `/api/*` routes (except auth endpoints)
- **Role-based access**: ADMIN and ACCOUNTANT roles
- **Session management** with `getSession()` helper for server components

### 👥 Contact Management
- Create/Edit contacts with type: CUSTOMER, VENDOR, or BOTH
- Fields: name, email, mobile (10-digit validation), city, state, pincode
- Soft-delete (archive) instead of hard delete
- List view with type badges and search

### 🪑 Product Catalog
- Create/Edit products with type: GOODS or SERVICE
- Fields: name, sales price, cost, category
- Soft-delete (archive) support
- Used in purchase and sales order line items

### 📊 Chart of Accounts
- 6 pre-seeded accounts covering Assets, Liabilities, Income, Expense
- Read-only view of all accounts with type badges
- Accounts are referenced by the posting engine for journal entries

### 📒 Journals
- 4 pre-seeded journals: Sales, Purchase, Bank, Cash
- Each journal has a type and a default account
- Used to categorize journal entries by business area

### 📦 Purchase Cycle (Procure-to-Pay)
1. **Purchase Order** — Create a PO with vendor, date, and line items (product, qty, unit price)
2. **Confirm PO** — Change status from DRAFT → CONFIRMED
3. **Create Vendor Bill** — Auto-generates bill from confirmed PO (CONFIRMED → BILLED)
4. **Record Payment** — Pay the bill partially or fully via CASH or BANK (UNPAID → PARTIAL → PAID)

### 📋 Sales Cycle (Order-to-Cash)
1. **Sales Order** — Create an SO with customer, date, and line items (product, qty, unit price, tax%)
2. **Confirm SO** — Change status from DRAFT → CONFIRMED
3. **Create Customer Invoice** — Auto-generates invoice from confirmed SO (CONFIRMED → INVOICED)
4. **Record Payment** — Receive payment partially or fully via CASH or BANK (UNPAID → PARTIAL → PAID)

### 📝 Journal Entries
- **System-generated** — Never manually created; always posted by the Auto-Posting Engine
- Linked to source documents (vendor bill, bill payment, customer invoice, invoice payment)
- Each entry has balanced debit/credit lines (double-entry bookkeeping)
- List view with expandable detail showing debit/credit breakdown

### 📈 Financial Reports
- **Balance Sheet** — Assets vs. Liabilities + Retained Earnings, with `asOf` date filter
- **Profit & Loss** — Income vs. Expenses and Net Profit, with date range filter
- Both reports are computed in real-time from journal entry lines

### 🎨 UI/UX Design
- **Dark theme** with gold accent colors (#d4a853)
- **Sidebar navigation** organized by module (Sales, Purchase, Account, Report)
- **Status badges** with color coding (Draft=gray, Confirmed=blue, Paid=green, etc.)
- **Quick action cards** on the dashboard for common tasks
- **Stat cards** showing overview counts
- **Responsive forms** with real-time validation
- **Modals** for payment entry
- **Custom scrollbars** and selection styling

---

## Accounting Workflow

### Complete Procure-to-Pay Flow

```
                Purchase Order (DRAFT)
                        │
                   [Confirm PO]
                        │
                        ▼
                Purchase Order (CONFIRMED)
                        │
                  [Create Bill]
                        │
           ┌────────────┴────────────┐
           ▼                         ▼
  Purchase Order (BILLED)    Vendor Bill (UNPAID)
                                     │
                              ┌──────┴──────┐
                              │  Auto-Post  │
                              │  Journal    │
                              │  Entry #1   │
                              │             │
                              │ DR: Purchase│
                              │     Expense │
                              │ CR: Creditors│
                              └──────┬──────┘
                                     │
                              [Record Payment]
                                     │
                              ┌──────┴──────┐
                              │  Auto-Post  │
                              │  Journal    │
                              │  Entry #2   │
                              │             │
                              │ DR: Creditors│
                              │ CR: Bank/Cash│
                              └──────┬──────┘
                                     │
                                     ▼
                            Vendor Bill (PAID)
```

### Complete Order-to-Cash Flow

```
                 Sales Order (DRAFT)
                        │
                   [Confirm SO]
                        │
                        ▼
                Sales Order (CONFIRMED)
                        │
                 [Create Invoice]
                        │
           ┌────────────┴────────────┐
           ▼                         ▼
  Sales Order (INVOICED)   Customer Invoice (UNPAID)
                                     │
                              ┌──────┴──────┐
                              │  Auto-Post  │
                              │  Journal    │
                              │  Entry #3   │
                              │             │
                              │ DR: Debtors │
                              │ CR: Sales   │
                              │     Income  │
                              └──────┬──────┘
                                     │
                              [Record Payment]
                                     │
                              ┌──────┴──────┐
                              │  Auto-Post  │
                              │  Journal    │
                              │  Entry #4   │
                              │             │
                              │ DR: Bank/   │
                              │    Cash     │
                              │ CR: Debtors │
                              └──────┬──────┘
                                     │
                                     ▼
                          Customer Invoice (PAID)
```

---

## Auto-Posting Engine

The **Posting Engine** (`lib/postingEngine.ts`) is the heart of the accounting system. It implements 4 posting rules that automatically generate balanced journal entries:

### Posting Rules

| # | Event | Debit Account | Credit Account | Journal |
|---|-------|--------------|----------------|---------|
| 1 | Vendor Bill Confirmed | Purchase Expense | Creditors | Purchase Journal |
| 2 | Payment to Vendor | Creditors | Bank / Cash | Bank / Cash Journal |
| 3 | Customer Invoice Created | Debtors | Sales Income | Sales Journal |
| 4 | Payment from Customer | Bank / Cash | Debtors | Bank / Cash Journal |

### Safety Mechanisms

- **`assertBalanced()`** — Validates every journal entry is balanced (total debits = total credits) before writing to DB. Uses ε=0.001 for floating-point tolerance.
- **Overpayment Prevention** — Payments cannot exceed outstanding bill/invoice amounts.
- **`$transaction`** — Payment operations use Prisma's interactive transactions for atomicity (journal entry + payment record + status update happen together or not at all).
- **Status Tracking** — Bills and invoices automatically transition: UNPAID → PARTIAL → PAID based on `amountPaid` vs `totalAmount`.

---

## API Reference

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | Login and receive JWT cookie |
| POST | `/api/auth/logout` | Clear auth cookie |

### Master Data

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/contacts` | List all contacts |
| POST | `/api/contacts` | Create contact |
| GET | `/api/contacts/:id` | Get contact details |
| PATCH | `/api/contacts/:id` | Update contact |
| POST | `/api/contacts/:id/archive` | Archive/unarchive contact |
| GET | `/api/products` | List all products |
| POST | `/api/products` | Create product |
| GET | `/api/products/:id` | Get product details |
| PATCH | `/api/products/:id` | Update product |
| GET | `/api/accounts` | List chart of accounts |
| GET | `/api/journals` | List journals |

### Purchase Cycle

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/purchase-orders` | List all POs |
| POST | `/api/purchase-orders` | Create new PO |
| GET | `/api/purchase-orders/:id` | Get PO details |
| POST | `/api/purchase-orders/:id/confirm` | Confirm PO (DRAFT → CONFIRMED) |
| POST | `/api/purchase-orders/:id/create-bill` | Generate vendor bill from PO |
| GET | `/api/vendor-bills` | List all vendor bills |
| GET | `/api/vendor-bills/:id` | Get bill details |
| POST | `/api/vendor-bills/:id/payments` | Record payment against bill |

### Sales Cycle

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/sales-orders` | List all SOs |
| POST | `/api/sales-orders` | Create new SO |
| GET | `/api/sales-orders/:id` | Get SO details |
| POST | `/api/sales-orders/:id/confirm` | Confirm SO (DRAFT → CONFIRMED) |
| POST | `/api/sales-orders/:id/create-invoice` | Generate customer invoice from SO |
| GET | `/api/customer-invoices` | List all invoices |
| GET | `/api/customer-invoices/:id` | Get invoice details |
| POST | `/api/customer-invoices/:id/payments` | Record payment against invoice |

### Journal & Reports

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/journal-entries` | List all journal entries |
| GET | `/api/journal-entries/:id` | Get entry with debit/credit lines |
| GET | `/api/reports/balance-sheet?asOf=YYYY-MM-DD` | Balance Sheet report |
| GET | `/api/reports/profit-loss?from=YYYY-MM-DD&to=YYYY-MM-DD` | Profit & Loss report |

---

## Project Structure

```
c:\odoofinal\
├── app/
│   ├── globals.css                    # Full design system (867 lines)
│   ├── layout.tsx                     # Root layout with fonts
│   ├── page.tsx                       # Landing redirect
│   ├── login/page.tsx                 # Login form (client component)
│   ├── signup/page.tsx                # Signup form (client component)
│   │
│   ├── dashboard/
│   │   ├── layout.tsx                 # Auth guard + sidebar layout (RSC)
│   │   ├── SidebarNav.tsx             # Client sidebar with navigation
│   │   ├── page.tsx                   # Dashboard overview (RSC)
│   │   ├── contacts/                  # Contact CRUD pages
│   │   │   ├── page.tsx               #   List view
│   │   │   ├── new/page.tsx           #   Create form
│   │   │   └── [id]/page.tsx          #   Detail/edit view
│   │   ├── products/                  # Product CRUD pages
│   │   │   ├── page.tsx
│   │   │   ├── new/page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── accounts/page.tsx          # Chart of Accounts (read-only list)
│   │   ├── journals/page.tsx          # Journals list (read-only)
│   │   ├── purchase-orders/           # Purchase order workflow pages
│   │   │   ├── page.tsx               #   List all POs
│   │   │   ├── new/page.tsx           #   Create PO with line items
│   │   │   └── [id]/page.tsx          #   PO detail + confirm + create bill
│   │   ├── vendor-bills/              # Vendor bill pages
│   │   │   ├── page.tsx               #   List all bills
│   │   │   └── [id]/page.tsx          #   Bill detail + record payment
│   │   ├── sales-orders/              # Sales order workflow pages
│   │   │   ├── page.tsx
│   │   │   ├── new/page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── customer-invoices/         # Customer invoice pages
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── journal-entries/           # Journal entry viewer
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   └── reports/
│   │       ├── balance-sheet/page.tsx  # Balance Sheet report
│   │       └── profit-loss/page.tsx    # Profit & Loss report
│   │
│   └── api/                           # REST API Routes (28 endpoints)
│       ├── auth/
│       │   ├── signup/route.ts
│       │   ├── login/route.ts
│       │   └── logout/route.ts
│       ├── contacts/
│       │   ├── route.ts               # GET (list), POST (create)
│       │   └── [id]/
│       │       ├── route.ts           # GET (detail), PATCH (update)
│       │       └── archive/route.ts   # POST (toggle archive)
│       ├── products/
│       │   ├── route.ts
│       │   └── [id]/route.ts
│       ├── accounts/route.ts
│       ├── journals/route.ts
│       ├── purchase-orders/
│       │   ├── route.ts
│       │   └── [id]/
│       │       ├── route.ts
│       │       ├── confirm/route.ts
│       │       └── create-bill/route.ts
│       ├── vendor-bills/
│       │   ├── route.ts
│       │   └── [id]/
│       │       ├── route.ts
│       │       └── payments/route.ts
│       ├── sales-orders/
│       │   ├── route.ts
│       │   └── [id]/
│       │       ├── route.ts
│       │       ├── confirm/route.ts
│       │       └── create-invoice/route.ts
│       ├── customer-invoices/
│       │   ├── route.ts
│       │   └── [id]/
│       │       ├── route.ts
│       │       └── payments/route.ts
│       ├── journal-entries/
│       │   ├── route.ts
│       │   └── [id]/route.ts
│       └── reports/
│           ├── balance-sheet/route.ts
│           └── profit-loss/route.ts
│
├── lib/                               # Shared business logic
│   ├── db.ts                          # Prisma singleton client
│   ├── auth.ts                        # JWT sign/verify, session, cookies
│   ├── postingEngine.ts               # Auto double-entry posting (4 rules)
│   ├── validations.ts                 # Zod schemas for all entities
│   └── numberGenerator.ts             # Auto-increment PO/BILL/SO/INV numbers
│
├── prisma/
│   ├── schema.prisma                  # 14 models, relations, indexes
│   ├── seed.ts                        # Bootstraps accounts, journals, sample data
│   └── dev.db                         # SQLite database file (dev)
│
├── middleware.ts                       # Edge middleware for auth guard
├── package.json                       # Dependencies and scripts
├── tsconfig.json                      # TypeScript config
├── next.config.ts                     # Next.js config
├── postcss.config.mjs                 # PostCSS + Tailwind plugin
└── eslint.config.mjs                  # ESLint config
```

---

## Setup & Installation

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9 (or yarn/pnpm)
- **PostgreSQL** 14+ (for production) OR SQLite (included for development)

### Quick Start (SQLite — Development)

```bash
# 1. Clone the repository
git clone https://github.com/KaranRathore05/Oddo-Urban-Furniture-Accounting.git
cd Oddo-Urban-Furniture-Accounting

# 2. Install dependencies
npm install

# 3. Create environment file
echo 'DATABASE_URL="file:./dev.db"' > .env
echo 'JWT_SECRET="your-secret-key-change-in-production"' >> .env

# 4. Push schema to database and seed master data
npm run db:setup

# 5. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and login with `admin@urbanfurniture.com` / `Demo@1234`.

### PostgreSQL Setup (Production)

```bash
# 1. Create a PostgreSQL database
createdb urban_furniture

# 2. Update .env with your PostgreSQL connection string
echo 'DATABASE_URL="postgresql://user:password@localhost:5432/urban_furniture"' > .env
echo 'JWT_SECRET="a-very-strong-random-secret-key"' >> .env

# 3. Update prisma/schema.prisma — change the datasource provider
#    provider = "postgresql"   (instead of "sqlite")

# 4. Push schema and seed
npm run db:setup

# 5. Build and start
npm run build
npm start
```

---

## NPM Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `next dev` | Start development server with hot reload |
| `build` | `next build` | Create optimized production build |
| `start` | `next start` | Start production server |
| `lint` | `eslint` | Run ESLint checks |
| `db:push` | `npx prisma db push` | Push schema changes to database |
| `db:seed` | `npx tsx prisma/seed.ts` | Seed database with master data |
| `db:setup` | `prisma db push && tsx prisma/seed.ts` | Full database setup (schema + seed) |
| `db:studio` | `npx prisma studio` | Open Prisma Studio (GUI database browser) |

---

## Environment Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DATABASE_URL` | ✅ | Database connection string | `file:./dev.db` or `postgresql://...` |
| `JWT_SECRET` | ⚠️ | Secret key for JWT signing (defaults to fallback in dev) | `your-secret-key` |
| `NODE_ENV` | ❌ | Environment mode | `development` / `production` |

---

## Technical Deep Dive

### Validation Layer

All user inputs are validated using **Zod 4** schemas (`lib/validations.ts`):

- **Signup** — Email format, 10-digit mobile, strong password (8+ chars with letter, number, and special char), password confirmation match
- **Contact** — Required name, enum type, optional fields
- **Product** — Required name, enum type, positive prices
- **Purchase/Sales Order** — Required vendor/customer, date, at least 1 line item with positive qty/price
- **Payment** — Enum method (CASH/BANK), positive amount, date

### Number Generator

The system auto-generates sequential document numbers:
- `PO-0001`, `PO-0002`, ... for Purchase Orders
- `BILL-0001`, `BILL-0002`, ... for Vendor Bills
- `SO-0001`, `SO-0002`, ... for Sales Orders
- `INV-0001`, `INV-0002`, ... for Customer Invoices

### Auth Cookie Strategy

| Property | Value |
|----------|-------|
| Cookie Name | `auth-token` |
| HttpOnly | `true` (not accessible via JS) |
| SameSite | `lax` |
| Secure | `true` in production only |
| Max Age | 24 hours |

### Financial Report Computation

**Balance Sheet** — Aggregates all journal entry lines up to `asOf` date:
- Assets = Σ(debit - credit) for ASSET accounts
- Liabilities = Σ(credit - debit) for LIABILITY accounts
- Retained Earnings = Net Profit (Income - Expense)
- Verify: Total Assets = Total Liabilities + Retained Earnings

**Profit & Loss** — Aggregates journal entry lines within date range:
- Income = Σ(credit - debit) for INCOME accounts
- Expenses = Σ(debit - credit) for EXPENSE accounts
- Net Profit = Income - Expenses

---

## Development History

| Phase | Commit | What Was Built |
|-------|--------|---------------|
| Phase 1 | `2622154` | Initial Next.js 16 app scaffold |
| Phase 2-3 | `b56f10d` | Core setup, Auth system, Master Data (Contacts, Products, Accounts, Journals), Posting Engine |
| Phase 4-7 | `84d5329` | Purchase cycle, Sales cycle, Journal entries viewer, Financial reports (Balance Sheet, P&L) |

---

## License

This project is part of an academic/training exercise to demonstrate ERP accounting workflows using modern web technologies.

---

*Built with ❤️ using Next.js 16, React 19, Prisma, and TypeScript*
