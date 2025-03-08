
import React, { useEffect, useState } from "react";
import { useAutoSave } from "@/hooks/useAutoSave";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, Save } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { formatDistanceToNow } from "date-fns";
import { arSA } from "date-fns/locale";

interface AutoSaveDocumentFormProps {
  formType: string;
  formData: any;
  onSave: (data: any) => Promise<void>;
  isValid?: boolean;
  children: React.ReactNode;
}

export const AutoSaveDocumentForm: React.FC<AutoSaveDocumentFormProps> = ({
  formType,
  formData,
  onSave,
  isValid = true,
  children,
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<Date | null>(null);
  const [showSavedMessage, setShowSavedMessage] = useState(false);

  // AutoSave hook
  const { saveData, lastSavedAt, loading } = useAutoSave({
    formType,
    data: formData,
    enabled: isValid,
  });

  // Update the last saved time whenever lastSavedAt changes
  useEffect(() => {
    if (lastSavedAt) {
      setLastSavedTime(new Date(lastSavedAt));
    }
  }, [lastSavedAt]);

  // Handle manual save
  const handleManualSave = async () => {
    if (!isValid) return;
    
    setIsSaving(true);
    try {
      // Call the provided onSave function
      await onSave(formData);
      
      // Update the save timestamp and show saved message
      setLastSavedTime(new Date());
      setShowSavedMessage(true);
      
      // Hide the saved message after 3 seconds
      setTimeout(() => {
        setShowSavedMessage(false);
      }, 3000);
    } catch (error) {
      console.error("Error saving document:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Format the relative time for display
  const getRelativeTimeString = () => {
    if (!lastSavedTime) return "لم يتم الحفظ بعد";
    
    return formatDistanceToNow(lastSavedTime, {
      addSuffix: true,
      locale: arSA
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 space-x-reverse">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {loading ? "جاري الحفظ التلقائي..." : `آخر حفظ: ${getRelativeTimeString()}`}
          </span>
        </div>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={handleManualSave}
                disabled={isSaving || !isValid || loading}
                className="flex items-center space-x-1 space-x-reverse"
              >
                {showSavedMessage ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 ml-1 text-green-500" />
                    <span>تم الحفظ</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 ml-1" />
                    <span>حفظ</span>
                  </>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isValid ? "حفظ التغييرات" : "أكمل البيانات المطلوبة"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {children}
    </div>
  );
};
