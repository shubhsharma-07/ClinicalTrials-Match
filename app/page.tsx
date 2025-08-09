"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowRight, Search, ClipboardList, BookOpen, MapPin, Users, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { apiClient, type ClinicalTrial } from "@/lib/api"

export default function HomePage() {
  const [featuredTrials, setFeaturedTrials] = useState<ClinicalTrial[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalTrials: 0,
    activeTrials: 0,
    locations: 0
  })

  useEffect(() => {
    loadFeaturedTrials()
    loadStats()
  }, [])

  const loadFeaturedTrials = async () => {
    try {
      // Get a few featured trials for the homepage
      const response = await apiClient.searchTrials({ 
        limit: 3, 
        sortBy: 'recent' 
      })
      setFeaturedTrials(response.trials)
    } catch (error) {
      console.error('Error loading featured trials:', error)
      // Fallback to empty array
      setFeaturedTrials([])
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const allTrials = await apiClient.getAllTrials()
      const activeTrials = allTrials.filter(trial => 
        trial.status.toLowerCase().includes('recruiting') || 
        trial.status.toLowerCase().includes('active')
      )
      
      // Get unique locations
      const uniqueLocations = new Set(allTrials.map(trial => trial.location))
      
      setStats({
        totalTrials: allTrials.length,
        activeTrials: activeTrials.length,
        locations: uniqueLocations.size
      })
    } catch (error) {
      console.error('Error loading stats:', error)
      // Fallback stats
      setStats({
        totalTrials: 60,
        activeTrials: 45,
        locations: 25
      })
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Find Your Perfect
            <span className="text-blue-600 block">Clinical Trial</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Connect with cutting-edge cancer research and find clinical trials that match your specific needs. 
            Our intelligent matching system helps you discover opportunities that could change your life.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/search">
              <Button size="lg" className="text-lg px-8 py-6">
                <Search className="mr-2 h-5 w-5" />
                Search Trials
              </Button>
            </Link>
            <Link href="/eligibility">
              <Button variant="outline" size="lg" className="text-lg px-8 py-6">
                <ClipboardList className="mr-2 h-5 w-5" />
                Check Eligibility
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">{stats.totalTrials}+</div>
              <div className="text-gray-600">Active Clinical Trials</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">{stats.activeTrials}+</div>
              <div className="text-gray-600">Currently Recruiting</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600 mb-2">{stats.locations}+</div>
              <div className="text-gray-600">Research Locations</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Trials Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Clinical Trials</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover some of the most promising cancer research studies currently available. 
              These trials represent cutting-edge treatments and innovative approaches.
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Loading featured trials...</span>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              {featuredTrials.map((trial) => (
                <Card key={trial.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="secondary">{trial.phase}</Badge>
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        {trial.status}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl line-clamp-2">{trial.title}</CardTitle>
                    <CardDescription className="line-clamp-3">{trial.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="mr-2 h-4 w-4" />
                        <span 
                          className="cursor-pointer hover:text-blue-600 hover:underline"
                          onClick={() => {
                            const encodedLocation = encodeURIComponent(trial.location)
                            const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedLocation}`
                            window.open(googleMapsUrl, '_blank')
                          }}
                          title="Click to view on Google Maps"
                        >
                          {trial.location}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="mr-2 h-4 w-4" />
                        {trial.participants}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 mb-4">
                      <span className="font-medium">Condition: </span>
                      {trial.condition}
                    </div>
                    <Link href={`/search?trial=${trial.id}`}>
                      <Button className="w-full">
                        Learn More
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="text-center">
            <Link href="/search">
              <Button variant="outline" size="lg">
                View All Trials
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our platform makes finding and participating in clinical trials simple and straightforward
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">1. Search & Filter</h3>
              <p className="text-gray-600">
                Use our advanced search to find trials by cancer type, location, phase, and other criteria
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ClipboardList className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">2. Check Eligibility</h3>
              <p className="text-gray-600">
                Take our quick assessment to see which trials you might qualify for
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">3. Connect & Learn</h3>
              <p className="text-gray-600">
                Get detailed information and connect with study teams to learn more
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Find Your Clinical Trial?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of patients who have found hope through clinical trials. 
            Start your search today and take the first step toward better treatment options.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/search">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
                Start Searching Now
              </Button>
            </Link>
            <Link href="/learn">
              <Button variant="outline" size="lg" className="text-lg px-8 py-6 text-white border-white hover:bg-white hover:text-blue-600">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
