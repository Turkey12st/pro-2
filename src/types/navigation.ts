
import { LucideIcon } from "lucide-react";

export interface MenuItem {
  title: string;
  icon: LucideIcon;
  href: string;
  children?: MenuItem[];
  new?: boolean;
}
