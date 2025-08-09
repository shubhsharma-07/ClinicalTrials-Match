const API_BASE_URL = 'http://127.0.0.1:3001/api';

export interface ClinicalTrial {
  id: string;
  title: string;
  phase: string;
  condition: string;
  location: string;
  status: string;
  participants: string;
  description: string;
  eligibility: string | string[];
  sponsor: string;
  treatmentType?: string;
  trialSize?: string;
  zipCode?: string;
  coordinates?: { lat: number; lng: number };
  eligibilityCriteria?: any;
}

export interface SearchFilters {
  cancerType?: string;
  location?: string;
  phase?: string;
  ageRange?: string;
  searchText?: string;
  status?: string;
  sponsor?: string;
  treatmentType?: string;
  trialSize?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
}

export interface SearchResponse {
  trials: ClinicalTrial[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  filters: any;
  sortBy: string;
}

export interface EligibilityQuestion {
  id: number;
  question: string;
  type: string;
  field: string;
  required: boolean;
  options?: string[];
  validation?: { min: number; max: number };
  placeholder?: string;
}

export interface AssessmentAnswer {
  [key: string]: string;
}

export interface AssessmentResult {
  assessmentId: string;
  matches: any[];
  summary: any;
  nextSteps: any[];
  assessmentUrl: string;
}

class ApiClient {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Health check
  async healthCheck(): Promise<any> {
    return this.request('/health');
  }

  // Get all trials
  async getAllTrials(): Promise<ClinicalTrial[]> {
    return this.request('/trials');
  }

  // Search trials with filters
  async searchTrials(filters: SearchFilters): Promise<SearchResponse> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, value.toString());
      }
    });

    return this.request(`/trials/search?${params.toString()}`);
  }

  // Get trial by ID
  async getTrialById(id: string): Promise<ClinicalTrial> {
    return this.request(`/trials/${id}`);
  }

  // Get eligibility questions
  async getEligibilityQuestions(): Promise<EligibilityQuestion[]> {
    return this.request('/eligibility/questions');
  }

  // Submit eligibility assessment
  async submitAssessment(answers: AssessmentAnswer): Promise<AssessmentResult> {
    return this.request('/eligibility/assess', {
      method: 'POST',
      body: JSON.stringify(answers),
    });
  }

  // Get assessment result by ID
  async getAssessmentResult(assessmentId: string): Promise<AssessmentResult> {
    return this.request(`/eligibility/assessment/${assessmentId}`);
  }

  // Get search suggestions
  async getSearchSuggestions(query: string): Promise<any> {
    return this.request(`/search/suggestions?q=${encodeURIComponent(query)}`);
  }

  // Get available filters
  async getAvailableFilters(): Promise<any> {
    return this.request('/trials/filters');
  }

  // Get trial statistics
  async getTrialStats(): Promise<any> {
    return this.request('/trials/stats');
  }
}

export const apiClient = new ApiClient();
export default apiClient;
