
import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart3, Users, FileText, Settings } from "lucide-react";

export default function MainPage() {
  const features = [
    {
      icon: <Users className="h-8 w-8" />,
      title: "إدارة الموارد البشرية",
      description: "نظام شامل لإدارة الموظفين والرواتب والحضور",
      link: "/hr"
    },
    {
      icon: <BarChart3 className="h-8 w-8" />,
      title: "المحاسبة والمالية",
      description: "نظام محاسبي متكامل مع التقارير المالية",
      link: "/accounting"
    },
    {
      icon: <FileText className="h-8 w-8" />,
      title: "إدارة المشاريع",
      description: "تخطيط ومتابعة المشاريع والمهام",
      link: "/projects"
    },
    {
      icon: <Settings className="h-8 w-8" />,
      title: "الإعدادات",
      description: "إعدادات النظام والتخصيصات",
      link: "/settings"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            نظام إدارة الأعمال المتكامل
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            حل شامل لإدارة جميع جوانب عملك من الموارد البشرية والمالية إلى إدارة المشاريع والعملاء
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/dashboard">
              <Button size="lg" className="gap-2">
                دخول النظام
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link to="/auth">
              <Button variant="outline" size="lg">
                تسجيل الدخول
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {features.map((feature, index) => (
            <Card key={index} className="transition-transform hover:scale-105">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-lg w-fit">
                  {feature.icon}
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 mb-4">{feature.description}</p>
                <Link to={feature.link}>
                  <Button variant="outline" size="sm">
                    تصفح الميزة
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
