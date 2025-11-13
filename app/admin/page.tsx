"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Appointment = {
  id: string;
  name: string;
  contact: string;
  datetime: string;
  createdAt: string;
};

export default function AdminPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [form, setForm] = useState({ name: "", contact: "", datetime: "" });
  const [editingAppt, setEditingAppt] = useState<Appointment | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteAppt, setDeleteAppt] = useState<Appointment | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // ---------- Fetch Appointments ----------
  useEffect(() => {
    fetchAppointments();
  }, []);

  async function fetchAppointments() {
    try {
      setLoading(true);
      const res = await fetch("/api/admin");
      const data = await res.json();
      setAppointments(data);
    } catch (err) {
      console.error("Error fetching appointments:", err);
    } finally {
      setLoading(false);
    }
  }

  // ---------- CRUD Handlers ----------
  async function handleAdd() {
    if (!form.name || !form.contact || !form.datetime) return;

    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Failed to add appointment");
      setForm({ name: "", contact: "", datetime: "" });
      await fetchAppointments();
    } catch (err: any) {
      alert(err.message || "Error adding appointment");
    }
  }

  const handleEdit = (appt: Appointment) => {
    setEditingAppt(appt);
    setForm({
      name: appt.name,
      contact: appt.contact,
      datetime: new Date(appt.datetime).toISOString().slice(0, 16),
    });
  };

  async function handleUpdate() {
    if (!editingAppt) return;

    try {
      const res = await fetch("/api/admin", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingAppt.id, ...form }),
      });

      if (!res.ok) throw new Error("Failed to update appointment");
      setEditingAppt(null);
      setForm({ name: "", contact: "", datetime: "" });
      await fetchAppointments();
    } catch (err: any) {
      alert(err.message || "Error updating appointment");
    }
  }

  const handleDeleteClick = (appt: Appointment) => {
    setDeleteAppt(appt);
    setShowDelete(true);
  };

  async function handleDeleteConfirm() {
    if (!deleteAppt) return;
    try {
      await fetch("/api/admin", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deleteAppt.id }),
      });
      setShowDelete(false);
      setDeleteAppt(null);
      await fetchAppointments();
    } catch (err) {
      console.error("Error deleting appointment:", err);
    }
  }

  // ---------- Filter + Pagination ----------
  const filteredAppointments = appointments.filter(
    (appt) =>
      appt.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appt.contact.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentAppointments = filteredAppointments.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handlePrev = () => setCurrentPage((p) => Math.max(p - 1, 1));
  const handleNext = () => setCurrentPage((p) => Math.min(p + 1, totalPages));

  // ---------- Common Styles ----------
  const inputClass =
    "rounded-md border border-zinc-300 bg-white p-2 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500";

  // ---------- Render ----------
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black flex flex-col items-center p-10">
      <div className="w-full max-w-5xl bg-white dark:bg-zinc-900 rounded-lg shadow-md p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            Appointment Admin
          </h1>
          <Link
            href="/"
            className="rounded-md bg-zinc-800 px-3 py-2 text-white text-sm hover:bg-zinc-700 transition-colors"
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
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1); // reset page when filtering
          }}
          className={`${inputClass} mb-6 w-full`}
        />

        {/* Add Form */}
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
            className={`${inputClass} flex-1`}
          />
          <input
            type="text"
            placeholder="Contact"
            value={form.contact}
            onChange={(e) => setForm({ ...form, contact: e.target.value })}
            className={`${inputClass} flex-1`}
          />
          <input
            type="datetime-local"
            value={form.datetime}
            onChange={(e) => setForm({ ...form, datetime: e.target.value })}
            className={`${inputClass} flex-1`}
          />

          <button
            type="submit"
            className="rounded-md bg-green-600 px-4 py-2 text-white font-medium hover:bg-green-700 transition-colors"
          >
            Add
          </button>
        </form>

        {/* Appointment Table */}
        {loading ? (
          <p className="text-zinc-700 dark:text-zinc-300">
            Loading appointments...
          </p>
        ) : filteredAppointments.length > 0 ? (
          <>
            <div className="overflow-x-auto rounded-md border border-zinc-200 dark:border-zinc-700">
              <table className="min-w-full text-sm text-left text-zinc-700 dark:text-zinc-300">
                <thead className="sticky top-0 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 uppercase text-xs font-semibold">
                  <tr>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Contact</th>
                    <th className="px-4 py-3">Appointment</th>
                    <th className="px-4 py-3">Created At</th>
                    <th className="px-4 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentAppointments.map((appt, i) => (
                    <tr
                      key={appt.id}
                      className={`border-t border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-colors ${i % 2 === 0
                        ? "bg-white dark:bg-zinc-900"
                        : "bg-zinc-50 dark:bg-zinc-800"
                        }`}
                    >
                      <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100">
                        {appt.name}
                      </td>
                      <td className="px-4 py-3">{appt.contact}</td>
                      <td className="px-4 py-3">
                        {new Date(appt.datetime).toLocaleString(undefined, {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </td>
                      <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                        {appt.createdAt
                          ? new Date(appt.createdAt).toLocaleString(undefined, {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })
                          : "—"}
                      </td>
                      <td className="px-4 py-3 flex justify-center gap-2">
                        <button
                          onClick={() => handleEdit(appt)}
                          className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteClick(appt)}
                          className="text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded transition"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex justify-between items-center mt-4 text-sm text-zinc-600 dark:text-zinc-300">
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={handlePrev}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded border border-zinc-300 dark:border-zinc-600 transition ${currentPage === 1
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-zinc-100 dark:hover:bg-zinc-700"
                    }`}
                >
                  Previous
                </button>
                <button
                  onClick={handleNext}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded border border-zinc-300 dark:border-zinc-600 transition ${currentPage === totalPages
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-zinc-100 dark:hover:bg-zinc-700"
                    }`}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-zinc-600 dark:text-zinc-400 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-md">
            No appointments found.
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingAppt && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow-lg w-80">
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
                className={inputClass}
              />
              <input
                type="text"
                name="contact"
                placeholder="Contact"
                value={form.contact}
                onChange={(e) => setForm({ ...form, contact: e.target.value })}
                className={inputClass}
              />
              <input
                type="datetime-local"
                name="datetime"
                value={form.datetime}
                onChange={(e) => setForm({ ...form, datetime: e.target.value })}
                className={inputClass}
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

      {/* Delete Confirmation Modal */}
      {showDelete && deleteAppt && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow-lg w-80 text-center">
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
