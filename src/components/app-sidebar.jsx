"use client";

import * as React from "react";
import {
  IconCamera,
  IconChartBar,
  IconDashboard,
  IconFileWord,
  IconHelp,
  IconInfoCircle,
  IconListDetails,
  IconSearch,
  IconUser,
} from "@tabler/icons-react";

import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { SparklesIcon } from "lucide-react";

const recruiterRoutes = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/recruiter/dashboard",
      icon: IconDashboard,
    },
    {
      title: "Job Listings",
      url: "/recruiter/jobs",
      icon: IconListDetails,
    },
     {
      title: "Interviews",
      url: "/recruiter/interviews",
      icon: IconCamera,
    },
    {
      title: "Analytics",
      url: "/recruiter/analytics",
      icon: IconChartBar,
    },
  ],
  navSecondary: [
    {
      title: "Profile",
      url: "/recruiter/profile",
      icon: IconUser,
    },
    {
      title: "Help",
      url: "/recruiter/help",
      icon: IconHelp,
    },
    {
      title: "About",
      url: "/recruiter/about",
      icon: IconInfoCircle,
    }
  ],
};

const candidateRoutes = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/candidate/dashboard",
      icon: IconDashboard,
    },
    {
      title: "My Applications",
      url: "/candidate/applications",
      icon: IconListDetails,
    },
    {
      title: "Job Search",
      url: "/candidate/jobs",
      icon: IconSearch,
    },
    {
      title: "Interviews",
      url: "/candidate/interviews",
      icon: IconCamera,
    },
    {
      title: "My Resume",
      url: "/candidate/resume",
      icon: IconFileWord,
    },
  ],

  navSecondary: [
    {
      title: "Profile ",
      url: "/candidate/profile",
      icon: IconUser,
    },
    {
      title: "Help Center",
      url: "/candidate/help",
      icon: IconHelp,
    },
    {
      title: "About",
      url: "/candidate/about",
      icon: IconInfoCircle,
    }
  ],
};

export function AppSidebar({
  dashboardType = "candidate", // 'recruiter' or 'candidate'
  ...props
}) {
  const routes =
    dashboardType === "recruiter" ? recruiterRoutes : candidateRoutes;

  return (
    <Sidebar
      collapsible="offcanvas"
      className="flex flex-col h-full"
      {...props}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <SparklesIcon className="!size-5" />
                <span className="text-base font-semibold">HireHunt AI</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="flex-1 flex flex-col">
        <NavMain items={routes.navMain} dashboardType={dashboardType} />
        {/* <NavDocuments items={routes.documents} /> */}
        <NavSecondary items={routes.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
