
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { SaveIcon, CheckCircle2, AlertCircle } from 'lucide-react';
import useAutoSave from '@/hooks/useAutoSave';

interface AutoSaveDocumentFormProps {
  children: React.ReactNode;
  title: string;
  formType: string;
  initialData?: unknown;
  onSubmit?: (data: unknown) => void;
}

const AutoSaveDocumentForm: React.FC<AutoSaveDocumentFormProps> = ({
  children,
  title,
  formType,
  initialData,
  onSubmit,
}) => {
  const { formData, setFormData, isLoading, saveData, lastSaved } = useAutoSave({
    formType,
    initialData,
  });

  const handleManualSave = async () => {
    const success = await saveData();
    if (success && onSubmit) {
      onSubmit(formData);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          {lastSaved ? (
            <>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>آخر حفظ تلقائي: {lastSaved}</span>
            </>
          ) : (
            <>
              <AlertCircle className="h-4 w-4 text-amber-500" />
              <span>لم يتم الحفظ بعد</span>
            </>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child as React.ReactElement<any>, {
              formData,
              setFormData,
            });
          }
          return child;
        })}
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-sm text-muted-foreground">
          {isLoading ? 'جاري الحفظ...' : 'يتم الحفظ تلقائيًا عند إدخال البيانات'}
        </div>
        <Button onClick={handleManualSave} disabled={isLoading}>
          <SaveIcon className="ml-2 h-4 w-4" />
          حفظ
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AutoSaveDocumentForm;
