# تنفيذ محرك القيود الخادمي الذري

**المستودع:** `Turkey12st/pro-2`  
**المواصفة المرتبطة:** `docs/acceptance/financial-posting.feature`  
**الهدف:** جعل إنشاء القيود وترحيلها عملية خادمية واحدة، ذرية، متوازنة، معزولة بحسب الشركة، قابلة للتدقيق، ومحمية من التكرار.

> لا تنشئ واجهة React قيوداً أو بنود قيود مباشرة. وظيفة الواجهة هي تقديم مستند تشغيلي معتمد أو طلب ترحيل، أما التحقق المحاسبي والكتابة والترحيل والتدقيق فتتم داخل قاعدة البيانات أو خدمة خادمية موثوقة فقط.

## 1. العقد البرمجي المستهدف

ينبغي أن يكون هناك عقد واحد لإنشاء طلب قيد، وعقد منفصل لاعتماد/ترحيل القيد عندما تقتضي سياسة فصل المهام ذلك. لا تستخدم الدوال الجديدة `accounting_transactions` كدفتر أستاذ بديل؛ يظل `journal_entries` و`journal_entry_items` المصدر المحاسبي الوحيد للحقيقة.

| الدالة | المستدعي المسموح | الغرض | الحالة الناتجة |
|---|---|---|---|
| `create_accounting_event` | مستخدم مخول أو خدمة موثوقة | التحقق من المستند والمصدر، وإنشاء رأس قيد draft وبنوده وحدث عدم التكرار. | `draft` أو نتيجة الحدث السابق. |
| `approve_and_post_journal_entry` | معتمد مالي مخول | التحقق النهائي من فصل المهام والفترة والتوازن، ثم ترحيل القيد. | `posted` أو `cancelled`. |
| `reverse_posted_journal_entry` | معتمد مخول | إنشاء قيد عكسي جديد مرتبط بالقيد الأصلي، من دون تعديله. | قيد عكسي `posted` أو `draft` وفق سير الاعتماد. |
| `get_accounting_event_result` | مستخدم يملك حق عرض الشركة | إعادة نتيجة عملية أُرسلت سابقاً بمفتاح عدم تكرار. | قراءة فقط. |

تدعم الدالة الأولى الترحيل الآلي بتمرير `p_auto_post = true` **فقط** للأحداث التشغيلية المعتمدة التي تسمح بها السياسة. أما القيود اليدوية فتبدأ دائماً في حالة `draft` ثم تعتمد بواسطة مستخدم آخر عند تفعيل الفصل بين المهام.

### 1.1 مدخلات `create_accounting_event`

```sql
create or replace function public.create_accounting_event(
  p_company_id uuid,
  p_source_type text,
  p_source_id uuid,
  p_accounting_event text,
  p_entry_date date,
  p_description text,
  p_currency text,
  p_idempotency_key uuid,
  p_lines jsonb,
  p_auto_post boolean default false
) returns jsonb;
```

تتكون `p_lines` من مصفوفة JSON؛ كل عنصر يحمل `account_id` و`description` و`debit` و`credit` وحقول اختيارية للأبعاد مثل `cost_center_id` و`project_id` و`tax_code`. يجب أن يحتوي أي بند على مبلغ مدين **أو** دائن موجب فقط، وليس كليهما ولا صفراً.

مثال طلب صحيح لمستند مبيعات بعد اعتماد فاتورة المبيعات:

```json
[
  {"account_id":"<ar-id>","description":"ذمم العميل - INV-1001","debit":1150.00,"credit":0},
  {"account_id":"<revenue-id>","description":"إيراد مبيعات - INV-1001","debit":0,"credit":1000.00},
  {"account_id":"<vat-output-id>","description":"ضريبة قيمة مضافة مخرجات - INV-1001","debit":0,"credit":150.00}
]
```

## 2. التغييرات البرمجية مرتبة بحسب التنفيذ

### الخطوة 0: تثبيت الخط الأساسي ومنع المسارات الخطرة

