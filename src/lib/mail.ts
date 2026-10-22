import "server-only";
import nodemailer from "nodemailer";
import type { Order, OrderItem } from "@prisma/client";
import { env } from "@/lib/env";
import { formatINR } from "@/lib/money";
import { ORDER_STATUS_LABELS, PAYMENT_METHOD_LABELS } from "@/lib/constants";
import { getSettings } from "@/lib/settings";

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (!env.smtp.host) return null;
  transporter ??= nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    secure: env.smtp.port === 465,
    auth: env.smtp.user ? { user: env.smtp.user, pass: env.smtp.password } : undefined,
  });
  return transporter;
}

export function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

/** Send an email. Without SMTP configured, the email is printed to the server log instead. Never throws. */
export async function sendMail(to: string, subject: string, html: string) {
  try {
    const t = getTransporter();
    if (!t) {
      console.info(`\n[mail] SMTP not configured — would send to ${to}\nSubject: ${subject}\n${html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()}\n`);
      return;
    }
    await t.sendMail({ from: env.smtp.from, to, subject, html });
  } catch (err) {
    console.error("[mail] failed to send", subject, err);
  }
}

async function layout(title: string, body: string) {
  const store = await getSettings("store");
  const brand = escapeHtml(store.storeName);
  return `<!doctype html><html><body style="margin:0;background:#f5f4ef;font-family:Arial,Helvetica,sans-serif;color:#1f1c17">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:24px 12px"><tr><td align="center">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fff;border:1px solid #e6e3d8">
    <tr><td style="padding:20px 28px;border-bottom:3px solid ${store.primaryColor};font-size:18px;font-weight:bold;letter-spacing:2px">${brand}</td></tr>
    <tr><td style="padding:28px">
      <h1 style="margin:0 0 16px;font-size:20px">${escapeHtml(title)}</h1>
      ${body}
    </td></tr>
    <tr><td style="padding:16px 28px;background:#faf9f6;font-size:12px;color:#756d59">
      ${brand} · ${escapeHtml(store.address)}<br/>Questions? Reply to this email or contact ${escapeHtml(store.contactEmail)}
    </td></tr>
  </table></td></tr></table></body></html>`;
}

function button(href: string, label: string) {
  return `<p style="margin:24px 0"><a href="${escapeHtml(href)}" style="background:#1f1c17;color:#fff;text-decoration:none;padding:12px 22px;font-size:14px;display:inline-block">${escapeHtml(label)}</a></p>`;
}

export async function sendVerificationEmail(to: string, name: string, token: string) {
  const link = `${env.appUrl}/verify-email?token=${encodeURIComponent(token)}`;
  const html = await layout(
    "Confirm your email address",
    `<p>Hi ${escapeHtml(name)},</p><p>Please confirm your email address to secure your account.</p>${button(link, "Verify email")}<p style="font-size:12px;color:#756d59">This link expires in 24 hours. If you didn't create an account, you can ignore this email.</p>`,
  );
  await sendMail(to, "Confirm your email address", html);
}

export async function sendPasswordResetEmail(to: string, name: string, token: string) {
  const link = `${env.appUrl}/reset-password?token=${encodeURIComponent(token)}`;
  const html = await layout(
    "Reset your password",
    `<p>Hi ${escapeHtml(name)},</p><p>We received a request to reset your password.</p>${button(link, "Choose a new password")}<p style="font-size:12px;color:#756d59">This link expires in 1 hour. If you didn't request this, you can safely ignore this email — your password won't change.</p>`,
  );
  await sendMail(to, "Reset your password", html);
}

function itemsTable(order: Order & { items: OrderItem[] }) {
  const rows = order.items
    .map(
      (i) => `<tr><td style="padding:8px 0;border-bottom:1px solid #eee">${escapeHtml(i.title)}<br/><span style="font-size:12px;color:#756d59">${escapeHtml(i.size)} / ${escapeHtml(i.color)} × ${i.quantity}</span></td><td align="right" style="padding:8px 0;border-bottom:1px solid #eee">${formatINR(i.lineTotal)}</td></tr>`,
    )
    .join("");
  const line = (label: string, value: string, bold = false) =>
    `<tr><td style="padding:4px 0;${bold ? "font-weight:bold" : ""}">${label}</td><td align="right" style="padding:4px 0;${bold ? "font-weight:bold" : ""}">${value}</td></tr>`;
  return `<table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px">${rows}
    ${line("Subtotal", formatINR(order.subtotal))}
    ${order.discount ? line(`Discount${order.couponCode ? ` (${escapeHtml(order.couponCode)})` : ""}`, `−${formatINR(order.discount)}`) : ""}
    ${line("Shipping", order.shippingFee ? formatINR(order.shippingFee) : "Free")}
    ${order.taxIncluded ? "" : line("GST", formatINR(order.tax))}
    ${line("Total", formatINR(order.total), true)}
  </table>`;
}

export async function sendOrderConfirmation(order: Order & { items: OrderItem[] }) {
  const link = `${env.appUrl}/account/orders/${order.orderNumber}`;
  const html = await layout(
    `Thank you! Order ${order.orderNumber} is confirmed`,
    `<p>Hi ${escapeHtml(order.shippingName)}, we've received your order and will start packing it soon.</p>
     ${itemsTable(order)}
     <p style="font-size:14px"><strong>Payment:</strong> ${PAYMENT_METHOD_LABELS[order.paymentMethod]}<br/>
     <strong>Delivering to:</strong> ${escapeHtml(order.shippingLine1)}, ${escapeHtml(order.shippingCity)}, ${escapeHtml(order.shippingState)} ${escapeHtml(order.shippingPostal)}</p>
     ${button(link, "View your order")}`,
  );
  await sendMail(order.email, `Order confirmed — ${order.orderNumber}`, html);

  const store = await getSettings("store");
  if (store.orders.notifyEmail) {
    await sendMail(
      store.orders.notifyEmail,
      `New order ${order.orderNumber} — ${formatINR(order.total)}`,
      await layout(`New order ${order.orderNumber}`, `<p>${escapeHtml(order.shippingName)} placed an order.</p>${itemsTable(order)}${button(`${env.appUrl}/admin/orders/${order.id}`, "Open in admin")}`),
    );
  }
}

export async function sendOrderStatusEmail(order: Order, note?: string | null) {
  const link = `${env.appUrl}/account/orders/${order.orderNumber}`;
  const tracking =
    order.trackingNumber && (order.status === "SHIPPED" || order.status === "OUT_FOR_DELIVERY")
      ? `<p style="font-size:14px"><strong>Courier:</strong> ${escapeHtml(order.courierName ?? "—")}<br/><strong>Tracking number:</strong> ${escapeHtml(order.trackingNumber)}</p>${order.trackingUrl ? button(order.trackingUrl, "Track shipment") : ""}`
      : "";
  const html = await layout(
    `Your order is ${ORDER_STATUS_LABELS[order.status].toLowerCase()}`,
    `<p>Hi ${escapeHtml(order.shippingName)}, there's an update on order <strong>${order.orderNumber}</strong>.</p>
     <p style="font-size:16px"><strong>Status:</strong> ${ORDER_STATUS_LABELS[order.status]}</p>
     ${note ? `<p>${escapeHtml(note)}</p>` : ""}${tracking}${button(link, "View order")}`,
  );
  await sendMail(order.email, `Order ${order.orderNumber}: ${ORDER_STATUS_LABELS[order.status]}`, html);
}
