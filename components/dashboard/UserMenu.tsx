"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Settings, LogOut } from "lucide-react";

interface UserMenuProps {
  user: {
    id: string;
    fullName: string;
    email: string;
    role: string;
    avatar?: string | null;
  };
}

export default function UserMenu({ user }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initials = user.fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className="user-menu-container"
      ref={menuRef}
      style={{ position: "relative" }}
    >
      <div
        className="topbar-user"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          padding: "0.35rem 0.5rem",
          borderRadius: "30px",
          transition: "background 0.2s ease",
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.background = "var(--bg-hover)")
        }
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
          }}
        >
          <span
            style={{
              fontSize: "0.8125rem",
              fontWeight: 600,
              color: "var(--text-primary)",
            }}
          >
            {user.fullName}
          </span>
          <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
            {user.role}
          </span>
        </div>
        <div
          className="topbar-avatar"
          style={{
            background: user.avatar
              ? `url(${user.avatar}) center/cover`
              : "linear-gradient(135deg, #6366f1, #4f46e5)",
            color: "white",
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "bold",
            border: "2px solid var(--bg-primary)",
          }}
        >
          {!user.avatar && initials}
        </div>
      </div>

      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "110%",
            right: 0,
            width: "220px",
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: "16px",
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.2)",
            padding: "0.5rem",
            zIndex: 50,
          }}
        >
          <div
            style={{
              padding: "0.5rem 0.75rem",
              borderBottom: "1px solid var(--border)",
              marginBottom: "0.5rem",
            }}
          >
            <div style={{ fontWeight: 600, fontSize: "0.875rem" }}>
              {user.fullName}
            </div>
            <div
              style={{
                color: "var(--text-muted)",
                fontSize: "0.75rem",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {user.email}
            </div>
          </div>

          <Link
            href="/dashboard/profile"
            onClick={() => setIsOpen(false)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.5rem 0.75rem",
              color: "var(--text-primary)",
              textDecoration: "none",
              fontSize: "0.875rem",
              borderRadius: "8px",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "var(--bg-hover)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
          >
            <User size={16} /> My Profile
          </Link>

          <div
            style={{
              height: "1px",
              background: "var(--border)",
              margin: "0.5rem 0",
            }}
          />

          <button
            onClick={handleLogout}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.5rem 0.75rem",
              color: "var(--danger)",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              fontSize: "0.875rem",
              borderRadius: "8px",
              transition: "background 0.2s",
              textAlign: "left",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
          >
            <LogOut size={16} /> Sign out
          </button>
        </div>
      )}
    </div>
  );
}
