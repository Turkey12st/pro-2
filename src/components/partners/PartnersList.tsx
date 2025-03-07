import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import PartnerForm from "./PartnerForm";
import { User, Building, MoreHorizontal, Pencil, Trash, Search } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Partner } from "@/types/database";

const PartnersList = () => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [filteredPartners, setFilteredPartners] = useState<Partner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchPartners();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = partners.filter(partner => 
        partner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        partner.partner_type.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredPartners(filtered);
    } else {
      setFilteredPartners(partners);
    }
  }, [searchTerm, partners]);

  const fetchPartners = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("company_partners")
        .select("*");
      
      if (error) throw error;

      const transformedPartners: Partner[] = (data || []).map(p => ({
        id: p.id || p.created_at,
        name: p.name,
        partner_type: p.partner_type || 'individual',
        ownership_percentage: p.ownership_percentage,
        share_value: p.share_value || 0,
        contact_info: p.contact_info || {},
        documents: p.documents || [],
        created_at: p.created_at,
        updated_at: p.updated_at
      }));
      
      setPartners(transformedPartners);
      setFilteredPartners(transformedPartners);
    } catch (error) {
      console.error("Error fetching partners:", error);
      toast({
        title: "خطأ في جلب البيانات",
        description: "حدث خطأ أثناء محاولة جلب بيانات الشركاء.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditPartner = (partnerId: string) => {
    setSelectedPartnerId(partnerId);
    setIsEditDialogOpen(true);
  };

  const handleDeletePartner = async (partnerId: string) => {
    try {
      const { error } = await supabase
        .from("company_partners")
        .delete()
        .eq("id", partnerId);

      if (error) throw error;

      toast({
        title: "تم حذف الشريك",
        description: "تم حذف بيانات الشريك بنجاح",
      });

      fetchPartners();
    } catch (error) {
      console.error("Error deleting partner:", error);
      toast({
        title: "خطأ في حذف البيانات",
        description: "حدث خطأ أثناء محاولة حذف بيانات الشريك.",
        variant: "destructive",
      });
    }
  };

  const formatPercentage = (value: number) => {
    return `${value}%`;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(value);
  };

  const getPartnerTypeIcon = (type: string) => {
    return type === 'individual' ? 
      <User className="h-4 w-4 text-blue-500" /> : 
      <Building className="h-4 w-4 text-purple-500" />;
  };

  const getPartnerTypeLabel = (type: string) => {
    return type === 'individual' ? 'فرد' : 'شركة';
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="mb-4 flex justify-between items-center">
            <Skeleton className="h-10 w-[200px]" />
            <Skeleton className="h-10 w-[100px]" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="mb-6 flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="بحث عن شريك..." 
              className="pl-3 pr-9 w-full sm:w-[300px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {filteredPartners.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">لا توجد بيانات للعرض</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">الاسم</TableHead>
                  <TableHead className="text-right">النوع</TableHead>
                  <TableHead className="text-right">نسبة الملكية</TableHead>
                  <TableHead className="text-right">قيمة الحصة</TableHead>
                  <TableHead className="text-right">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPartners.map((partner) => (
                  <TableRow key={partner.id}>
                    <TableCell className="font-medium">{partner.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getPartnerTypeIcon(partner.partner_type)}
                        <span>{getPartnerTypeLabel(partner.partner_type)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono">
                        {formatPercentage(partner.ownership_percentage)}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatCurrency(partner.share_value)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>خيارات</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleEditPartner(partner.id)}>
                            <Pencil className="h-4 w-4 ml-2" />
                            تعديل
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeletePartner(partner.id)}
                            className="text-red-500 focus:text-red-500"
                          >
                            <Trash className="h-4 w-4 ml-2" />
                            حذف
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>تعديل بيانات الشريك</DialogTitle>
            </DialogHeader>
            {selectedPartnerId && (
              <PartnerForm 
                initialData={partners.find(p => p.id === selectedPartnerId)}
                onSuccess={() => {
                  setIsEditDialogOpen(false);
                  fetchPartners();
                }} 
              />
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default PartnersList;
