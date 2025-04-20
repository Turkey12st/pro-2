
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export function PestelAnalysis() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>تحليل PESTEL</CardTitle>
        <CardDescription>تحليل العوامل الخارجية المؤثرة</CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <div className="space-y-2">
          <Label>العوامل السياسية</Label>
          <Textarea placeholder="التشريعات والقوانين المؤثرة على العمل" />
        </div>
        <div className="space-y-2">
          <Label>العوامل الاقتصادية</Label>
          <Textarea placeholder="الوضع الاقتصادي وتأثيره على العمل" />
        </div>
        <div className="space-y-2">
          <Label>العوامل الاجتماعية</Label>
          <Textarea placeholder="العادات والتقاليد والتغيرات الاجتماعية" />
        </div>
        <div className="space-y-2">
          <Label>العوامل التقنية</Label>
          <Textarea placeholder="التطورات التقنية وتأثيرها على العمل" />
        </div>
        <div className="space-y-2">
          <Label>العوامل البيئية</Label>
          <Textarea placeholder="القضايا البيئية والاستدامة" />
        </div>
        <div className="space-y-2">
          <Label>العوامل القانونية</Label>
          <Textarea placeholder="القوانين واللوائح التنظيمية" />
        </div>
      </CardContent>
    </Card>
  )
}
