"use client"

import * as React from "react"
import {
  IconCamera,
  IconChartBar,
  IconDashboard,
  IconDatabase,
  IconFileAi,
  IconFileDescription,
  IconFileWord,
  IconFolder,
  IconHelp,
  IconInnerShadowTop,
  IconListDetails,
  IconReport,
  IconSearch,
  IconSettings,
  IconUsers,
} from "@tabler/icons-react"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

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
      title: "Candidates",
      url: "/recruiter/candidates",
      icon: IconUsers,
    },
    {
      title: "Analytics",
      url: "/recruiter/analytics",
      icon: IconChartBar,
    },
    {
      title: "Interview Panel",
      url: "/recruiter/panel",
      icon: IconUsers,
    },
  ],
  documents: [
    {
      name: "Resume Database",
      url: "/recruiter/resumes",
      icon: IconDatabase,
    },
    {
      name: "Reports",
      url: "/recruiter/reports",
      icon: IconReport,
    },
    {
      name: "Templates",
      url: "/recruiter/templates",
      icon: IconFileWord,
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "/recruiter/settings",
      icon: IconSettings,
    },
    {
      title: "Help",
      url: "/recruiter/help",
      icon: IconHelp,
    },
  ],
}

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
  ],
  documents: [
    {
      name: "My Resume",
      url: "/candidate/resume",
      icon: IconFileWord,
    },
    {
      name: "Documents",
      url: "/candidate/documents",
      icon: IconDatabase,
    },
  ],
  navSecondary: [
    {
      title: "Profile Settings",
      url: "/candidate/settings",
      icon: IconSettings,
    },
    {
      title: "Help Center",
      url: "/candidate/help",
      icon: IconHelp,
    },
  ],
}

export function AppSidebar({
  dashboardType = "candidate", // 'recruiter' or 'candidate'
  ...props
}) {
  const routes =
    dashboardType === "recruiter" ? recruiterRoutes : candidateRoutes

  return (
    <Sidebar collapsible="offcanvas" className="flex flex-col h-full" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
              <a href="#">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">Acme Inc.</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="flex-1 flex flex-col">
        <NavMain items={routes.navMain} />
        <NavDocuments items={routes.documents} />
        <NavSecondary items={routes.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
    