لا تُنفذ أي ترحيلات جديدة قبل أخذ نسخة احتياطية واستخراج قائمة القيود الحالية والحالة ومجاميع المدين والدائن ومصادرها. أنشئ تقرير تسوية يحدد القيود غير المتوازنة أو المكررة أو غير المرتبطة بمصدر. لا تُعدل القيود التاريخية مباشرة؛ تُعالج لاحقاً بقيود عكس/تصحيح موثقة.

أوقف استدعاء `FinancialIntegrationService.createAutomaticJournalEntry` بصورته الحالية لأنه يكتب من المتصفح إلى رؤوس القيود وبنودها مباشرة. كما يجب إيقاف أو إعادة بناء `supabase/functions/accounting-automation/index.ts` لأنه ينشئ مبالغ كلية لا تمثل قيوداً مزدوجة مكتملة.

| الملف الحالي | التغيير المطلوب | سبب التغيير |
|---|---|---|
| `src/services/financialIntegrationService.ts` | تحويله إلى عميل RPC رقيق لا ينفذ insert/update في جداول الأستاذ. | منع الترحيل المباشر من المتصفح. |
| `src/services/automationService.ts` | استبدال `linkEmployeeSalary` بنداء حدث رواتب موحد يعتمد `salary_record_id`. | منع مسار رواتب ثانٍ واحتمال التكرار. |
| `src/services/employeeAccountingService.ts` | اعتماد دالة الحدث الموحد بدلاً من دالة رواتب موازية أو تغليف الدالة القديمة به. | مصدر واحد للقيد. |
| `supabase/functions/accounting-automation/index.ts` | تعطيله مؤقتاً أو تحويله إلى متحقق من JWT يستدعي RPC الموثوق فقط. | إزالة منطق القيد غير المتوازن. |
| `src/services/dataIntegrationService.ts` | حذف أي استدعاء إنتاجي لتعديلات افتراضية أو عشوائية. | منع تلويث البيانات أو خلق روابط غير معتمدة. |

### الخطوة 1: إنشاء طبقة الشركة النشطة والصلاحية الدقيقة

ينبغي ألا تعتمد الدوال على أول عضوية متاحة أو على الدور في أي شركة. أضف دالة مرجعية مركزية باسم `has_company_permission` وتُستخدم في RLS وRPC ودوال الاعتماد.

```sql
create or replace function public.has_company_permission(
  p_user_id uuid,
  p_company_id uuid,
  p_permission text
) returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles ur
    join public.role_permissions rp
      on rp.role = ur.role
    where ur.user_id = p_user_id
      and ur.company_id = p_company_id
      and rp.permission = p_permission
  );
$$;
```

إذا لم يوجد جدول `role_permissions` بعد، أنشئه أو احتفظ بخريطة roles داخل دالة واحدة في البداية. المهم هو أن تأخذ الدالة دائماً المستخدم والشركة والصلاحية، لا المستخدم والدور فقط. تُصحح الأدوار القديمة `finance_manager` و`employee` قبل نشر هذه الدالة، ويُحصر النموذج في الأدوار المعتمدة.

### الخطوة 2: إضافة بنية الأحداث المحاسبية ومفاتيح عدم التكرار

أنشئ ترحيلاً جديداً، مثلاً `supabase/migrations/<timestamp>_atomic_posting_engine.sql`، يضيف جدولاً للأحداث المحاسبية. يحمي هذا الجدول من تكرار الطلبات ويجعل رابط المصدر واضحاً.

```sql
create table if not exists public.accounting_events (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id),
  source_type text not null,
  source_id uuid not null,
  accounting_event text not null,
  idempotency_key uuid not null,
  requested_by uuid not null references auth.users(id),
  status text not null check (status in ('processing','draft','posted','failed','reversed')),
  journal_entry_id uuid unique references public.journal_entries(id),
  request_hash text not null,
  failure_code text,
  failure_detail text,
  created_at timestamptz not null default now(),
  processed_at timestamptz,
  unique (company_id, idempotency_key),
  unique (company_id, source_type, source_id, accounting_event)
);
```

