// Login form for AllerQ-Forge
import { useState } from "react";
import { useFirebaseAuth } from "@/contexts/FirebaseAuthContext";
import PasswordInput from "./PasswordInput";

export default function SigninForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useFirebaseAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
      // Redirect to dashboard on successful login
      window.location.href = '/restaurants';
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid credentials.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-8 rounded shadow-md w-96"
      aria-label="Sign in form"
    >
      <h2 className="text-2xl font-bold mb-6">Welcome Back</h2>

      {/* Email Field */}
      <label htmlFor="email" className="block mb-2 font-medium">
        Email Address
      </label>
      <input
        id="email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="w-full px-4 py-2 border rounded mb-4"
        autoComplete="email"
        placeholder="Enter your email address"
      />

      {/* Password Field */}
      <label htmlFor="password" className="block mb-2 font-medium">
        Password
      </label>
      <PasswordInput
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Enter your password"
      />

      {error && (
        <div className="text-red-600 mb-4 text-sm" role="alert">
          {error}
        </div>
      )}

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 font-medium"
      >
        Sign In
      </button>

      <div className="mt-4 text-center">
        <a
          href="/auth/reset-password"
          className="text-sm text-blue-600 hover:underline"
        >
          Forgot your password?
        </a>
      </div>

      <div className="mt-4 text-center">
        <span className="text-sm text-gray-600">
          Don't have an account?{" "}
          <a href="/auth/signup" className="text-blue-600 hover:underline">
            Sign up
          </a>
        </span>
      </div>
    </form>
  );
}
