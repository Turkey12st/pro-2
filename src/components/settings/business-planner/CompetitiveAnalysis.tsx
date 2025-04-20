
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export function CompetitiveAnalysis() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>استراتيجية المنافسة</CardTitle>
        <CardDescription>تحليل القوى التنافسية الخمس لبورتر</CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <div className="space-y-2">
          <Label>المنافسون الحاليون</Label>
          <Textarea placeholder="تحليل المنافسين الحاليين في السوق" />
        </div>
        <div className="space-y-2">
          <Label>المنافسون المحتملون</Label>
          <Textarea placeholder="تحليل احتمالية دخول منافسين جدد" />
        </div>
        <div className="space-y-2">
          <Label>قوة المشترين</Label>
          <Textarea placeholder="تحليل قوة التفاوض للعملاء" />
        </div>
        <div className="space-y-2">
          <Label>قوة الموردين</Label>
          <Textarea placeholder="تحليل قوة التفاوض للموردين" />
        </div>
        <div className="space-y-2">
          <Label>تهديد المنتجات البديلة</Label>
          <Textarea placeholder="تحليل المنتجات والخدمات البديلة" />
        </div>
      </CardContent>
    </Card>
  )
}
