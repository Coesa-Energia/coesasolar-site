export type LeadPrefill = { telefone?: string; valorConta?: string };

export function trackLeadEvent(name: string, source: string) {
  if (typeof window === "undefined") return;
  (window as Window & { gtag?: (...args: unknown[]) => void }).gtag?.("event", name, { source });
}

export function openLeadForm(source: string, prefill: LeadPrefill = {}) {
  trackLeadEvent("lead_cta_click", source);
  window.dispatchEvent(new CustomEvent("coesa:open-lead-form", { detail: { source, prefill } }));
}

export function formatLeadBill(value: string) {
  const clean = value.replace(/[^\d,.]/g, "");
  const normalized = clean.includes(",")
    ? clean.replace(/\./g, "").replace(",", ".")
    : /^\d{1,3}(\.\d{3})+$/.test(clean) ? clean.replace(/\./g, "") : clean;
  const amount = Number(normalized);
  return Number.isFinite(amount) && amount > 0
    ? amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
    : "";
}
