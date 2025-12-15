// app/company-profile/page.jsx
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Building2, MapPin, Calendar, Globe, Users, Briefcase, Mail, Phone, Clock, Edit } from "lucide-react"

const companyData = {
  logo: "https://api.dicebear.com/7.x/initials/svg?seed=TechCorp",
  name: "TechCorp Solutions",
  industry: "Information Technology",
  size: "201-500 employees",
  status: "Active",
  overview: "TechCorp Solutions is a leading technology company specializing in enterprise software solutions and digital transformation services. We empower businesses to achieve their goals through innovative technology and strategic consulting.",
  website: "https://techcorpsolutions.com",
  headquarters: "San Francisco, California, USA",
  founded: "2015",
  hiringModel: "Hybrid",
  companyType: "Enterprise",
  primaryRoles: ["Software Engineer", "Product Manager", "Data Scientist", "UX Designer"],
  interviewProcess: "Hybrid",
  contactEmail: "careers@techcorpsolutions.com",
  contactPhone: "+1 (555) 123-4567",
  admin: {
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=SarahJohnson",
    name: "Sarah Johnson",
    role: "Senior Talent Acquisition Manager",
    email: "sarah.johnson@techcorpsolutions.com",
    phone: "+1 (555) 987-6543",
    timezone: "Pacific Time (PT)",
    location: "San Francisco, CA",
    status: "Active"
  }
}

export default function CompanyProfilePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={companyData.logo} alt={companyData.name} />
                  <AvatarFallback><Building2 className="h-12 w-12" /></AvatarFallback>
                </Avatar>
                
                <div className="flex-1 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <CardTitle className="text-3xl">{companyData.name}</CardTitle>
                    <Badge variant={companyData.status === "Active" ? "default" : "secondary"}>
                      {companyData.status}
                    </Badge>
                  </div>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Briefcase className="h-4 w-4" />
                      <span>{companyData.industry}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{companyData.size}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{companyData.headquarters}</span>
                    </div>
                  </div>
                </div>
                
                <Button className="self-start sm:self-center">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Company Profile
                </Button>
              </div>
            </CardHeader>
          </Card>

          <Tabs defaultValue="about" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="about">About Company</TabsTrigger>
              <TabsTrigger value="contact">Contact Info</TabsTrigger>
              <TabsTrigger value="admin">Admin Info</TabsTrigger>
            </TabsList>

            <TabsContent value="about" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Company Information</CardTitle>
                  <CardDescription>Overview and key details about the company</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Company Overview</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {companyData.overview}
                    </p>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <span>Website</span>
                      </div>
                      <a href={companyData.website} className="text-sm text-primary hover:underline ml-6">
                        {companyData.website}
                      </a>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>Headquarters</span>
                      </div>
                      <p className="text-sm text-muted-foreground ml-6">{companyData.headquarters}</p>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>Founded</span>
                      </div>
                      <p className="text-sm text-muted-foreground ml-6">{companyData.founded}</p>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span>Hiring Model</span>
                      </div>
                      <Badge variant="outline" className="ml-6">{companyData.hiringModel}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Company Details</CardTitle>
                  <CardDescription>Additional information and hiring preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <h3 className="text-sm font-medium">Company Type</h3>
                      <p className="text-sm text-muted-foreground">{companyData.companyType}</p>
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-sm font-medium">Interview Process Type</h3>
                      <Badge variant="secondary">{companyData.interviewProcess}</Badge>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Primary Hiring Roles</h3>
                    <div className="flex flex-wrap gap-2">
                      {companyData.primaryRoles.map((role, index) => (
                        <Badge key={index} variant="outline">
                          {role}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="contact" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                  <CardDescription>Get in touch with the company</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>Career Email</span>
                      </div>
                      <a href={`mailto:${companyData.contactEmail}`} className="text-sm text-primary hover:underline ml-6">
                        {companyData.contactEmail}
                      </a>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>Contact Phone</span>
                      </div>
                      <a href={`tel:${companyData.contactPhone}`} className="text-sm text-primary hover:underline ml-6">
                        {companyData.contactPhone}
                      </a>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <span>Company Website</span>
                      </div>
                      <a href={companyData.website} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline ml-6">
                        {companyData.website}
                      </a>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>Office Location</span>
                      </div>
                      <p className="text-sm text-muted-foreground ml-6">{companyData.headquarters}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="admin" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <CardTitle>Company Administrator</CardTitle>
                      <CardDescription>Primary contact for managing company profile and recruitment</CardDescription>
                    </div>
                    <Button variant="outline" size="sm">
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Admin Info
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={companyData.admin.avatar} alt={companyData.admin.name} />
                        <AvatarFallback>{companyData.admin.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold">{companyData.admin.name}</h3>
                          <Badge variant={companyData.admin.status === "Active" ? "default" : "secondary"}>
                            {companyData.admin.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{companyData.admin.role}</p>
                      </div>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span>Email Address</span>
                        </div>
                        <a href={`mailto:${companyData.admin.email}`} className="text-sm text-primary hover:underline ml-6">
                          {companyData.admin.email}
                        </a>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>Phone Number</span>
                        </div>
                        <a href={`tel:${companyData.admin.phone}`} className="text-sm text-primary hover:underline ml-6">
                          {companyData.admin.phone}
                        </a>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>Timezone</span>
                        </div>
                        <p className="text-sm text-muted-foreground ml-6">{companyData.admin.timezone}</p>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>Location</span>
                        </div>
                        <p className="text-sm text-muted-foreground ml-6">{companyData.admin.location}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}