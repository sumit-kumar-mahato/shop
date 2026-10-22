// Browser-side helper that opens Razorpay Checkout.

type RazorpayResponse = { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string };

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  order_id: string;
  name: string;
  description?: string;
  prefill?: { name?: string; email?: string; contact?: string };
  theme?: { color?: string };
  handler: (response: RazorpayResponse) => void;
  modal?: { ondismiss?: () => void };
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => { open: () => void; on: (event: string, cb: (resp: { error?: { description?: string } }) => void) => void };
  }
}

let loader: Promise<void> | null = null;

function loadScript(): Promise<void> {
  if (window.Razorpay) return Promise.resolve();
  loader ??= new Promise<void>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => {
      loader = null;
      reject(new Error("Could not load the payment window. Check your internet connection."));
    };
    document.body.appendChild(s);
  });
  return loader;
}

export async function openRazorpay(opts: {
  keyId: string;
  orderId: string;
  amount: number;
  currency: string;
  storeName: string;
  description: string;
  prefill: { name?: string; email?: string; contact?: string };
  color: string;
}): Promise<RazorpayResponse | null> {
  await loadScript();
  return new Promise((resolve, reject) => {
    const rzp = new window.Razorpay!({
      key: opts.keyId,
      amount: opts.amount,
      currency: opts.currency,
      order_id: opts.orderId,
      name: opts.storeName,
      description: opts.description,
      prefill: opts.prefill,
      theme: { color: opts.color },
      handler: (response) => resolve(response),
      modal: { ondismiss: () => resolve(null) },
    });
    rzp.on("payment.failed", (resp) => reject(new Error(resp.error?.description || "Payment failed. Please try again.")));
    rzp.open();
  });
}
