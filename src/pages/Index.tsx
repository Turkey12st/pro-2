
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  ArrowLeft, 
  ChevronDown, 
  LayoutDashboard, 
  Receipt, 
  Users, 
  FileText, 
  Building2,
  Link,
  Store,
  Scale,
  CalendarIcon,
  Settings
} from "lucide-react";
import { useNavigate, Link as RouterLink } from "react-router-dom";

export default function Index() {
  const navigate = useNavigate();

  const quickAccessCategories = [
    {
      title: "الإدارة المالية",
      description: "إدارة الحسابات والمالية",
      color: "bg-green-50 border-green-200",
      icon: Receipt,
      iconColor: "text-green-600",
      items: [
        { name: "المحاسبة", href: "/accounting", icon: Receipt },
        { name: "إدارة رأس المال", href: "/capital", icon: Building2 },
        { name: "الزكاة والضرائب", href: "/zakat", icon: Scale }
      ]
    },
    {
      title: "إدارة الأعمال",
      description: "إدارة المشاريع والموظفين",
      color: "bg-blue-50 border-blue-200",
      icon: Users,
      iconColor: "text-blue-600",
      items: [
        { name: "المشاريع", href: "/projects", icon: LayoutDashboard },
        { name: "الموظفين", href: "/hr", icon: Users },
        { name: "العملاء", href: "/clients", icon: Store }
      ]
    },
    {
      title: "الوثائق والسجلات",
      description: "إدارة المستندات والسجلات",
      color: "bg-purple-50 border-purple-200",
      icon: FileText,
      iconColor: "text-purple-600",
      items: [
        { name: "المستندات", href: "/documents", icon: FileText },
        { name: "معلومات الشركة", href: "/company", icon: Building2 },
        { name: "الشركاء", href: "/partners", icon: Link }
      ]
    },
    {
      title: "الأدوات والإعدادات",
      description: "أدوات مساعدة وإعدادات النظام",
      color: "bg-amber-50 border-amber-200",
      icon: Settings,
      iconColor: "text-amber-600",
      items: [
        { name: "التقويم", href: "/calendar", icon: CalendarIcon },
        { name: "الإعدادات", href: "/settings", icon: Settings }
      ]
    }
  ];

  return (
    <div 
      className="min-h-screen w-full flex flex-col items-center justify-center relative px-4"
      style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      }}
    >
      {/* Header */}
      <div className="text-center space-y-6 max-w-4xl w-full mb-8">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg">
            نظام إدارة الأعمال المتكامل
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            منصة شاملة لإدارة جميع احتياجات شركتك من المحاسبة إلى إدارة الموارد البشرية
          </p>
        </div>

        {/* Quick Access Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button 
            onClick={() => navigate("/dashboard")}
            size="lg" 
            className="bg-white text-gray-900 hover:bg-gray-100 text-lg px-8 py-3 shadow-lg"
          >
            <LayoutDashboard className="h-5 w-5 ml-2" />
            لوحة المعلومات
            <ArrowLeft className="h-5 w-5 mr-2" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                size="lg" 
                className="bg-white/10 border-white/30 text-white hover:bg-white/20 text-lg px-8 py-3"
              >
                الوصول السريع
                <ChevronDown className="h-5 w-5 mr-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-white shadow-xl" align="center">
              <DropdownMenuLabel>اختر القسم</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {quickAccessCategories.map((category) => (
                <div key={category.title}>
                  <DropdownMenuLabel className="text-xs text-muted-foreground flex items-center gap-2">
                    <category.icon className={`h-4 w-4 ${category.iconColor}`} />
                    {category.title}
                  </DropdownMenuLabel>
                  {category.items.map((item) => (
                    <DropdownMenuItem key={item.href} asChild>
                      <RouterLink to={item.href} className="flex w-full items-center gap-2 cursor-pointer">
                        <item.icon className="h-4 w-4" />
                        <span>{item.name}</span>
                      </RouterLink>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                </div>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl w-full">
        {quickAccessCategories.map((category) => (
          <Card key={category.title} className={`${category.color} hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}>
            <CardHeader className="text-center pb-4">
              <div className={`mx-auto w-12 h-12 rounded-full bg-white flex items-center justify-center mb-3 shadow-sm`}>
                <category.icon className={`h-6 w-6 ${category.iconColor}`} />
              </div>
              <CardTitle className="text-lg">{category.title}</CardTitle>
              <CardDescription className="text-sm">
                {category.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                {category.items.map((item) => (
                  <RouterLink 
                    key={item.href}
                    to={item.href}
                    className="flex items-center gap-2 p-2 rounded-md hover:bg-white/50 transition-colors text-sm"
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </RouterLink>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Background Animation */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute w-[600px] h-[600px] bg-white rounded-full blur-[120px] animate-pulse -top-32 -right-32" />
        <div className="absolute w-[400px] h-[400px] bg-white rounded-full blur-[80px] animate-pulse -bottom-20 -left-20" />
      </div>
    </div>
  );
}
