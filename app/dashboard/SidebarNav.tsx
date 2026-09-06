"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";

interface SidebarNavProps {
  user: {
    id: string;
    fullName: string;
    email: string;
    role: string;
    avatar?: string | null;
  };
}

import {
  ShoppingCart,
  Receipt,
  Package,
  FileText,
  Users,
  Layers,
  LayoutDashboard,
  BookOpen,
  FileSignature,
  LineChart,
  TrendingUp,
  BarChart3,
  Target,
} from "lucide-react";

const navSections = [
  {
    title: "Sales",
    items: [
      {
        label: "Sales Orders",
        href: "/dashboard/sales-orders",
        icon: <ShoppingCart size={18} />,
      },
      {
        label: "Customer Invoices",
        href: "/dashboard/customer-invoices",
        icon: <Receipt size={18} />,
      },
    ],
  },
  {
    title: "Purchase",
    items: [
      {
        label: "Purchase Orders",
        href: "/dashboard/purchase-orders",
        icon: <Package size={18} />,
      },
      {
        label: "Vendor Bills",
        href: "/dashboard/vendor-bills",
        icon: <FileText size={18} />,
      },
    ],
  },
  {
    title: "Account",
    items: [
      {
        label: "Contacts",
        href: "/dashboard/contacts",
        icon: <Users size={18} />,
      },
      {
        label: "Products",
        href: "/dashboard/products",
        icon: <Layers size={18} />,
      },
      {
        label: "Chart of Accounts",
        href: "/dashboard/accounts",
        icon: <LayoutDashboard size={18} />,
      },
      {
        label: "Journals",
        href: "/dashboard/journals",
        icon: <BookOpen size={18} />,
      },
      {
        label: "Journal Entries",
        href: "/dashboard/journal-entries",
        icon: <FileSignature size={18} />,
      },
    ],
  },
  {
    title: "Report",
    items: [
      {
        label: "Balance Sheet",
        href: "/dashboard/reports/balance-sheet",
        icon: <LineChart size={18} />,
      },
      {
        label: "Profit & Loss",
        href: "/dashboard/reports/profit-loss",
        icon: <TrendingUp size={18} />,
      },
    ],
  },
  {
    title: "Analytics",
    items: [
      {
        label: "Analytic Accounts",
        href: "/dashboard/analytics",
        icon: <BarChart3 size={18} />,
      },
      {
        label: "Budgets",
        href: "/dashboard/budgets",
        icon: <Target size={18} />,
      },
    ],
  },
];

export function SidebarNav({ user }: SidebarNavProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <Link href="/dashboard" style={{ textDecoration: "none" }}>
          <h2>Urban Furniture</h2>
          <span>Accounting System</span>
        </Link>
      </div>

      <nav>
        {navSections.map((section) => (
          <div key={section.title} className="sidebar-section">
            <div className="sidebar-section-title">{section.title}</div>
            {section.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar-link ${pathname.startsWith(item.href) ? "active" : ""}`}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "0.75rem",
          }}
        >
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
            Signed in as
            <br />
            <span style={{ color: "var(--text-secondary)", fontWeight: 500 }}>
              {user.email}
            </span>
          </div>
          <ThemeToggle />
        </div>
        <button
          onClick={handleLogout}
          className="btn btn-secondary btn-sm btn-full"
        >
          Sign Out
        </button>
      </div>
    </aside>
  );
}
