"use client";
// Complete password reset form component
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PasswordInput from "./PasswordInput";

export default function CompleteResetForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams?.get("token");

  const validatePassword = () => {
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return false;
    }
    if (!/[A-Z]/.test(password)) {
      setError("Password must contain at least one uppercase letter");
      return false;
    }
    if (!/[0-9]/.test(password)) {
      setError("Password must contain at least one number");
      return false;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError("Invalid reset token");
      return;
    }
    if (!validatePassword()) return;

    setStatus("loading");
    setError("");

    try {
      const response = await fetch("/api/auth/complete-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();
      
      if (data.success) {
        setStatus("success");
        // Redirect to login after 3 seconds
        setTimeout(() => {
          // Use alternative navigation approach for compatibility with strict route typing
          window.location.href = "/auth/login";
        }, 3000);
      } else {
        throw new Error(data.error || "Failed to reset password");
      }
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Failed to reset password");
    }
  };

  if (!token) {
    return (
      <div className="bg-white p-8 rounded shadow-md w-80">
        <h2 className="text-2xl font-bold mb-4">Invalid Reset Link</h2>
        <p className="text-red-600 mb-4">
          This password reset link is invalid or has expired.
        </p>
        <a
          href="/auth/reset-password"
          className="text-blue-600 hover:text-blue-800"
        >
          Request a new reset link
        </a>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="bg-white p-8 rounded shadow-md w-80">
        <h2 className="text-2xl font-bold mb-4">Password Reset Complete</h2>
        <div className="text-green-600 mb-4">
          Your password has been successfully reset.
        </div>
        <p className="text-sm text-gray-600">
          Redirecting to login page...
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-8 rounded shadow-md w-80"
      aria-label="Complete password reset form"
    >
      <h2 className="text-2xl font-bold mb-4">Reset Password</h2>
      
      <label htmlFor="password" className="block mb-2">
        New Password
      </label>
      <PasswordInput
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={status === "loading"}
      />

      <label htmlFor="confirmPassword" className="block mt-4 mb-2">
        Confirm Password
      </label>
      <PasswordInput
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        disabled={status === "loading"}
      />

      <ul className="text-xs text-gray-500 mt-2 mb-4">
        <li>• At least 8 characters</li>
        <li>• 1 uppercase letter</li>
        <li>• 1 number</li>
      </ul>

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
        {status === "loading" ? "Resetting..." : "Reset Password"}
      </button>
    </form>
  );
}
