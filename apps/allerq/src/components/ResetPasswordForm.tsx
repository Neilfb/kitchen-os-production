"use client";
// Reset password form component
import { useState } from "react";

export default function ResetPasswordForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setError("");

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      
      if (data.success) {
        setStatus("success");
      } else {
        throw new Error(data.error || "Failed to initiate password reset");
      }
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Failed to initiate password reset");
    }
  };

  if (status === "success") {
    return (
      <div className="bg-white p-8 rounded shadow-md w-80">
        <h2 className="text-2xl font-bold mb-4">Reset Password</h2>
        <div className="text-green-600 mb-4">
          Password reset email sent! Please check your inbox.
        </div>
        <p className="text-sm text-gray-600">
          Didn&apos;t receive an email? Check your spam folder or try again.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-8 rounded shadow-md w-80"
      aria-label="Reset password form"
    >
      <h2 className="text-2xl font-bold mb-4">Reset Password</h2>
      <p className="text-sm text-gray-600 mb-4">
        Enter your email address and we&apos;ll send you instructions to reset your password.
      </p>
      <label htmlFor="email" className="block mb-2">
        Email
      </label>
      <input
        id="email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="w-full px-4 py-2 border rounded mb-4"
        autoComplete="email"
        disabled={status === "loading"}
      />
      {error && (
        <div className="text-red-600 mb-2" role="alert">
          {error}
        </div>
      )}
      <button
        type="submit"
        className={`w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 ${
          status === "loading" ? "opacity-50 cursor-not-allowed" : ""
        }`}
        disabled={status === "loading"}
      >
        {status === "loading" ? "Sending..." : "Reset Password"}
      </button>
    </form>
  );
}
