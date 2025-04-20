
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export function StrategicPlan() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>الخطة الاستراتيجية</CardTitle>
        <CardDescription>تحديد الرؤية والرسالة والأهداف</CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <div className="space-y-2">
          <Label>الرؤية</Label>
          <Textarea placeholder="ما هو طموحنا وما نسعى لتحقيقه" />
        </div>
        <div className="space-y-2">
          <Label>الرسالة</Label>
          <Textarea placeholder="كيف سنحقق رؤيتنا وما هي قيمنا" />
        </div>
        <div className="space-y-2">
          <Label>القيم</Label>
          <Textarea placeholder="القيم الأساسية التي تحكم عملنا" />
        </div>
        <div className="space-y-2">
          <Label>الأهداف الاستراتيجية</Label>
          <Textarea placeholder="الأهداف الرئيسية للسنوات القادمة" />
        </div>
        <div className="space-y-2">
          <Label>مؤشرات الأداء</Label>
          <Textarea placeholder="كيف سنقيس نجاحنا في تحقيق الأهداف" />
        </div>
      </CardContent>
    </Card>
  )
}
