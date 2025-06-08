
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSimpleEmployees, SimpleEmployee } from '@/hooks/useSimpleEmployees';
import { User, Mail, Phone, Building, DollarSign } from 'lucide-react';

interface SimpleEmployeeFormProps {
  onSuccess?: () => void;
}

export default function SimpleEmployeeForm({ onSuccess }: SimpleEmployeeFormProps) {
  const { addEmployee, loading } = useSimpleEmployees();
  const [formData, setFormData] = useState<Omit<SimpleEmployee, 'id'>>({
    name: '',
    identity_number: '',
    birth_date: '',
    nationality: 'سعودي',
    position: '',
    department: '',
    salary: 0,
    joining_date: '',
    contract_type: 'full-time',
    email: '',
    phone: '',
    base_salary: 0,
    housing_allowance: 0,
    transportation_allowance: 0,
  });

  const handleInputChange = (field: keyof typeof formData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // حساب الراتب الإجمالي
    const totalSalary = (formData.base_salary || 0) + (formData.housing_allowance || 0) + (formData.transportation_allowance || 0);
    
    const finalData = {
      ...formData,
      salary: totalSalary || formData.salary
    };

    const result = await addEmployee(finalData);
    if (result && onSuccess) {
      onSuccess();
      // إعادة تعيين النموذج
      setFormData({
        name: '',
        identity_number: '',
        birth_date: '',
        nationality: 'سعودي',
        position: '',
        department: '',
        salary: 0,
        joining_date: '',
        contract_type: 'full-time',
        email: '',
        phone: '',
        base_salary: 0,
        housing_allowance: 0,
        transportation_allowance: 0,
      });
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          إضافة موظف جديد
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">الاسم الكامل</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="أدخل الاسم الكامل"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="identity_number">رقم الهوية</Label>
              <Input
                id="identity_number"
                value={formData.identity_number}
                onChange={(e) => handleInputChange('identity_number', e.target.value)}
                placeholder="أدخل رقم الهوية"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="أدخل البريد الإلكتروني"
                  className="pl-9"
                  dir="ltr"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">رقم الهاتف</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="أدخل رقم الهاتف"
                  className="pl-9"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="position">المنصب</Label>
              <div className="relative">
                <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="position"
                  value={formData.position}
                  onChange={(e) => handleInputChange('position', e.target.value)}
                  placeholder="أدخل المنصب"
                  className="pl-9"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">القسم</Label>
              <Input
                id="department"
                value={formData.department}
                onChange={(e) => handleInputChange('department', e.target.value)}
                placeholder="أدخل القسم"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="birth_date">تاريخ الميلاد</Label>
              <Input
                id="birth_date"
                type="date"
                value={formData.birth_date}
                onChange={(e) => handleInputChange('birth_date', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="joining_date">تاريخ الالتحاق</Label>
              <Input
                id="joining_date"
                type="date"
                value={formData.joining_date}
                onChange={(e) => handleInputChange('joining_date', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nationality">الجنسية</Label>
              <Select value={formData.nationality} onValueChange={(value) => handleInputChange('nationality', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر الجنسية" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="سعودي">سعودي</SelectItem>
                  <SelectItem value="غير سعودي">غير سعودي</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contract_type">نوع العقد</Label>
              <Select value={formData.contract_type} onValueChange={(value) => handleInputChange('contract_type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر نوع العقد" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full-time">دوام كامل</SelectItem>
                  <SelectItem value="part-time">دوام جزئي</SelectItem>
                  <SelectItem value="contract">عقد</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="base_salary">الراتب الأساسي</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="base_salary"
                  type="number"
                  value={formData.base_salary}
                  onChange={(e) => handleInputChange('base_salary', parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  className="pl-9"
                  min="0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="housing_allowance">بدل السكن</Label>
              <Input
                id="housing_allowance"
                type="number"
                value={formData.housing_allowance}
                onChange={(e) => handleInputChange('housing_allowance', parseFloat(e.target.value) || 0)}
                placeholder="0"
                min="0"
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'جاري الحفظ...' : 'حفظ الموظف'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
