"use client";

import { useState } from "react";

export default function Home() {
  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    datetime: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(
      `Appointment Scheduled!\n\nName: ${formData.name}\nContact: ${formData.contact}\nDate & Time: ${formData.datetime}`
    );
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-md flex-col items-center justify-center rounded-lg bg-white p-10 shadow-md dark:bg-zinc-900">
        <h1 className="mb-6 text-3xl font-semibold text-zinc-900 dark:text-zinc-50">
          Schedule an Appointment
        </h1>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-5">
          {/* Name Field */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Full Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="mt-1 w-full rounded-md border border-zinc-300 bg-white p-2 text-zinc-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            />
          </div>

          {/* Contact Field */}
          <div>
            <label
              htmlFor="contact"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Contact Number
            </label>
            <input
              type="tel"
              id="contact"
              name="contact"
              value={formData.contact}
              onChange={handleChange}
              required
              className="mt-1 w-full rounded-md border border-zinc-300 bg-white p-2 text-zinc-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            />
          </div>

          {/* Date and Time Field */}
          <div>
            <label
              htmlFor="datetime"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Date & Time
            </label>
            <input
              type="datetime-local"
              id="datetime"
              name="datetime"
              value={formData.datetime}
              onChange={handleChange}
              required
              className="mt-1 w-full rounded-md border border-zinc-300 bg-white p-2 text-zinc-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="mt-4 w-full rounded-md bg-blue-600 py-2 text-white font-medium transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Schedule
          </button>
        </form>
      </main>
    </div>
  );
}