أضف إلى `journal_entries` حقول الربط إن لم تكن موجودة: `source_type` و`source_id` و`accounting_event` و`idempotency_key` و`reversal_of_journal_entry_id` و`company_id NOT NULL`. أنشئ فهارس على `(company_id, entry_date, status)` و`(company_id, source_type, source_id)`.

يجب أن تحفظ `request_hash` لبصمة مخرجات الطلب. إذا وصل المفتاح نفسه بطلب مختلف، تُرفض العملية بخطأ `IDEMPOTENCY_KEY_REUSED_WITH_DIFFERENT_PAYLOAD`، بدلاً من إرجاع نتيجة عملية لا تماثل الطلب.

### الخطوة 3: تقوية قيود بيانات الأستاذ

تضاف قيود ثابتة في قاعدة البيانات قبل كتابة المحرك. يجب أن يكون لكل بند حساب صحيح ومبلغ واحد موجب واتصال برأس القيد. ويمكن تمثيل القاعدة الأساسية كما يأتي:

```sql
alter table public.journal_entry_items
  add constraint journal_item_one_sided_positive_chk
  check (
    (coalesce(debit, 0) > 0 and coalesce(credit, 0) = 0)
    or
    (coalesce(credit, 0) > 0 and coalesce(debit, 0) = 0)
  );
```

تُضاف trigger تتحقق من أن `account_id` تابع للشركة نفسها الموجودة في رأس القيد وأن الحساب نشط. وتُحدّث trigger التوازن بحيث تعمل عند إدراج رأس بحالة `posted` وعند تغيير الحالة من `draft` إلى `posted`؛ لا يجوز أن تفترض أن جميع القيود تدخل أولاً بحالة draft دائماً.

يستمر منع تعديل وحذف القيود المرحّلة وبنودها، مع إضافة حماية تمنع إدراج بند جديد على رأس مرحّل. لا تُترك ثغرة تسمح بإدراج رأس `posted` ثم بنود لاحقاً.

### الخطوة 4: كتابة دالة إنشاء الحدث الذري

تكتب الدالة `create_accounting_event` بلغة PL/pgSQL وبـ`SECURITY DEFINER` مع `SET search_path = public`. لا تملك الدالة صلاحية مفتوحة؛ يُسحب التنفيذ من `PUBLIC` و`anon` ويُمنح فقط إلى `authenticated` أو خدمة موثوقة بحسب الحاجة.

تسلسل التنفيذ داخل الدالة يجب أن يكون كما يلي:

| الترتيب | العملية | سببها |
|---:|---|---|
| 1 | قراءة `auth.uid()` ورفض غيابه. | منع الترحيل المجهول. |
| 2 | التحقق من عضوية المستخدم وصلاحية `create_journal_entries` في `p_company_id`. | عزل الشركة والتفويض. |
| 3 | التحقق من وجود الفترة المالية وفتحها لتاريخ القيد. | منع اختراق الإقفال. |
| 4 | التحقق من الحقول المصدرية ومفتاح عدم التكرار وبنية JSON. | منع الأحداث الناقصة والطلبات المشوهة. |
| 5 | محاولة إدراج `accounting_events` مع `ON CONFLICT` ثم قراءة الصف الحالي بقفل. | ضمان طلب واحد لكل مصدر/مفتاح، حتى مع التزامن. |
| 6 | عند وجود حدث posted بالمفتاح نفسه والبصمة نفسها، إعادة `journal_entry_id` الأصلي. | تحقيق idempotency. |
| 7 | تحويل `p_lines` باستخدام `jsonb_to_recordset` إلى صفوف مؤقتة والتحقق من العدد والمبالغ والحسابات. | منع بنود غير صالحة قبل أي أثر دائم. |
| 8 | التأكد من أن كل حساب نشط وينتمي إلى الشركة، وحساب المجاميع في SQL. | صحة دليل الحسابات والتوازن. |
| 9 | إنشاء رأس قيد في حالة `draft` مع الشركة والمصدر والمرجع. | إنشاء القيد تحت معاملة واحدة. |
| 10 | إدراج البنود من مجموعة SQL المحققة. | حفظ أطراف القيد كاملة. |
| 11 | إعادة احتساب المجاميع من البنود المخزنة، ومقارنتها بدقة التقريب المعتمدة. | لا تثق بقيم العميل أو المجاميع السابقة. |
| 12 | عند `p_auto_post=true` وتحقق السياسة، تحديث الحالة إلى `posted`؛ وإلا تترك draft. | احترام الموافقات وفصل المهام. |
| 13 | تحديث الحدث وربطه بـ`journal_entry_id` ثم إدراج audit trail. | قابلية التتبع. |
| 14 | إرجاع JSON موحد يضم معرف الحدث والقيد والحالة و`reused=false`. | واجهة ثابتة للخدمات والواجهة. |

