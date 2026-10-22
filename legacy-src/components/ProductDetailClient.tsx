"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useCart } from "./CartContext";
import { useWishlist } from "./WishlistContext";
import { Star, Heart, ShoppingBag, Truck, RefreshCw, Ruler, Calendar, ArrowRight } from "lucide-react";
import confetti from "canvas-confetti";

interface ProductDetailClientProps {
  product: {
    id: string;
    title: string;
    description: string;
    price: number;
    compareAtPrice: number | null;
    sku: string;
    stock: number;
    categoryName: string;
    images: string; // JSON string
    colors: string; // JSON string
    sizes: string; // JSON string
    fabric: string;
    fit: string;
    rating: number;
  };
  reviews: any[];
}

// Helper to safely parse JSON
function safeParse(jsonString: string, fallback: any = []) {
  try {
    return JSON.parse(jsonString);
  } catch (e) {
    return fallback;
  }
}

const ProductDetailClient: React.FC<ProductDetailClientProps> = ({ product, reviews }) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const productImages = safeParse(product.images);
  const colors = safeParse(product.colors);
  const sizes = safeParse(product.sizes);

  const [activeImage, setActiveImage] = useState(productImages[0] || "");
  const [selectedSize, setSelectedSize] = useState(sizes[0] || "");
  const [selectedColor, setSelectedColor] = useState(colors[0] || "");
  const [quantity, setQuantity] = useState(1);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [reviewName, setReviewName] = useState("");
  const [reviewEmail, setReviewEmail] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const handleAddToCart = () => {
    if (product.stock === 0) return;
    setAddingToCart(true);

    addToCart({
      productId: product.id,
      title: product.title,
      price: product.price,
      image: productImages[0] || "",
      size: selectedSize,
      color: selectedColor,
      quantity: quantity,
      stock: product.stock,
    });

    setTimeout(() => {
      setAddingToCart(false);
      // Trigger a confetti pop for visual delight
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.8 },
        colors: ["#c5a880", "#000000", "#ffffff"],
      });
    }, 500);
  };

  const handleBuyNow = () => {
    if (product.stock === 0) return;
    addToCart({
      productId: product.id,
      title: product.title,
      price: product.price,
      image: productImages[0] || "",
      size: selectedSize,
      color: selectedColor,
      quantity: quantity,
      stock: product.stock,
    });
    window.location.href = "/checkout";
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName || !reviewComment) return;

    try {
      const res = await fetch("/api/reviews/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: reviewName,
          customerEmail: reviewEmail,
          rating: reviewRating,
          comment: reviewComment,
          productId: product.id,
        }),
      });

      if (res.ok) {
        setReviewSubmitted(true);
        setReviewName("");
        setReviewEmail("");
        setReviewComment("");
        setTimeout(() => setReviewSubmitted(false), 5000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const isLiked = isInWishlist(product.id);

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Images Column */}
        <div className="space-y-4">
          {/* Active Image with Zoom effect */}
          <div className="relative aspect-[3/4] w-full overflow-hidden bg-luxury-100 dark:bg-zinc-950 border border-luxury-200/50 dark:border-zinc-800 rounded-sm group">
            <Image
              src={activeImage}
              alt={product.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              priority
            />
          </div>

          {/* Image Thumbnail Selector */}
          {productImages.length > 1 && (
            <div className="flex space-x-3 overflow-x-auto pb-2">
              {productImages.map((img: string) => (
                <button
                  key={img}
                  onClick={() => setActiveImage(img)}
                  className={`relative w-20 aspect-[3/4] flex-shrink-0 overflow-hidden border transition-all ${
                    activeImage === img
                      ? "border-luxury-gold ring-1 ring-luxury-gold"
                      : "border-luxury-200 hover:border-luxury-gold/50"
                  }`}
                >
                  <Image src={img} alt="Product Thumbnail" fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details Info Column */}
        <div className="space-y-8 lg:pl-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold tracking-widest text-luxury-gold uppercase">
                {product.categoryName}
              </span>
              <div className="flex items-center text-xs font-bold text-amber-500 gap-1 bg-amber-500/10 px-2 py-1 rounded">
                <Star size={12} fill="currentColor" />
                <span>{product.rating}</span>
                <span className="text-luxury-500 dark:text-zinc-500 font-light">({reviews.length} reviews)</span>
              </div>
            </div>
            <h1 className="serif-header text-3xl font-normal tracking-wide uppercase leading-snug">
              {product.title}
            </h1>
            <p className="text-xs text-luxury-400 font-mono">SKU: {product.sku}</p>
          </div>

          {/* Pricing */}
          <div className="flex items-end gap-3 pb-6 border-b border-luxury-200/40 dark:border-zinc-800/40">
            <span className="text-3xl font-bold text-luxury-900 dark:text-white">₹{product.price}</span>
            {product.compareAtPrice && (
              <>
                <span className="text-base text-luxury-400 dark:text-zinc-500 line-through">
                  ₹{product.compareAtPrice}
                </span>
                <span className="text-xs font-bold text-red-500 bg-red-50 dark:bg-red-950/20 px-2.5 py-1 rounded uppercase">
                  {Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)}% OFF
                </span>
              </>
            )}
          </div>

          {/* Variant: Colors */}
          {colors.length > 0 && (
            <div className="space-y-3">
              <span className="text-xs font-bold tracking-widest text-luxury-500 uppercase">
                Color: {selectedColor}
              </span>
              <div className="flex flex-wrap gap-3">
                {colors.map((color: string) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-8 h-8 rounded-full border transition-all flex items-center justify-center ${
                      selectedColor === color
                        ? "ring-2 ring-luxury-gold ring-offset-2 dark:ring-offset-zinc-950"
                        : "border-luxury-200 hover:border-luxury-gold"
                    }`}
                    style={{ backgroundColor: color }}
                    title={color}
                  >
                    {selectedColor === color && (
                      <span className={`w-1.5 h-1.5 rounded-full ${color === "#FFFFFF" ? "bg-black" : "bg-white"}`} />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Variant: Sizes */}
          {sizes.length > 0 && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold tracking-widest text-luxury-500 uppercase">
                  Size: {selectedSize}
                </span>
                <button
                  onClick={() => setSizeGuideOpen(true)}
                  className="text-xs font-bold text-luxury-gold flex items-center gap-1.5 hover:underline"
                >
                  <Ruler size={13} /> Size Guide
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {sizes.map((sz: string) => (
                  <button
                    key={sz}
                    onClick={() => setSelectedSize(sz)}
                    className={`h-11 px-5 border text-xs font-bold tracking-widest flex items-center justify-center transition-all ${
                      selectedSize === sz
                        ? "bg-luxury-900 border-luxury-900 text-white dark:bg-luxury-gold dark:border-luxury-gold dark:text-zinc-950"
                        : "border-luxury-200 text-luxury-600 dark:border-zinc-800 dark:text-zinc-400 hover:border-luxury-gold"
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Stock & Quantity Control */}
          <div className="flex items-center gap-6">
            <div className="flex flex-col space-y-1">
              <span className="text-xs font-bold tracking-widest text-luxury-500 uppercase">Quantity</span>
              <div className="flex items-center border border-luxury-200 dark:border-zinc-800 h-11">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-4 hover:text-luxury-gold transition-colors font-bold"
                  disabled={product.stock === 0}
                >
                  -
                </button>
                <span className="w-8 text-center text-xs font-bold font-mono">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  className="px-4 hover:text-luxury-gold transition-colors font-bold"
                  disabled={product.stock === 0}
                >
                  +
                </button>
              </div>
            </div>

            <div className="pt-5">
              {product.stock > 5 ? (
                <span className="text-xs text-green-600 font-bold bg-green-50 dark:bg-green-950/20 px-3 py-1.5 rounded uppercase">
                  In Stock ({product.stock} available)
                </span>
              ) : product.stock > 0 ? (
                <span className="text-xs text-red-500 font-bold bg-red-50 dark:bg-red-950/20 px-3 py-1.5 rounded uppercase animate-pulse">
                  Only {product.stock} Left in Stock
                </span>
              ) : (
                <span className="text-xs text-zinc-500 font-bold bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 rounded uppercase">
                  Sold Out
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-luxury-200/40 dark:border-zinc-800/40">
            <button
              onClick={handleAddToCart}
              className={`flex-grow h-14 bg-luxury-900 hover:bg-luxury-gold text-white hover:text-zinc-950 transition-colors font-bold text-xs tracking-widest uppercase flex items-center justify-center gap-2 rounded-sm active:scale-95 border border-luxury-900 ${
                product.stock === 0 ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={product.stock === 0 || addingToCart}
            >
              <ShoppingBag size={16} />
              {addingToCart ? "ADDING..." : "ADD TO SHOPPING BAG"}
            </button>

            <button
              onClick={handleBuyNow}
              className={`flex-grow h-14 bg-white hover:bg-luxury-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-950 dark:text-white transition-colors font-bold text-xs tracking-widest uppercase flex items-center justify-center gap-2 rounded-sm active:scale-95 border border-luxury-200 dark:border-zinc-700 ${
                product.stock === 0 ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={product.stock === 0}
            >
              BUY IT NOW
            </button>

            {/* Wishlist toggle */}
            <button
              onClick={() =>
                toggleWishlist({
                  productId: product.id,
                  title: product.title,
                  price: product.price,
                  image: productImages[0] || "",
                  categoryName: product.categoryName,
                  stock: product.stock,
                })
              }
              className={`w-14 h-14 border rounded-sm flex items-center justify-center transition-colors hover:border-red-500 hover:text-red-500 active:scale-95 ${
                isLiked
                  ? "border-red-500 bg-red-50 dark:bg-red-950/20 text-red-500 animate-scale-in"
                  : "border-luxury-200 dark:border-zinc-800 text-luxury-500"
              }`}
              title="Add to Wishlist"
            >
              <Heart size={18} fill={isLiked ? "currentColor" : "none"} />
            </button>
          </div>

          {/* Delivery & Material details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-light text-luxury-500 dark:text-zinc-400 bg-luxury-100 dark:bg-zinc-900/40 p-4 rounded border border-luxury-200/40 dark:border-zinc-800/40">
            <div className="flex gap-2">
              <Truck size={15} className="text-luxury-gold flex-shrink-0" />
              <div>
                <p className="font-bold text-zinc-800 dark:text-white uppercase text-[10px]">Free Delivery Estimator</p>
                <p className="mt-0.5">Arrives in 3-5 business days. Free shipping above ₹2000.</p>
              </div>
            </div>
            <div className="flex gap-2">
              <RefreshCw size={15} className="text-luxury-gold flex-shrink-0" />
              <div>
                <p className="font-bold text-zinc-800 dark:text-white uppercase text-[10px]">Returns Exchange</p>
                <p className="mt-0.5">Hassle-free 7-day visual exchange request system.</p>
              </div>
            </div>
            <div className="flex gap-2 sm:col-span-2">
              <Calendar size={15} className="text-luxury-gold flex-shrink-0" />
              <div>
                <p className="font-bold text-zinc-800 dark:text-white uppercase text-[10px]">Material & Spec Details</p>
                <p className="mt-0.5">
                  Fabric Composition: <span className="font-semibold text-zinc-900 dark:text-white">{product.fabric}</span>. Cut:{" "}
                  <span className="font-semibold text-zinc-900 dark:text-white">{product.fit}</span>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Description Accordion Details */}
      <div className="border-t border-luxury-200 dark:border-zinc-800 pt-10">
        <h3 className="serif-header text-xl uppercase tracking-wider mb-6">Product Story</h3>
        <p className="text-sm font-light text-luxury-600 dark:text-zinc-400 leading-relaxed max-w-4xl">
          {product.description}
        </p>
      </div>

      {/* Reviews Column */}
      <div className="border-t border-luxury-200 dark:border-zinc-800 pt-10 grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="space-y-6">
          <h3 className="serif-header text-xl uppercase tracking-wider">Client Reviews</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-4xl font-bold font-mono">{product.rating}</span>
              <div>
                <div className="flex items-center text-amber-500">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      fill={i < Math.floor(product.rating) ? "currentColor" : "none"}
                      className={i < Math.floor(product.rating) ? "" : "text-luxury-200 dark:text-zinc-800"}
                    />
                  ))}
                </div>
                <p className="text-xs text-luxury-500 font-light mt-0.5">Based on client feedbacks</p>
              </div>
            </div>
          </div>

          {/* Review form */}
          <form onSubmit={handleReviewSubmit} className="space-y-4 border border-luxury-200 dark:border-zinc-800 p-5 rounded-sm bg-white dark:bg-zinc-950 shadow-sm">
            <h4 className="text-xs font-bold tracking-widest uppercase">Write a Review</h4>
            <div className="flex items-center gap-1.5 text-amber-500">
              <span className="text-xs text-luxury-500 mr-2">Your Rating:</span>
              {[1, 2, 3, 4, 5].map((stars) => (
                <button
                  type="button"
                  key={stars}
                  onClick={() => setReviewRating(stars)}
                  className="hover:scale-110 transition-transform"
                >
                  <Star size={16} fill={stars <= reviewRating ? "currentColor" : "none"} />
                </button>
              ))}
            </div>
            <div className="grid grid-cols-1 gap-3">
              <input
                type="text"
                placeholder="Name"
                value={reviewName}
                onChange={(e) => setReviewName(e.target.value)}
                className="bg-transparent border border-luxury-200 dark:border-zinc-800 text-xs p-2.5 rounded focus:outline-none focus:border-luxury-gold text-zinc-950 dark:text-white"
                required
              />
              <input
                type="email"
                placeholder="Email Address"
                value={reviewEmail}
                onChange={(e) => setReviewEmail(e.target.value)}
                className="bg-transparent border border-luxury-200 dark:border-zinc-800 text-xs p-2.5 rounded focus:outline-none focus:border-luxury-gold text-zinc-950 dark:text-white"
                required
              />
              <textarea
                placeholder="Share your thoughts about this product..."
                rows={3}
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                className="bg-transparent border border-luxury-200 dark:border-zinc-800 text-xs p-2.5 rounded focus:outline-none focus:border-luxury-gold text-zinc-950 dark:text-white"
                required
              />
            </div>
            <button
              type="submit"
              className="bg-luxury-900 hover:bg-luxury-gold text-white hover:text-zinc-950 font-bold text-xs tracking-widest py-2.5 px-6 uppercase rounded-sm transition-colors active:scale-95"
            >
              SUBMIT FOR APPROVAL
            </button>
            {reviewSubmitted && (
              <p className="text-xs text-green-600 font-medium">
                Thank you! Your review has been submitted and is pending moderation.
              </p>
            )}
          </form>
        </div>

        {/* Reviews List */}
        <div className="lg:col-span-2 space-y-6 max-h-[30rem] overflow-y-auto pr-2">
          {reviews.length === 0 ? (
            <p className="text-sm font-light text-luxury-500 italic py-10">No reviews yet. Be the first to review this product!</p>
          ) : (
            reviews.map((rev) => (
              <div key={rev.id} className="border-b border-luxury-100 dark:border-zinc-800/80 pb-6 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold">{rev.customerName}</span>
                  <span className="text-[10px] text-luxury-400 font-mono">
                    {new Date(rev.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex text-amber-500">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={11} fill={i < rev.rating ? "currentColor" : "none"} className={i < rev.rating ? "" : "text-luxury-200 dark:text-zinc-800"} />
                  ))}
                </div>
                <p className="text-xs text-luxury-600 dark:text-zinc-400 font-light leading-relaxed">
                  {rev.comment}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Size Guide Drawer/Modal */}
      {sizeGuideOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSizeGuideOpen(false)} />
          <div className="relative w-full max-w-lg bg-white dark:bg-zinc-900 p-8 rounded shadow-2xl z-10 animate-scale-in">
            <h3 className="serif-header text-xl uppercase tracking-wider mb-4 border-b border-luxury-100 dark:border-zinc-800 pb-2">Size Estimation Chart</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-light text-left border-collapse">
                <thead>
                  <tr className="border-b border-luxury-200 dark:border-zinc-800 font-semibold">
                    <th className="py-2.5">Size</th>
                    <th className="py-2.5">Chest (in)</th>
                    <th className="py-2.5">Waist (in)</th>
                    <th className="py-2.5">Length (in)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-luxury-100 dark:divide-zinc-800">
                  <tr>
                    <td className="py-2.5 font-bold">XS</td>
                    <td className="py-2.5">34-36</td>
                    <td className="py-2.5">28-30</td>
                    <td className="py-2.5">27</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-bold">S</td>
                    <td className="py-2.5">36-38</td>
                    <td className="py-2.5">30-32</td>
                    <td className="py-2.5">28</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-bold">M</td>
                    <td className="py-2.5">38-40</td>
                    <td className="py-2.5">32-34</td>
                    <td className="py-2.5">29</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-bold">L</td>
                    <td className="py-2.5">40-42</td>
                    <td className="py-2.5">34-36</td>
                    <td className="py-2.5">30</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-bold">XL</td>
                    <td className="py-2.5">42-44</td>
                    <td className="py-2.5">36-38</td>
                    <td className="py-2.5">31</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <button
              onClick={() => setSizeGuideOpen(false)}
              className="mt-6 w-full bg-luxury-900 hover:bg-luxury-gold text-white hover:text-zinc-950 font-bold text-xs tracking-widest py-3 uppercase rounded-sm transition-colors"
            >
              CLOSE SIZE GUIDE
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailClient;
