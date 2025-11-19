import { format as formatDate } from "date-fns";

export default function combineDateTime(dateValue, timeValue) {
  if (!dateValue || !timeValue) return null;

  const dateStr = formatDate(new Date(dateValue), "yyyy-MM-dd");

  const combined = `${dateStr}T${timeValue}:00`;

  return new Date(combined).toISOString();
}