أي `RAISE EXCEPTION` في أي خطوة ينهي المعاملة كلها؛ لذلك لا يبقى رأس أو بنود أو event ناقص. إذا كان من الضروري حفظ سبب الفشل داخل `accounting_events`، ينفذ ذلك من محاولة خادمية منفصلة أو عبر آلية تسجل الخطأ بعد rollback من دون الادعاء بأن الحدث المالي اكتمل.

### الخطوة 5: دالة الاعتماد والترحيل المنفصلة

يجب أن تظل الدالة `approve_and_post_journal_entry` منفصلة عن الإنشاء للقيود اليدوية. تقفل الدالة رأس القيد بـ`FOR UPDATE`، وتتحقق من أنه `draft`، ومن الصلاحية `approve_journal_entries` للشركة ذاتها، ومن أن سياسة فصل المهام لا تمنح المنشئ حق الاعتماد على قيده. ثم تعيد حساب الإجماليات من `journal_entry_items` وتتحقق من الفترة المالية وتغيّر الحالة إلى `posted`.

تستخدم هذه الدالة الدور/الصلاحية الحالية الصحيحة فقط؛ لا تستخدم `finance_manager` أو أي قيمة خارج enum المعتمد. عند الترحيل تنشئ أو تكمل سجل التدقيق في المعاملة نفسها.

### الخطوة 6: دالة العكس، لا التعديل

تستقبل `reverse_posted_journal_entry(p_journal_entry_id, p_reason, p_entry_date, p_idempotency_key)`. تقفل القيد الأصلي، تتحقق من أنه `posted` ومن أنه لم يُعكس سابقاً بالسبب نفسه، ثم تنشئ حدثاً جديداً وقيداً جديداً يقلب كل مبلغ مدين إلى دائن والعكس. يُحفظ مرجع القيد الأصلي في `reversal_of_journal_entry_id` ولا يحدث أي تعديل للمصدر.

### الخطوة 7: تحديث RLS ومنع DML المباشر

بعد اختبار RPC في بيئة تطوير، تحذف سياسات `FOR ALL` العامة عن `journal_entries` و`journal_entry_items`. تكون القراءة مسموحة فقط لمن يملك `view_journal_entries` في الشركة، أما insert/update/delete المباشر فتُرفض للمستخدم المصادق. تتولى دوال `SECURITY DEFINER` الموثوقة الكتابة تحت ضوابطها الخاصة.

هذا التغيير يتطلب مراجعة كل الشاشات التي تكتب مباشرة؛ يجب أن تحول إلى استدعاء RPC، لا أن توسع RLS لتستمر بالعمل. يعد هذا شرطاً أساسياً لاختبار `@direct-dml-blocking`.

### الخطوة 8: استبدال خدمات الواجهة

يُعاد تصميم `src/services/financialIntegrationService.ts` بهذه الحدود:

