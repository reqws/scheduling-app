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
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [currentAppt, setCurrentAppt] = useState<Appointment | null>(null);

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

  const handleEditClick = (appt: Appointment) => {
    setCurrentAppt(appt);
    setShowEdit(true);
  };

  const handleDeleteClick = (appt: Appointment) => {
    setCurrentAppt(appt);
    setShowDelete(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!currentAppt) return;
    const { name, value } = e.target;
    setCurrentAppt({ ...currentAppt, [name]: value });
  };

  const handleSave = async () => {
    if (!currentAppt) return;

    try {
      const res = await fetch(`/api/admin/${currentAppt.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(currentAppt),
      });

      if (!res.ok) throw new Error("Failed to update appointment");

      setAppointments((prev) =>
        prev.map((appt) => (appt.id === currentAppt.id ? currentAppt : appt))
      );
      setShowEdit(false);
    } catch (err) {
      console.error(err);
      alert("Error saving changes");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!currentAppt) return;

    try {
      const res = await fetch(`/api/admin/${currentAppt.id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete appointment");

      setAppointments((prev) =>
        prev.filter((appt) => appt.id !== currentAppt.id)
      );
      setShowDelete(false);
    } catch (err) {
      console.error(err);
      alert("Error deleting appointment");
    }
  };

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
              <li
                key={appt.id}
                className="py-4 flex justify-between items-center"
              >
                <div>
                  <p className="text-zinc-900 dark:text-zinc-100 font-medium">
                    {appt.name}
                  </p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    {appt.contact} — {new Date(appt.datetime).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditClick(appt)}
                    className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteClick(appt)}
                    className="text-sm bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-zinc-700 dark:text-zinc-300">
            No appointments found.
          </p>
        )}
      </div>

      {/* EDIT MODAL */}
      {showEdit && currentAppt && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow-md w-80">
            <h2 className="text-xl font-semibold text-center mb-4 text-zinc-900 dark:text-zinc-50">
              Edit Appointment
            </h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSave();
              }}
              className="flex flex-col gap-3"
            >
              <input
                type="text"
                name="name"
                placeholder="Name"
                value={currentAppt.name}
                onChange={handleInputChange}
                className="rounded-md border border-zinc-300 bg-white p-2 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              />
              <input
                type="text"
                name="contact"
                placeholder="Contact"
                value={currentAppt.contact}
                onChange={handleInputChange}
                className="rounded-md border border-zinc-300 bg-white p-2 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              />
              <input
                type="datetime-local"
                name="datetime"
                value={new Date(currentAppt.datetime)
                  .toISOString()
                  .slice(0, 16)}
                onChange={handleInputChange}
                className="rounded-md border border-zinc-300 bg-white p-2 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              />

              <div className="flex gap-2 mt-3">
                <button
                  type="submit"
                  className="w-full rounded-md bg-blue-600 py-2 text-white font-medium hover:bg-blue-700 transition-colors"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setShowEdit(false)}
                  className="w-full rounded-md bg-gray-400 py-2 text-white font-medium hover:bg-gray-500 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {showDelete && currentAppt && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow-md w-80 text-center">
            <h2 className="text-xl font-semibold mb-4 text-zinc-900 dark:text-zinc-50">
              Delete Appointment
            </h2>
            <p className="text-zinc-700 dark:text-zinc-300 mb-5">
              Are you sure you want to delete{" "}
              <span className="font-medium">{currentAppt.name}</span>?
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleDeleteConfirm}
                className="w-full rounded-md bg-red-600 py-2 text-white font-medium hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
              <button
                onClick={() => setShowDelete(false)}
                className="w-full rounded-md bg-gray-400 py-2 text-white font-medium hover:bg-gray-500 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
