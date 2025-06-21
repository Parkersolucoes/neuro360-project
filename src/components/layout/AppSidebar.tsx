
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  BarChart3,
  Settings,
  QrCode,
  Database,
  MessageSquare,
  Calendar,
  Users,
  Building2,
  LogOut,
  Menu,
  X,
  CreditCard,
  Package
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { CompanySelector } from "./CompanySelector";
import { useCompanies } from "@/hooks/useCompanies";

const menuItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: BarChart3,
  },
  {
    title: "Configuração",
    url: "/configuracao",
    icon: Settings,
  },
  {
    title: "QR Code",
    url: "/qrcode",
    icon: QrCode,
  },
  {
    title: "Consultas SQL",
    url: "/consultas",
    icon: Database,
  },
  {
    title: "Templates",
    url: "/templates",
    icon: MessageSquare,
  },
  {
    title: "Agendamento",
    url: "/agendamento",
    icon: Calendar,
  },
  {
    title: "Planos",
    url: "/planos",
    icon: Package,
  },
  {
    title: "Financeiro",
    url: "/financeiro",
    icon: CreditCard,
  },
  {
    title: "Usuários",
    url: "/usuarios",
    icon: Users,
  },
  {
    title: "Empresas",
    url: "/empresas",
    icon: Building2,
  },
];

export function AppSidebar() {
  const location = useLocation();
  const { currentCompany } = useCompanies();

  return (
    <Sidebar className="border-r border-gray-200">
      <SidebarHeader className="p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">WhatsApp</h1>
            <p className="text-sm text-gray-500">Automation</p>
            {currentCompany && (
              <p className="text-xs text-blue-600 font-medium mt-1">{currentCompany.name}</p>
            )}
          </div>
        </div>
        <CompanySelector />
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-gray-500 uppercase tracking-wider px-3 py-2">
            Navegação
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location.pathname === item.url}>
                    <Link 
                      to={item.url} 
                      className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        location.pathname === item.url
                          ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-500'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <Button 
          variant="ghost" 
          className="w-full justify-start text-gray-700 hover:text-red-600 hover:bg-red-50"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sair
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
