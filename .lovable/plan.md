
# تقرير المراجعة الشاملة وخطة إعادة تصميم نظام ERP

> نطاق هذه الخطة: **طبقة العرض فقط** (Design System + UX + Layout + i18n/RTL). لن نمس منطق الأعمال، المصادقة، قاعدة البيانات، أو التكاملات الحالية.

---

## القسم 1 — المشاكل المكتشفة

### 1.1 تناقض بنية الصفحات (Layout drift)
- `Dashboard` / `HR` / `Accounting` / `Clients` / `Company` / `Documents` / `Admin` صارت تستخدم `PageShell` (تم في جولات سابقة).
- **لكن** `Tenders` / `Commissions` / `Notifications` كانت تستخدم `<div className="space-y-6">` مباشرة بدون Header — تم إصلاحها للتو.
- `Projects` / `Partners` / `Calendar` / `Settings` / `Financial` / `Capital` / `Bank Reconciliation` **لم يتم فحصها بعد** ومن المرجّح أنها تستخدم أنماطاً متفرقة.
- `AdminDashboard` داخل `pages/admin` قد يرسم Header ثانياً داخل `PageShell` → ازدواج بصري.

### 1.2 هوية بصرية غير موحدة
- `index.css` يعرّف نظام tokens غني (teal/emerald + gradients + shadows) لكن كثير من الصفحات لا يستخدمه.
- الأيقونات: أحجام مختلطة (14/16/18/24px) وحاويات غير متسقة.
- الخطوط: `text-3xl` هنا، `text-2xl` هناك، وأوزان مختلطة `font-bold/semibold/medium` بلا سلم واضح.
- Cards: `premium-card` + `glass-card` + `stat-card` + `bg-card` — أربعة أنماط لنفس الغرض.

### 1.3 قوائم تنقل
- تم تنظيف قائمة الانتقال السريع المكررة (Sprint سابق) واستُبدلت بـ `⌘K`.
- **متبقٍّ**: 
  - `AppNavigation` لا تستخدم `collapsible="icon"` بشكل كامل.
  - لا يوجد highlight بصري للمجموعة النشطة.
  - 17 عنصر بدون فواصل بصرية بين المجموعات.

### 1.4 RTL/i18n غير مكتمل
- `mr-*` / `ml-*` مختلط مع `me-*` / `ms-*` في كثير من المكونات.
- لا يوجد `react-i18next` — النصوص Hard-coded عربية.
- لا يوجد Language Switcher.

### 1.5 الاستجابة (Responsive)
- جداول المحاسبة/الموظفين/المناقصات/العمولات/الإشعارات تفيض أفقياً على الجوال بدون بديل بطاقات.
- Dialogs بعرض ثابت `sm:max-w-[600px]` بدون `max-h` معقول (تم إصلاح Documents فقط).

### 1.6 عناصر ناقصة بصرياً
| الصفحة | المشكلة |
|---|---|
| Dashboard | تكرار: `IntegratedKPIWidgets` + `IntegratedDashboardStats` + `ERPDashboard` + `FinancialMetricsCard` بدون تدرج معلوماتي. لا Chart رئيسي (Cash Flow). KPIs بدون trend arrows. |
| Accounting | لا Filter Bar، جدول القيود بدون sticky columns. |
| Clients | لا حالة عميل (نشط/متأخر)، لا Pagination، لا List/Grid Toggle. |
| Company | تبويبان بلا Overview، فورم طويل بلا Progress Indicator. |
| Admin | KPIs غائبة قبل التبويبات. |
| HR | يعمل جيداً لكن يحتاج Chart Saudization دائري. |

### 1.7 الحالات (Loading / Empty)
- `Loader2` spinner في كل مكان بلا Skeletons.
- Empty states نصية فقط بدون SVG أو CTA.

### 1.8 Dark Mode
- Tokens معرّفة لكن لم يُدقَّق التباين صفحة-صفحة.

---

## القسم 2 — تقييم اتساق نظام التصميم

| المحور | الحالة | الملاحظة |
|---|---|---|
| Tokens الألوان | ✅ معرّفة | ⚠️ استخدام غير منتظم |
| الطباعة | ⚠️ خط IBM Plex محمّل | ❌ لا سلم موحد h1..h4 |
| المسافات | ❌ عشوائية | `space-y-4/6/8` بلا قاعدة |
| المكونات | ⚠️ shadcn كامل | ❌ 4 أنماط cards متكررة |
| PageShell | ✅ متبنى في 10 صفحات | ⚠️ 7 صفحات لم تُفحص بعد |
| الأيقونات | ⚠️ lucide موحد | ❌ أحجام مختلطة |
| RTL | ⚠️ جزئي | `mr/ml` بدل `me/ms` |
| Dark mode | ⚠️ tokens موجودة | لم يُدقَّق التباين |
| i18n | ❌ غير موجود | نصوص hard-coded |

