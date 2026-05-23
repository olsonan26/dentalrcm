export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCurrencyExact(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function formatDateShort(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function claimStatusColor(status: string): string {
  const map: Record<string, string> = {
    draft: "bg-muted text-muted-foreground",
    scrubbing: "bg-info/15 text-info",
    ready: "bg-chart-1/15 text-chart-1",
    submitted: "bg-info/15 text-info",
    accepted: "bg-chart-2/15 text-chart-2",
    denied: "bg-destructive/15 text-destructive",
    paid: "bg-success/15 text-success",
    appealed: "bg-warning/15 text-warning",
    closed: "bg-muted text-muted-foreground",
  };
  return map[status] ?? "bg-muted text-muted-foreground";
}

export function taskPriorityColor(priority: string): string {
  const map: Record<string, string> = {
    urgent: "bg-destructive/15 text-destructive",
    high: "bg-warning/15 text-warning",
    medium: "bg-info/15 text-info",
    low: "bg-muted text-muted-foreground",
  };
  return map[priority] ?? "bg-muted text-muted-foreground";
}

export function taskCategoryLabel(category: string): string {
  const map: Record<string, string> = {
    claim_submission: "Claim Submission",
    claim_followup: "Claim Follow-up",
    denial_appeal: "Denial Appeal",
    payment_posting: "Payment Posting",
    eligibility_verification: "Eligibility Verification",
    patient_billing: "Patient Billing",
    credentialing: "Credentialing",
    other: "Other",
  };
  return map[category] ?? category;
}

export function paymentStatusColor(status: string): string {
  const map: Record<string, string> = {
    pending: "bg-warning/15 text-warning",
    posted: "bg-info/15 text-info",
    reconciled: "bg-success/15 text-success",
  };
  return map[status] ?? "bg-muted text-muted-foreground";
}
