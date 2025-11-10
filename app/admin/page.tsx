"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Appointment = {
  id: string;
  name: string;
  contact: string;
  datetime: string;
};

export default function AdminPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [form, setForm] = useState({ name: "", contact: "", datetime: "" });
  const [editingAppt, setEditingAppt] = useState<Appointment | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteAppt, setDeleteAppt] = useState<Appointment | null>(null);

  useEffect(() => {
    fetchAppointments();
  }, []);

  async function fetchAppointments() {
    try {
      const res = await fetch("/api/admin");
      const data = await res.json();
      setAppointments(data);
    } catch (err) {
      console.error("Error fetching appointments:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleAdd = async () => {
    if (!form.name || !form.contact || !form.datetime) return;
    const res = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setForm({ name: "", contact: "", datetime: "" });
      fetchAppointments();
    } else {
      const err = await res.json();
      alert(err.error || "Failed to add appointment");
    }
  };

  const handleEdit = (appt: Appointment) => {
    setEditingAppt(appt);
    setForm({
      name: appt.name,
      contact: appt.contact,
      datetime: new Date(appt.datetime).toISOString().slice(0, 16),
    });
  };

  const handleUpdate = async () => {
    if (!editingAppt) return;
    await fetch(`/api/admin/${editingAppt.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: editingAppt.id, ...form }),
    });
    setEditingAppt(null);
    setForm({ name: "", contact: "", datetime: "" });
    fetchAppointments();
  };

  const handleDeleteClick = (appt: Appointment) => {
    setDeleteAppt(appt);
    setShowDelete(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteAppt) return;
    await fetch("/api/admin", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: deleteAppt.id }),
    });
    setShowDelete(false);
    setDeleteAppt(null);
    fetchAppointments();
  };

  const filteredAppointments = appointments.filter(
    (appt) =>
      appt.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appt.contact.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black flex flex-col items-center p-10">
      <div className="w-full max-w-4xl bg-white dark:bg-zinc-900 rounded-lg shadow-md p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            Appointment Admin
          </h1>
          <Link
            href="/"
            className="rounded-md bg-zinc-800 px-3 py-2 text-white text-sm hover:bg-zinc-700"
          >
            Back to Home
          </Link>
        </div>

        <p className="text-zinc-600 dark:text-zinc-400 mb-4 text-sm">
          Manage and monitor all appointments below.
        </p>

        {/* Search */}
        <input
          type="text"
          placeholder="Search by name or contact..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="mb-6 w-full rounded-md border border-zinc-300 bg-white p-2 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
        />

        {/* Form for adding new appointment */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAdd();
          }}
          className="flex flex-col sm:flex-row gap-2 mb-6"
        >
          <input
            type="text"
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="rounded-md border border-zinc-300 bg-white p-2 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 flex-1"
          />
          <input
            type="text"
            placeholder="Contact"
            value={form.contact}
            onChange={(e) => setForm({ ...form, contact: e.target.value })}
            className="rounded-md border border-zinc-300 bg-white p-2 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 flex-1"
          />
          <input
            type="datetime-local"
            value={form.datetime}
            onChange={(e) => setForm({ ...form, datetime: e.target.value })}
            className="rounded-md border border-zinc-300 bg-white p-2 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 flex-1"
          />

          <button
            type="submit"
            className="rounded-md bg-green-600 px-4 py-2 text-white font-medium hover:bg-green-700 transition-colors"
          >
            Add
          </button>
        </form>

        {/* Appointment List */}
        {loading ? (
          <p className="text-zinc-700 dark:text-zinc-300">Loading...</p>
        ) : filteredAppointments.length > 0 ? (
          <ul className="divide-y divide-zinc-200 dark:divide-zinc-700">
            {filteredAppointments.map((appt) => (
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
                    onClick={() => handleEdit(appt)}
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
      {editingAppt && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow-md w-80">
            <h2 className="text-xl font-semibold text-center mb-4 text-zinc-900 dark:text-zinc-50">
              Edit Appointment
            </h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleUpdate();
              }}
              className="flex flex-col gap-3"
            >
              <input
                type="text"
                name="name"
                placeholder="Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="rounded-md border border-zinc-300 bg-white p-2 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              />
              <input
                type="text"
                name="contact"
                placeholder="Contact"
                value={form.contact}
                onChange={(e) => setForm({ ...form, contact: e.target.value })}
                className="rounded-md border border-zinc-300 bg-white p-2 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              />
              <input
                type="datetime-local"
                name="datetime"
                value={form.datetime}
                onChange={(e) =>
                  setForm({ ...form, datetime: e.target.value })
                }
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
                  onClick={() => setEditingAppt(null)}
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
      {showDelete && deleteAppt && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow-md w-80 text-center">
            <h2 className="text-xl font-semibold mb-4 text-zinc-900 dark:text-zinc-50">
              Delete Appointment
            </h2>
            <p className="text-zinc-700 dark:text-zinc-300 mb-5">
              Are you sure you want to delete{" "}
              <span className="font-medium">{deleteAppt.name}</span>?
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
