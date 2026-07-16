
# تقرير المراجعة الشاملة وخطة إعادة تصميم نظام ERP

> نطاق هذه الخطة: **طبقة العرض فقط** (Design System + UX + Layout + i18n/RTL). لن نمس منطق الأعمال، المصادقة، قاعدة البيانات، أو التكاملات الحالية.

---

## القسم 1 — المشاكل المكتشفة

### 1.1 تناقض بنية الصفحات (Layout drift)
- `Dashboard` / `HR` يستخدمان `.page-container` عبر `PageShell`.
- `Company` / `Documents` يستخدمان `max-w-7xl mx-auto p-4 sm:p-6` يدوياً.
- `Clients` يستخدم `container mx-auto p-6` بلا RTL ولا Header.
- `Accounting` ملفوف داخل `Card` بلا عنوان وصفي.
- `Admin` تم لفه بـ `PageShell` لكن الداخل `AdminDashboard` يعيد رسم Header آخر.
→ كل صفحة تبدو من عالم مختلف.

### 1.2 هوية بصرية غير موحدة
- `index.css` يعرّف نظام tokens غني (teal/emerald + gradients + shadows) لكن معظم الصفحات لا تستخدمه.
- الأيقونات: بعضها داخل مربع ملون، بعضها عارٍ، أحجام مختلطة (14/16/18px).
- الخطوط: `text-3xl` هنا، `text-2xl` هناك، وأحياناً لا عنوان.
- أوزان مختلطة `font-bold` / `font-semibold` / `font-medium` بلا سلم واضح.
- Cards: `premium-card` + `glass-card` + `stat-card` + `bg-card` — أربعة أنماط لنفس الغرض.

### 1.3 قوائم تنقل مكررة
- `AppLayout` كان يعرض ثلاث قوائم في نفس الوقت (Sidebar + قائمة الانتقال السريع + `QuickNavMenu` داخل Dashboard). تم تنظيف جزء منها في Sprint 1 لكن:
  - `AppNavigation` لا تستخدم `collapsible="icon"` بشكل كامل.
  - لا توجد إشارة للـ Group النشط.
  - 17 عنصر بدون فواصل بصرية بين المجموعات.

### 1.4 RTL/i18n غير مكتمل
- بعض الصفحات تضيف `dir="rtl"` محلياً، بعضها يعتمد على الغلاف.
- استعمال `mr-*` / `ml-*` مختلط بدل `me-*` / `ms-*` المنطقية → يكسر عند تبديل اللغة.
- لا يوجد `react-i18next`، النصوص Hard-coded عربية.
- `TabNavigation.tsx` لا يزال يستخدم `space-x-reverse` و`ml-2`.

### 1.5 الاستجابة (Responsive)
- جداول المحاسبة/الموظفين تفيض أفقياً على الجوال بدون بديل بطاقات.
- Dialogs بعرض ثابت `sm:max-w-[600px]` بدون `max-h` معقول.
- Sidebar لا تنهار بشكل نظيف على الشاشات المتوسطة.

### 1.6 عناصر ناقصة أو معطوبة بصرياً
| الصفحة | المشكلة |
|---|---|
| Dashboard | تكرار بصري: `IntegratedKPIWidgets` + `IntegratedDashboardStats` + `ERPDashboard` + `FinancialMetricsCard` بدون تدرج معلوماتي. |
| Accounting | أيقونة "إضافة" ملتصقة (`mr-2` في RTL)، لا Header، لا Filter Bar. |
| Clients | بلا حالة عميل (نشط/متأخر)، بلا Pagination، بحث بسيط فقط. |
| Documents | تبويب "إضافة" داخل الصفحة بدل Dialog (تم إصلاحه جزئياً). |
| Company | تبويبان بلا Overview، فورم طويل بلا أقسام مرئية. |
| Admin | KPIs غائبة قبل التبويبات. |
| Notifications/Tenders/Commissions | حديثة الإنشاء لكن بدون نفس نمط `PageShell`. |

### 1.7 لوحة التحكم المالية
- لا يوجد Chart رئيسي (Cash Flow / Revenue vs Expenses) أعلى الصفحة.
- KPIs أرقام مجردة بدون trend arrows أو مقارنة بالفترة السابقة.
- لا يوجد تسلسل بصري بين الملخص المالي والإشعارات.

### 1.8 حالات فارغة و Loading
- `Loader2` spinner في كل مكان بلا Skeletons.
- Empty states نصية فقط (لا SVG، لا CTA واضح).
- Toasts بلا styling موحد للحالة.

---

## القسم 2 — تقييم اتساق نظام التصميم

| المحور | الحالة | الملاحظة |
|---|---|---|
| Tokens الألوان | ✅ معرّفة | ❌ غير مستخدمة بانتظام |
| الطباعة | ⚠️ IBM Plex محمّل | ❌ لا سلم واضح (h1..h4) |
| المسافات | ❌ عشوائية | `space-y-4/6/8` بلا قاعدة |
| المكونات | ⚠️ shadcn كامل | ❌ 4 أنماط cards متكررة |
| الأيقونات | ⚠️ lucide موحد | ❌ أحجام/حاويات مختلطة |
| RTL | ⚠️ جزئي | `mr/ml` بدل `me/ms` |
| Dark mode | ⚠️ tokens موجودة | لم يُدقّق التباين في كل الصفحات |