---

## القسم 3 — خطة إعادة التصميم (5 مراحل)

### Sprint 1 — تثبيت النظام البصري (Foundation) — **مُنجَز جزئياً**
- ✅ `docs/design-system.md` (مصدر الحقيقة).
- ✅ `PageShell` مطبق على معظم الصفحات.
- ⏳ تنظيف `index.css`: توحيد أنماط cards في class واحد لكل غرض.
- ⏳ إضافة `--font-display` منفصلاً + سلم طباعة موحد (h1..h4).
- ⏳ Skeletons + Empty states + Toast variants موحدة.

### Sprint 2 — Shell شامل + تنقل نظيف
- تدقيق وتطبيق `PageShell` على: `Projects`, `Partners`, `Calendar`, `Settings`, `Financial`, `Capital`, `Bank Reconciliation`.
- إزالة الـ Header المزدوج داخل `AdminDashboard`.
- توسعة `PageShell` بمكوّنَي `PageToolbar` (بحث/فلاتر) و`PageTabs` بـ RTL صحيح.
- Sidebar `collapsible="icon"` + 5 مجموعات + Highlight للمجموعة النشطة.

### Sprint 3 — بنية اللغتين (i18n + RTL منطقي)
- تركيب `react-i18next` + `ar.json` / `en.json`.
- `<LanguageProvider>` يضبط `<html dir lang>` ويحفظ الاختيار في localStorage.
- استخراج نصوص الصفحات الرئيسية إلى مفاتيح i18n (Dashboard, HR, Accounting, Clients, Documents, Company, Admin أولاً).
- Codemod: استبدال شامل `mr-*/ml-*` → `me-*/ms-*` وإزالة `space-x-reverse`.
- Language Switcher في الهيدر.

### Sprint 4 — إعادة تصميم الصفحات
```text
Dashboard:
  [Hero KPIs × 4 مع trend arrows]
  [Chart رئيسي: Cash Flow 12 شهر]
  [Notifications | Alerts]
  [ERP Modules Grid]
```
- **Accounting**: Filter Bar + جدول قيود sticky + Actions موحد.
- **HR**: QuickActions Bar + Chart Saudization دائري + Table-to-Card على الجوال.
- **Clients**: List/Grid Toggle + فلتر النوع + بطاقة بحالة العميل.
- **Documents**: تنبيهات انتهاء الصلاحية أعلى الصفحة.
- **Company**: Progress Indicator + 4 أقسام مرئية.
- **Admin**: KPIs (users/roles/audit events) قبل التبويبات.
- **Tenders/Commissions/Notifications**: تحويل الجداول لبطاقات على `< md`.

### Sprint 5 — الصقل (Polish)
- Loading Skeletons موحدة.
- Empty States بصور SVG + CTA.
- Focus rings واضحة (WCAG AA).
- Dark Mode audit صفحة-صفحة.
- Micro-animations متسقة.

---

## القسم 4 — الجدول الزمني

```text
Sprint 1  → مُنجَز جزئياً (يتبقى: تنظيف index.css + Skeletons)
Sprint 2  (يومان)    → PageShell شامل + Sidebar جديدة
Sprint 3  (يومان)    → i18n كامل + RTL منطقي
Sprint 4  (3 أيام)   → إعادة تصميم كل صفحة
Sprint 5  (يوم)      → Skeletons + Empty states + a11y + dark audit
```

---

## القسم 5 — قرارات تحتاج تأكيدك قبل البدء

1. **الاتجاه اللوني**: نُبقي **Teal/Emerald** الحالي، أم نستكشف اتجاه ERP فاخر بديل (Deep Navy + Gold / Charcoal + Emerald)؟
2. **اللغة**: هل نبدأ i18n كامل (Sprint 3) الآن، أم نؤجل حتى تكتمل إعادة تصميم الصفحات؟
3. **نطاق التنفيذ**: نبدأ بـ **Sprint 1 (إتمام) + Sprint 2** كأساس ثم نعرض Dashboard كنموذج قبل الباقي، أم ننفذ الكل دفعة واحدة؟
4. **مسار الاعتماد**: هل تريد أن أعرض **3 اتجاهات بصرية مرسومة** (screenshots) لتختار واحداً قبل البدء الفعلي؟ (موصى به لتجنب إعادة العمل)

---

**التوصية**: إتمام Sprint 1 + تنفيذ Sprint 2 معاً، مع عرض 3 اتجاهات بصرية للـ Dashboard أولاً لاعتماد الهوية، ثم الانتقال للـ Sprints المتبقية.
