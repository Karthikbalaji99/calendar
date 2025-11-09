import { Calendar, Heart, Image, BookOpen, CheckSquare, TrendingUp } from "lucide-react";
import { Link, useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar";
import pandaIcon from "@assets/generated_images/Panda_character_avatar_icon_c3ecdae1.png";
import cookieIcon from "@assets/generated_images/Cookie_character_avatar_icon_f4fe2d95.png";

const menuItems = [
  {
    title: "Calendar",
    url: "/",
    icon: Calendar,
  },
  {
    title: "Gratitude",
    url: "/gratitude",
    icon: Heart,
  },
  {
    title: "Memories",
    url: "/memories",
    icon: Image,
  },
  {
    title: "Journal",
    url: "/journal",
    icon: BookOpen,
  },
  {
    title: "Tasks",
    url: "/tasks",
    icon: CheckSquare,
  },
  {
    title: "Habits",
    url: "/habits",
    icon: TrendingUp,
  },
];

export function AppSidebar() {
  const [location] = useLocation();

  return (
    <Sidebar>
      <SidebarHeader className="p-6">
        <div className="flex items-center gap-3 justify-center">
          <img src={pandaIcon} alt="Panda" className="w-12 h-12" />
          <Heart className="w-5 h-5 text-chart-3" />
          <img src={cookieIcon} alt="Cookie" className="w-12 h-12" />
        </div>
        <h1 className="text-center text-lg font-bold mt-2">Our Calendar</h1>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url}
                    data-testid={`link-${item.title.toLowerCase()}`}
                  >
                    <Link href={item.url}>
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
    </Sidebar>
  );
}