---

## القسم 3 — خطة إعادة التصميم (5 مراحل / 4 Sprints)

### Sprint 1 — تثبيت النظام البصري (Foundation)
**الهدف**: مصدر حقيقة واحد للألوان/الطباعة/المسافات.
- توثيق `docs/design-system.md`: سلم الطباعة (h1..h4, body, caption)، سلم المسافات (4/8/12/16/24/32)، ألوان الحالة (success/warning/danger/info).
- تنظيف `index.css`: إبقاء tokens فقط + class واحد لكل غرض (`.surface-card`, `.surface-elevated`, `.surface-glass`) وحذف المكرر.
- إضافة `--font-display` منفصلاً عن `--font-body`.
- تفعيل Tailwind logical properties (`me-*`, `ms-*`, `pe-*`, `ps-*`).
- توحيد Skeletons + Empty states + Toast variants.

### Sprint 2 — Shell موحد + تنقل نظيف
- توسعة `<PageShell>` ليشمل: `<PageToolbar>` (بحث/فلاتر/إجراءات) + `<PageTabs>` مع RTL صحيح.
- تطبيقه على كل الصفحات المتبقية: `Accounting`, `Clients`, `Documents`, `Company`, `Tenders`, `Commissions`, `Notifications`, `Projects`, `Partners`, `Calendar`, `Settings`.
- Sidebar `collapsible="icon"` مع 5 مجموعات:
  1. نظرة عامة (Dashboard)
  2. المحاسبة والمالية
  3. الموارد البشرية
  4. العمليات
  5. النظام
- حذف كل قوائم "الانتقال السريع" المتبقية (تُغني عنها `⌘K`).

### Sprint 3 — بنية اللغتين (i18n + RTL منطقي)
- تركيب `react-i18next` + ملفَي `ar.json` / `en.json`.
- `<LanguageProvider>` يضبط `<html dir lang>` ويحفظ الاختيار.
- استخراج نصوص الصفحات الرئيسية إلى مفاتيح i18n (مرحلة أولى: Dashboard, HR, Accounting, Clients, Documents, Company, Admin).
- استبدال شامل لـ `mr-*/ml-*` → `me-*/ms-*` عبر codemod.
- Language switcher في الهيدر.

### Sprint 4 — إعادة تصميم الصفحات
**Dashboard**:
```text
[Hero KPIs × 4 مع trend arrows]
[Chart رئيسي: Cash Flow 12 شهر]
[Notifications | Alerts]
[ERP Modules Grid]
```
- **Accounting**: PageShell + Filter Bar + جدول قيود بأعمدة sticky + عمود Actions موحد.
- **HR**: QuickActions Bar + Chart Saudization دائري + بطاقات موظف على الجوال.
- **Clients**: List/Grid Toggle + بحث/فلتر + بطاقة بحالة العميل.
- **Documents**: تنبيهات انتهاء الصلاحية أعلى الصفحة + Dialog للإضافة.
- **Company**: Progress Indicator + 4 أقسام مرئية (أساسي/تسجيل/بنكي/نشاط).
- **Admin**: KPIs (users/roles/audit events) قبل التبويبات.
- **Tenders/Commissions/Notifications**: تطبيق نفس اللغة البصرية.
- تحويل كل الجداول الحرجة إلى Table-to-Card على `< md`.

### Sprint 5 — الصقل (Polish)
- Loading Skeletons موحدة لكل صفحة.
- Empty States بصور SVG + CTA.
- Focus rings واضحة لـ a11y (WCAG AA).
- Dark Mode audit صفحة-صفحة (تباين + عبارات ألوان).
- Micro-animations متسقة (`animate-fade-in`, `animate-slide-up`).

---

## القسم 4 — الجدول الزمني

```text
Sprint 1  (يوم-يومان)  → Design tokens + docs + logical properties
Sprint 2  (يوم-يومان)  → PageShell شامل + Sidebar جديدة
Sprint 3  (2 يوم)      → i18n كامل + RTL منطقي
Sprint 4  (3 أيام)     → إعادة تصميم كل صفحة
Sprint 5  (يوم)        → Skeletons + Empty states + a11y + dark audit
```

---

## القسم 5 — قرارات تحتاج تأكيدك قبل البدء

1. **الاتجاه اللوني**: نُبقي **Teal/Emerald** الحالي، أم نستكشف اتجاه ERP فاخر بديل (Deep Navy + Gold / Charcoal + Emerald)؟
2. **اللغة**: هل نبدأ i18n كامل (Sprint 3) الآن، أم نؤجل حتى تكتمل إعادة تصميم الصفحات؟
3. **نطاق التنفيذ**: نبدأ بـ **Sprint 1 + 2** كأساس ثم نعرض Dashboard كنموذج قبل الباقي، أم ننفذ الكل دفعة واحدة؟
4. **مسار الاعتماد**: هل تريد أن أعرض 3 اتجاهات بصرية مختلفة (مع Screenshots) لتختار واحداً قبل البدء الفعلي؟ (موصى به لتجنب إعادة العمل)

---

**التوصية**: البدء بـ Sprint 1 + 2 معاً، مع عرض 3 اتجاهات بصرية للـ Dashboard أولاً لاعتماد الهوية، ثم الانتقال للـ Sprints المتبقية.
