"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Plus, Edit3, Trash2, X, AlertCircle, Sparkles, Filter, Search, Star, Download } from "lucide-react";

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  compareAtPrice: number | null;
  sku: string;
  stock: number;
  gender: string;
  categoryName: string;
  images: string; // JSON string
  colors: string; // JSON string
  sizes: string; // JSON string
  fabric: string;
  fit: string;
  rating: number;
}

interface Category {
  id: string;
  name: string;
}

interface AdminProductsClientProps {
  initialProducts: Product[];
  categories: Category[];
}

// Safe parse JSON
function safeParse(jsonString: string, fallback: any = []) {
  try {
    return JSON.parse(jsonString);
  } catch (e) {
    return fallback;
  }
}

export default function AdminProductsClient({ initialProducts, categories }: AdminProductsClientProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [modalOpen, setModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStock, setFilterStock] = useState<"all" | "instock" | "lowstock" | "outofstock">("all");

  const handleExportCSV = () => {
    const headers = ["Title", "SKU", "Category", "Gender", "Price", "Original Price", "Stock", "Fabric", "Fit"];
    const rows = products.map((p) => [
      `"${p.title.replace(/"/g, '""')}"`,
      p.sku,
      p.categoryName,
      p.gender,
      p.price,
      p.compareAtPrice || "",
      p.stock,
      `"${p.fabric.replace(/"/g, '""')}"`,
      `"${p.fit.replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8,"
      + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `boutique_product_catalog_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Form Fields
  const [title, setTitle] = useState("");
  const [sku, setSku] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [compareAtPrice, setCompareAtPrice] = useState("");
  const [stock, setStock] = useState("10");
  const [gender, setGender] = useState("Men");
  const [categoryName, setCategoryName] = useState(categories[0]?.name || "Shirts");
  const [imageInput, setImageInput] = useState("");
  const [colorsInput, setColorsInput] = useState("#000000, #FFFFFF");
  const [sizesInput, setSizesInput] = useState("S, M, L, XL");
  const [fabric, setFabric] = useState("100% Cotton");
  const [fit, setFit] = useState("Regular Fit");

  const [saving, setSaving] = useState(false);

  // Unsplash Quick Templates to help the user visually add items without searching for photo links
  const clothingTemplates = [
    {
      title: "French Linen Casual Shirt",
      desc: "Super-breathable 100% flax linen casual summer wear.",
      skuPrefix: "MS-LIN",
      price: "2499",
      img: "https://images.unsplash.com/photo-1621072156002-e2fcc103e86e?w=800&auto=format&fit=crop&q=80",
      fabric: "100% Linen",
      category: "Shirts",
    },
    {
      title: "Embroidered Silk Lehenga",
      desc: "Elegant royal wedding lehenga adorned with mirror embroidery details.",
      skuPrefix: "WS-LEH",
      price: "9999",
      img: "https://images.unsplash.com/photo-1608748010899-18f300247112?w=800&auto=format&fit=crop&q=80",
      fabric: "Silk Georgette",
      category: "Ethnic Wear",
    },
    {
      title: "Comfort Stretch Denim Chinos",
      desc: "Brushed Italian cotton chino denim, slim fit construct.",
      skuPrefix: "UN-DEN",
      price: "3499",
      img: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&auto=format&fit=crop&q=80",
      fabric: "98% Cotton Denim, 2% Spandex",
      category: "Jeans",
    },
    {
      title: "Designer Leather Accessories bag",
      desc: "Minimalist full grain leather travel handbag with metal zippers.",
      skuPrefix: "AC-BAG",
      price: "5999",
      img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80",
      fabric: "Full Grain Leather",
      category: "Accessories",
    },
  ];

  const handleApplyTemplate = (template: typeof clothingTemplates[0]) => {
    setTitle(template.title);
    setDescription(template.desc);
    setSku(`${template.skuPrefix}-${Math.floor(100 + Math.random() * 900)}`);
    setPrice(template.price);
    setImageInput(template.img);
    setFabric(template.fabric);
    setCategoryName(template.category);
  };

  const openAddModal = () => {
    setEditProduct(null);
    setTitle("");
    setSku(`AVG-SKU-${Math.floor(1000 + Math.random() * 9000)}`);
    setDescription("");
    setPrice("");
    setCompareAtPrice("");
    setStock("15");
    setGender("Men");
    setCategoryName(categories[0]?.name || "Shirts");
    setImageInput("");
    setColorsInput("#000000, #FFFFFF, #E5E7EB");
    setSizesInput("S, M, L, XL");
    setFabric("100% Cotton");
    setFit("Regular Fit");
    setModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditProduct(p);
    setTitle(p.title);
    setSku(p.sku);
    setDescription(p.description);
    setPrice(String(p.price));
    setCompareAtPrice(p.compareAtPrice ? String(p.compareAtPrice) : "");
    setStock(String(p.stock));
    setGender(p.gender);
    setCategoryName(p.categoryName);
    setImageInput(safeParse(p.images)[0] || "");
    setColorsInput(safeParse(p.colors).join(", "));
    setSizesInput(safeParse(p.sizes).join(", "));
    setFabric(p.fabric);
    setFit(p.fit);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to visually delete this product? This will remove it from the catalog.")) return;

    try {
      const res = await fetch(`/api/products/delete?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (e) {
      alert("Error deleting product.");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !sku || !price || !imageInput) {
      alert("Please enter title, SKU, price, and at least one image URL.");
      return;
    }

    setSaving(true);

    const parsedColors = colorsInput.split(",").map((c) => c.trim()).filter(Boolean);
    const parsedSizes = sizesInput.split(",").map((s) => s.trim()).filter(Boolean);

    const productPayload = {
      title,
      sku,
      description,
      price: parseFloat(price),
      compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : null,
      stock: parseInt(stock),
      gender,
      categoryName,
      images: JSON.stringify([imageInput]),
      colors: JSON.stringify(parsedColors.length ? parsedColors : ["#000000"]),
      sizes: JSON.stringify(parsedSizes.length ? parsedSizes : ["M"]),
      fabric,
      fit,
    };

    try {
      let res;
      if (editProduct) {
        // Edit Action
        res = await fetch(`/api/products/update?id=${editProduct.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(productPayload),
        });
      } else {
        // Create Action
        res = await fetch("/api/products/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(productPayload),
        });
      }

      if (res.ok) {
        const savedProd = await res.json();
        if (editProduct) {
          setProducts((prev) => prev.map((p) => (p.id === editProduct.id ? savedProd : p)));
        } else {
          setProducts((prev) => [savedProd, ...prev]);
        }
        setModalOpen(false);
      } else {
        const err = await res.json();
        alert(err.error || "Save operation failed.");
      }
    } catch (e) {
      console.error(e);
      alert("Error occurred communicating with API.");
    } finally {
      setSaving(false);
    }
  };

  // Filter products list
  const filtered = products.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = filterCategory ? p.categoryName === filterCategory : true;
    
    let matchesStock = true;
    if (filterStock === "instock") {
      matchesStock = p.stock > 5;
    } else if (filterStock === "lowstock") {
      matchesStock = p.stock > 0 && p.stock <= 5;
    } else if (filterStock === "outofstock") {
      matchesStock = p.stock === 0;
    }

    return matchesSearch && matchesCat && matchesStock;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <div>
          <h1 className="serif-header text-2xl font-bold uppercase tracking-wide text-zinc-900 dark:text-white">Products Catalog</h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-light mt-0.5">Visually list, edit, or create retail items.</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleExportCSV}
            className="border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 font-bold text-xs tracking-wider py-3 px-4 rounded flex items-center gap-1.5 uppercase transition-all active:scale-95 flex-shrink-0"
          >
            <Download size={14} /> Export CSV
          </button>
          <button
            onClick={openAddModal}
            className="bg-luxury-gold hover:bg-luxury-gold/90 text-zinc-950 font-bold text-xs tracking-wider py-3 px-5 rounded flex items-center gap-1.5 uppercase transition-all active:scale-95 flex-shrink-0"
          >
            <Plus size={16} /> Add New Apparel
          </button>
        </div>
      </div>

      {/* Search and filter controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-grow">
          <Search size={15} className="absolute left-3 top-3 text-zinc-500" />
          <input
            type="text"
            placeholder="Search by Title or SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs py-3 pl-10 pr-4 rounded focus:outline-none focus:border-luxury-gold text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs py-3 px-4 rounded focus:outline-none focus:border-luxury-gold text-zinc-800 dark:text-zinc-300 sm:w-48"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Stock status pills */}
      <div className="flex flex-wrap gap-1.5 text-[9px] font-bold uppercase tracking-wider border-b border-zinc-100 dark:border-zinc-800/40 pb-3">
        {[
          { label: "All Items", value: "all" },
          { label: "In Stock (>5)", value: "instock" },
          { label: "Low Stock (1-5)", value: "lowstock" },
          { label: "Out of Stock (0)", value: "outofstock" },
        ].map((pill) => (
          <button
            key={pill.value}
            type="button"
            onClick={() => setFilterStock(pill.value as any)}
            className={`px-3 py-1.5 rounded transition-all ${
              filterStock === pill.value
                ? "bg-luxury-gold text-zinc-955"
                : "bg-zinc-100 dark:bg-zinc-800/40 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800"
            }`}
          >
            {pill.label}
          </button>
        ))}
      </div>

      {/* Catalog Table */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-light text-left border-collapse text-zinc-500 dark:text-zinc-400">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 uppercase font-semibold text-[10px] tracking-wider">
                <th className="py-3.5 px-4">Item</th>
                <th className="py-3.5 px-4">SKU</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Gender</th>
                <th className="py-3.5 px-4">Stock</th>
                <th className="py-3.5 px-4">Price</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/80">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-zinc-500 dark:text-zinc-500 italic">No products match search criteria.</td>
                </tr>
              ) : (
                filtered.map((p) => {
                  const imgs = safeParse(p.images);
                  return (
                    <tr key={p.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/20 transition-colors">
                      <td className="py-3 px-4 flex items-center gap-3">
                        <div className="relative w-9 h-12 flex-shrink-0 bg-zinc-100 dark:bg-zinc-800">
                          <img src={imgs[0]} alt={p.title} className="object-cover w-full h-full" />
                        </div>
                        <span className="font-semibold text-zinc-800 dark:text-zinc-200 uppercase truncate w-48 block">{p.title}</span>
                      </td>
                      <td className="py-3 px-4 font-mono text-zinc-500 dark:text-zinc-400 uppercase">{p.sku}</td>
                      <td className="py-3 px-4 font-medium text-zinc-800 dark:text-zinc-300">{p.categoryName}</td>
                      <td className="py-3 px-4 text-[10px] bg-zinc-100 dark:bg-zinc-800/40 text-zinc-700 dark:text-zinc-300 font-bold rounded px-2 py-0.5 inline-block mt-3">{p.gender}</td>
                      <td className="py-3 px-4">
                        <span className={`font-bold ${p.stock <= 5 ? "text-red-500 font-bold" : "text-zinc-700 dark:text-zinc-300"}`}>{p.stock} units</span>
                      </td>
                      <td className="py-3 px-4 font-bold text-zinc-900 dark:text-zinc-200 font-mono font-bold">₹{p.price}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEditModal(p)}
                            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-luxury-gold transition-colors rounded text-zinc-500 dark:text-zinc-400"
                            title="Edit Product"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-red-500 transition-colors rounded text-zinc-500 dark:text-zinc-400"
                            title="Delete Product"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Editor Modal Overlay */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="relative w-full max-w-5xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded shadow-2xl z-10 space-y-6 max-h-[95vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <h3 className="serif-header text-lg uppercase tracking-wider text-zinc-900 dark:text-white font-bold">
                {editProduct ? "Modify Product Details" : "Create New Catalog Entry"}
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded text-zinc-500 dark:text-zinc-400">
                <X size={18} />
              </button>
            </div>

            {/* Quick Templates Selector (Only for creation) */}
            {!editProduct && (
              <div className="bg-zinc-50 dark:bg-zinc-950 p-4 border border-zinc-200 dark:border-zinc-800 rounded-sm">
                <span className="text-[10px] font-bold text-luxury-gold uppercase tracking-widest flex items-center gap-1 mb-2">
                  <Sparkles size={11} /> Quick Visual Templates
                </span>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mb-3">Click to instantly populate dummy assets and mock images:</p>
                <div className="flex flex-wrap gap-2">
                  {clothingTemplates.map((t) => (
                    <button
                      key={t.title}
                      type="button"
                      onClick={() => handleApplyTemplate(t)}
                      className="text-[10px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-luxury-gold hover:text-zinc-900 dark:hover:text-white px-3 py-1.5 rounded transition-all text-zinc-700 dark:text-zinc-300"
                    >
                      {t.title}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: Form inputs */}
              <form onSubmit={handleSave} className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Title */}
                <div className="flex flex-col space-y-1.5">
                  <label className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase">Product Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-2.5 rounded focus:outline-none focus:border-luxury-gold text-zinc-900 dark:text-white uppercase font-bold"
                    required
                  />
                </div>

                {/* SKU */}
                <div className="flex flex-col space-y-1.5">
                  <label className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase">Garment SKU (Unique)</label>
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-2.5 rounded focus:outline-none focus:border-luxury-gold text-zinc-900 dark:text-white font-mono uppercase font-bold"
                    required
                  />
                </div>

                {/* Description */}
                <div className="flex flex-col space-y-1.5 sm:col-span-2">
                  <label className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase">Product Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                    className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-2.5 rounded focus:outline-none focus:border-luxury-gold text-zinc-900 dark:text-white font-light"
                  />
                </div>

                {/* Price */}
                <div className="flex flex-col space-y-1.5">
                  <label className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase">Selling Price (₹)</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-2.5 rounded focus:outline-none focus:border-luxury-gold text-zinc-900 dark:text-white font-bold"
                    required
                  />
                </div>

                {/* Compare Price */}
                <div className="flex flex-col space-y-1.5">
                  <label className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase">Original Price Before Discount (₹)</label>
                  <input
                    type="number"
                    value={compareAtPrice}
                    onChange={(e) => setCompareAtPrice(e.target.value)}
                    className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-2.5 rounded focus:outline-none focus:border-luxury-gold text-zinc-900 dark:text-white"
                  />
                </div>

                {/* Stock */}
                <div className="flex flex-col space-y-1.5">
                  <label className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase">Stock Inventory Quantity</label>
                  <input
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-2.5 rounded focus:outline-none focus:border-luxury-gold text-zinc-900 dark:text-white font-bold font-mono"
                    required
                  />
                </div>

                {/* Gender */}
                <div className="flex flex-col space-y-1.5">
                  <label className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase">Gender Classification</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-2.5 rounded focus:outline-none focus:border-luxury-gold text-zinc-800 dark:text-zinc-300"
                  >
                    <option value="Men">Men</option>
                    <option value="Women">Women</option>
                    <option value="Kids">Kids</option>
                    <option value="Unisex">Unisex</option>
                  </select>
                </div>

                {/* Category */}
                <div className="flex flex-col space-y-1.5">
                  <label className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase">Category Name</label>
                  <select
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-2.5 rounded focus:outline-none focus:border-luxury-gold text-zinc-800 dark:text-zinc-300"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Image URL */}
                <div className="flex flex-col space-y-1.5">
                  <label className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase">Image Photo Link (URL)</label>
                  <input
                    type="text"
                    value={imageInput}
                    onChange={(e) => setImageInput(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-2.5 rounded focus:outline-none focus:border-luxury-gold text-zinc-900 dark:text-white"
                    required
                  />
                </div>

                {/* Sizes list */}
                <div className="flex flex-col space-y-1.5">
                  <label className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase">Available Sizes (Comma Separated)</label>
                  <input
                    type="text"
                    value={sizesInput}
                    onChange={(e) => setSizesInput(e.target.value)}
                    className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-2.5 rounded focus:outline-none focus:border-luxury-gold text-zinc-900 dark:text-white font-semibold font-mono"
                  />
                </div>

                {/* Colors list */}
                <div className="flex flex-col space-y-1.5">
                  <label className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase">Available Colors (Hex Codes, Comma Separated)</label>
                  <input
                    type="text"
                    value={colorsInput}
                    onChange={(e) => setColorsInput(e.target.value)}
                    className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-2.5 rounded focus:outline-none focus:border-luxury-gold text-zinc-900 dark:text-white font-semibold font-mono"
                  />
                </div>

                {/* Fabric spec */}
                <div className="flex flex-col space-y-1.5">
                  <label className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase">Fabric details</label>
                  <input
                    type="text"
                    value={fabric}
                    onChange={(e) => setFabric(e.target.value)}
                    className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-2.5 rounded focus:outline-none focus:border-luxury-gold text-zinc-900 dark:text-white"
                  />
                </div>

                {/* Fit spec */}
                <div className="flex flex-col space-y-1.5">
                  <label className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase">Garment Fit spec</label>
                  <input
                    type="text"
                    value={fit}
                    onChange={(e) => setFit(e.target.value)}
                    className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-2.5 rounded focus:outline-none focus:border-luxury-gold text-zinc-900 dark:text-white"
                  />
                </div>

                {/* Actions row */}
                <div className="sm:col-span-2 pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="w-1/2 border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/20 py-3 uppercase rounded-sm"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-1/2 bg-luxury-gold hover:bg-luxury-gold/90 text-zinc-955 font-bold py-3 uppercase rounded-sm transition-all"
                  >
                    {saving ? "SAVING ENTRY..." : "SAVE PRODUCT"}
                  </button>
                </div>
              </form>

              {/* Right Column: Live Storefront Card Preview */}
              <div className="lg:col-span-1 border-t lg:border-t-0 lg:border-l border-zinc-200 dark:border-zinc-800 pt-6 lg:pt-0 lg:pl-6 space-y-4">
                <h4 className="text-[10px] font-bold text-luxury-gold uppercase tracking-widest flex items-center gap-1">
                  <Sparkles size={11} className="animate-pulse" /> Live Card Preview
                </h4>

                <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 p-4 rounded-sm space-y-3 relative overflow-hidden text-left shadow-lg">
                  {/* Image Box */}
                  <div className="relative aspect-[3/4] w-full overflow-hidden bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center border border-zinc-200 dark:border-zinc-805">
                    {imageInput ? (
                      <img src={imageInput} alt="Preview" className="object-cover w-full h-full" />
                    ) : (
                      <span className="text-zinc-500 dark:text-zinc-600 text-[10px] uppercase font-mono tracking-widest">No Image Selected</span>
                    )}
                    {compareAtPrice && parseFloat(compareAtPrice) > parseFloat(price) && (
                      <span className="absolute top-2 left-2 bg-luxury-gold text-zinc-955 text-[9px] font-bold px-2 py-0.5 uppercase rounded-sm">
                        -{Math.round(((parseFloat(compareAtPrice) - parseFloat(price)) / parseFloat(compareAtPrice)) * 100)}% OFF
                      </span>
                    )}
                    {parseInt(stock) <= 5 && parseInt(stock) > 0 && (
                      <span className="absolute bottom-2 left-2 bg-red-600 text-white text-[8px] font-bold px-1.5 py-0.5 uppercase rounded-sm animate-pulse">
                        Low Stock ({stock})
                      </span>
                    )}
                    {parseInt(stock) === 0 && (
                      <span className="absolute inset-0 bg-black/70 flex items-center justify-center text-white text-xs font-bold tracking-widest uppercase">
                        Sold Out
                      </span>
                    )}
                  </div>

                  {/* Info Details */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[9px] text-zinc-500 font-bold uppercase">
                      <span>{categoryName}</span>
                      <div className="flex items-center text-amber-500">
                        <Star size={9} fill="currentColor" className="mr-0.5" />
                        <span>4.8</span>
                      </div>
                    </div>
                    <h4 className="font-semibold text-xs text-zinc-900 dark:text-zinc-200 line-clamp-1 uppercase tracking-wide">
                      {title || "Apparel item name"}
                    </h4>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-500 line-clamp-2 min-h-[30px] font-light leading-relaxed">
                      {description || "No description provided yet."}
                    </p>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-zinc-900 dark:text-white font-mono">₹{price || "0"}</span>
                        {compareAtPrice && parseFloat(compareAtPrice) > 0 && (
                          <span className="text-[10px] text-zinc-400 dark:text-zinc-600 line-through font-mono">₹{compareAtPrice}</span>
                        )}
                      </div>
                      <span className="text-[9px] bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-650 dark:text-zinc-400 px-2 py-0.5 rounded font-mono font-bold uppercase">
                        {sizesInput ? sizesInput.split(",").length : 0} Sizes
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-zinc-50 dark:bg-zinc-950/40 p-3.5 border border-zinc-200 dark:border-zinc-800/80 rounded-sm text-[10px] text-zinc-500 dark:text-zinc-500 font-light space-y-2">
                  <p className="font-bold text-zinc-700 dark:text-zinc-400 uppercase tracking-widest">Specifications:</p>
                  <p><strong className="text-zinc-700 dark:text-zinc-400 font-semibold uppercase">Fabric:</strong> {fabric || "Not specified"}</p>
                  <p><strong className="text-zinc-700 dark:text-zinc-400 font-semibold uppercase">Fit:</strong> {fit || "Not specified"}</p>
                  <p><strong className="text-zinc-700 dark:text-zinc-400 font-semibold uppercase">Gender:</strong> {gender}</p>
                  <p><strong className="text-zinc-700 dark:text-zinc-400 font-semibold uppercase">SKU:</strong> <span className="font-mono">{sku || "None"}</span></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
