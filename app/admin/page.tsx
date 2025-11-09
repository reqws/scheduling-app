"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Appointment {
  id: string;
  name: string;
  contact: string;
  datetime: string;
}

export default function AdminPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await fetch("/api/admin");
        const data = await res.json();
        setAppointments(data);
      } catch (err) {
        console.error("Error fetching appointments:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black flex flex-col items-center p-10">
      <div className="w-full max-w-3xl bg-white dark:bg-zinc-900 rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            Admin Panel
          </h1>
          <Link
            href="/"
            className="rounded-md bg-zinc-800 px-3 py-2 text-white text-sm hover:bg-zinc-700"
          >
            Back to Home
          </Link>
        </div>

        {loading ? (
          <p className="text-zinc-700 dark:text-zinc-300">Loading...</p>
        ) : appointments.length > 0 ? (
          <ul className="divide-y divide-zinc-200 dark:divide-zinc-700">
            {appointments.map((appt) => (
              <li key={appt.id} className="py-4">
                <p className="text-zinc-900 dark:text-zinc-100 font-medium">
                  {appt.name}
                </p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {appt.contact} —{" "}
                  {new Date(appt.datetime).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-zinc-700 dark:text-zinc-300">
            No appointments found.
          </p>
        )}
      </div>
    </div>
  );
}