```ts
export async function createAccountingEvent(input: CreateAccountingEventInput) {
  const { data, error } = await supabase.rpc('create_accounting_event', {
    p_company_id: input.companyId,
    p_source_type: input.sourceType,
    p_source_id: input.sourceId,
    p_accounting_event: input.eventType,
    p_entry_date: input.entryDate,
    p_description: input.description,
    p_currency: input.currency,
    p_idempotency_key: input.idempotencyKey,
    p_lines: input.lines,
    p_auto_post: input.autoPost,
  });
  if (error) throw mapAccountingError(error);
  return data as AccountingEventResult;
}
```

لا يستدعي هذا الملف `.from('journal_entries').insert()` أو `.from('journal_entry_items').insert()` بعد هذا التغيير. يصبح منطق تحويل المستندات إلى بنود في خادم موثوق أو في وحدات تحويل مشتركة مدققة، وتُرسل الواجهة بيانات مستند معتمد فقط.

تُحدّث `AutomationService.processMonthlyPayroll` لتستدعي حدثاً واحداً مرتبطاً بـ`salary_record.id`، وتُزال الدعوات الموازية إلى `linkEmployeeSalary` أو `create_salary_journal_entry`. لا يجوز أن تكون وظيفة الخلفية التي تعمل شهرياً مسؤولة عن الاستعلام وإنشاء الرواتب والترحيل والإشعارات بلا مفتاح تكرار أو تحكم بالتزامن.

### الخطوة 9: نقل المؤشرات والتقارير إلى المصدر الصحيح

تتوقف `FinancialMetricsService` عن فحص بادئات UUID في `accounting_transactions`. تُستبدل باستدعاءات SQL views أو RPC مثل `get_financial_metrics(p_company_id, p_start_date, p_end_date)` تعمل على `journal_entries` المرحّلة و`journal_entry_items` و`chart_of_accounts` والفترة المالية.

يتغير مفتاح التخزين المؤقت في الواجهة ليشمل `companyId` و`period` ونسخة/طابع آخر ترحيل. لا تستخدم التقارير وصف البند لتصنيف الأصل أو النقدية أو الإيراد؛ تعتمد على نوع ورقم الحساب من دليل الحسابات.

### الخطوة 10: الإطلاق التدريجي والتسوية

ابدأ في بيئة تطوير ببيانات معزولة، ثم بيئة اختبار قبل الإنتاج. شغّل المحرك الجديد في وضع مراقبة أولاً للأحداث المختارة، وقارن القيد المقترح بالتسجيل الحالي من دون ترحيله. بعد اعتماد التسوية، فعّل الترحيل لوحدة واحدة مثل الرواتب، ثم مدده إلى رأس المال والمصاريف، وبعد ذلك المبيعات والمشتريات عند بنائها.

لا تحذف المسارات القديمة قبل إجراء تسوية تاريخية وتوفير آلية rollback. يكون rollback عبر تعطيل feature flag وإعادة الحظر على مسار الحدث الجديد، لا عبر تعديل قيود مرحّلة.

## 3. خريطة الملفات المقترحة

| الملف أو المسار | الإجراء |
|---|---|
| `supabase/migrations/<timestamp>_atomic_posting_engine.sql` | الجداول الجديدة، قيود البنود، الدوال، triggers، الأذونات والفهارس. |
| `supabase/migrations/<timestamp>_financial_rls_hardening.sql` | استبدال سياسات DML المباشر بسياسات القراءة وصلاحيات الدوال. |
| `supabase/tests/database/atomic_posting_engine.test.sql` | اختبارات قاعدة البيانات الذرية والصلاحيات وعدم التكرار والعكس. |
| `docs/acceptance/financial-posting.feature` | مواصفات القبول الوظيفية التي يعتمدها فريق المالية والتطوير. |
| `src/services/financialIntegrationService.ts` | عميل RPC فقط وأنواع الإدخال والإخراج ومعالجة أخطاء الأعمال. |
| `src/services/automationService.ts` | تحويل أتمتة الرواتب إلى حدث مصدر واحد بمفتاح عدم تكرار. |
| `src/services/employeeAccountingService.ts` | إزالة المسار الموازي للرواتب أو تغليفه بالدالة الموحدة. |
| `supabase/functions/accounting-automation/index.ts` | الإيقاف أو التحويل إلى طبقة تفويض خفيفة تستدعي RPC الموثوق. |
| `src/services/financialMetrics.ts` | استبدال الحسابات المعتمدة على UUID بوظيفة تقرير خادمية. |
| `src/hooks/usePermissions.ts` و`src/components/auth/ProtectedRoute.tsx` | استخدام الشركة النشطة والصلاحيات الدقيقة في الواجهة، مع بقاء المنع النهائي في الخادم. |

