import React, { useState, useEffect } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Mail, Phone, User, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useCompanyContext } from '@/hooks/useCompanyContext';

interface Client {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  type: string;
  contact_person: string | null;
  cr_number: string | null;
  vat_number: string | null;
  address: any;
  created_at: string;
  company_id: string | null;
}

const ClientsPage = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const { getCompanyId } = useCompanyContext();

  const [clientForm, setClientForm] = useState({
    name: '',
    phone: '',
    email: '',
    type: 'individual',
    contact_person: '',
    cr_number: '',
    vat_number: '',
    address: ''
  });

  // Fetch clients on component mount
  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    setIsLoading(true);
    try {
      const companyId = await getCompanyId();
      
      let query = supabase.from('clients').select('*').order('created_at', { ascending: false });
      
      if (companyId) {
        query = query.eq('company_id', companyId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast({
        variant: "destructive",
        title: "خطأ في تحميل العملاء",
        description: "حدث خطأ أثناء تحميل بيانات العملاء"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientForm.name.trim()) {
      toast({
        variant: "destructive",
        title: "بيانات ناقصة",
        description: "الاسم مطلوب"
      });
      return;
    }

    setIsSaving(true);

    try {
      const companyId = await getCompanyId();
      
      const clientData = {
        name: clientForm.name.trim(),
        phone: clientForm.phone.trim() || null,
        email: clientForm.email.trim() || null,
        type: clientForm.type || 'individual',
        contact_person: clientForm.contact_person.trim() || null,
        cr_number: clientForm.cr_number.trim() || null,
        vat_number: clientForm.vat_number.trim() || null,
        address: clientForm.address ? { street: clientForm.address } : null,
        company_id: companyId
      };

      if (editingClient) {
        const { error } = await supabase
          .from('clients')
          .update(clientData)
          .eq('id', editingClient.id);
          
        if (error) throw error;
        
        toast({
          title: "تم تحديث العميل",
          description: "تم تحديث بيانات العميل بنجاح"
        });
      } else {
        const { error } = await supabase
          .from('clients')
          .insert(clientData);
          
        if (error) throw error;
        
        toast({
          title: "تم إضافة العميل",
          description: "تم إضافة العميل بنجاح"
        });
      }

      resetForm();
      setShowDialog(false);
      fetchClients();
    } catch (error) {
      console.error('Error saving client:', error);
      toast({
        variant: "destructive",
        title: "خطأ في حفظ العميل",
        description: "حدث خطأ أثناء حفظ بيانات العميل"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (clientId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا العميل؟')) return;

    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', clientId);
        
      if (error) throw error;
      
      setClients(clients.filter(client => client.id !== clientId));
      toast({
        title: "تم حذف العميل",
        description: "تم حذف العميل بنجاح"
      });
    } catch (error) {
      console.error('Error deleting client:', error);
      toast({
        variant: "destructive",
        title: "خطأ في حذف العميل",
        description: "حدث خطأ أثناء حذف العميل"
      });
    }
  };

  const resetForm = () => {
    setClientForm({
      name: '',
      phone: '',
      email: '',
      type: 'individual',
      contact_person: '',
      cr_number: '',
      vat_number: '',
      address: ''
    });
    setEditingClient(null);
  };

  const openEditDialog = (client: Client) => {
    setEditingClient(client);
    setClientForm({
      name: client.name,
      phone: client.phone || '',
      email: client.email || '',
      type: client.type || 'individual',
      contact_person: client.contact_person || '',
      cr_number: client.cr_number || '',
      vat_number: client.vat_number || '',
      address: (client.address as any)?.street || ''
    });
    setShowDialog(true);
  };

  return (
    <>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">إدارة العملاء</h1>
          <Button onClick={() => setShowDialog(true)} className="flex items-center gap-2">
            <Plus size={16} />
            إضافة عميل جديد
          </Button>
        </div>

        {/* Clients Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clients.length === 0 ? (
              <Card className="col-span-full">
                <CardContent className="p-8 text-center">
                  <User size={48} className="mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">لا توجد عملاء مضافين بعد</p>
                  <p className="text-sm text-muted-foreground mt-2">ابدأ بإضافة عميل جديد</p>
                </CardContent>
              </Card>
            ) : (
              clients.map((client) => (
                <Card key={client.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{client.name}</CardTitle>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openEditDialog(client)}
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(client.id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {client.phone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone size={14} className="text-muted-foreground" />
                          <span>{client.phone}</span>
                        </div>
                      )}
                      {client.email && (
                        <div className="flex items-center gap-2 text-sm">
                          <Mail size={14} className="text-muted-foreground" />
                          <span>{client.email}</span>
                        </div>
                      )}
                      {client.contact_person && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">جهة الاتصال: </span>
                          <span>{client.contact_person}</span>
                        </div>
                      )}
                      {client.cr_number && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">السجل التجاري: </span>
                          <span>{client.cr_number}</span>
                        </div>
                      )}
                      <div className="text-xs text-muted-foreground pt-2">
                        تاريخ الإضافة: {new Date(client.created_at).toLocaleDateString('ar-SA')}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {/* Add/Edit Client Dialog */}
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingClient ? 'تعديل بيانات العميل' : 'إضافة عميل جديد'}
              </DialogTitle>
              <DialogDescription>
                أدخل بيانات العميل كاملة
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">الاسم *</Label>
                <Input
                  id="name"
                  value={clientForm.name}
                  onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="phone">رقم الهاتف</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={clientForm.phone}
                  onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <Input
                  id="email"
                  type="email"
                  value={clientForm.email}
                  onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="contact_person">جهة الاتصال</Label>
                <Input
                  id="contact_person"
                  value={clientForm.contact_person}
                  onChange={(e) => setClientForm({ ...clientForm, contact_person: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="cr_number">رقم السجل التجاري</Label>
                <Input
                  id="cr_number"
                  value={clientForm.cr_number}
                  onChange={(e) => setClientForm({ ...clientForm, cr_number: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="vat_number">الرقم الضريبي</Label>
                <Input
                  id="vat_number"
                  value={clientForm.vat_number}
                  onChange={(e) => setClientForm({ ...clientForm, vat_number: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="address">العنوان</Label>
                <Input
                  id="address"
                  value={clientForm.address}
                  onChange={(e) => setClientForm({ ...clientForm, address: e.target.value })}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => { resetForm(); setShowDialog(false); }}>
                  إلغاء
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      جاري الحفظ...
                    </>
                  ) : (
                    editingClient ? 'تحديث' : 'إضافة'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default ClientsPage;
