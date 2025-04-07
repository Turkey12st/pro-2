
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('ar-SA', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(value)
}
