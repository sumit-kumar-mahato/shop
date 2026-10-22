"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useCart } from "@/components/CartContext";
import { CreditCard, Truck, CheckCircle2, ShieldCheck, Printer, ArrowLeft, Loader2, QrCode } from "lucide-react";
import confetti from "canvas-confetti";

export default function CheckoutPage() {
  const { cartItems, subtotal, gst, discount, finalTotal, shippingFee, clearCart } = useCart();

  // Multi-step: "form" | "payment" | "success"
  const [step, setStep] = useState<"form" | "payment" | "success">("form");

  // Form Fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");

  // Payment Selection
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "UPI" | "CARD">("COD");
  const [placingOrder, setPlacingOrder] = useState(false);
  const [placedOrderDetails, setPlacedOrderDetails] = useState<any>(null);

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone || !address || !city || !postalCode) return;
    setStep("payment");
  };

  const handlePlaceOrder = async () => {
    setPlacingOrder(true);

    const orderNumber = `AVG-${Math.floor(100000 + Math.random() * 900000)}`;
    const trackingNumber = `TRK-${Math.floor(10000000 + Math.random() * 90000000)}`;

    const orderData = {
      orderNumber,
      customerName: name,
      customerEmail: email,
      customerPhone: phone,
      address,
      city,
      postalCode,
      total: subtotal,
      gst,
      discount,
      finalTotal,
      paymentMethod,
      trackingNumber,
      items: JSON.stringify(
        cartItems.map((item) => ({
          productId: item.productId,
          title: item.title,
          price: item.price,
          size: item.size,
          color: item.color,
          quantity: item.quantity,
        }))
      ),
    };

    try {
      const response = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        const order = await response.json();
        setPlacedOrderDetails(order);
        setStep("success");
        clearCart();

        // Celebration Confetti
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
          colors: ["#c5a880", "#000000", "#ffffff"],
        });
      } else {
        alert("Failed to place order. Please try again.");
      }
    } catch (e) {
      console.error(e);
      alert("Error occurred while communicating with database.");
    } finally {
      setPlacingOrder(false);
    }
  };

  if (cartItems.length === 0 && step !== "success") {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <h1 className="serif-header text-2xl uppercase tracking-wide">Checkout is empty</h1>
        <p className="text-xs text-luxury-500 font-light">Add items to your bag before proceeding to checkout.</p>
        <Link href="/shop" className="inline-block bg-luxury-900 text-white text-xs font-bold px-6 py-3 rounded-sm">
          SHOP COLLECTIONS
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Checkout header steps indicators */}
      {step !== "success" && (
        <div className="flex justify-center items-center gap-4 sm:gap-8 mb-10 text-xs font-bold tracking-widest text-luxury-400 uppercase">
          <span className={step === "form" ? "text-luxury-gold" : "text-green-600"}>1. Delivery Address</span>
          <span className="h-[1px] w-8 sm:w-16 bg-luxury-200 dark:bg-zinc-800" />
          <span className={step === "payment" ? "text-luxury-gold" : ""}>2. Payment Options</span>
        </div>
      )}

      {step === "form" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
          {/* Shipping Form details */}
          <form onSubmit={handleDetailsSubmit} className="lg:col-span-2 space-y-6">
            <h2 className="serif-header text-xl uppercase tracking-wider border-b border-luxury-200/40 dark:border-zinc-800/40 pb-3 mb-4">
              Shipping Address
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col space-y-1.5 sm:col-span-2">
                <label className="text-[10px] font-bold text-luxury-500 uppercase">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-white dark:bg-zinc-950 border border-luxury-200 dark:border-zinc-800 text-xs p-3 rounded-sm focus:outline-none focus:border-luxury-gold text-zinc-950 dark:text-white"
                  required
                />
              </div>

              <div className="flex flex-col space-y-1.5">
                <label className="text-[10px] font-bold text-luxury-500 uppercase">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white dark:bg-zinc-950 border border-luxury-200 dark:border-zinc-800 text-xs p-3 rounded-sm focus:outline-none focus:border-luxury-gold text-zinc-950 dark:text-white"
                  required
                />
              </div>

              <div className="flex flex-col space-y-1.5">
                <label className="text-[10px] font-bold text-luxury-500 uppercase">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  className="bg-white dark:bg-zinc-950 border border-luxury-200 dark:border-zinc-800 text-xs p-3 rounded-sm focus:outline-none focus:border-luxury-gold text-zinc-950 dark:text-white"
                  required
                />
              </div>

              <div className="flex flex-col space-y-1.5 sm:col-span-2">
                <label className="text-[10px] font-bold text-luxury-500 uppercase">Street Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Apartment, suite, block details"
                  className="bg-white dark:bg-zinc-950 border border-luxury-200 dark:border-zinc-800 text-xs p-3 rounded-sm focus:outline-none focus:border-luxury-gold text-zinc-950 dark:text-white"
                  required
                />
              </div>

              <div className="flex flex-col space-y-1.5">
                <label className="text-[10px] font-bold text-luxury-500 uppercase">City / State</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="bg-white dark:bg-zinc-950 border border-luxury-200 dark:border-zinc-800 text-xs p-3 rounded-sm focus:outline-none focus:border-luxury-gold text-zinc-950 dark:text-white"
                  required
                />
              </div>

              <div className="flex flex-col space-y-1.5">
                <label className="text-[10px] font-bold text-luxury-500 uppercase">Postal Code (PIN)</label>
                <input
                  type="text"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  className="bg-white dark:bg-zinc-950 border border-luxury-200 dark:border-zinc-800 text-xs p-3 rounded-sm focus:outline-none focus:border-luxury-gold text-zinc-950 dark:text-white font-mono font-bold"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto bg-luxury-900 hover:bg-luxury-gold text-white hover:text-zinc-950 font-bold text-xs tracking-widest px-10 py-4 rounded-sm transition-all uppercase"
            >
              PROCEED TO PAYMENT
            </button>
          </form>

          {/* Sidebar Item Overviews */}
          <div className="bg-luxury-100/50 dark:bg-zinc-900 border border-luxury-200/50 dark:border-zinc-800 p-6 rounded-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest pb-3 border-b border-luxury-200 dark:border-zinc-800">
              Your bag items
            </h3>
            <div className="divide-y divide-luxury-200/60 dark:divide-zinc-800 max-h-60 overflow-y-auto pr-2">
              {cartItems.map((item) => (
                <div key={item.id} className="flex gap-3 py-3 text-xs">
                  <div className="relative w-10 h-13 bg-zinc-200 flex-shrink-0">
                    <img src={item.image} alt={item.title} className="object-cover w-full h-full" />
                  </div>
                  <div className="min-w-0 flex-grow">
                    <h4 className="font-semibold truncate uppercase text-[10px]">{item.title}</h4>
                    <p className="text-[9px] text-luxury-500 mt-0.5">
                      {item.size} / {item.color}
                    </p>
                    <p className="text-[9px] font-bold mt-1">
                      {item.quantity} &times; ₹{item.price}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {step === "payment" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
          <div className="lg:col-span-2 space-y-6">
            <h2 className="serif-header text-xl uppercase tracking-wider border-b border-luxury-200/40 dark:border-zinc-800/40 pb-3">
              Payment Selection
            </h2>

            <div className="space-y-4">
              {/* COD */}
              <label
                className={`flex items-start gap-4 p-4 border rounded-sm cursor-pointer transition-all ${
                  paymentMethod === "COD" ? "border-luxury-gold bg-luxury-gold/5" : "border-luxury-200 dark:border-zinc-800"
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === "COD"}
                  onChange={() => setPaymentMethod("COD")}
                  className="mt-1 accent-luxury-gold"
                />
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider block">Cash on Delivery (COD)</span>
                  <span className="text-xs text-luxury-500 font-light mt-1 block">
                    Pay with cash, cards or phone at your doorstep. Zero-contact handovers available.
                  </span>
                </div>
              </label>

              {/* UPI */}
              <label
                className={`flex items-start gap-4 p-4 border rounded-sm cursor-pointer transition-all ${
                  paymentMethod === "UPI" ? "border-luxury-gold bg-luxury-gold/5" : "border-luxury-200 dark:border-zinc-800"
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === "UPI"}
                  onChange={() => setPaymentMethod("UPI")}
                  className="mt-1 accent-luxury-gold"
                />
                <div className="w-full">
                  <span className="text-xs font-bold uppercase tracking-wider block">Instant UPI Transfer (QR Code)</span>
                  <span className="text-xs text-luxury-500 font-light mt-1 block">
                    Google Pay, PhonePe, Paytm, or any banking app. Scan the visual QR code on the next screen.
                  </span>
                  {paymentMethod === "UPI" && (
                    <div className="mt-4 p-4 bg-white dark:bg-zinc-950 border border-luxury-200 dark:border-zinc-800 rounded flex flex-col items-center max-w-xs mx-auto animate-slide-down">
                      <QrCode size={120} className="text-luxury-900 dark:text-white" />
                      <p className="text-[10px] text-luxury-500 font-bold uppercase tracking-wider mt-2">
                        Scan to Pay ₹{finalTotal}
                      </p>
                      <p className="text-[9px] text-zinc-400 mt-0.5">UPI ID: avgclothing@okaxis</p>
                    </div>
                  )}
                </div>
              </label>

              {/* Credit Card / Stripe */}
              <label
                className={`flex items-start gap-4 p-4 border rounded-sm cursor-pointer transition-all ${
                  paymentMethod === "CARD" ? "border-luxury-gold bg-luxury-gold/5" : "border-luxury-200 dark:border-zinc-800"
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === "CARD"}
                  onChange={() => setPaymentMethod("CARD")}
                  className="mt-1 accent-luxury-gold"
                />
                <div className="w-full">
                  <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <CreditCard size={15} /> Credit / Debit Card (Stripe Gateway Mock)
                  </span>
                  <span className="text-xs text-luxury-500 font-light mt-1 block">
                    Visa, MasterCard, RuPay and American Express cards supported.
                  </span>
                  {paymentMethod === "CARD" && (
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 animate-slide-down max-w-md">
                      <input
                        type="text"
                        placeholder="Card Number"
                        className="sm:col-span-3 bg-white dark:bg-zinc-950 border border-luxury-200 dark:border-zinc-800 text-xs p-2.5 rounded focus:outline-none focus:border-luxury-gold text-zinc-950 dark:text-white font-mono font-bold"
                        maxLength={16}
                      />
                      <input
                        type="text"
                        placeholder="MM/YY"
                        className="bg-white dark:bg-zinc-950 border border-luxury-200 dark:border-zinc-800 text-xs p-2.5 rounded focus:outline-none focus:border-luxury-gold text-zinc-950 dark:text-white font-mono"
                        maxLength={5}
                      />
                      <input
                        type="password"
                        placeholder="CVV"
                        className="bg-white dark:bg-zinc-950 border border-luxury-200 dark:border-zinc-800 text-xs p-2.5 rounded focus:outline-none focus:border-luxury-gold text-zinc-950 dark:text-white font-mono"
                        maxLength={3}
                      />
                    </div>
                  )}
                </div>
              </label>
            </div>

            <div className="flex gap-4 pt-6">
              <button
                onClick={() => setStep("form")}
                className="border border-luxury-200 text-luxury-600 dark:border-zinc-800 dark:text-zinc-400 font-bold text-xs tracking-widest px-6 py-4 uppercase rounded-sm flex items-center gap-1.5 hover:bg-luxury-100/30"
              >
                <ArrowLeft size={14} /> BACK
              </button>
              <button
                onClick={handlePlaceOrder}
                disabled={placingOrder}
                className="flex-grow bg-luxury-900 hover:bg-luxury-gold text-white hover:text-zinc-950 font-bold text-xs tracking-widest py-4 px-8 uppercase rounded-sm transition-all flex items-center justify-center gap-2 border border-luxury-900"
              >
                {placingOrder ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> PLACING ORDER...
                  </>
                ) : (
                  `PLACE ORDER (₹${finalTotal})`
                )}
              </button>
            </div>
          </div>

          <div className="bg-luxury-100/50 dark:bg-zinc-900 border border-luxury-200/50 dark:border-zinc-800 p-6 rounded-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest pb-3 border-b border-luxury-200 dark:border-zinc-800">
              Delivery Estimation
            </h3>
            <p className="text-xs text-luxury-500 font-light leading-relaxed">
              Shipping to: <span className="font-semibold text-zinc-900 dark:text-white">{address}, {city} - {postalCode}</span>
            </p>
            <div className="pt-2 border-t border-luxury-200 dark:border-zinc-800 text-xs font-light space-y-2.5">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (GST)</span>
                <span>₹{gst}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>₹{shippingFee}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600 font-medium">
                  <span>Coupons Discount</span>
                  <span>-₹{discount}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-sm border-t border-luxury-200/60 dark:border-zinc-800/40 pt-2 text-zinc-900 dark:text-white">
                <span>Order Total</span>
                <span>₹{finalTotal}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {step === "success" && placedOrderDetails && (
        <div className="max-w-2xl mx-auto bg-white dark:bg-zinc-900 border border-luxury-200 dark:border-zinc-800 p-8 rounded shadow-lg text-center space-y-8 animate-fade-in-up">
          <div className="w-16 h-16 bg-green-50 dark:bg-green-950/20 text-green-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 size={36} />
          </div>

          <div className="space-y-3">
            <h1 className="serif-header text-3xl uppercase tracking-wide">Purchase Completed</h1>
            <p className="text-xs text-luxury-500 font-light">
              Thank you for choosing Prabodh Kumar Mahato. A confirmation has been sent to your email.
            </p>
          </div>

          <div className="border border-luxury-200/60 dark:border-zinc-800 p-5 rounded-sm text-left grid grid-cols-2 gap-4 text-xs font-light bg-luxury-100/30 dark:bg-zinc-950/30">
            <div>
              <p className="text-[10px] text-luxury-400 font-bold uppercase tracking-wider">Order Reference</p>
              <p className="font-semibold text-zinc-900 dark:text-white mt-0.5">{placedOrderDetails.orderNumber}</p>
            </div>
            <div>
              <p className="text-[10px] text-luxury-400 font-bold uppercase tracking-wider">Tracking ID</p>
              <p className="font-semibold text-zinc-900 dark:text-white mt-0.5">{placedOrderDetails.trackingNumber}</p>
            </div>
            <div>
              <p className="text-[10px] text-luxury-400 font-bold uppercase tracking-wider">Shipment Mode</p>
              <p className="mt-0.5">Express Air Delivery (3-5 days)</p>
            </div>
            <div>
              <p className="text-[10px] text-luxury-400 font-bold uppercase tracking-wider">Final Value</p>
              <p className="font-bold text-luxury-gold mt-0.5">₹{placedOrderDetails.finalTotal}</p>
            </div>
          </div>

          {/* Action buttons including printer invoice */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={() => window.print()}
              className="flex-grow bg-luxury-100 hover:bg-luxury-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white font-bold text-xs tracking-widest py-3 px-6 uppercase rounded-sm flex items-center justify-center gap-1.5 transition-colors border border-luxury-200 dark:border-zinc-700"
            >
              <Printer size={15} /> PRINT INVOICE
            </button>
            <Link
              href="/shop"
              className="flex-grow bg-luxury-900 hover:bg-luxury-gold text-white hover:text-zinc-950 font-bold text-xs tracking-widest py-3 px-6 uppercase rounded-sm flex items-center justify-center transition-colors border border-luxury-900"
            >
              CONTINUE SHOPPING
            </Link>
          </div>

          <div className="text-center pt-2">
            <Link href="/profile" className="text-xs font-semibold text-luxury-gold hover:underline">
              View Order History in Account Dashboard
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
