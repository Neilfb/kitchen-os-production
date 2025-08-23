// Accessible password input with show/hide toggle and validation
import { useState } from "react";

export interface PasswordInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  id?: string;
  name?: string;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  placeholder?: string;
  disabled?: boolean;
}

export default function PasswordInput({
  value,
  onChange,
  id = "password",
  name = "password",
  required = true,
  minLength = 8,
  maxLength = 64,
  placeholder = "Enter your password",
  disabled = false,
}: PasswordInputProps) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        minLength={minLength}
        maxLength={maxLength}
        placeholder={placeholder}
        className="w-full px-4 py-2 border rounded focus:outline-none focus:ring"
        aria-label="Password"
        aria-required={required}
        autoComplete="current-password"
        disabled={disabled}
      />
      <button
        type="button"
        aria-label={show ? "Hide password" : "Show password"}
        onClick={() => setShow((s) => !s)}
        className="absolute right-2 top-2 text-sm text-gray-600 focus:outline-none"
        tabIndex={0}
      >
        {show ? "Hide" : "Show"}
      </button>
    </div>
  );
}
