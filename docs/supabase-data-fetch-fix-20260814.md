# تشخيص وإصلاح جلب بيانات Supabase — 14 أغسطس 2026

## السبب الجذري

ظهر في سجلات واجهة REST عدد كبير من أخطاء `404` عند جلب جداول ERP، ومنها `journal_entries` و`employees` و`chart_of_accounts` و`company_partners` و`capital_management`.

فحص الاستجابة التفصيلية لمسار `capital_management` كشف الخطأ الفعلي التالي:

```json
{
  "code": "42883",
  "message": "operator does not exist: public.app_role = text"
}
```

السبب هو أن عمود `user_roles.role` من النوع `public.app_role`، بينما دوال RLS القديمة `has_role(text)` و`has_any_role(uuid, text[])` كانت تقارنه مباشرة بقيم `text`. هذا يجعل سياسات RLS تفشل وقت تنفيذ استعلام REST بدلاً من تصفية الصفوف فقط.

## الإصلاح المنشور

| الترحيلة | الإجراء |
|---|---|
| `20260814003000_fix_role_enum_rls_data_fetch` | تعديل `has_any_role` لاستخدام `role::text = ANY(_roles)` وإعادة تحميل مخطط PostgREST. |
| `20260814004000_fix_has_role_enum_rls` | تعديل دالتي `has_role` إلى مقارنة `role::text = _role` وإعادة تحميل مخطط PostgREST. |

كما أُرسلت إشارة `NOTIFY pgrst, 'reload schema'` وفُحص طابور الإشعارات عبر `pg_notification_queue_usage()`؛ وكانت النتيجة `0`.

## التحقق

بعد الإصلاح أعاد استدعاء REST لجدول `capital_management` رمز `HTTP 200` بدلاً من `404`. كذلك أعادت المسارات الأساسية `journal_entries` و`employees` و`chart_of_accounts` و`company_partners` رمز `HTTP 200` عند اختبار واجهة REST. تظهر استجابات فارغة عند الاختبار بمفتاح `anon` لأن سياسات RLS لا تعرض بيانات مالية دون جلسة مستخدم مخولة؛ وهذا سلوك أمني متوقع وليس فشل جلب.

## أخطاء مستقلة متبقية في السجل

| المسار | الحالة | الملاحظة |
|---|---:|---|
| `attendance_records` | 400 | طلب الواجهة يمرر تاريخ نهاية غير صالح: `2026-08-32`. |
| `projects` | 400 | الاستعلام يطلب الحقول `budget` و`contract_value`؛ يلزم مطابقة الحقول مع المخطط المنشور. |
| `capital_history` | 404 | عملية `POST` حديثة تحتاج مراجعة فصلية لمسار الكتابة وحقول الإدراج، وهي منفصلة عن عطل القراءة الأساسي. |

## مرجع

اتبعت إعادة تحميل مخطط PostgREST الإجراء الرسمي في Supabase: <https://supabase.com/docs/guides/troubleshooting/refresh-postgrest-schema>.

## تصحيحات الواجهة والتحقق النهائي

تم تصحيح `AttendanceManagement.tsx` ليستخدم اليوم الأول من الشهر التالي كحد علوي حصري بدلاً من إنشاء قيمة غير صالحة من النمط `YYYY-MM-32`. وتم كذلك تصحيح لوحة الإدارة التنفيذية لتستعلم عن `projects.revenue` بدلاً من `projects.contract_value` غير الموجود في جدول المشاريع.

أعادت اختبارات REST النهائية الرموز التالية:

| الاختبار | النتيجة |
|---|---:|
| `capital_management` بعد إصلاح RLS | 200 |
| `capital_history` بعد إصلاح RLS | 200 |
| نطاق `attendance_records` من بداية الشهر إلى بداية الشهر التالي | 200 |
| استعلام مؤشرات `projects` باستخدام `budget,revenue` | 200 |
| اختبارات الوحدة | ناجحة |
| فحص الجودة | 0 أخطاء، مع تحذيرات أنواع قديمة موجودة سابقاً |
| بناء الإنتاج | ناجح |

> اختبار REST بمفتاح `anon` لا يثبت عرض بيانات مالية فعلية لأنه لا يحمل جلسة مستخدم. يثبت الاختبار أن المسار وسياسة RLS لا يفشلان تقنياً؛ أما العرض الفعلي فيتطلب مستخدماً مسجلاً يملك دوراً مالياً أو إدارياً مناسباً.
