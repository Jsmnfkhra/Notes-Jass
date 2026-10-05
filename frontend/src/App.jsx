import React, { useState, useEffect } from "react";
import API from "./api";

export default function App() {
  const [token, setToken] = useState(
    localStorage.getItem("noteflow_token") || "",
  );
  const [username, setUsername] = useState(
    localStorage.getItem("noteflow_user") || "",
  );
  const [isRegister, setIsRegister] = useState(false);

  // Auth Form State
  const [authInput, setAuthInput] = useState({ username: "", password: "" });
  const [authError, setAuthError] = useState("");

  // Notes State
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tag, setTag] = useState("Ide");
  const [isPinned, setIsPinned] = useState(false);
  const [search, setSearch] = useState("");
  const [editId, setEditId] = useState(null);
  const [activeFilter, setActiveFilter] = useState("Semua");

  // Tag Options dengan warna aksen
  const TAG_OPTIONS = [
    {
      value: "Ide",
      label: "Ide",
      color: "amber",
      className: "bg-amber-50 border-amber-200 text-amber-900",
      borderColor: "border-amber-200",
    },
    {
      value: "Pekerjaan",
      label: "Pekerjaan",
      color: "blue",
      className: "bg-blue-50 border-blue-200 text-blue-900",
      borderColor: "border-blue-200",
    },
    {
      value: "Pribadi",
      label: "Pribadi",
      color: "emerald",
      className: "bg-emerald-50 border-emerald-200 text-emerald-900",
      borderColor: "border-emerald-200",
    },
    {
      value: "Pembelajaran",
      label: "Pembelajaran",
      color: "purple",
      className: "bg-purple-50 border-purple-200 text-purple-900",
      borderColor: "border-purple-200",
    },
  ];

  // Ambil Catatan dari Database saat login
  useEffect(() => {
    if (token) {
      fetchNotes();
    }
  }, [token]);

  const fetchNotes = async () => {
    try {
      const res = await API.get("/notes");
      setNotes(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Auth Handler
  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError("");
    try {
      if (isRegister) {
        await API.post("/auth/register", authInput);
        setIsRegister(false);
        alert("Registrasi berhasil! Silakan login.");
      } else {
        const res = await API.post("/auth/login", authInput);
        localStorage.setItem("noteflow_token", res.data.token);
        localStorage.setItem("noteflow_user", res.data.username);
        setToken(res.data.token);
        setUsername(res.data.username);
      }
      setAuthInput({ username: "", password: "" });
    } catch (err) {
      setAuthError(err.response?.data?.message || "Terjadi kesalahan");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("noteflow_token");
    localStorage.removeItem("noteflow_user");
    setToken("");
    setUsername("");
    setNotes([]);
  };

  // Note Handlers
  const handleSaveNote = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      if (editId) {
        const res = await API.put(`/notes/${editId}`, {
          title,
          content,
          tag,
          isPinned,
        });
        setNotes(notes.map((n) => (n.id === editId ? res.data : n)));
        setEditId(null);
      } else {
        const res = await API.post("/notes", { title, content, tag, isPinned });
        setNotes([res.data, ...notes]);
      }
      setTitle("");
      setContent("");
      setTag("Idea");
      setIsPinned(false);
    } catch (err) {
      alert("Gagal menyimpan catatan");
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/notes/${id}`);
      setNotes(notes.filter((n) => n.id !== id));
    } catch (err) {
      alert("Gagal menghapus catatan");
    }
  };

  const handleEdit = (note) => {
    setEditId(note.id);
    setTitle(note.title);
    setContent(note.content || "");
    setTag(note.tag);
    setIsPinned(note.isPinned);
  };

  const togglePin = async (note) => {
    try {
      const res = await API.put(`/notes/${note.id}`, {
        title: note.title,
        content: note.content,
        tag: note.tag,
        isPinned: !note.isPinned,
      });
      setNotes(notes.map((n) => (n.id === note.id ? res.data : n)));
    } catch (err) {
      alert("Gagal mengubah pin");
    }
  };

  // Filter Search + Category
  const filteredNotes = notes
    .filter((n) => {
      const matchesSearch =
        n.title.toLowerCase().includes(search.toLowerCase()) ||
        (n.content && n.content.toLowerCase().includes(search.toLowerCase()));

      const matchesFilter = activeFilter === "Semua" || n.tag === activeFilter;

      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      // Pinned notes first
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return 0;
    });

  // Helper: Get tag color style
  const getTagStyle = (tagValue) => {
    const tagObj = TAG_OPTIONS.find((t) => t.value === tagValue);
    return tagObj ? tagObj.className : "";
  };

  // Helper: Get card border color based on tag
  const getCardBorderColor = (tagValue) => {
    const tagObj = TAG_OPTIONS.find((t) => t.value === tagValue);
    return tagObj ? tagObj.borderColor : "border-slate-200";
  };

  // Layar Login / Register
  if (!token) {
    return (
      <div className="min-h-screen bg-white text-slate-900 flex items-center justify-center p-4 font-sans">
        <div className="w-full max-w-md bg-slate-100 border-slate-300 backdrop-blur border rounded-2xl p-8 shadow-xl">
          <h2 className="text-3xl font-bold text-center text-blue-600 mb-2">
            Noteflow
          </h2>
          <p className="text-center text-slate-600 text-sm mb-6">
            {isRegister
              ? "Buat akun baru untuk mulai mencatat"
              : "Masuk untuk mengelola catatanmu"}
          </p>

          {authError && (
            <div className="bg-red-100 border-red-300 text-red-700 border text-sm p-3 rounded-lg mb-4 text-center">
              {authError}
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                Username
              </label>
              <input
                type="text"
                required
                value={authInput.username}
                onChange={(e) =>
                  setAuthInput({ ...authInput, username: e.target.value })
                }
                className="w-full bg-white border-slate-300 text-slate-900 focus:border-blue-600 border rounded-lg px-4 py-2.5 focus:outline-none"
                placeholder="nama user"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={authInput.password}
                onChange={(e) =>
                  setAuthInput({ ...authInput, password: e.target.value })
                }
                className="w-full bg-white border-slate-300 text-slate-900 focus:border-blue-600 border rounded-lg px-4 py-2.5 focus:outline-none"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-500 transition py-2.5 rounded-lg font-semibold text-white mt-2"
            >
              {isRegister ? "Daftar Sekarang" : "Masuk"}
            </button>
          </form>

          <p className="text-center text-sm text-slate-600 mt-6">
            {isRegister ? "Sudah punya akun?" : "Belum punya akun?"}{" "}
            <button
              onClick={() => {
                setIsRegister(!isRegister);
                setAuthError("");
              }}
              className="text-blue-600 hover:text-blue-700 hover:underline font-medium ml-1"
            >
              {isRegister ? "Login di sini" : "Daftar di sini"}
            </button>
          </p>
        </div>
      </div>
    );
  }

  // Layar Dashboard Catatan
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      {/* Navbar */}
      <header className="border-b border-slate-200 bg-white/60 backdrop-blur sticky top-0 z-10 px-6 py-4 flex items-center justify-between">
        {/* Logo & Brand */}
        <h1 className="text-2xl font-bold text-blue-700">Noteflow</h1>

        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-600">
            Hai, <strong className="text-slate-900">@{username}</strong>
          </span>

          <button
            onClick={handleLogout}
            className="text-xs bg-slate-200 hover:bg-red-100 border-slate-300 hover:border-red-300 border px-3 py-1.5 rounded-md transition"
          >
            Keluar
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Form Tambah/Edit */}
        <div className="bg-slate-100 border-slate-300 border rounded-xl p-5 shadow-lg">
          <h2 className="text-lg font-semibold mb-4 text-slate-800">
            {editId ? "Edit Catatan" : "Tulis Catatan Baru"}
          </h2>
          <form onSubmit={handleSaveNote} className="space-y-3">
            <input
              type="text"
              placeholder="Judul catatan..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-white border-slate-300 text-slate-900 focus:border-blue-600 border rounded-lg px-4 py-2 focus:outline-none"
            />
            <textarea
              rows="3"
              placeholder="Isi catatan..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full bg-white border-slate-300 text-slate-900 focus:border-blue-600 border rounded-lg px-4 py-2 focus:outline-none resize-none"
            />
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-4">
                <select
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  className="bg-white border-slate-300 text-slate-900 focus:border-blue-600 border rounded-lg px-3 py-1.5 text-sm focus:outline-none"
                >
                  {TAG_OPTIONS.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>

                <label className="flex items-center gap-2 text-sm cursor-pointer text-slate-600">
                  <input
                    type="checkbox"
                    checked={isPinned}
                    onChange={(e) => setIsPinned(e.target.checked)}
                    className="w-4 h-4 rounded bg-white text-blue-600 focus:ring-0"
                  />
                  Sematkan (Pin)
                </label>
              </div>

              <div className="flex gap-2">
                {editId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditId(null);
                      setTitle("");
                      setContent("");
                      setTag("Ide");
                      setIsPinned(false);
                    }}
                    className="px-4 py-1.5 rounded-lg border border-slate-400 hover:bg-slate-200 text-sm transition"
                  >
                    Batal
                  </button>
                )}
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 px-5 py-1.5 rounded-lg font-medium text-sm text-white transition"
                >
                  {editId ? "Simpan Perubahan" : "Tambah Catatan"}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Pencarian */}
        <div className="flex items-center justify-between gap-4">
          <input
            type="text"
            placeholder="Cari catatan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-xs bg-white border-slate-300 text-slate-900 focus:border-blue-600 border rounded-lg px-4 py-2 text-sm focus:outline-none"
          />
          <span className="text-xs text-slate-600">
            {filteredNotes.length} Catatan
          </span>
        </div>

        {/* Filter Kategori */}
        <div className="flex flex-wrap gap-2 items-center justify-center">
          <span className="text-sm font-semibold text-slate-600">Filter:</span>
          {["Semua", ...TAG_OPTIONS.map((t) => t.value)].map((filterTag) => (
            <button
              key={filterTag}
              onClick={() => setActiveFilter(filterTag)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                activeFilter === filterTag
                  ? "bg-blue-600 text-white"
                  : "bg-slate-200 text-slate-700 hover:bg-slate-300"
              }`}
            >
              {filterTag}
            </button>
          ))}
        </div>

        {/* Grid Catatan */}
        {filteredNotes.length === 0 ? (
          <div className="text-center py-16 text-slate-600">
            Belum ada catatan yang tersimpan.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredNotes.map((note) => {
              const tagStyle = getTagStyle(note.tag);
              const cardBorder = getCardBorderColor(note.tag);

              return (
                <div
                  key={note.id}
                  className={`bg-slate-50 border rounded-xl p-5 flex flex-col justify-between transition shadow-md ${
                    note.isPinned ? "border-blue-400 bg-blue-50/50" : cardBorder
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-lg text-slate-900 break-words">
                        {note.title}
                      </h3>
                      <button
                        onClick={() => togglePin(note)}
                        title="Sematkan"
                        className={`text-lg transition flex-shrink-0 ${
                          note.isPinned
                            ? "opacity-100 scale-110"
                            : "opacity-30 hover:opacity-100"
                        }`}
                      >
                        📌
                      </button>
                    </div>
                    <p className="text-slate-700 text-sm whitespace-pre-wrap break-words mb-4">
                      {note.content}
                    </p>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-300/60 pt-3 mt-2 text-xs">
                    <span
                      className={`border rounded-full px-2.5 py-1 font-medium ${tagStyle}`}
                    >
                      {note.tag}
                    </span>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleEdit(note)}
                        className="text-slate-600 hover:text-blue-600 font-medium transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(note.id)}
                        className="text-slate-600 hover:text-red-600 font-medium transition"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
