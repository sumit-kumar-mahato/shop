"use client";

import React, { useState } from "react";
import { Plus, Trash2, FolderTree, X } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  gender: string;
  image: string;
}

interface AdminCategoriesClientProps {
  initialCategories: Category[];
}

export default function AdminCategoriesClient({ initialCategories }: AdminCategoriesClientProps) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [gender, setGender] = useState("Men");
  const [image, setImage] = useState("");
  const [saving, setSaving] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !image) {
      alert("Name and cover image link are required.");
      return;
    }

    setSaving(true);
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    try {
      const res = await fetch("/api/categories/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug, gender, image }),
      });

      if (res.ok) {
        const savedCat = await res.json();
        setCategories((prev) => [...prev, savedCat]);
        setModalOpen(false);
        setName("");
        setImage("");
      } else {
        alert("Failed to create category. Make sure it has a unique name.");
      }
    } catch (e) {
      alert("Error occurred.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this category? Products inside this category will remain, but will lose their category association.")) return;

    try {
      const res = await fetch(`/api/categories/delete?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setCategories((prev) => prev.filter((c) => c.id !== id));
      }
    } catch (e) {
      alert("Error deleting category.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <div>
          <h1 className="serif-header text-2xl font-bold uppercase tracking-wide text-zinc-900 dark:text-white">Categories Manager</h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-light mt-0.5">Edit and create store department categories.</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="bg-luxury-gold hover:bg-luxury-gold/90 text-zinc-950 font-bold text-xs tracking-wider py-3 px-5 rounded flex items-center gap-1.5 uppercase transition-all active:scale-95 flex-shrink-0"
        >
          <Plus size={16} /> Create Category
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="group relative h-48 overflow-hidden rounded-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex flex-col justify-end p-4 shadow-sm"
          >
            <div
              className="absolute inset-0 bg-cover bg-center opacity-40 group-hover:scale-103 transition-transform duration-300"
              style={{ backgroundImage: `url(${cat.image})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
            <div className="relative z-10 flex justify-between items-end text-white">
              <div className="space-y-1">
                <span className="text-[9px] text-luxury-gold font-bold tracking-widest uppercase">
                  {cat.gender}'s Collection
                </span>
                <h3 className="display-header font-bold text-base tracking-wide uppercase">{cat.name}</h3>
              </div>
              <button
                onClick={() => handleDelete(cat.id)}
                className="p-2 hover:bg-zinc-800/40 text-zinc-300 hover:text-red-500 rounded transition-colors"
                title="Delete Category"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Creation Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded shadow-2xl z-10 space-y-6">
            <div className="flex justify-between items-center border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <h3 className="serif-header text-lg uppercase tracking-wider text-zinc-900 dark:text-white font-bold flex items-center gap-2">
                <FolderTree size={18} className="text-luxury-gold" /> Add Category
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded text-zinc-500 dark:text-zinc-400">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div className="flex flex-col space-y-1.5">
                <label className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase">Category Name</label>
                <input
                  type="text"
                  placeholder="e.g. Ethnic Wear"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-2.5 rounded focus:outline-none focus:border-luxury-gold text-zinc-900 dark:text-white uppercase font-bold"
                  required
                />
              </div>

              <div className="flex flex-col space-y-1.5">
                <label className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase">Gender Tag</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-2.5 rounded focus:outline-none focus:border-luxury-gold text-zinc-800 dark:text-zinc-300"
                >
                  <option value="Men">Men</option>
                  <option value="Women">Women</option>
                  <option value="Kids">Kids</option>
                  <option value="Unisex">Unisex</option>
                  <option value="All">All Genders</option>
                </select>
              </div>

              <div className="flex flex-col space-y-1.5">
                <label className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase">Cover Image Link (URL)</label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/..."
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-2.5 rounded focus:outline-none focus:border-luxury-gold text-zinc-900 dark:text-white"
                  required
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="w-1/2 border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/20 py-2.5 uppercase rounded-sm"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="w-1/2 bg-luxury-gold hover:bg-luxury-gold/90 text-zinc-950 font-bold py-2.5 uppercase rounded-sm transition-all"
                >
                  {saving ? "SAVING..." : "CREATE"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
