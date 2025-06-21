import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export default function ProfilePage({ params }) {
  const { userId } = params

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
          <h1 className="text-2xl font-bold">My Profile</h1>
          {/* Now we can use userId in our profile page */}
          <div>User ID: {userId}</div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
