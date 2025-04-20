
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export function SwotAnalysis() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>تحليل SWOT</CardTitle>
        <CardDescription>تحليل نقاط القوة والضعف والفرص والتحديات</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-4">
            <div className="p-4 bg-green-50 dark:bg-green-900/10 rounded-lg">
              <Label className="text-green-700 dark:text-green-300">نقاط القوة</Label>
              <Textarea 
                placeholder="أدخل نقاط القوة الرئيسية للشركة"
                className="mt-2"
              />
            </div>
            <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg">
              <Label className="text-amber-700 dark:text-amber-300">الفرص</Label>
              <Textarea 
                placeholder="أدخل الفرص المتاحة في السوق"
                className="mt-2"
              />
            </div>
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-lg">
              <Label className="text-red-700 dark:text-red-300">نقاط الضعف</Label>
              <Textarea 
                placeholder="أدخل نقاط الضعف التي تحتاج للتحسين"
                className="mt-2"
              />
            </div>
            <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg">
              <Label className="text-blue-700 dark:text-blue-300">التحديات</Label>
              <Textarea 
                placeholder="أدخل التحديات والمخاطر المحتملة"
                className="mt-2"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
