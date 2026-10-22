import "server-only";

const isProd = process.env.NODE_ENV === "production";

function authSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (secret && secret.length >= 32) return secret;
  if (isProd) {
    throw new Error("AUTH_SECRET must be set to a random string of at least 32 characters in production.");
  }
  return "dev-only-insecure-secret-change-me-before-deploying!!";
}

export const env = {
  isProd,
  get appUrl() {
    return (process.env.APP_URL || "http://localhost:3000").replace(/\/$/, "");
  },
  get authSecret() {
    return authSecret();
  },
  razorpay: {
    get keyId() {
      return process.env.RAZORPAY_KEY_ID || "";
    },
    get keySecret() {
      return process.env.RAZORPAY_KEY_SECRET || "";
    },
    get webhookSecret() {
      return process.env.RAZORPAY_WEBHOOK_SECRET || "";
    },
    get configured() {
      return Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
    },
  },
  smtp: {
    get host() {
      return process.env.SMTP_HOST || "";
    },
    get port() {
      return Number(process.env.SMTP_PORT || 587);
    },
    get user() {
      return process.env.SMTP_USER || "";
    },
    get password() {
      return process.env.SMTP_PASSWORD || "";
    },
    get from() {
      return process.env.MAIL_FROM || "Store <no-reply@example.com>";
    },
  },
};
