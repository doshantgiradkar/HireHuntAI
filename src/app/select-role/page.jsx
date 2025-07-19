'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Users, UserCheck, Briefcase, Search } from 'lucide-react'
import { useSession } from 'next-auth/react'

export default function SelectRolePage() {
  const [role, setRole] = useState('candidate') // default role
  const [isLoading, setIsLoading] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState(null)

  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return
    if (!session?.user) {
      router.push('/api/auth/signin')
    } else {
      setIsLoaded(true)
    }
  }, [session, status, router])

  const handleSaveRole = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/set-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      })

      if (!res.ok) {
        throw new Error('Failed to set role. Please try again.')
      }

      router.push(`/${role}/dashboard`)
    } catch (err) {
      setError(err.message || 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center pb-6">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Welcome to TalentHunt
          </CardTitle>
          <CardDescription className="text-gray-600 mt-2">
            Choose your role to get started with our AI-powered recruitment platform
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertDescription className="text-red-700">{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="relative">
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger className="w-full h-12 text-left">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="candidate" className="p-3">
                      <div className="flex items-center space-x-3">
                        <UserCheck className="h-5 w-5 text-green-600" />
                        <div>
                          <div className="font-medium">Candidate</div>
                          <div className="text-sm text-gray-500">Looking for job opportunities</div>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="recruiter" className="p-3">
                      <div className="flex items-center space-x-3">
                        <Briefcase className="h-5 w-5 text-blue-600" />
                        <div>
                          <div className="font-medium">Recruiter</div>
                          <div className="text-sm text-gray-500">Hiring talented professionals</div>
                        </div>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Search className="h-4 w-4" />
                <span>AI-powered matching technology</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <UserCheck className="h-4 w-4" />
                <span>Smart candidate screening</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Briefcase className="h-4 w-4" />
                <span>Streamlined hiring process</span>
              </div>
            </div>
          </div>

          <Button
            onClick={handleSaveRole}
            disabled={!role || isLoading}
            className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium transition-all duration-200 transform hover:scale-105"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Setting up your account...</span>
              </div>
            ) : (
              'Continue to Dashboard'
            )}
          </Button>

          <div className="text-center text-sm text-gray-500 mt-4">
            You can change your role later in account settings
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
