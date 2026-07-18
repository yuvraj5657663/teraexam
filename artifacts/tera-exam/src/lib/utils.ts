import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, parseISO } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateValue: string | Date | undefined | null) {
  if (!dateValue) return "N/A"

  try {
    const date = dateValue instanceof Date ? dateValue : parseISO(dateValue);
    return format(date, "dd MMM yyyy");
  } catch {
    return String(dateValue);
  }
}
