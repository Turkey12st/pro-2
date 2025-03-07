
import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import * as XLSX from "xlsx";
import { useToast } from "@/hooks/use-toast";

const EmployeeImport: React.FC = () => {
  const [importFile, setImportFile] = useState(null);
  const { toast } = useToast();
  const fileInputRef = useRef(null);

  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImportFile(file);
      processImportedFile(file);
    }
  };

  const processImportedFile = (file) => {
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const binaryStr = evt.target.result;
        const workbook = XLSX.read(binaryStr, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        if (jsonData.length === 0) {
          throw new Error("الملف لا يحتوي على بيانات");
        }
        
        // Process the imported data
        // In a real application, you would validate and transform this data
        // and then send it to your database
        
        console.log("Imported data:", jsonData);
        
        toast({
          title: "تم استيراد البيانات",
          description: `تم استيراد ${jsonData.length} سجل بنجاح.`,
        });
        
        // In a real app, you would update the database and then refetch:
        // fetchEmployees();
        
      } catch (error) {
        console.error("Error processing imported file:", error);
        toast({
          title: "خطأ في معالجة الملف",
          description: error.message || "حدث خطأ أثناء معالجة الملف المستورد.",
          variant: "destructive",
        });
      }
    };
    
    reader.onerror = (error) => {
      console.error("File reading error:", error);
      toast({
        title: "خطأ في قراءة الملف",
        description: "حدث خطأ أثناء محاولة قراءة الملف.",
        variant: "destructive",
      });
    };
    
    reader.readAsBinaryString(file);
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept=".xlsx,.xls"
        onChange={handleFileChange}
      />
      <Button 
        variant="outline" 
        size="sm" 
        className="flex items-center gap-2"
        onClick={handleImportClick}
      >
        <Upload className="h-4 w-4" />
        استيراد من Excel
      </Button>
    </>
  );
};

export default EmployeeImport;
