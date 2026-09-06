"use client";

import { useState, useRef } from "react";
import { Camera, Save } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ProfileForm({ user }: { user: any }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    fullName: user.fullName || "",
    email: user.email || "",
    loginId: user.loginId || "",
    mobile: user.mobile || "",
    avatar: user.avatar || "",
  });

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const initials = form.fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        // 2MB max
        setErrorMsg("Image size must be less than 2MB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setForm({ ...form, avatar: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.fullName,
          loginId: form.loginId,
          mobile: form.mobile,
          avatar: form.avatar,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update profile");

      setSuccessMsg("Profile updated successfully!");
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="card"
      style={{ maxWidth: "600px", margin: "0 auto", padding: "3rem" }}
    >
      {successMsg && (
        <div
          className="alert alert-success"
          style={{
            marginBottom: "1.5rem",
            background: "rgba(34,197,94,0.1)",
            color: "#16a34a",
            padding: "1rem",
            borderRadius: "8px",
          }}
        >
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div
          className="alert alert-error"
          style={{
            marginBottom: "1.5rem",
            background: "rgba(239,68,68,0.1)",
            color: "#dc2626",
            padding: "1rem",
            borderRadius: "8px",
          }}
        >
          {errorMsg}
        </div>
      )}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "2rem",
          marginBottom: "2.5rem",
        }}
      >
        <div style={{ position: "relative" }}>
          <div
            style={{
              width: "100px",
              height: "100px",
              borderRadius: "50%",
              background: form.avatar
                ? `url(${form.avatar}) center/cover`
                : "linear-gradient(135deg, #6366f1, #4f46e5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: "2.5rem",
              fontWeight: "bold",
              boxShadow: "0 10px 15px -3px rgba(99, 102, 241, 0.4)",
            }}
          >
            {!form.avatar && initials}
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            style={{
              position: "absolute",
              bottom: -5,
              right: -5,
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              borderRadius: "50%",
              width: 36,
              height: 36,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "var(--text-primary)",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            }}
          >
            <Camera size={16} />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/png, image/jpeg, image/webp"
            style={{ display: "none" }}
          />
        </div>
        <div>
          <h2 style={{ fontSize: "1.5rem", marginBottom: "0.25rem" }}>
            {form.fullName}
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
            {form.email}
          </p>
          <span
            className={`badge badge-${user.role.toLowerCase()}`}
            style={{ marginTop: "0.5rem", display: "inline-block" }}
          >
            {user.role}
          </span>
        </div>
      </div>

      <div style={{ borderTop: "1px solid var(--border)", paddingTop: "2rem" }}>
        <div className="form-group">
          <label>Full Name</label>
          <input
            type="text"
            className="form-input"
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label>
            Email{" "}
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
              (Cannot be changed)
            </span>
          </label>
          <input
            type="email"
            className="form-input"
            value={form.email}
            disabled
            style={{ opacity: 0.7 }}
          />
        </div>
        <div className="form-group">
          <label>Login ID</label>
          <input
            type="text"
            className="form-input"
            value={form.loginId}
            onChange={(e) => setForm({ ...form, loginId: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>Mobile Number</label>
          <input
            type="text"
            className="form-input"
            value={form.mobile}
            onChange={(e) => setForm({ ...form, mobile: e.target.value })}
          />
        </div>
        <div className="form-group" style={{ marginTop: "2.5rem" }}>
          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loading}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
            }}
          >
            <Save size={18} />
            {loading ? "Saving Changes..." : "Save Profile Changes"}
          </button>
        </div>
      </div>
    </form>
  );
}
