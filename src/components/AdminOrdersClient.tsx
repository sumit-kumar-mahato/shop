"use client";

import React, { useState } from "react";
import { ListOrdered, Eye, Edit3, X, Printer, Search, CheckCircle, Download } from "lucide-react";

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  city: string;
  postalCode: string;
  total: number;
  gst: number;
  discount: number;
  finalTotal: number;
  status: string;
  trackingNumber: string | null;
  paymentMethod: string;
  paymentStatus: string;
  items: string; // JSON string
  createdAt: string;
}

interface AdminOrdersClientProps {
  initialOrders: Order[];
}

function safeParse(jsonString: string, fallback: any = []) {
  try {
    return JSON.parse(jsonString);
  } catch (e) {
    return fallback;
  }
}

export default function AdminOrdersClient({ initialOrders }: AdminOrdersClientProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const handleExportCSV = () => {
    const headers = ["Order Number", "Customer Name", "Customer Email", "Phone", "City", "Payment Method", "Charged Total", "Status", "Date"];
    const rows = orders.map((o) => [
      o.orderNumber,
      `"${o.customerName.replace(/"/g, '""')}"`,
      o.customerEmail,
      o.customerPhone,
      `"${o.city.replace(/"/g, '""')}"`,
      o.paymentMethod,
      o.finalTotal,
      o.status,
      new Date(o.createdAt).toISOString().slice(0,10)
    ]);

    const csvContent = "data:text/csv;charset=utf-8,"
      + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `boutique_orders_register_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/update?id=${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        const updated = await res.json();
        setOrders((prev) => prev.map((o) => (o.id === id ? updated : o)));
        if (selectedOrder?.id === id) {
          setSelectedOrder(updated);
        }
      } else {
        alert("Failed to update status.");
      }
    } catch (e) {
      alert("Error updating order status.");
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus ? o.status === filterStatus : true;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <div>
          <h1 className="serif-header text-2xl font-bold uppercase tracking-wide text-zinc-900 dark:text-white">Orders Manager</h1>
          <p className="text-xs text-zinc-555 dark:text-zinc-400 font-light mt-0.5">Track logistics, modify status, and view client invoices.</p>
        </div>
        <button
          type="button"
          onClick={handleExportCSV}
          className="border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 font-bold text-xs tracking-wider py-3 px-4 rounded flex items-center gap-1.5 uppercase transition-all active:scale-95 flex-shrink-0"
        >
          <Download size={14} /> Export Register
        </button>
      </div>

      {/* Filters row */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-grow">
          <Search size={15} className="absolute left-3 top-3 text-zinc-500" />
          <input
            type="text"
            placeholder="Search by Client Name or Order Ref..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs py-3 pl-10 pr-4 rounded focus:outline-none focus:border-luxury-gold text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs py-3 px-4 rounded focus:outline-none focus:border-luxury-gold text-zinc-800 dark:text-zinc-300 sm:w-48"
        >
          <option value="">All Orders</option>
          <option value="Processing">Processing</option>
          <option value="Shipped">Shipped</option>
          <option value="Delivered">Delivered</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      {/* Status pills */}
      <div className="flex flex-wrap gap-1.5 text-[9px] font-bold uppercase tracking-wider border-b border-zinc-100 dark:border-zinc-800/40 pb-3">
        {[
          { label: "All Orders", value: "" },
          { label: "Processing", value: "Processing" },
          { label: "Shipped", value: "Shipped" },
          { label: "Delivered", value: "Delivered" },
          { label: "Cancelled", value: "Cancelled" },
        ].map((pill) => (
          <button
            key={pill.value}
            type="button"
            onClick={() => setFilterStatus(pill.value)}
            className={`px-3 py-1.5 rounded transition-all ${
              filterStatus === pill.value
                ? "bg-luxury-gold text-zinc-955"
                : "bg-zinc-100 dark:bg-zinc-800/40 text-zinc-550 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800"
            }`}
          >
            {pill.label}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-light text-left border-collapse text-zinc-500 dark:text-zinc-400">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 uppercase font-semibold text-[10px] tracking-wider">
                <th className="py-3.5 px-4">Invoice</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Payment</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Value</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/80">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-zinc-450 dark:text-zinc-500 italic">No customer orders recorded.</td>
                </tr>
              ) : (
                filteredOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/20 transition-colors">
                    <td className="py-3 px-4 font-semibold text-luxury-gold font-mono uppercase">{o.orderNumber}</td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-zinc-800 dark:text-zinc-200">{o.customerName}</p>
                      <p className="text-[10px] text-zinc-500 dark:text-zinc-550">{o.customerEmail}</p>
                    </td>
                    <td className="py-3 px-4 uppercase text-[10px]">{o.paymentMethod}</td>
                    <td className="py-3 px-4">
                      {new Date(o.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={o.status}
                        onChange={(e) => handleUpdateStatus(o.id, e.target.value)}
                        className={`text-[10px] font-bold uppercase bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded px-2 py-1 focus:outline-none focus:border-luxury-gold ${
                          o.status === "Delivered"
                            ? "text-green-600 dark:text-green-500"
                            : o.status === "Shipped"
                            ? "text-blue-600 dark:text-blue-500"
                            : o.status === "Cancelled"
                            ? "text-red-600 dark:text-red-500"
                            : "text-amber-600 dark:text-amber-500"
                        }`}
                      >
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-zinc-800 dark:text-zinc-200 font-mono">₹{o.finalTotal}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedOrder(o)}
                        className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-luxury-gold transition-colors rounded text-zinc-500 dark:text-zinc-400"
                        title="View Invoice details"
                      >
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice details Overlay */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedOrder(null)} />
          <div className="relative w-full max-w-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded shadow-2xl z-10 space-y-6 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <h3 className="serif-header text-lg uppercase tracking-wider text-zinc-900 dark:text-white font-bold flex items-center gap-2">
                <ListOrdered size={18} className="text-luxury-gold" /> Invoice details: {selectedOrder.orderNumber}
              </h3>
              <button onClick={() => setSelectedOrder(null)} className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded text-zinc-500 dark:text-zinc-400">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 text-xs font-light text-zinc-655 dark:text-zinc-400">
              {/* Customer summary */}
              <div className="grid grid-cols-2 gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
                <div>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-500 font-bold uppercase">Customer Information</p>
                  <p className="font-semibold text-zinc-800 dark:text-zinc-200 mt-1">{selectedOrder.customerName}</p>
                  <p>{selectedOrder.customerEmail}</p>
                  <p>{selectedOrder.customerPhone}</p>
                </div>
                <div>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-500 font-bold uppercase">Shipping Address</p>
                  <p className="mt-1">{selectedOrder.address}</p>
                  <p>{selectedOrder.city} - <span className="font-mono">{selectedOrder.postalCode}</span></p>
                </div>
              </div>

              {/* Items Summary list */}
              <div>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-550 font-bold uppercase mb-2">Purchased Items</p>
                <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/60 p-3 rounded space-y-2">
                  {safeParse(selectedOrder.items).map((item: any, i: number) => (
                    <div key={i} className="flex justify-between items-center">
                      <span className="font-semibold text-zinc-800 dark:text-zinc-200 uppercase">{item.title}</span>
                      <span className="text-zinc-600 dark:text-zinc-400">
                        Size: {item.size} / Color: <span style={{ color: item.color }} className="font-semibold">{item.color}</span> &times; {item.quantity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pricing breakdown */}
              <div className="border-t border-zinc-200 dark:border-zinc-800 pt-4 space-y-2 font-mono text-zinc-700 dark:text-zinc-300">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-zinc-900 dark:text-white">₹{selectedOrder.total}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST (12%)</span>
                  <span className="text-zinc-900 dark:text-white">₹{selectedOrder.gst}</span>
                </div>
                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between text-green-600 dark:text-green-500">
                    <span>Discount Code Applied</span>
                    <span>-₹{selectedOrder.discount}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold text-zinc-900 dark:text-white border-t border-zinc-200 dark:border-zinc-800 pt-2 font-sans">
                  <span>Final Charged Total</span>
                  <span className="text-luxury-gold">₹{selectedOrder.finalTotal}</span>
                </div>
              </div>
            </div>

            {/* Print and Close buttons */}
            <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 flex gap-3">
              <button
                onClick={() => window.print()}
                className="w-1/2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-white font-bold text-xs tracking-widest py-3 uppercase rounded-sm flex items-center justify-center gap-1.5 transition-colors border border-zinc-200 dark:border-zinc-700"
              >
                <Printer size={15} /> PRINT INVOICE
              </button>
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-1/2 bg-luxury-gold hover:bg-luxury-gold/90 text-zinc-950 font-bold py-3 uppercase rounded-sm transition-all"
              >
                CLOSE VIEW
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
