// Enhanced signup form with all required fields
import { useState, useEffect } from "react";
import { useFirebaseAuth } from "@/contexts/FirebaseAuthContext";
import { useRouter } from "next/navigation";
import PasswordInput from "./PasswordInput";

export default function SignupForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savePassword, setSavePassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState("");
  const [isSigningUp, setIsSigningUp] = useState(false);

  const { signup, user } = useFirebaseAuth();
  const router = useRouter();

  // Navigate to welcome page when user is authenticated after signup
  useEffect(() => {
    if (isSigningUp && user) {
      console.log('[SignupForm] User authenticated, navigating to welcome page');
      setIsSigningUp(false);
      router.push('/welcome');
    }
  }, [user, isSigningUp, router]);

  const validate = () => {
    if (!name.trim()) {
      setError("Name is required.");
      return false;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setError("Enter a valid email address.");
      return false;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return false;
    }
    if (!/[A-Z]/.test(password)) {
      setError("Password must contain an uppercase letter.");
      return false;
    }
    if (!/[0-9]/.test(password)) {
      setError("Password must contain a number.");
      return false;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return false;
    }
    if (!agreeTerms) {
      setError("You must agree to the terms and conditions.");
      return false;
    }
    setError("");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setIsSigningUp(true);
      await signup(email, password, name);
      // Navigation will happen automatically via useEffect when auth state changes
      console.log('[SignupForm] Signup completed, waiting for auth state...');
    } catch (err) {
      setIsSigningUp(false);
      setError(err instanceof Error ? err.message : 'Failed to sign up. Please try again.');
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-8 rounded shadow-md w-96"
      aria-label="Sign up form"
    >
      <h2 className="text-2xl font-bold mb-6">Create Your Account</h2>

      {/* Name Field */}
      <label htmlFor="name" className="block mb-2 font-medium">
        Full Name
      </label>
      <input
        id="name"
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        className="w-full px-4 py-2 border rounded mb-4"
        autoComplete="name"
        placeholder="Enter your full name"
      />

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
        placeholder="Create a strong password"
      />

      {/* Confirm Password Field */}
      <label htmlFor="confirmPassword" className="block mb-2 mt-4 font-medium">
        Confirm Password
      </label>
      <PasswordInput
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        placeholder="Confirm your password"
        id="confirmPassword"
      />

      <ul className="text-xs text-gray-500 mt-2 mb-4">
        <li>• At least 8 characters</li>
        <li>• 1 uppercase letter</li>
        <li>• 1 number</li>
      </ul>

      {/* Save Password Checkbox */}
      <div className="flex items-center mb-4">
        <input
          id="savePassword"
          type="checkbox"
          checked={savePassword}
          onChange={(e) => setSavePassword(e.target.checked)}
          className="mr-2"
        />
        <label htmlFor="savePassword" className="text-sm">
          Save password in browser
        </label>
      </div>

      {/* Terms & Conditions Checkbox */}
      <div className="flex items-start mb-4">
        <input
          id="agreeTerms"
          type="checkbox"
          checked={agreeTerms}
          onChange={(e) => setAgreeTerms(e.target.checked)}
          className="mr-2 mt-1"
          required
        />
        <label htmlFor="agreeTerms" className="text-sm">
          I agree to the{" "}
          <a href="/terms" className="text-blue-600 hover:underline">
            Terms & Conditions
          </a>{" "}
          and{" "}
          <a href="/privacy" className="text-blue-600 hover:underline">
            Privacy Policy
          </a>
        </label>
      </div>

      {error && (
        <div className="text-red-600 mb-4 text-sm" role="alert">
          {error}
        </div>
      )}

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 font-medium"
      >
        Create Account
      </button>

      <div className="mt-4 text-center">
        <span className="text-sm text-gray-600">
          Already have an account?{" "}
          <a href="/auth/login" className="text-blue-600 hover:underline">
            Sign in
          </a>
        </span>
      </div>
    </form>
  );
}
