export const TEMPLATE_STATUSES = ["available", "maintenance", "in_progress"] as const;

export type TemplateStatus = (typeof TEMPLATE_STATUSES)[number];

export const TEMPLATE_STATUS_LABELS: Record<TemplateStatus, string> = {
  available: "Aktif",
  maintenance: "Maintenance",
  in_progress: "Dalam Proses",
};

export function isTemplateStatus(value: unknown): value is TemplateStatus {
  return TEMPLATE_STATUSES.some((status) => status === value);
}
