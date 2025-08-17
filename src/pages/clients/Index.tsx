import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Mail, Phone, User } from 'lucide-react';

interface Client {
  id: string;
  name: string;
  phone: string;
  email?: string;
  company?: string;
  address?: string;
  created_at: string;
}

const ClientsPage = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const [clientForm, setClientForm] = useState({
    name: '',
    phone: '',
    email: '',
    company: '',
    address: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientForm.name.trim() || !clientForm.phone.trim()) {
      toast({
        variant: "destructive",
        title: "بيانات ناقصة",
        description: "الاسم ورقم الهاتف مطلوبان"
      });
      return;
    }

    setIsLoading(true);

    try {
      const newClient: Client = {
        id: editingClient?.id || Math.random().toString(36).substr(2, 9),
        name: clientForm.name.trim(),
        phone: clientForm.phone.trim(),
        email: clientForm.email.trim() || undefined,
        company: clientForm.company.trim() || undefined,
        address: clientForm.address.trim() || undefined,
        created_at: editingClient?.created_at || new Date().toISOString()
      };

      if (editingClient) {
        setClients(clients.map(client => client.id === editingClient.id ? newClient : client));
        toast({
          title: "تم تحديث العميل",
          description: "تم تحديث بيانات العميل بنجاح"
        });
      } else {
        setClients([...clients, newClient]);
        toast({
          title: "تم إضافة العميل",
          description: "تم إضافة العميل بنجاح"
        });
      }

      resetForm();
      setShowDialog(false);
    } catch (error) {
      console.error('Error saving client:', error);
      toast({
        variant: "destructive",
        title: "خطأ في حفظ العميل",
        description: "حدث خطأ أثناء حفظ بيانات العميل"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (clientId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا العميل؟')) return;

    setClients(clients.filter(client => client.id !== clientId));
    toast({
      title: "تم حذف العميل",
      description: "تم حذف العميل بنجاح"
    });
  };

  const resetForm = () => {
    setClientForm({
      name: '',
      phone: '',
      email: '',
      company: '',
      address: ''
    });
    setEditingClient(null);
  };

  const openEditDialog = (client: Client) => {
    setEditingClient(client);
    setClientForm({
      name: client.name,
      phone: client.phone,
      email: client.email || '',
      company: client.company || '',
      address: client.address || ''
    });
    setShowDialog(true);
  };

  return (
    <AppLayout>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">إدارة العملاء</h1>
          <Button onClick={() => setShowDialog(true)} className="flex items-center gap-2">
            <Plus size={16} />
            إضافة عميل جديد
          </Button>
        </div>

        {/* Clients Grid */}
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
                    <div className="flex items-center gap-2 text-sm">
                      <Phone size={14} className="text-muted-foreground" />
                      <span>{client.phone}</span>
                    </div>
                    {client.email && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail size={14} className="text-muted-foreground" />
                        <span>{client.email}</span>
                      </div>
                    )}
                    {client.company && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">الشركة: </span>
                        <span>{client.company}</span>
                      </div>
                    )}
                    {client.address && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">العنوان: </span>
                        <span>{client.address}</span>
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

        {/* Add/Edit Client Dialog */}
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent>
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
                <Label htmlFor="phone">رقم الهاتف *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={clientForm.phone}
                  onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })}
                  required
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
                <Label htmlFor="company">الشركة</Label>
                <Input
                  id="company"
                  value={clientForm.company}
                  onChange={(e) => setClientForm({ ...clientForm, company: e.target.value })}
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
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'جاري الحفظ...' : (editingClient ? 'تحديث' : 'إضافة')}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default ClientsPage;