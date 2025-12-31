'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  MapPin,
  Calendar,
  Briefcase,
  GraduationCap,
  Award,
  Link2,
  FileText,
  Edit,
  Loader2,
  Github,
  Linkedin,
  Code,
  ExternalLink,
  Mail,
  Phone
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth, useUser } from '@clerk/nextjs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function CandidateProfile() {
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const { getToken } = useAuth();
  const { user, isLoaded: isUserLoaded } = useUser();

  useEffect(() => {
    fetchCandidateData();
  }, []);

  const fetchCandidateData = async () => {
    try {
      const clerkToken = await getToken();
      const response = await fetch('/api/candidate', {
        headers: {
          Authorization: `Bearer ${clerkToken}`
        }
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch candidate data');
      }

      setCandidate(data.candidate);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getSocialIcon = (name) => {
    const icons = {
      github: Github,
      linkedin: Linkedin,
      leetcode: Code,
      others: Link2
    };
    const Icon = icons[name] || Link2;
    return <Icon className="h-4 w-4" />;
  };

  const getEducationLabel = (type) => {
    const labels = {
      SSC: 'Secondary School Certificate',
      HSC: 'Higher Secondary Certificate',
      UG: 'Undergraduate',
      PG: 'Postgraduate',
      Diploma: 'Diploma'
    };
    return labels[type] || type;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getInitials = () => {
    if (!user) return 'U';
    const first = user.firstName?.[0] || '';
    const last = user.lastName?.[0] || '';
    return (first + last).toUpperCase() || 'U';
  };

  if (loading || !isUserLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Alert>
          <AlertDescription>No candidate profile found.</AlertDescription>
        </Alert>
      </div>
    );
  }

  const { resume, address } = candidate;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header Section with User Info */}
        <div className="mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={user?.imageUrl} alt={user?.fullName || 'User'} />
                    <AvatarFallback className="text-lg">{getInitials()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h1 className="text-3xl font-bold">{user?.fullName || 'Candidate Profile'}</h1>
                    <p className="text-muted-foreground mt-1">
                      {user?.primaryEmailAddress?.emailAddress}
                    </p>
                    {user?.publicMetadata?.role && (
                      <Badge variant="secondary" className="mt-2">
                        {user.publicMetadata.role}
                      </Badge>
                    )}
                  </div>
                </div>
                <Button
                  onClick={() => router.push('/candidate/edit-profile')}
                  className="flex items-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Edit Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Personal Info & Resume */}
          <div className="lg:col-span-1 space-y-6">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="h-5 w-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {user?.primaryEmailAddress && (
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Email</p>
                      <p className="text-sm text-muted-foreground break-all">
                        {user.primaryEmailAddress.emailAddress}
                      </p>
                    </div>
                  </div>
                )}

                {user?.primaryPhoneNumber && (
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Phone</p>
                      <p className="text-sm text-muted-foreground">
                        {user.primaryPhoneNumber.phoneNumber}
                      </p>
                    </div>
                  </div>
                )}

                {candidate.dateOfBirth && (
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Date of Birth</p>
                      <p className="text-sm text-muted-foreground">{formatDate(candidate.dateOfBirth)}</p>
                    </div>
                  </div>
                )}

                {candidate.totalExperienceDuration !== undefined && (
                  <div className="flex items-start gap-3">
                    <Briefcase className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Total Experience</p>
                      <p className="text-sm text-muted-foreground">
                        {candidate.totalExperienceDuration} {candidate.totalExperienceDuration === 1 ? 'year' : 'years'}
                      </p>
                    </div>
                  </div>
                )}

                {candidate.address && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Address</p>
                      <p className="text-sm text-muted-foreground">
                        {candidate.address.line}<br />
                        {candidate.address.city}, {candidate.address.state}<br />
                        {candidate.address.pinCode}, {candidate.address.country}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Profile Status */}
            {user?.publicMetadata && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <FileText className="h-5 w-5" />
                    Profile Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Profile Complete</span>
                    <Badge variant={user.publicMetadata.isProfileComplete ? 'default' : 'secondary'}>
                      {user.publicMetadata.isProfileComplete ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Resume Uploaded</span>
                    <Badge variant={user.publicMetadata.hasResume ? 'default' : 'secondary'}>
                      {user.publicMetadata.hasResume ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                  {candidate.appliedJobs?.length > 0 && (
                    <div className="pt-3 border-t">
                      <p className="text-sm font-medium">Total Applications</p>
                      <p className="text-2xl font-bold mt-1">{candidate.appliedJobs.length}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Resume & ATS Score */}
            {candidate.resume && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <FileText className="h-5 w-5" />
                    Resume
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {candidate.resume.atsScore !== undefined && (
                    <div className="text-center p-6 bg-primary/5 rounded-lg border">
                      <p className="text-sm text-muted-foreground mb-2">ATS Score</p>
                      <p className="text-4xl font-bold">{candidate.resume.atsScore}%</p>
                    </div>
                  )}

                  {candidate.resume.resumeUrl && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => window.open(candidate.resume.resumeUrl, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Resume
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Social Links */}
            {candidate.resume?.socials?.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Link2 className="h-5 w-5" />
                    Social Links
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">

                  {candidate.resume.socials.map((social, index) => (
                    <a
                      key={index}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-md hover:bg-accent transition-colors border"
                    >
                      {getSocialIcon(social.name)}
                      <span className="text-sm font-medium capitalize">{social.name}</span>
                      <ExternalLink className="h-3 w-3 ml-auto text-muted-foreground" />
                    </a>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Education, Experience, Skills, Certifications */}
          <div className="lg:col-span-2 space-y-6">
            {/* Skills */}
            {candidate.resume?.skills?.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Code className="h-5 w-5" />
                    Skills
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {candidate.resume.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Experience */}
            {candidate.resume?.experience?.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Briefcase className="h-5 w-5" />
                    Work Experience
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {candidate.resume.experience.map((exp, index) => (
                    <div key={index} className={index > 0 ? 'pt-4 border-t' : ''}>
                      <h3 className="font-semibold text-base">{exp.jobTitle}</h3>
                      {exp.jobDesc && (
                        <p className="text-sm text-muted-foreground mt-2">{exp.jobDesc}</p>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Education */}
            {candidate.resume?.education?.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <GraduationCap className="h-5 w-5" />
                    Education
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {candidate.resume.education.map((edu, index) => (
                    <div key={index} className={index > 0 ? 'pt-4 border-t' : ''}>
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <h3 className="font-semibold text-base">{edu.course}</h3>
                          <p className="text-sm text-muted-foreground">{edu.instituteName}</p>
                          <Badge variant="outline">
                            {getEducationLabel(edu.eduType)}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {edu.score}{edu.isCGPA ? ' CGPA' : '%'}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">{edu.yearOfComp}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Certifications */}
            {candidate.resume?.certifications?.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Award className="h-5 w-5" />
                    Certifications
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {candidate.resume.certifications.map((cert, index) => (
                    <div key={index} className={index > 0 ? 'pt-4 border-t' : ''}>
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-base">{cert.name}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{cert.provider}</p>
                          {cert.url && (
                            <a
                              href={cert.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-primary hover:underline mt-2 inline-flex items-center gap-1"
                            >
                              View Certificate
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                        {cert.yearOfComp && (
                          <p className="text-sm text-muted-foreground">{cert.yearOfComp}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
