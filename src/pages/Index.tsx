
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Index() {
  const navigate = useNavigate();

  return (
    <div 
      className="min-h-screen w-full flex flex-col items-center justify-center relative"
      style={{
        background: "linear-gradient(135deg, #FF1B6B 0%, #45CAFF 100%)",
      }}
    >
      {/* Enter Button */}
      <Button
        onClick={() => navigate("/dashboard")}
        className="mt-8 opacity-70 hover:opacity-100 transition-all duration-300 group absolute bottom-8 left-8"
        variant="ghost"
        size="sm"
      >
        <span className="text-white group-hover:mr-2 transition-all duration-300">دخول</span>
        <ArrowLeft className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-all duration-300" />
      </Button>

      {/* Background Animation */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute w-[500px] h-[500px] bg-white rounded-full blur-[100px] animate-pulse -top-20 -right-20" />
        <div className="absolute w-[500px] h-[500px] bg-purple-500 rounded-full blur-[100px] animate-pulse -bottom-20 -left-20" />
      </div>
    </div>
  );
}
