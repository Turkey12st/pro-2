import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(num: number | string): string {
  const numberValue = typeof num === 'string' ? parseFloat(num) : num;
  
  if (isNaN(numberValue)) {
    return '0';
  }
  
  // Using 'en-US' locale for English numbers
  return new Intl.NumberFormat('en-US').format(numberValue);
}
