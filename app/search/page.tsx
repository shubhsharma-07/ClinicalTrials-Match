"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, MapPin, Users, Filter, ChevronRight, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { apiClient, type ClinicalTrial, type SearchFilters } from "@/lib/api"

export default function SearchPage() {
  const router = useRouter()
  const [trials, setTrials] = useState<ClinicalTrial[]>([])
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [totalTrials, setTotalTrials] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filters, setFilters] = useState<SearchFilters>({
    cancerType: 'all',
    location: '',
    phase: 'all',
    ageRange: 'all',
    searchText: '',
    status: 'all',
    sponsor: 'all',
    treatmentType: 'all',
    trialSize: 'all'
  })

  // Load initial trials when component mounts
  useEffect(() => {
    console.log('useEffect called, calling loadInitialTrials')
    console.log('Component mounted, filters state:', filters)
    loadInitialTrials()
  }, [])

  const loadInitialTrials = async () => {
    console.log('loadInitialTrials called')
    console.log('Current filters state:', filters)
    setLoading(true)
    try {
      console.log('Calling API with filters:', filters)
      console.log('API URL will be:', `http://127.0.0.1:3001/api/trials/search?${new URLSearchParams({
        ...filters,
        page: '1',
        limit: '100'
      }).toString()}`)
      
      const results = await apiClient.searchTrials({
        ...filters,
        page: 1,
        limit: 100
      })
      console.log('API response:', results)
      console.log('Trials array:', results.trials)
      console.log('Total trials:', results.total)
      
      setTrials(results.trials || [])
      setTotalTrials(results.total || 0)
      setCurrentPage(results.page || 1)
      setTotalPages(results.totalPages || 1)
      setHasSearched(false) // This is the initial load, not a search
      
      console.log('State updated - trials:', results.trials?.length || 0)
    } catch (error) {
      console.error('Error loading initial trials:', error)
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      })
    } finally {
      setLoading(false)
      console.log('Loading finished, trials state:', trials.length)
    }
  }

  const handleSearch = async () => {
    setLoading(true)
    setHasSearched(true)
    try {
      const results = await apiClient.searchTrials({
        ...filters,
        page: 1,
        limit: 100
      })
      setTrials(results.trials || [])
      setTotalTrials(results.total || 0)
      setCurrentPage(results.page || 1)
      setTotalPages(results.totalPages || 1)
    } catch (error) {
      console.error('Error searching trials:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key: keyof SearchFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleClearFilters = () => {
    const clearedFilters = {
      cancerType: 'all',
      location: '',
      phase: 'all',
      ageRange: 'all',
      searchText: '',
      status: 'all',
      sponsor: 'all',
      treatmentType: 'all',
      trialSize: 'all'
    }
    setFilters(clearedFilters)
    setHasSearched(false)
    loadInitialTrials()
  }

  const hasActiveFilters = () => {
    return Object.values(filters).some(value => value !== 'all' && value !== '')
  }

  const getResultsText = () => {
    if (loading) return "Searching for trials..."
    
    if (trials.length === 0) {
      if (!hasSearched) {
        return "No trials available at the moment"
      }
      return "No trials found matching your criteria"
    }
    
    if (!hasSearched && !hasActiveFilters()) {
      return `Showing ${totalTrials} available clinical trials`
    }
    
    if (hasSearched || hasActiveFilters()) {
      return `Found ${totalTrials} trials matching your criteria`
    }
    
    return `Showing ${totalTrials} trials`
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Search Clinical Trials</h1>
        <p className="text-gray-600">Find clinical trials that match your criteria</p>
      </div>

      {/* Search Filters */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Search Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <Label htmlFor="searchText">Search Terms</Label>
              <Input
                id="searchText"
                placeholder="Enter keywords..."
                value={filters.searchText}
                onChange={(e) => handleFilterChange('searchText', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="cancerType">Cancer Type</Label>
              <Select value={filters.cancerType} onValueChange={(value) => handleFilterChange('cancerType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select cancer type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cancer Types</SelectItem>
                  <SelectItem value="breast">Breast Cancer</SelectItem>
                  <SelectItem value="lung">Lung Cancer</SelectItem>
                  <SelectItem value="colorectal">Colorectal Cancer</SelectItem>
                  <SelectItem value="prostate">Prostate Cancer</SelectItem>
                  <SelectItem value="lymphoma">Lymphoma</SelectItem>
                  <SelectItem value="leukemia">Leukemia</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="City, State, or ZIP"
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="phase">Trial Phase</Label>
              <Select value={filters.phase} onValueChange={(value) => handleFilterChange('phase', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select phase" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Phases</SelectItem>
                  <SelectItem value="phase 1">Phase 1</SelectItem>
                  <SelectItem value="phase 2">Phase 2</SelectItem>
                  <SelectItem value="phase 3">Phase 3</SelectItem>
                  <SelectItem value="phase 4">Phase 4</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <Label htmlFor="ageRange">Age Range</Label>
              <Select value={filters.ageRange} onValueChange={(value) => handleFilterChange('ageRange', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select age range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ages</SelectItem>
                  <SelectItem value="18-30">18-30</SelectItem>
                  <SelectItem value="31-50">31-50</SelectItem>
                  <SelectItem value="51-70">51-70</SelectItem>
                  <SelectItem value="70+">70+</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status">Trial Status</Label>
              <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="recruiting">Recruiting</SelectItem>
                  <SelectItem value="not yet recruiting">Not Yet Recruiting</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="treatmentType">Treatment Type</Label>
              <Select value={filters.treatmentType} onValueChange={(value) => handleFilterChange('treatmentType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select treatment type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Treatments</SelectItem>
                  <SelectItem value="immunotherapy">Immunotherapy</SelectItem>
                  <SelectItem value="targeted therapy">Targeted Therapy</SelectItem>
                  <SelectItem value="chemotherapy">Chemotherapy</SelectItem>
                  <SelectItem value="radiation therapy">Radiation Therapy</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="trialSize">Trial Size</Label>
              <Select value={filters.trialSize} onValueChange={(value) => handleFilterChange('trialSize', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select trial size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sizes</SelectItem>
                  <SelectItem value="small">Small (1-50)</SelectItem>
                  <SelectItem value="medium">Medium (51-200)</SelectItem>
                  <SelectItem value="large">Large (200+)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSearch} disabled={loading} className="flex items-center gap-2">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              Search Trials
            </Button>
            <Button variant="outline" onClick={handleClearFilters} disabled={loading}>
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Search Results</h2>
          <p className="text-gray-600">{getResultsText()}</p>
        </div>
        {hasActiveFilters() && (
          <Badge variant="secondary" className="text-sm">
            Filters Applied
          </Badge>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Searching for trials...</span>
        </div>
      )}

      {/* Results */}
      {!loading && trials.length > 0 && (
        <div className="space-y-4">
          {trials.map((trial) => (
            <Card key={trial.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2 text-blue-600 hover:text-blue-800 cursor-pointer">
                      {trial.title}
                    </CardTitle>
                    <CardDescription className="text-sm text-gray-600 mb-3">
                      {trial.description}
                    </CardDescription>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant={trial.status === 'Recruiting' ? 'default' : 'secondary'}>
                      {trial.status}
                    </Badge>
                    <Badge variant="outline">{trial.phase}</Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
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
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="h-4 w-4" />
                    <span>{trial.participants}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Sponsor:</span> {trial.sponsor}
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Condition:</span> {trial.condition}
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-blue-600 hover:text-blue-800"
                    onClick={() => router.push(`/trial/${trial.id}`)}
                  >
                    View Details <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* No Results */}
      {!loading && trials.length === 0 && hasSearched && (
        <Card className="p-8 text-center">
          <CardContent>
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No trials found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search criteria or clearing some filters.
            </p>
            <Button onClick={handleClearFilters} variant="outline">
              Clear All Filters
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => handleSearch()}
            >
              Previous
            </Button>
            <span className="flex items-center px-4 text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              disabled={currentPage === totalPages}
              onClick={() => handleSearch()}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
