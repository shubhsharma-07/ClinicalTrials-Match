"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle, AlertCircle, ArrowRight, ArrowLeft, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { apiClient, type EligibilityQuestion, type AssessmentAnswer, type AssessmentResult } from "@/lib/api"

export default function EligibilityPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [answers, setAnswers] = useState<AssessmentAnswer>({})
  const [questions, setQuestions] = useState<EligibilityQuestion[]>([])
  const [loading, setLoading] = useState(false)
  const [assessmentResult, setAssessmentResult] = useState<AssessmentResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [questionsLoading, setQuestionsLoading] = useState(true)
  const totalSteps = 5

  // Load eligibility questions on component mount
  useEffect(() => {
    loadQuestions()
  }, [])

  const loadQuestions = async () => {
    try {
      setQuestionsLoading(true)
      console.log('Loading eligibility questions...')
      console.log('API client:', apiClient)
      console.log('API client methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(apiClient)))
      
      const questionsData = await apiClient.getEligibilityQuestions()
      console.log('Questions loaded:', questionsData)
      console.log('Questions type:', typeof questionsData)
      console.log('Questions length:', questionsData?.length)
      
      if (Array.isArray(questionsData)) {
        setQuestions(questionsData)
        console.log('Questions state updated:', questionsData)
      } else {
        console.error('Questions data is not an array:', questionsData)
        setError('Invalid questions data received from server')
      }
    } catch (error) {
      console.error('Error loading questions:', error)
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      })
      setError('Failed to load eligibility questions. Please try again.')
    } finally {
      setQuestionsLoading(false)
      console.log('Questions loading finished, questions state:', questions)
    }
  }

  const handleAnswer = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }))
  }

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await apiClient.submitAssessment(answers)
      setAssessmentResult(result)
      setCurrentStep(totalSteps + 1)
    } catch (error) {
      console.error('Error submitting assessment:', error)
      setError('Failed to process your assessment. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Get the current question based on step
  const currentQuestion = questions[currentStep - 1]
  const progress = (currentStep / totalSteps) * 100

  if (currentStep > totalSteps) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl">Eligibility Assessment Complete!</CardTitle>
              <CardDescription className="text-lg">
                {assessmentResult?.summary?.description || 'Based on your answers, we found several trials you might be eligible for.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {assessmentResult?.matches && assessmentResult.matches.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-4">
                  {assessmentResult.matches.slice(0, 2).map((match, index) => (
                    <Card key={index} className={`border-${index === 0 ? 'green' : 'blue'}-200`}>
                      <CardHeader>
                        <CardTitle className={`text-lg text-${index === 0 ? 'green' : 'blue'}-700`}>
                          {index === 0 ? 'High Match' : 'Good Match'}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="font-medium">{match.trial?.title || 'Clinical Trial'}</div>
                          <div className="text-sm text-gray-600">
                            {match.trial?.location ? (
                              <span 
                                className="cursor-pointer hover:text-blue-600 hover:underline"
                                onClick={() => {
                                  const encodedLocation = encodeURIComponent(match.trial.location)
                                  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedLocation}`
                                  window.open(googleMapsUrl, '_blank')
                                }}
                                title="Click to view on Google Maps"
                              >
                                {match.trial.location}
                              </span>
                            ) : (
                              'Location TBD'
                            )}
                          </div>
                          <Badge className={`bg-${index === 0 ? 'green' : 'blue'}-100 text-${index === 0 ? 'green' : 'blue'}-800`}>
                            {match.eligibilityScore || 'N/A'}% Match
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  <Card className="border-green-200">
                    <CardHeader>
                      <CardTitle className="text-lg text-green-700">High Match</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="font-medium">Immunotherapy Trial for Advanced Lung Cancer</div>
                        <div className="text-sm text-gray-600">
                          <span 
                            className="cursor-pointer hover:text-blue-600 hover:underline"
                            onClick={() => {
                              const encodedLocation = encodeURIComponent('Memorial Sloan Kettering, NY')
                              const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedLocation}`
                              window.open(googleMapsUrl, '_blank')
                            }}
                            title="Click to view on Google Maps"
                          >
                            Memorial Sloan Kettering, NY
                          </span>
                        </div>
                        <Badge className="bg-green-100 text-green-800">95% Match</Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-blue-200">
                    <CardHeader>
                      <CardTitle className="text-lg text-blue-700">Good Match</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="font-medium">Targeted Therapy Combination Study</div>
                        <div className="text-sm text-gray-600">
                          <span 
                            className="cursor-pointer hover:text-blue-600 hover:underline"
                            onClick={() => {
                              const encodedLocation = encodeURIComponent('Johns Hopkins, MD')
                              const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedLocation}`
                              window.open(googleMapsUrl, '_blank')
                            }}
                            title="Click to view on Google Maps"
                          >
                            Johns Hopkins, MD
                          </span>
                        </div>
                        <Badge className="bg-blue-100 text-blue-800">78% Match</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              <div className="bg-blue-50 p-6 rounded-lg text-left">
                <h3 className="font-semibold mb-2 flex items-center">
                  <AlertCircle className="mr-2 h-5 w-5 text-blue-600" />
                  Important Next Steps
                </h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• Contact the study teams to confirm your eligibility</li>
                  <li>• Discuss these options with your oncologist</li>
                  <li>• Ask about any additional tests you might need</li>
                  <li>• Consider the time commitment and travel requirements</li>
                </ul>
              </div>

              <div className="flex gap-4 justify-center">
                <Button 
                  size="lg"
                  onClick={() => router.push('/')}
                >
                  Back to Home
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => {
                    setCurrentStep(1)
                    setAnswers({})
                    setAssessmentResult(null)
                    setError(null)
                  }}
                >
                  Start New Assessment
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (questionsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <Card className="text-center py-12">
            <CardContent>
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading eligibility questions...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <Card className="text-center py-12">
            <CardContent>
              {error ? (
                <>
                  <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                  <p className="text-red-600 mb-4">{error}</p>
                  <Button onClick={loadQuestions}>Try Again</Button>
                </>
              ) : (
                <>
                  <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                  <p className="text-red-600 mb-4">No eligibility questions available</p>
                  <Button onClick={loadQuestions}>Try Again</Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Progress Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">Eligibility Assessment</h1>
            <span className="text-sm text-gray-600">
              Step {currentStep} of {totalSteps}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">{currentQuestion?.question || 'Loading question...'}</CardTitle>
            <CardDescription className="text-base">
              {currentQuestion?.field && `Field: ${currentQuestion.field}`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {currentQuestion?.type === "select" && currentQuestion.options && (
              <RadioGroup
                value={answers[currentQuestion.field] || ""}
                onValueChange={(value) => handleAnswer(currentQuestion.field, value)}
              >
                {currentQuestion.options.map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <RadioGroupItem value={option} id={option} />
                    <Label htmlFor={option} className="text-base cursor-pointer">
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}

            {currentQuestion?.type === "number" && (
              <div className="space-y-2">
                <Label htmlFor={currentQuestion.field} className="text-base">
                  {currentQuestion.question}
                </Label>
                <Input
                  id={currentQuestion.field}
                  type="number"
                  placeholder={currentQuestion.placeholder || "Enter your answer"}
                  min={currentQuestion.validation?.min}
                  max={currentQuestion.validation?.max}
                  value={answers[currentQuestion.field] || ""}
                  onChange={(e) => handleAnswer(currentQuestion.field, e.target.value)}
                />
              </div>
            )}

            {currentQuestion?.type === "text" && (
              <div className="space-y-2">
                <Label htmlFor={currentQuestion.field} className="text-base">
                  {currentQuestion.question}
                </Label>
                <Input
                  id={currentQuestion.field}
                  type="text"
                  placeholder={currentQuestion.placeholder || "Enter your answer"}
                  value={answers[currentQuestion.field] || ""}
                  onChange={(e) => handleAnswer(currentQuestion.field, e.target.value)}
                />
              </div>
            )}

            {currentQuestion?.type === "multiselect" && currentQuestion.options && (
              <div className="space-y-2">
                <Label className="text-base">{currentQuestion.question}</Label>
                <div className="space-y-2">
                  {currentQuestion.options.map((option) => (
                    <div key={option} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`${currentQuestion.field}-${option}`}
                        value={option}
                        checked={answers[currentQuestion.field]?.includes(option) || false}
                        onChange={(e) => {
                          const currentValues = answers[currentQuestion.field] || []
                          if (e.target.checked) {
                            handleAnswer(currentQuestion.field, [...currentValues, option])
                          } else {
                            handleAnswer(currentQuestion.field, currentValues.filter(v => v !== option))
                          }
                        }}
                      />
                      <Label htmlFor={`${currentQuestion.field}-${option}`} className="cursor-pointer">
                        {option}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6">
              <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 1}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>

              {currentStep === totalSteps ? (
                <Button onClick={handleSubmit} disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Complete Assessment
                      <CheckCircle className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              ) : (
                <Button onClick={handleNext}>
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            This assessment takes about 5 minutes and helps identify trials you might qualify for.
            <br />
            Your information is private and not stored.
          </p>
        </div>
      </div>
    </div>
  )
}
