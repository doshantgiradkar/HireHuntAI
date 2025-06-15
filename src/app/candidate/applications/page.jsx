import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export default function ApplicationsPage() {
  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)"
      }}>
      <AppSidebar variant="inset" dashboardType="candidate" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col p-6">
          <h1 className="text-2xl font-bold">My Applications</h1>
          {/* Add applications content here */}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
