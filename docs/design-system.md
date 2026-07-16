# ERP Design System — Reference

نظام تصميم موحد لكل وحدات النظام. تُعتمد هذه المستندات كمصدر حقيقة واحد.

## 1) الألوان (Semantic Tokens)
كل الألوان معرّفة في `src/index.css` كـ HSL tokens ولا تُستعمل ألوان مطلقة (`text-white`, `bg-black`, `#hex`) في المكونات.

| Token | الاستخدام |
|---|---|
| `--background` / `--foreground` | خلفية الصفحة الرئيسية والنص |
| `--card` / `--card-foreground` | البطاقات والحاويات |
| `--primary` / `--primary-foreground` | الإجراء الأساسي (Teal/Emerald) |
| `--secondary` | إجراءات ثانوية |
| `--muted` / `--muted-foreground` | نصوص وخلفيات هادئة |
| `--accent` | Highlights (hover, active) |
| `--success` / `--warning` / `--destructive` / `--info` | ألوان الحالات |
| `--border` / `--input` / `--ring` | حدود وحقول ومؤشرات التركيز |
| `--sidebar-*` | ألوان مخصصة للـ Sidebar |

### التدرجات
`--gradient-primary`, `--gradient-hero`, `--gradient-success`, `--gradient-info`, `--gradient-warning`, `--gradient-subtle`, `--gradient-glass`.

## 2) الطباعة (Typography Scale)
الخط الأساسي: **IBM Plex Sans Arabic** (يدعم العربية واللاتيني).

| المستوى | Class | الاستخدام |
|---|---|---|
| H1 (Display) | `text-3xl md:text-4xl lg:text-5xl font-bold` | عناوين الصفحات الرئيسية (عبر `PageShell`) |
| H2 | `text-2xl md:text-3xl font-bold` | عناوين الأقسام الكبيرة |
| H3 | `text-xl md:text-2xl font-semibold` | عناوين البطاقات |
| H4 | `text-lg font-semibold` | عناوين فرعية |
| Body | `text-sm sm:text-base` | نص عادي |
| Caption | `text-xs text-muted-foreground` | Metadata / Breadcrumbs / Hints |

**قواعد**:
- استخدم `font-bold` فقط للعناوين، `font-semibold` للتأكيد، `font-medium` للـ labels.
- لا تخلط أوزان الخطوط في نفس البلوك.

## 3) المسافات (Spacing Scale)
اعتمد سلماً واحداً: **4 · 8 · 12 · 16 · 24 · 32 · 48**.

| Class | الاستخدام |
|---|---|
| `gap-2` / `space-y-2` | داخل عنصر واحد (icon+text) |
| `gap-4` / `space-y-4` | حقول فورم متجاورة |
| `gap-6` / `space-y-6` | بين أقسام البطاقة |
| `gap-8` / `space-y-8` | بين أقسام الصفحة الكبيرة |

**ممنوع** استخدام `space-y-5/7/9` (خارج السلم).

## 4) المكونات (Components)
### Cards — نمط واحد لكل غرض
| Class | متى |
|---|---|
| `Card` (shadcn) | البطاقة الافتراضية |
| `.stat-card` | بطاقة إحصائية بـ hover effect |
| `.premium-card` | بطاقة بارزة مع خط علوي متدرج |
| `.glass-card` | Overlay شفاف (Dialogs / Sticky bars) |

> لا تُنشئ `.stat-card-v2` أو نمطاً بديلاً. أضف variants فقط للـ Card الموجود.

### Buttons
- الأساسي: `<Button>` من shadcn
- المميز: class `btn-primary-glow`
- الشفاف: class `btn-glass`

### PageShell
كل صفحة **يجب** أن تُلَف بـ `<PageShell title description icon actions breadcrumbs>` من `@/components/shared/PageShell`.

## 5) الأيقونات (Icons)
- المكتبة الوحيدة: **lucide-react**.
- الحجم داخل الأزرار: `h-4 w-4`.
- الحجم داخل PageShell header: `h-6 w-6`.
- الحجم داخل stat cards: `h-8 w-8`.
- **لا** تضع أيقونة بدون سياق (labels / aria-label).

## 6) RTL / i18n (منطقي)
- كل الصفحات تُغلَّف بـ `dir="rtl"` عبر `AppLayout` — **لا تكرر `dir` داخل الصفحة**.
- استخدم **Logical Properties**:
  - بدل `mr-*` → `me-*` (margin end)
  - بدل `ml-*` → `ms-*` (margin start)
  - بدل `pr-*` → `pe-*`
  - بدل `pl-*` → `ps-*`
  - بدل `right-*` → `end-*` (Tailwind logical)
  - بدل `left-*` → `start-*`
- **لا** تستخدم `space-x-reverse` — استعمل `gap-*` بدلاً منه.

## 7) الاستجابة (Responsive)
- Breakpoints Tailwind الافتراضية: `sm 640` · `md 768` · `lg 1024` · `xl 1280`.
- الجداول الأكبر من 3 أعمدة: يجب أن تتحول لبطاقات على `< md` (Table-to-Card pattern).
- Dialogs: دائماً `max-h-[85vh] overflow-y-auto` للسماح بالتمرير.

## 8) الحركات (Animations)
- Fade in للصفحات: `animate-fade-in`
- Stagger للأقسام: `animate-slide-up stagger-1..4`
- لا تُنشئ keyframes جديدة — استخدم الموجودة في `index.css`.

## 9) الحالات (States)
- Loading: `Skeleton` من shadcn (لا `Loader2` كخيار أساسي).
- Empty: أيقونة + عنوان + وصف + CTA اختياري.
- Error: Toast أحمر + رسالة عربية واضحة.

## 10) الوصول (Accessibility)
- Focus ring واضح على كل العناصر التفاعلية (`ring-2 ring-primary/30`).
- Contrast ratio ≥ 4.5:1 (WCAG AA).
- كل الأيقونات التفاعلية بلا نص → `aria-label` إلزامي.

---

> عند التعارض بين هذا الدليل و`index.css`، الأولوية لهذا الدليل. عدّل `index.css` ليطابقه.