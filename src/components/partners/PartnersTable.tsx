
import { Partner } from "@/types/database";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash, Upload, Users } from "lucide-react";
import { formatNumber, formatPercentage } from "@/utils/formatters";
import { useNavigate } from "react-router-dom";

interface PartnersTableProps {
  partners: Partner[];
  onDelete: (partnerId: string) => void;
  onUploadDocument: (partnerId: string) => void;
  loading: boolean;
}

export function PartnersTable({ partners, onDelete, onUploadDocument, loading }: PartnersTableProps) {
  const navigate = useNavigate();

  if (loading) {
    return <div className="text-center py-4">جاري تحميل البيانات...</div>;
  }
  
  if (partners.length === 0) {
    return (
      <div className="text-center py-8">
        <Users className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">لا يوجد شركاء</h3>
        <p className="text-muted-foreground mt-2">لم يتم إضافة أي شركاء بعد. قم بإضافة شريك جديد للبدء.</p>
        <Button onClick={() => navigate("/partners/add")} className="mt-4">
          <span className="mr-2">+</span> إضافة شريك جديد
        </Button>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">اسم الشريك</TableHead>
            <TableHead>الجنسية</TableHead>
            <TableHead>رقم الهوية</TableHead>
            <TableHead>رأس المال</TableHead>
            <TableHead>النسبة</TableHead>
            <TableHead>المنصب</TableHead>
            <TableHead className="text-left">الإجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {partners.map((partner) => (
            <TableRow key={partner.id}>
              <TableCell className="font-medium">{partner.name}</TableCell>
              <TableCell>{partner.nationality}</TableCell>
              <TableCell>{partner.identity_number}</TableCell>
              <TableCell>{formatNumber(partner.capital_amount)} ريال</TableCell>
              <TableCell>{formatPercentage(partner.capital_percentage)}</TableCell>
              <TableCell>{partner.position}</TableCell>
              <TableCell className="flex items-center space-x-2 space-x-reverse">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(`/partners/edit/${partner.id}`)}
                >
                  <Pencil className="h-4 w-4" />
                  <span className="sr-only">تعديل</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onUploadDocument(partner.id)}
                  className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                >
                  <Upload className="h-4 w-4" />
                  <span className="sr-only">رفع مستند</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(partner.id)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash className="h-4 w-4" />
                  <span className="sr-only">حذف</span>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
