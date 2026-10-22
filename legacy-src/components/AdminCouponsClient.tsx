"use client";

import React, { useState } from "react";
import { Plus, Trash2, Tag, X, Calendar } from "lucide-react";

interface Coupon {
  id: string;
  code: string;
  discountType: string;
  value: number;
  expiryDate: string;
  active: boolean;
  usageLimit: number;
  usageCount: number;
}

interface AdminCouponsClientProps {
  initialCoupons: Coupon[];
}

export default function AdminCouponsClient({ initialCoupons }: AdminCouponsClientProps) {
  const [coupons, setCoupons] = useState<Coupon[]>(initialCoupons);
  const [modalOpen, setModalOpen] = useState(false);
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState("PERCENTAGE");
  const [value, setValue] = useState("");
  const [expiry, setExpiry] = useState("2027-12-31");
  const [limit, setLimit] = useState("500");
  const [saving, setSaving] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !value) {
      alert("Code and discount value are required.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/coupons/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: code.toUpperCase().trim(),
          discountType,
          value: parseFloat(value),
          expiryDate: new Date(expiry),
          usageLimit: parseInt(limit),
        }),
      });

      if (res.ok) {
        const savedCoup = await res.json();
        setCoupons((prev) => [savedCoup, ...prev]);
        setModalOpen(false);
        setCode("");
        setValue("");
      } else {
        alert("Failed to create coupon code. Ensure code is unique.");
      }
    } catch (e) {
      alert("Error saving coupon.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to visually delete this discount code? It will no longer validate during checkout.")) return;

    try {
      const res = await fetch(`/api/coupons/delete?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setCoupons((prev) => prev.filter((c) => c.id !== id));
      }
    } catch (e) {
      alert("Error deleting coupon.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <div>
          <h1 className="serif-header text-2xl font-bold uppercase tracking-wide text-zinc-900 dark:text-white">Coupons & Discounts</h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-light mt-0.5">Visually manage coupon codes and discount values.</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="bg-luxury-gold hover:bg-luxury-gold/90 text-zinc-950 font-bold text-xs tracking-wider py-3 px-5 rounded flex items-center gap-1.5 uppercase transition-all active:scale-95 flex-shrink-0"
        >
          <Plus size={16} /> Add Promo Code
        </button>
      </div>

      {/* Coupons Table */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-light text-left border-collapse text-zinc-500 dark:text-zinc-400">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 uppercase font-semibold text-[10px] tracking-wider">
                <th className="py-3.5 px-4">Coupon Code</th>
                <th className="py-3.5 px-4">Discount Type</th>
                <th className="py-3.5 px-4">Discount Value</th>
                <th className="py-3.5 px-4">Expiry Date</th>
                <th className="py-3.5 px-4">Usage Counts</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/80">
              {coupons.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-zinc-500 dark:text-zinc-500 italic">No active coupons available.</td>
                </tr>
              ) : (
                coupons.map((c) => (
                  <tr key={c.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/20 transition-colors">
                    <td className="py-3 px-4 font-bold text-luxury-gold font-mono uppercase">{c.code}</td>
                    <td className="py-3 px-4 font-medium text-zinc-800 dark:text-zinc-300">{c.discountType}</td>
                    <td className="py-3 px-4 font-bold text-zinc-900 dark:text-zinc-200">
                      {c.discountType === "PERCENTAGE" ? `${c.value}% OFF` : `₹${c.value} OFF`}
                    </td>
                    <td className="py-3 px-4">
                      {new Date(c.expiryDate).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-3 px-4 font-mono">
                      {c.usageCount} / {c.usageLimit} uses
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-red-500 rounded transition-colors"
                        title="Delete Coupon"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Creation Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded shadow-2xl z-10 space-y-6">
            <div className="flex justify-between items-center border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <h3 className="serif-header text-lg uppercase tracking-wider text-zinc-900 dark:text-white font-bold flex items-center gap-2">
                <Tag size={18} className="text-luxury-gold" /> Create Discount Voucher
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded text-zinc-500 dark:text-zinc-400">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div className="flex flex-col space-y-1.5">
                <label className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase">Coupon Code Name</label>
                <input
                  type="text"
                  placeholder="e.g. FASHION20"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-2.5 rounded focus:outline-none focus:border-luxury-gold text-zinc-900 dark:text-white uppercase font-bold font-mono"
                  required
                />
              </div>

              <div className="flex flex-col space-y-1.5">
                <label className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase">Discount Type</label>
                <select
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value)}
                  className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-2.5 rounded focus:outline-none focus:border-luxury-gold text-zinc-800 dark:text-zinc-300"
                >
                  <option value="PERCENTAGE">PERCENTAGE (% off)</option>
                  <option value="FIXED">FIXED VALUE (₹ flat off)</option>
                </select>
              </div>

              <div className="flex flex-col space-y-1.5">
                <label className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase">Discount Value</label>
                <input
                  type="number"
                  placeholder="e.g. 20 or 500"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-2.5 rounded focus:outline-none focus:border-luxury-gold text-zinc-900 dark:text-white font-bold"
                  required
                />
              </div>

              <div className="flex flex-col space-y-1.5">
                <label className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase">Expiry Date</label>
                <input
                  type="date"
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                  className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-2.5 rounded focus:outline-none focus:border-luxury-gold text-zinc-900 dark:text-white font-semibold font-mono"
                  required
                />
              </div>

              <div className="flex flex-col space-y-1.5">
                <label className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase">Usage Limit</label>
                <input
                  type="number"
                  value={limit}
                  onChange={(e) => setLimit(e.target.value)}
                  className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-2.5 rounded focus:outline-none focus:border-luxury-gold text-zinc-900 dark:text-white font-mono"
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
