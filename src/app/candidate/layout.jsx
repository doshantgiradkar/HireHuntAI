"use client";
import React, { useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import ChatbotBubble from "@/components/ChatbotBubble";
import ChatbotWindow from "@/components/ChatbotWindow";

export default function DashboardLayout({ children }) {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      }}
    >
      <AppSidebar variant="inset" dashboardType="candidate" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">{children}</div>
        <ChatbotBubble onClick={() => setIsChatOpen(true)} />
        <ChatbotWindow
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
        />
      </SidebarInset>
    </SidebarProvider>
  );
}
