import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { getNavigationMenu } from "@/data/navigationMenu";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * لوحة أوامر بصيغة ⌘K / Ctrl+K للتنقل السريع بين وحدات النظام.
 */
export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const navigate = useNavigate();
  const menu = getNavigationMenu();

  const grouped = menu.reduce<Record<string, typeof menu>>((acc, item) => {
    const g = item.group || "أخرى";
    (acc[g] ||= []).push(item);
    return acc;
  }, {});

  const go = (href: string) => {
    onOpenChange(false);
    navigate(href);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="ابحث عن صفحة، وحدة، أو إجراء…" />
      <CommandList>
        <CommandEmpty>لا توجد نتائج مطابقة</CommandEmpty>
        {Object.entries(grouped).map(([group, items], idx) => (
          <React.Fragment key={group}>
            {idx > 0 && <CommandSeparator />}
            <CommandGroup heading={group}>
              {items.map((item) => (
                <CommandItem
                  key={item.href}
                  value={`${group} ${item.name} ${item.href}`}
                  onSelect={() => go(item.href)}
                >
                  {item.icon && <item.icon className="h-4 w-4 me-2" />}
                  <span>{item.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </React.Fragment>
        ))}
      </CommandList>
    </CommandDialog>
  );
}

/** Hook لتفعيل اختصار ⌘K / Ctrl+K على مستوى التطبيق. */
export function useCommandPalette() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return { open, setOpen };
}