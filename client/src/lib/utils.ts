import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  gundem: { bg: "bg-red-500", text: "text-white", border: "border-red-500" },
  yasam: { bg: "bg-emerald-500", text: "text-white", border: "border-emerald-500" },
  "kultur-sanat": { bg: "bg-violet-500", text: "text-white", border: "border-violet-500" },
  cevre: { bg: "bg-green-600", text: "text-white", border: "border-green-600" },
  saglik: { bg: "bg-blue-500", text: "text-white", border: "border-blue-500" },
  spor: { bg: "bg-orange-500", text: "text-white", border: "border-orange-500" },
  egitim: { bg: "bg-amber-500", text: "text-white", border: "border-amber-500" },
};

export const CATEGORY_LIGHT_COLORS: Record<string, { bg: string; text: string }> = {
  gundem: { bg: "bg-red-50 dark:bg-red-950/30", text: "text-red-600 dark:text-red-400" },
  yasam: { bg: "bg-emerald-50 dark:bg-emerald-950/30", text: "text-emerald-600 dark:text-emerald-400" },
  "kultur-sanat": { bg: "bg-violet-50 dark:bg-violet-950/30", text: "text-violet-600 dark:text-violet-400" },
  cevre: { bg: "bg-green-50 dark:bg-green-950/30", text: "text-green-700 dark:text-green-400" },
  saglik: { bg: "bg-blue-50 dark:bg-blue-950/30", text: "text-blue-600 dark:text-blue-400" },
  spor: { bg: "bg-orange-50 dark:bg-orange-950/30", text: "text-orange-600 dark:text-orange-400" },
  egitim: { bg: "bg-amber-50 dark:bg-amber-950/30", text: "text-amber-600 dark:text-amber-400" },
};

export function getCategoryColor(slug: string) {
  return CATEGORY_COLORS[slug] ?? { bg: "bg-gray-500", text: "text-white", border: "border-gray-500" };
}

export function getCategoryLightColor(slug: string) {
  return CATEGORY_LIGHT_COLORS[slug] ?? { bg: "bg-gray-50 dark:bg-gray-900/30", text: "text-gray-600 dark:text-gray-400" };
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });
}

export function formatDateShort(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
}

export function formatDateTime(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function timeAgo(date: Date | string): string {
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 1) return "Az önce";
  if (minutes < 60) return `${minutes} dakika önce`;
  if (hours < 24) return `${hours} saat önce`;
  if (days < 7) return `${days} gün önce`;
  return formatDate(date);
}
