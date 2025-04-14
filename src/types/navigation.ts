
import { LucideIcon } from "lucide-react";

export interface MenuItem {
  name: string;
  icon: LucideIcon;
  href: string;
  children?: MenuItem[];
  new?: boolean;
  group?: string; // Group items for better organization
  badge?: string; // For showing badges like "Beta", "New", etc.
  disabled?: boolean; // For disabling menu items
  exact?: boolean; // For exact matching of routes in navigation
  title?: string; // Additional property for compatibility
}
