
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAutoSave } from "@/hooks/useAutoSave";

// Define the Client type here since it's not defined in @/types/database
interface Client {
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
  created_at?: string;
  updated_at?: string;
}

type ClientFormProps = {
  initialData?: Client;
  onSubmit?: (data: Client) => void;
  onSuccess?: () => void;
};

const ClientForm: React.FC<ClientFormProps> = ({ initialData, onSubmit, onSuccess }) => {

const { formData, setFormData, isLoading } = useAutoSave<Partial<Client>>({
  formType: "client_form",
  initialData: initialData || {}
});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit && formData) {
      onSubmit(formData as Client);
      if (onSuccess) {
        onSuccess();
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Client Information</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              value={formData?.name || ""}
              onChange={handleChange}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData?.email || ""}
              onChange={handleChange}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              name="phone"
              value={formData?.phone || ""}
              onChange={handleChange}
            />
          </div>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Client"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ClientForm;
