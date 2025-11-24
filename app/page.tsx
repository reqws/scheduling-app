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

    if (!loginData.username.trim() || !loginData.password.trim()) {
      setLoginError("Please enter a username and password");
      return;
    }

    if (loginData.username === "admin" && loginData.password === "admin123") {
      router.push("/admin");
    } else {
      setLoginError("Invalid username or password");
      setLoginData({ username: "", password: "" });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-black dark:to-zinc-900 font-sans px-4">
      <main className="w-full max-w-md rounded-2xl bg-white/90 dark:bg-zinc-900/80 backdrop-blur-md p-10 shadow-2xl border border-zinc-200 dark:border-zinc-800">
        <h1 className="mb-8 text-3xl font-bold text-center text-zinc-900 dark:text-zinc-50 tracking-tight">
          Book an Appointment
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Input */}
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            required
            className="input-field"
          />
          <input
            type="tel"
            name="contact"
            placeholder="Contact Number"
            value={formData.contact}
            onChange={handleChange}
            required
            className="input-field"
          />
          <input
            type="datetime-local"
            name="datetime"
            value={formData.datetime}
            onChange={handleChange}
            required
            className="input-field"
          />

          <button type="submit" className="btn-primary mt-4">
            Schedule Appointment
          </button>
        </form>

        {status && (
          <p className="mt-4 text-center text-sm animate-fade text-zinc-700 dark:text-zinc-300">
            {status}
          </p>
        )}

        <button
          onClick={() => setShowLogin(true)}
          className="btn-secondary mt-8 w-full"
        >
          Admin Login
        </button>
      </main>

      {/* LOGIN MODAL */}
      {showLogin && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade">
          <div className="w-80 bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-xl border border-zinc-300 dark:border-zinc-700 animate-scale">
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
                className="input-field"
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={loginData.password}
                onChange={(e) =>
                  setLoginData({ ...loginData, password: e.target.value })
                }
                className="input-field"
              />

              {loginError && (
                <p className="text-sm text-red-500 text-center animate-fade">
                  {loginError}
                </p>
              )}

              <div className="flex gap-2 mt-4">
                <button type="submit" className="btn-primary w-full">
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => setShowLogin(false)}
                  className="btn-gray w-full"
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
