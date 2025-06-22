
import {
  Calendar,
  ChevronUp,
  CreditCard,
  Database,
  FileText,
  Home,
  Search,
  Settings,
  Building2,
  Users,
  BarChart3,
  Webhook,
  FileBarChart,
  Package
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { CompanySelector } from "./CompanySelector";
import { useAuth } from "@/hooks/useAuth";

// Menu items.
const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Empresas",
    url: "/empresas",
    icon: Building2,
  },
  {
    title: "Usuários",
    url: "/usuarios",
    icon: Users,
  },
  {
    title: "SQL Server",
    url: "/sql-server",
    icon: Database,
  },
  {
    title: "Consultas SQL",
    url: "/consultas-sql",
    icon: Search,
  },
  {
    title: "Relatórios",
    url: "/relatorios",
    icon: FileBarChart,
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
    title: "Agendamentos",
    url: "/agendamentos",
    icon: Calendar,
  },
  {
    title: "Webhooks",
    url: "/webhooks",
    icon: Webhook,
  },
  {
    title: "Configuração",
    url: "/configuracao",
    icon: Settings,
  },
];

export function AppSidebar() {
  const location = useLocation();
  const { userLogin, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <Sidebar variant="inset">
      <SidebarHeader>
        <CompanySelector />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild
                    isActive={location.pathname === item.url}
                  >
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{userLogin?.name || 'Usuário'}</span>
                    <span className="truncate text-xs">{userLogin?.email || ''}</span>
                  </div>
                  <ChevronUp className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuItem onClick={handleLogout}>
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
