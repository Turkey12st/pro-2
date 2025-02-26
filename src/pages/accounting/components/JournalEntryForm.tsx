// src/components/JournalEntryForm.tsx
import { useState } from "react";

type JournalEntryFormProps = {
  initialData?: { description: string; amount: number }; // بيانات القيد إذا كان النموذج في وضع التعديل
  onSuccess: (data: { description: string; amount: number }) => void; // دالة تنفذ عند حفظ البيانات
  onClose: () => void; // دالة تنفذ عند إغلاق النموذج
};

export default function JournalEntryForm({
  initialData,
  onSuccess,
  onClose,
}: JournalEntryFormProps) {
  const [description, setDescription] = useState(initialData?.description || "");
  const [amount, setAmount] = useState(initialData?.amount || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || amount <= 0) {
      alert("يرجى إدخال وصف صحيح ومبلغ أكبر من صفر.");
      return;
    }
    onSuccess({ description, amount });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium">الوصف</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border rounded-md"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">المبلغ</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="mt-1 block w-full px-3 py-2 border rounded-md"
        />
      </div>
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 border rounded-md"
        >
          إلغاء
        </button>
        <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md">
          حفظ
        </button>
      </div>
    </form>
  );
}