## 4. تشغيل اختبارات القبول آلياً

ينقسم الاختبار إلى طبقتين. تختبر طبقة قاعدة البيانات الدوال والقيود وRLS داخل قاعدة بيانات Supabase محلية/اختبارية، لأنها الوحيدة القادرة على إثبات الذرية وصلاحيات الصفوف. وتختبر طبقة التطبيق أن الواجهة لا تستدعي DML المباشر وأنها تعرض أخطاء الأعمال الصحيحة وتعيد استخدام نتيجة مفتاح التكرار.

| الطبقة | التقنية المقترحة | الاختبارات التي تغطيها |
|---|---|---|
| قاعدة البيانات | pgTAP أو SQL integration tests مع مستخدمين وشركات وفترات معزولة داخل معاملة قابلة للتراجع. | `@P0` و`@P1` للتوازن، الذرية، RLS، العكس، اعتماد القيد، وعدم التكرار. |
| خادم/دوال | اختبارات تكامل تستدعي RPC/Edge Function برموز المستخدمين المختلفة. | JWT، تفويض الشركة، معالجة الأخطاء، وسلوك التزامن. |
| الواجهة | Vitest مع mock لعميل Supabase، ثم اختبار دخاني في متصفح. | عدم وجود DML مباشر، تحويل الأخطاء للعربية، وتعطيل أزرار غير مخولة. |
| قبول تشغيلي | تشغيل حالات ملف `.feature` على بيئة اختبار ببيانات معتمدة من المالية. | توقيع فريق المالية على دورة الرواتب والمبيعات والعكس والتقارير. |

يجب أن تُضاف إلى `package.json` أو مسار CI أوامر واضحة مثل `test:db` و`test:unit` و`test:acceptance`. لا يُعتبر الترحيل جاهزاً قبل اجتياز جميع اختبارات `@P0`، ثم اعتماد اختبارات `@P1` للوحدة التي ستُفعل في الإنتاج.

## 5. تعريف الإنجاز

لا يكتمل المحرك الذري إلا عند تحقق الشروط التالية:

1. لا يملك العميل المصادق صلاحية DML مباشر على جداول القيود أو البنود.
2. تنشئ كل عملية ناجحة رأساً وبنوداً وسجل تدقيق وربطاً بمصدر داخل معاملة واحدة.
3. لا يمكن ترحيل قيد غير متوازن أو فارغ أو بفترة مغلقة أو بحساب من شركة أخرى.
4. تعيد المحاولة بالمفتاح والمحتوى نفسيهما النتيجة نفسها من دون قيد ثانٍ، وترفض المفتاح ذاته مع محتوى مختلف.
5. تكون كل القيود المرحّلة غير قابلة للتعديل أو الإضافة أو الحذف، ويجري التصحيح بعكس موثق.
6. تفرض RLS ودوال الصلاحية الشركة والحق المطلوب، لا الدور العام فقط.
7. تستخدم الرواتب ورأس المال والمصروفات مسار محرك واحد فقط لكل مصدر.
8. تتطابق ميزانية المراجعة والتقارير مع بنود القيود المرحّلة للشركة والفترة المحددتين.
