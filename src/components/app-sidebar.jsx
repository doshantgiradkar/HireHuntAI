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
  IconCalendar,
  IconUser,
  
} from "@tabler/icons-react"

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

const candidateNavData = {
  user: {
    name: "Candidate User",
    email: "candidate@example.com",
    avatar: "/avatars/default.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/candidate/dashboard",
      icon: IconDashboard,
    },
    {
      title: "Job Listings",
      url: "/candidate/jobs",
      icon: IconFolder,
    },
    {
      title: "My Applications",
      url: "/candidate/applications",
      icon: IconFileDescription,
    },
    {
      title: "Interview Schedule",
      url: "/candidate/schedule",
      icon: IconCalendar,
    },
    {
      title: "Feedback & Results",
      url: "/candidate/feedback",
      icon: IconReport,
    },
  ],
  navSecondary: [
    {
      title: "My Profile",
      url: "/candidate/profile/current-user", // Update this with actual user ID when implementing auth
      icon: IconUser,
    },
    {
      title: "Settings",
      url: "/candidate/settings",
      icon: IconSettings,
    },
  ],
  documents: [],
}

const recruiterNavData = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "#",
      icon: IconDashboard,
    },
    {
      title: "Lifecycle",
      url: "#",
      icon: IconListDetails,
    },
    {
      title: "Analytics",
      url: "#",
      icon: IconChartBar,
    },
    {
      title: "Projects",
      url: "#",
      icon: IconFolder,
    },
    {
      title: "Team",
      url: "#",
      icon: IconUsers,
    },
  ],
  navClouds: [
    {
      title: "Capture",
      icon: IconCamera,
      isActive: true,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Proposal",
      icon: IconFileDescription,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Prompts",
      icon: IconFileAi,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: IconSettings,
    },
    {
      title: "Get Help",
      url: "#",
      icon: IconHelp,
    },
    {
      title: "Search",
      url: "#",
      icon: IconSearch,
    },
  ],
  documents: [
    {
      name: "Data Library",
      url: "#",
      icon: IconDatabase,
    },
    {
      name: "Reports",
      url: "#",
      icon: IconReport,
    },
    {
      name: "Word Assistant",
      url: "#",
      icon: IconFileWord,
    },
  ],
}

export function AppSidebar({
  dashboardType = 'recruiter',
  ...props
}) {
  const navData = dashboardType === 'candidate' ? candidateNavData : recruiterNavData;

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
              <a href={dashboardType === 'candidate' ? '/candidate/dashboard' : '/'}>
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">
                  {dashboardType === 'candidate' ? 'Interview Portal' : 'Acme Inc.'}
                </span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navData.navMain} dashboardType={dashboardType} />
        {dashboardType === 'recruiter' && (
          <>
            <NavDocuments items={navData.documents} />
            <NavSecondary items={navData.navSecondary} className="mt-auto" />
          </>
        )}
        {dashboardType === 'candidate' && (
          <NavSecondary items={navData.navSecondary} className="mt-auto" />
        )}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={navData.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
