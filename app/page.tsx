"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    datetime: "",
  });
  const [status, setStatus] = useState("");

  const [showLogin, setShowLogin] = useState(false);
  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const [loginError, setLoginError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("Saving...");

    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setStatus("Appointment saved successfully!");
        setFormData({ name: "", contact: "", datetime: "" });
      } else {
        const error = await res.json();
        setStatus(`Error: ${error.message}`);
      }
    } catch (err) {
      console.error(err);
      setStatus("Error saving appointment.");
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    // Check for empty inputs
    if (!loginData.username.trim() || !loginData.password.trim()) {
      setLoginError("Please enter a username and password");
      return;
    }

    // Validate credentials
    if (loginData.username === "admin" && loginData.password === "admin123") {
      router.push("/admin");
    } else {
      setLoginError("Invalid username or password");
      // Clear the fields on wrong credentials
      setLoginData({ username: "", password: "" });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black relative">
      <main className="flex w-full max-w-md flex-col items-center justify-center rounded-lg bg-white p-10 shadow-md dark:bg-zinc-900">
        <h1 className="mb-6 text-3xl font-semibold text-zinc-900 dark:text-zinc-50">
          Schedule an Appointment
        </h1>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-5">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            required
            className="rounded-md border border-zinc-300 bg-white p-2 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          />
          <input
            type="tel"
            name="contact"
            placeholder="Contact Number"
            value={formData.contact}
            onChange={handleChange}
            required
            className="rounded-md border border-zinc-300 bg-white p-2 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          />
          <input
            type="datetime-local"
            name="datetime"
            value={formData.datetime}
            onChange={handleChange}
            required
            className="rounded-md border border-zinc-300 bg-white p-2 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          />
          <button
            type="submit"
            className="mt-4 w-full rounded-md bg-blue-600 py-2 text-white font-medium transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Schedule
          </button>
        </form>

        {status && (
          <p className="mt-4 text-sm text-zinc-700 dark:text-zinc-300">{status}</p>
        )}

        {/* Admin Button */}
        <button
          onClick={() => setShowLogin(true)}
          className="mt-6 inline-block rounded-md bg-zinc-800 px-4 py-2 text-white text-sm font-medium hover:bg-zinc-700 transition-colors"
        >
          Admin Login
        </button>
      </main>

      {/* Login Popup */}
      {showLogin && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow-md w-80">
            <h2 className="text-xl font-semibold text-center mb-4 text-zinc-900 dark:text-zinc-50">
              Admin Login
            </h2>
            <form onSubmit={handleLogin} className="flex flex-col gap-3">
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={loginData.username}
                onChange={(e) =>
                  setLoginData({ ...loginData, username: e.target.value })
                }
                className="rounded-md border border-zinc-300 bg-white p-2 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={loginData.password}
                onChange={(e) =>
                  setLoginData({ ...loginData, password: e.target.value })
                }
                className="rounded-md border border-zinc-300 bg-white p-2 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              />
              {loginError && (
                <p className="text-sm text-red-500 text-center">{loginError}</p>
              )}
              <div className="flex gap-2 mt-3">
                <button
                  type="submit"
                  className="w-full rounded-md bg-blue-600 py-2 text-white font-medium hover:bg-blue-700 transition-colors"
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => setShowLogin(false)}
                  className="w-full rounded-md bg-gray-400 py-2 text-white font-medium hover:bg-gray-500 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
