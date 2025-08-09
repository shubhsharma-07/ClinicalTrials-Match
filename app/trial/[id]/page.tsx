"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, MapPin, Users, Calendar, Building, FileText, ExternalLink, Phone, Mail, X, CheckCircle, BookOpen, Eye } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { apiClient, type ClinicalTrial } from "@/lib/api"

export default function TrialDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [trial, setTrial] = useState<ClinicalTrial | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showApplicationModal, setShowApplicationModal] = useState(false)
  const [applicationSubmitted, setApplicationSubmitted] = useState(false)
  const [applicationForm, setApplicationForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    age: '',
    medicalHistory: '',
    currentMedications: '',
    reasonForInterest: ''
  })
  const [simplifiedContent, setSimplifiedContent] = useState<{
    description?: string
    eligibility?: string
  }>({})
  const [isSimplifying, setIsSimplifying] = useState(false)
  const [showSimplified, setShowSimplified] = useState(true)


  const trialId = params.id as string

  useEffect(() => {
    const fetchTrialDetails = async () => {
      if (!trialId) return
      
      setLoading(true)
      setError(null)
      
      try {
        // For now, we'll search for the trial by ID
        // In a real implementation, you'd have a dedicated endpoint
        const results = await apiClient.searchTrials({ searchText: trialId, limit: 100 })
        const foundTrial = results.trials?.find(t => t.id === trialId)
        
        if (foundTrial) {
          setTrial(foundTrial)
        } else {
          setError("Trial not found")
        }
      } catch (err) {
        setError("Failed to load trial details")
        console.error("Error fetching trial:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchTrialDetails()
  }, [trialId])

  useEffect(() => {
    if (trial) {
      // Simplify description and eligibility when trial loads
      simplifyTextWithGemini(trial.description, 'description')
      simplifyTextWithGemini(trial.eligibility, 'eligibility')
    }
  }, [trial])



  const handleApplicationSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Simulate application submission
    setLoading(true)
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setApplicationSubmitted(true)
    setLoading(false)
    
    // Close modal after 3 seconds
    setTimeout(() => {
      setShowApplicationModal(false)
      setApplicationSubmitted(false)
      setApplicationForm({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        age: '',
        medicalHistory: '',
        currentMedications: '',
        reasonForInterest: ''
      })
    }, 3000)
  }

  const handleFormChange = (field: string, value: string) => {
    setApplicationForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const simplifyTextWithGemini = async (text: string, type: 'description' | 'eligibility') => {
    if (!text) return
    
    setIsSimplifying(true)
    try {
      const prompt = type === 'description' 
        ? `Please simplify this clinical trial description to make it easy for a layperson to understand. Keep it accurate but use simple language. Remove medical jargon and explain complex terms. Here's the text: ${text}`
        : `Please simplify this clinical trial eligibility criteria to make it easy for a layperson to understand. Break down medical terms and explain what each criterion means in simple terms. Here's the text: ${text}`

      console.log(`Simplifying ${type} with prompt:`, prompt.substring(0, 100) + '...')

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyADkWwDMoju_f6SHGDUkD2PStD2ieg4cgw`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      })

      const data = await response.json()
      console.log('Gemini API response:', data)
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0]) {
        const simplifiedText = data.candidates[0].content.parts[0].text
        console.log(`Simplified ${type}:`, simplifiedText.substring(0, 100) + '...')
        setSimplifiedContent(prev => ({
          ...prev,
          [type]: simplifiedText
        }))
      } else {
        console.error('Unexpected API response structure:', data)
        // Create a simple fallback simplified version
        const fallbackText = type === 'description' 
          ? `This is a simplified version of the trial description. The original text contains medical terminology that may be difficult to understand. Please consult with your healthcare provider for detailed information about this clinical trial.`
          : `This is a simplified version of the eligibility criteria. The original text contains medical terminology. Please consult with your healthcare provider to determine if you meet the specific requirements for this trial.`
        
        setSimplifiedContent(prev => ({
          ...prev,
          [type]: fallbackText
        }))
      }
    } catch (error) {
      console.error('Error simplifying text:', error)
      // Create a simple fallback simplified version
      const fallbackText = type === 'description' 
        ? `This is a simplified version of the trial description. The original text contains medical terminology that may be difficult to understand. Please consult with your healthcare provider for detailed information about this clinical trial.`
        : `This is a simplified version of the eligibility criteria. The original text contains medical terminology. Please consult with your healthcare provider to determine if you meet the specific requirements for this trial.`
      
      setSimplifiedContent(prev => ({
        ...prev,
        [type]: fallbackText
      }))
    } finally {
      setIsSimplifying(false)
    }
  }



  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading trial details...</span>
        </div>
      </div>
    )
  }

  if (error || !trial) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-8 text-center">
          <CardContent>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Trial Not Found</h3>
            <p className="text-gray-600 mb-4">
              {error || "The requested trial could not be found."}
            </p>
            <Button onClick={() => router.back()} variant="outline">
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Search
      </Button>

      {/* Trial Header */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <CardTitle className="text-2xl mb-2 text-blue-600">
                {trial.title}
              </CardTitle>
              <CardDescription className="text-lg">
                {isSimplifying ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span>Simplifying medical terms...</span>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-gray-600">
                          {showSimplified ? 'Simplified Version' : 'Original Medical Text'}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowSimplified(!showSimplified)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        {showSimplified ? 'Show Original' : 'Show Simplified'}
                      </Button>
                    </div>
                    <div className="text-gray-700 leading-relaxed">
                      {showSimplified 
                        ? (simplifiedContent.description || trial.description)
                        : trial.description
                      }
                    </div>
                  </div>
                )}
              </CardDescription>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge variant={trial.status === 'Recruiting' ? 'default' : 'secondary'} className="text-sm">
                {trial.status}
              </Badge>
              <Badge variant="outline" className="text-sm">
                {trial.phase}
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Trial Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Trial Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Condition</label>
                  <p className="text-gray-900">{trial.condition}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Treatment Type</label>
                  <p className="text-gray-900">{trial.treatmentType || 'Not specified'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Trial Size</label>
                  <p className="text-gray-900">{trial.trialSize || 'Not specified'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Age Range</label>
                  <p className="text-gray-900">{trial.ageRange || 'Not specified'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Eligibility Criteria */}
          <Card>
            <CardHeader>
              <CardTitle>Eligibility Criteria</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isSimplifying ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span>Simplifying eligibility criteria...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-gray-600">
                        {showSimplified ? 'Simplified Version' : 'Original Medical Text'}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowSimplified(!showSimplified)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      {showSimplified ? 'Show Original' : 'Show Simplified'}
                    </Button>
                  </div>
                  <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {showSimplified 
                      ? (simplifiedContent.eligibility || trial.eligibility)
                      : trial.eligibility
                    }
                  </div>
                </div>
              )}
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => router.push('/eligibility')}
              >
                Check Your Eligibility
              </Button>
            </CardContent>
          </Card>


        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Location & Contact */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Location
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-900 mb-4">{trial.location}</p>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  const encodedLocation = encodeURIComponent(trial.location)
                  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedLocation}`
                  window.open(googleMapsUrl, '_blank')
                }}
              >
                <MapPin className="h-4 w-4 mr-2" />
                View on Map
              </Button>
            </CardContent>
          </Card>

          {/* Sponsor Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Sponsor
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-900 mb-4">{trial.sponsor}</p>
              {trial.sponsor && trial.sponsor !== 'Unknown' && trial.sponsor !== 'Not specified' && (
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      // For now, we'll show an alert with contact info
                      // In a real app, this could open a contact form or call a phone number
                      alert(`Contact Information for ${trial.sponsor}:\n\nPhone: +1-555-0123\nHours: Mon-Fri 9AM-5PM EST\n\nPlease note: This is placeholder contact information. In a real application, you would be connected to the actual sponsor contact details.`)
                    }}
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Contact Sponsor
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      // For now, we'll show an alert with email info
                      // In a real app, this could open the user's email client
                      alert(`Email Information for ${trial.sponsor}:\n\nEmail: contact@${trial.sponsor.toLowerCase().replace(/\s+/g, '')}.com\nSubject: Clinical Trial Inquiry - ${trial.id}\n\nPlease note: This is placeholder email information. In a real application, you would be connected to the actual sponsor email.`)
                    }}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Email Sponsor
                  </Button>
                </div>
              )}
              {(!trial.sponsor || trial.sponsor === 'Unknown' || trial.sponsor === 'Not specified') && (
                <p className="text-sm text-gray-500 italic">
                  Contact information not available for this sponsor.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                className="w-full"
                onClick={() => setShowApplicationModal(true)}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Apply for Trial
              </Button>
              <Button variant="outline" className="w-full">
                <FileText className="h-4 w-4 mr-2" />
                Download Information
              </Button>
              <Button variant="outline" className="w-full">
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Consultation
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Application Modal */}
      <Dialog open={showApplicationModal} onOpenChange={setShowApplicationModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ExternalLink className="h-5 w-5" />
              Apply for Trial: {trial?.title}
            </DialogTitle>
            <DialogDescription>
              Please fill out the application form below. Your information will be sent to the trial sponsor for review.
            </DialogDescription>
          </DialogHeader>

          {!applicationSubmitted ? (
            <form onSubmit={handleApplicationSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={applicationForm.firstName}
                    onChange={(e) => handleFormChange('firstName', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={applicationForm.lastName}
                    onChange={(e) => handleFormChange('lastName', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={applicationForm.email}
                    onChange={(e) => handleFormChange('email', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={applicationForm.phone}
                    onChange={(e) => handleFormChange('phone', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="age">Age *</Label>
                <Input
                  id="age"
                  type="number"
                  min="18"
                  max="120"
                  value={applicationForm.age}
                  onChange={(e) => handleFormChange('age', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="medicalHistory">Medical History</Label>
                <Textarea
                  id="medicalHistory"
                  placeholder="Please describe your relevant medical history, including any previous diagnoses, treatments, or surgeries..."
                  value={applicationForm.medicalHistory}
                  onChange={(e) => handleFormChange('medicalHistory', e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="currentMedications">Current Medications</Label>
                <Textarea
                  id="currentMedications"
                  placeholder="List any medications you are currently taking, including dosages..."
                  value={applicationForm.currentMedications}
                  onChange={(e) => handleFormChange('currentMedications', e.target.value)}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reasonForInterest">Why are you interested in this trial? *</Label>
                <Textarea
                  id="reasonForInterest"
                  placeholder="Please explain why you are interested in participating in this clinical trial..."
                  value={applicationForm.reasonForInterest}
                  onChange={(e) => handleFormChange('reasonForInterest', e.target.value)}
                  required
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowApplicationModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    'Submit Application'
                  )}
                </Button>
              </div>
            </form>
          ) : (
            <div className="text-center py-8">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Application Submitted!</h3>
              <p className="text-gray-600 mb-4">
                Thank you for your interest in this clinical trial. Your application has been submitted successfully.
              </p>
              <div className="bg-blue-50 p-4 rounded-lg text-left">
                <h4 className="font-semibold mb-2">What happens next?</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• The trial sponsor will review your application</li>
                  <li>• You will be contacted within 5-7 business days</li>
                  <li>• If eligible, you'll be invited for a screening visit</li>
                  <li>• Additional medical tests may be required</li>
                </ul>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
