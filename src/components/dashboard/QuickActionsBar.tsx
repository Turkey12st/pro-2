import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  UserPlus,
  FilePlus2,
  FolderPlus,
  ReceiptText,
  Landmark,
  Gavel,
} from "lucide-react";

const ACTIONS = [
  { label: "موظف جديد", icon: UserPlus, route: "/hr" },
  { label: "قيد محاسبي", icon: FilePlus2, route: "/accounting" },
  { label: "مشروع جديد", icon: FolderPlus, route: "/projects" },
  { label: "مستند", icon: ReceiptText, route: "/documents" },
  { label: "تسوية بنكية", icon: Landmark, route: "/bank-reconciliation" },
  { label: "منافسة", icon: Gavel, route: "/tenders" },
];

export function QuickActionsBar() {
  const navigate = useNavigate();

  return (
    <Card className="border-border/50 bg-card/80 shadow-sm">
      <CardContent className="p-3 sm:p-4">
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          {ACTIONS.map(({ label, icon: Icon, route }) => (
            <Button
              key={route}
              variant="outline"
              size="sm"
              className="h-11 w-full justify-start gap-2 rounded-xl bg-background/60 px-3 text-xs sm:w-auto sm:justify-center sm:text-sm"
              onClick={() => navigate(route)}
            >
              <Icon className="h-4 w-4 text-primary" />
              {label}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}