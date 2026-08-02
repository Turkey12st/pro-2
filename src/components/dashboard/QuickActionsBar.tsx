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
    <Card>
      <CardContent className="p-3">
        <div className="flex flex-wrap gap-2">
          {ACTIONS.map(({ label, icon: Icon, route }) => (
            <Button
              key={route}
              variant="outline"
              size="sm"
              className="gap-2"
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