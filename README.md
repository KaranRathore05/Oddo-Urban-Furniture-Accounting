# 🏢 Urban Furniture — Odoo-Style Accounting System ✨

<div align="center">
  <h3>A Full-Stack, Double-Entry ERP web application inspired by Odoo</h3>
  <p>Built exclusively for urban furniture businesses to handle the complete <strong>Procure-to-Pay</strong> and <strong>Order-to-Cash</strong> cycles with automatic journal posting, financial reports, and role-based access.</p>
</div>

> **Live Demo Credentials**  
> Email: `admin@urbanfurniture.com` · Password: `Demo@1234`

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Tech Stack & Architecture](#-tech-stack--architecture)
- [Database Schema (In Detail)](#-database-schema-in-detail)
- [Features & Modules](#-features--modules)
- [Accounting Workflows (In Detail)](#-accounting-workflows-in-detail)
- [Auto-Posting Engine & Functions](#-auto-posting-engine--functions)
- [API Reference](#-api-reference)
- [Project Structure](#-project-structure)
- [Setup & Installation](#-setup--installation)

---

## 🌟 Overview

This project is a **production-grade accounting application** for "Urban Furniture". It beautifully replicates the core accounting workflows found in enterprise ERPs like Odoo.

Unlike simple invoice trackers, this system strictly adheres to **double-entry bookkeeping**. Every transaction impacts exactly two or more accounts, keeping the balance sheet perfectly aligned.

---

## 🛠️ Tech Stack & Architecture

| Layer          | Technology                                         | Purpose                                           |
| -------------- | -------------------------------------------------- | ------------------------------------------------- |
| **Framework**  | [Next.js 16+ (App Router)](https://nextjs.org/)    | Full-stack React framework with Server Components |
| **Language**   | TypeScript 5                                       | Type-safe JavaScript                              |
| **UI Design**  | Tailwind CSS + Bento Box Grids                     | Dark-themed, highly interactive premium design    |
| **Icons & VFX**| Lucide React + Vanta.js (Fog)                      | Scalable line icons and dynamic 3D backgrounds    |
| **ORM**        | Prisma 6.19                                        | Type-safe database client and migration tool      |
| **Database**   | PostgreSQL 14+                                     | Production-grade Relational database              |

### 🏗️ High-Level Architecture Flow

```mermaid
graph TD
    A[Browser / Client] -->|Page Request| B[Next.js Middleware]
    B -->|Auth Guard| C[Next.js App Router RSC]
    C -->|Fetch Data| D[Prisma ORM]
    D -->|Query| E[(PostgreSQL Database)]
    C -->|Action / Mutation| F[API Routes]
    F --> G[Zod Validation]
    G --> H[Posting Engine]
    H --> D
```

---

## 🗄️ Database Schema (In Detail)

The PostgreSQL database contains **14 models** heavily normalized with strict Foreign Key constraints.

### Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    USER {
        String id PK
        String fullName
        String email UK
        String passwordHash
        String role "ADMIN | ACCOUNTANT"
        String avatar "Base64 Text"
    }
    CONTACT {
        String id PK
        String name
        String type "CUSTOMER/VENDOR"
    }
    PRODUCT {
        String id PK
        String name
        String type "GOODS/SERVICE"
        Float salesPrice
        Float cost
    }
    PURCHASE_ORDER {
        String id PK
        String number UK
        String status "DRAFT/CONFIRMED"
    }
    VENDOR_BILL {
        String id PK
        String number UK
        Float totalAmount
        Float amountPaid
        String status "UNPAID/PARTIAL/PAID"
    }
    SALES_ORDER {
        String id PK
        String number UK
        String status
    }
    CUSTOMER_INVOICE {
        String id PK
        String number UK
        Float totalAmount
        Float amountPaid
        String status
    }
    JOURNAL_ENTRY {
        String id PK
        String reference
        String sourceType
    }
    JOURNAL_ENTRY_LINE {
        String id PK
        Float debit
        Float credit
    }
    ACCOUNT {
        String id PK
        String name UK
        String type "ASSET/LIABILITY/INCOME/EXPENSE"
    }

    CONTACT ||--o{ PURCHASE_ORDER : creates
    CONTACT ||--o{ SALES_ORDER : places
    PURCHASE_ORDER ||--o{ VENDOR_BILL : generates
    SALES_ORDER ||--o{ CUSTOMER_INVOICE : generates
    PRODUCT ||--o{ PURCHASE_ORDER : contains
    PRODUCT ||--o{ SALES_ORDER : contains
    VENDOR_BILL ||--o{ JOURNAL_ENTRY : triggers
    CUSTOMER_INVOICE ||--o{ JOURNAL_ENTRY : triggers
    JOURNAL_ENTRY ||--|{ JOURNAL_ENTRY_LINE : has
    JOURNAL_ENTRY_LINE }|--|| ACCOUNT : affects
```

### Core Data Dictionaries

1. **User Model**: Handles auth. Added `avatar @db.Text` to store base64 string directly, removing the need for S3 buckets.
2. **Contact Model**: Defines actors in the system. A contact can be a `CUSTOMER`, `VENDOR`, or `BOTH`.
3. **Product Model**: `GOODS` or `SERVICE`. Holds `cost` for purchase cycles and `salesPrice` for sales cycles.
4. **Journal Models**: The ledger. Every financial event generates exactly one `JournalEntry` containing two `JournalEntryLine` records (one debit, one credit).

---

## 🔄 Accounting Workflows (In Detail)

### 🛒 Procure-to-Pay Cycle (Purchasing)

The procurement cycle manages everything from ordering goods to paying the vendor.

1. **Purchase Order (Draft)**: User creates a PO selecting a Vendor and adding Products.
2. **Purchase Order (Confirmed)**: User confirms the PO. Status shifts to `CONFIRMED`. No accounting impact yet.
3. **Create Vendor Bill**: User generates a bill from the PO.
   - **System Action**: `postVendorBill()` is called.
   - **Accounting Impact**: Generates Journal Entry #1. Debits `Purchase Expense`, Credits `Creditors`.
4. **Record Payment**: User pays the bill.
   - **System Action**: `postBillPayment()` is called.
   - **Accounting Impact**: Generates Journal Entry #2. Debits `Creditors`, Credits `Bank/Cash`.

```mermaid
sequenceDiagram
    participant User
    participant System
    participant Database
    
    User->>System: Create Purchase Order (Draft)
    User->>System: Confirm PO
    System->>Database: Status -> CONFIRMED
    User->>System: Create Vendor Bill
    System->>Database: Auto-Post Journal Entry #1 (Purchase Expense vs Creditors)
    User->>System: Record Payment
    System->>Database: Auto-Post Journal Entry #2 (Creditors vs Bank/Cash)
```

### 💰 Order-to-Cash Cycle (Sales)

The sales cycle manages customer orders through to invoice collection.

1. **Sales Order (Draft)**: User creates an SO for a Customer.
2. **Sales Order (Confirmed)**: User confirms the SO.
3. **Create Customer Invoice**: User generates an invoice from the SO.
   - **System Action**: `postCustomerInvoice()` is called.
   - **Accounting Impact**: Generates Journal Entry #3. Debits `Debtors`, Credits `Sales Income`.
4. **Record Payment**: User logs customer payment.
   - **System Action**: `postInvoicePayment()` is called.
   - **Accounting Impact**: Generates Journal Entry #4. Debits `Bank/Cash`, Credits `Debtors`.

```mermaid
sequenceDiagram
    participant User
    participant System
    participant Database
    
    User->>System: Create Sales Order (Draft)
    User->>System: Confirm SO
    System->>Database: Status -> CONFIRMED
    User->>System: Create Customer Invoice
    System->>Database: Auto-Post Journal Entry #3 (Debtors vs Sales Income)
    User->>System: Record Payment
    System->>Database: Auto-Post Journal Entry #4 (Bank/Cash vs Debtors)
```

---

## 🧾 Auto-Posting Engine & Functions

The **Posting Engine** (`lib/postingEngine.ts`) abstracts the complexity of double-entry accounting. The system strictly forbids manual Journal Entries; they are completely automated.

### The `assertBalanced()` Function
Before *any* Journal Entry is saved to the PostgreSQL database, the engine runs:
```typescript
function assertBalanced(lines: JournalLine[]): void {
  const totalDebit = lines.reduce((sum, l) => sum + l.debit, 0);
  const totalCredit = lines.reduce((sum, l) => sum + l.credit, 0);
  if (Math.abs(totalDebit - totalCredit) > 0.001) {
    throw new Error(`Unbalanced journal entry...`);
  }
}
```
This guarantees the Balance Sheet will *never* be out of sync. It uses `0.001` epsilon to safely handle Javascript floating-point arithmetic.

### Transaction Atomicity
Payments (e.g. `postBillPayment`) use Prisma's `$transaction` block. 
```typescript
await prisma.$transaction(async (tx) => {
  // 1. Create Journal Entry
  // 2. Create Payment Record
  // 3. Update Bill status (UNPAID -> PAID)
});
```
If the database connection drops halfway through, the entire payment rolls back. No orphaned payments!

### Overpayment Prevention
Functions calculate `bill.totalAmount - bill.amountPaid`. If the user submits a payment larger than the outstanding balance, the API explicitly rejects it.

---

## 📡 API Reference

### Auth & User
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/login` | Login and receive JWT `httpOnly` cookie |
| POST | `/api/auth/signup` | Register new user with Zod validation |
| PUT | `/api/auth/profile` | Update profile fields and upload base64 avatar |

### Purchasing
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/purchase-orders/:id/confirm` | Confirm PO |
| POST | `/api/purchase-orders/:id/create-bill` | Generate Vendor Bill |
| POST | `/api/vendor-bills/:id/payments` | Record bill payment (Calls Auto-Posting) |

### Sales
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/sales-orders/:id/confirm` | Confirm SO |
| POST | `/api/sales-orders/:id/create-invoice` | Generate Customer Invoice |
| POST | `/api/customer-invoices/:id/payments` | Record invoice payment (Calls Auto-Posting) |

### Reports
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/reports/balance-sheet?asOf=YYYY-MM-DD` | Aggregates Asset/Liability lines |
| GET | `/api/reports/profit-loss?from=YYYY-MM-DD` | Aggregates Income/Expense lines |

---

## 📁 Project Structure

```
c:\odoo-urban-furniture\
├── app/
│   ├── globals.css                    # Custom CSS properties, theme definitions
│   ├── login/ & signup/               # Auth routes with Vanta.js backgrounds
│   ├── dashboard/
│   │   ├── layout.tsx                 # Auth guard + sidebar layout
│   │   ├── page.tsx                   # Bento Box dashboard overview
│   │   ├── profile/                   # Interactive Profile editor
│   │   ├── contacts/                  # CRUD pages
│   │   ├── products/                  # CRUD pages
│   │   ├── purchase-orders/           # PO Workflow
│   │   ├── vendor-bills/              # Bill Workflow
│   │   ├── sales-orders/              # SO Workflow
│   │   ├── customer-invoices/         # Invoice Workflow
│   │   ├── journal-entries/           # JE Viewer
│   │   └── reports/                   # Balance Sheet / P&L Pages
│   └── api/                           # REST API Routes (28+ endpoints)
├── components/
│   └── dashboard/                     # Reusable UI (UserMenu, Charts, ProfileForm)
├── lib/
│   ├── auth.ts                        # JWT logic
│   ├── postingEngine.ts               # Auto double-entry logic
│   └── validations.ts                 # Zod schemas
└── prisma/
    ├── schema.prisma                  # 14 Models
    └── seed.ts                        # Bootstraps accounts/journals
```

---

## 🚀 Setup & Installation

### Prerequisites
- **Node.js** ≥ 18
- **PostgreSQL** 14+ 

### Local Setup Steps

```bash
# 1. Clone the repository
git clone https://github.com/KaranRathore05/Oddo-Urban-Furniture-Accounting.git
cd Oddo-Urban-Furniture-Accounting

# 2. Install dependencies
npm install

# 3. Configure Environment Variables
cp .env.example .env
# Important: Update .env with your local PostgreSQL DATABASE_URL
# Example: DATABASE_URL="postgresql://postgres:password@localhost:5432/urban_furniture"

# 4. Push Schema & Seed Master Data
npm run db:setup

# 5. Start Development Server
npm run dev
```

---
*Built with ❤️ using Next.js 16, React 19, Prisma, and PostgreSQL*
