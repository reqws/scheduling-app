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

  const [flashList, setFlashList] = useState<
    { id: string; type: "error"; message: string }[]
  >([]);

  const [flash, setFlash] = useState<{
    id?: string;
    type: "add" | "update" | "delete";
  } | null>(null);

  const [deletedRows, setDeletedRows] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [showDelete, setShowDelete] = useState(false);
  const [deleteAppt, setDeleteAppt] = useState<Appointment | null>(null);

  useEffect(() => {
    fetchAppointments();
  }, []);

  async function fetchAppointments() {
    try {
      setLoading(true);
      const res = await fetch("/api/admin");
      const data = await res.json();
      setAppointments(data);
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd() {
    if (!form.name || !form.contact || !form.datetime) {
      const newToast = {
        id: crypto.randomUUID(),
        type: "error" as const,
        message: "All fields are required!",
      };

      setFlashList((prev) => [...prev, newToast].slice(-3));

      setTimeout(() => {
        setFlashList((prev) => prev.filter((t) => t.id !== newToast.id));
      }, 2000);

      return;
    }

    const res = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!res.ok) return alert("Error adding appointment");

    const newAppt = await res.json();
    setForm({ name: "", contact: "", datetime: "" });

    await fetchAppointments();

    setFlash({ id: newAppt.id, type: "add" });
    setTimeout(() => setFlash(null), 1000);
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

    const res = await fetch("/api/admin", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: editingAppt.id, ...form }),
    });

    if (!res.ok) return alert("Error updating");

    const updatedId = editingAppt.id;

    setEditingAppt(null);
    setForm({ name: "", contact: "", datetime: "" });

    await fetchAppointments();

    setFlash({ id: updatedId, type: "update" });
    setTimeout(() => setFlash(null), 1000);
  }

  async function handleDeleteConfirm() {
    if (!deleteAppt) return;

    const id = deleteAppt.id;

    setShowDelete(false);
    setDeleteAppt(null);
    setDeletedRows((prev) => [...prev, id]);

    await fetch("/api/admin", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    setFlash({ id, type: "delete" });

    setTimeout(() => {
      setFlash(null);
      setAppointments((prev) => prev.filter((a) => a.id !== id));
    }, 1000);
  }

  const filtered = appointments.filter(
    (a) =>
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.contact.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const start = (currentPage - 1) * itemsPerPage;
  const current = filtered.slice(start, start + itemsPerPage);

  const inputClass = "input-field";

  return (
    <div className="min-h-screen flex justify-center items-start py-12 px-4 bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-black dark:to-zinc-900">
      <div className="w-full max-w-5xl bg-white/90 dark:bg-zinc-900/80 backdrop-blur-md rounded-2xl shadow-2xl border border-zinc-300 dark:border-zinc-800 p-8 animate-fade">

        {/* TOASTS */}
        {flashList.map((t, i) => (
          <div
            key={t.id}
            className="fixed right-5 bg-red-600 text-white shadow-lg px-4 py-2 rounded-lg animate-slide-in"
            style={{ top: `${20 + i * 60}px` }}
          >
            {t.message}
          </div>
        ))}

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            Admin Panel
          </h1>

          <Link href="/" className="btn-secondary px-4 py-2 text-sm">
            Back to Home
          </Link>
        </div>

        {/* SEARCH */}
        <input
          type="text"
          placeholder="Search appointments..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
          className={`${inputClass} mb-6`}
        />

        {/* ADD FORM */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAdd();
          }}
          className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-6"
        >
          <input
            type="text"
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className={inputClass}
          />
          <input
            type="text"
            placeholder="Contact"
            value={form.contact}
            onChange={(e) => setForm({ ...form, contact: e.target.value })}
            className={inputClass}
          />
          <input
            type="datetime-local"
            value={form.datetime}
            onChange={(e) => setForm({ ...form, datetime: e.target.value })}
            className={inputClass}
          />
          <button className="btn-primary">Add</button>
        </form>

        {/* TABLE */}
        <div className="overflow-x-auto rounded-xl border border-zinc-300 dark:border-zinc-700 shadow-lg">
          {loading ? (
            <p className="p-4 text-center text-zinc-600 dark:text-zinc-400">
              Loading appointments...
            </p>
          ) : current.length === 0 ? (
            <p className="p-6 text-center text-zinc-600 dark:text-zinc-400">
              No appointments found.
            </p>
          ) : (
            <table className="min-w-full text-sm text-zinc-700 dark:text-zinc-300 text-center">
              <thead className="bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 uppercase text-xs font-semibold text-center">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Appointment</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>

              <tbody className="text-center">
                {current.map((appt, i) => (
                  <tr
                    key={appt.id}
                    className={`
              border-t border-zinc-200 dark:border-zinc-700
              ${i % 2 ? "bg-white/40 dark:bg-zinc-900/40" : "bg-white/20 dark:bg-zinc-800/30"}
              ${flash?.id === appt.id && flash.type === "add" ? "animate-flash-green" : ""}
              ${flash?.id === appt.id && flash.type === "update" ? "animate-flash-blue" : ""}
              ${flash?.id === appt.id && flash.type === "delete" ? "animate-flash-red" : ""}
            `}
                  >
                    <td className="px-4 py-3 font-medium text-center">{appt.name}</td>
                    <td className="px-4 py-3 text-center">{appt.contact}</td>
                    <td className="px-4 py-3 text-center">
                      {new Date(appt.datetime).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {appt.createdAt
                        ? new Date(appt.createdAt).toLocaleString()
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleEdit(appt)}
                          className="btn-primary px-3 py-1 text-xs"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            setDeleteAppt(appt);
                            setShowDelete(true);
                          }}
                          className="btn-gray bg-red-600 hover:bg-red-700 px-3 py-1 text-xs"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* PAGINATION */}
        <div className="mt-4 flex justify-center gap-2 text-sm">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="btn-gray px-3 py-1 disabled:opacity-50"
          >
            Prev
          </button>

          <span className="text-zinc-600 dark:text-zinc-400">
            Page {currentPage} of {totalPages}
          </span>

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="btn-gray px-3 py-1 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {/* EDIT MODAL */}
      {editingAppt && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade">
          <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 shadow-xl border border-zinc-300 dark:border-zinc-700 w-80 animate-scale">
            <h2 className="text-xl font-semibold mb-4 text-center">
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
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
                className={inputClass}
              />
              <input
                type="text"
                value={form.contact}
                onChange={(e) =>
                  setForm({ ...form, contact: e.target.value })
                }
                className={inputClass}
              />
              <input
                type="datetime-local"
                value={form.datetime}
                onChange={(e) =>
                  setForm({ ...form, datetime: e.target.value })
                }
                className={inputClass}
              />

              <div className="flex gap-2 mt-4">
                <button className="btn-primary w-full">Save</button>
                <button
                  type="button"
                  onClick={() => setEditingAppt(null)}
                  className="btn-gray w-full"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {showDelete && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade">
          <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 shadow-xl border border-zinc-300 dark:border-zinc-700 w-80 animate-scale">
            <h2 className="text-xl font-semibold mb-4 text-center text-red-600">
              Confirm Delete
            </h2>
            <p className="text-center text-zinc-700 dark:text-zinc-300 mb-6">
              Delete{" "}
              <span className="font-semibold">{deleteAppt?.name}</span>?
            </p>

            <div className="flex gap-2">
              <button
                onClick={handleDeleteConfirm}
                className="btn-primary bg-red-600 hover:bg-red-700 w-full"
              >
                Delete
              </button>
              <button
                onClick={() => setShowDelete(false)}
                className="btn-gray w-full"
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
