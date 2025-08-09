const axios = require('axios');

class ClinicalTrialsApi {
  constructor() {
    this.baseUrl = 'https://clinicaltrials.gov/api/v2/studies';
    this.defaultParams = {
      pageSize: 100
    };
  }

  async searchTrials(filters = {}) {
    try {
      console.log('ClinicalTrialsApi.searchTrials called with filters:', filters);
      
      const queryParams = { ...this.defaultParams };
      
      // Build search query based on filters - API v2 only supports basic text search
      if (filters.cancerType && filters.cancerType !== 'all') {
        queryParams['query.term'] = filters.cancerType;
      } else if (filters.searchText && filters.searchText.trim() !== '') {
        queryParams['query.term'] = filters.searchText;
      } else if (filters.location && filters.location.trim() !== '') {
        // If only location is specified, search for trials in that location
        queryParams['query.term'] = filters.location;
      } else {
        // If no specific filters, search for all trials (use a broad term)
        queryParams['query.term'] = 'clinical trial';
      }
      
      // Handle pagination - API v2 uses pageToken for pagination
      if (filters.page && filters.limit) {
        queryParams.pageSize = Math.min(filters.limit, 100); // API max is 100
        // For now, we'll implement simple pagination by fetching more data
        // and slicing it on our side
      }
      
      console.log('Making API request with params:', queryParams);
      console.log('Full URL:', this.baseUrl);
      
      // Fetch more data to allow for client-side filtering and pagination
      const fetchSize = Math.max(100, (filters.limit || 20) * 3); // Fetch 3x the requested amount
      queryParams.pageSize = Math.min(fetchSize, 100);
      
      // Make multiple API calls to get more data if needed
      let allStudies = [];
      let currentPageToken = undefined;
      let totalFetched = 0;
      const maxFetchAttempts = 20; // Increased to allow fetching more trials
      let fetchAttempts = 0;
      
      while (totalFetched < fetchSize && fetchAttempts < maxFetchAttempts) {
        const currentParams = { ...queryParams };
        if (currentPageToken) {
          currentParams.pageToken = currentPageToken;
        }
        
        const response = await axios.get(this.baseUrl, { 
          params: currentParams
        });
        
        if (response.data && response.data.studies) {
          allStudies = allStudies.concat(response.data.studies);
          totalFetched += response.data.studies.length;
          currentPageToken = response.data.nextPageToken;
          
          // If no more pages, break
          if (!currentPageToken) {
            break;
          }
        } else {
          break;
        }
        
        fetchAttempts++;
      }
      
      console.log('Total studies fetched:', allStudies.length);
      
      if (allStudies.length > 0) {
        const result = this.transformApiResponse({ studies: allStudies }, filters);
        console.log('Transformed result trials length:', result.trials.length);
        return result;
      }
      
      console.log('No studies found in response, returning empty result');
      return { trials: [], total: 0, page: filters.page || 1, limit: filters.limit || 20 };
      
    } catch (error) {
      console.error('ClinicalTrials.gov API error:', error.message);
      console.error('Error details:', error.response?.data || error.stack);
      throw new Error('Failed to fetch clinical trials data');
    }
  }

  async getTrialById(nctId) {
    try {
      const response = await axios.get(`${this.baseUrl}/${nctId}`);
      
      if (response.data) {
        const trial = this.transformTrialData(response.data);
        return trial;
      }
      
      throw new Error('Trial not found');
      
    } catch (error) {
      console.error('Error fetching trial by ID:', error.message);
      throw new Error('Failed to fetch trial data');
    }
  }

  async getTrialStats() {
    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          ...this.defaultParams,
          'query.term': 'cancer',
          pageSize: 1
        }
      });
      
      // For stats, we'll return basic information since the API doesn't provide aggregate stats
      return {
        totalTrials: response.data.totalCount || 0,
        activeTrials: 0, // Would need to filter by status
        recruitingTrials: 0, // Would need to filter by status
        researchLocations: 0 // Would need to aggregate locations
      };
      
    } catch (error) {
      console.error('Error fetching trial statistics:', error.message);
      return { totalTrials: 0, activeTrials: 0, recruitingTrials: 0, researchLocations: 0 };
    }
  }

  async getAvailableFilters() {
    try {
      // Get sample data to extract filter options
      const response = await axios.get(this.baseUrl, {
        params: {
          ...this.defaultParams,
          'query.term': 'cancer',
          pageSize: 100
        }
      });
      
      if (response.data && response.data.studies) {
        const trials = response.data.studies;
        
        const filters = {
          cancerTypes: this.extractUniqueValues(trials, 'condition'),
          phases: this.extractUniqueValues(trials, 'phase'),
          locations: this.extractUniqueValues(trials, 'locationCity'),
          statuses: this.extractUniqueValues(trials, 'status'),
          treatmentTypes: this.extractUniqueValues(trials, 'interventionType')
        };
        
        return filters;
      }
      
      return { cancerTypes: [], phases: [], locations: [], statuses: [], treatmentTypes: [] };
    } catch (error) {
      console.error('Error fetching available filters:', error.message);
      return { cancerTypes: [], phases: [], locations: [], statuses: [], treatmentTypes: [] };
    }
  }

  transformApiResponse(apiResponse, filters) {
    let trials = (apiResponse.studies || []).map(trial => this.transformTrialData(trial));
    
    // Apply client-side filtering for parameters not supported by the API
    if (filters.phase && filters.phase !== 'all') {
      trials = trials.filter(trial => {
        const trialPhase = trial.phase.toLowerCase();
        const filterPhase = filters.phase.toLowerCase();
        return trialPhase.includes(filterPhase) || trialPhase.includes(filterPhase.replace('phase', ''));
      });
    }
    
    if (filters.location && filters.location !== '') {
      trials = trials.filter(trial => {
        const trialLocation = trial.location.toLowerCase();
        const trialZip = trial.zipCode || '';
        const filterLocation = filters.location.toLowerCase().trim();
        
        // More flexible location matching
        return trialLocation.includes(filterLocation) || 
               trialZip.includes(filterLocation) ||
               // Check for partial matches (e.g., "NY" matches "New York")
               filterLocation.split(' ').some(word => 
                 trialLocation.includes(word) || trialZip.includes(word)
               );
      });
    }
    
    if (filters.status && filters.status !== 'all') {
      trials = trials.filter(trial => {
        const trialStatus = trial.status.toLowerCase();
        const filterStatus = filters.status.toLowerCase();
        return trialStatus.includes(filterStatus);
      });
    }
    
    if (filters.ageRange && filters.ageRange !== 'all') {
      // Age filtering would need to be implemented based on eligibility criteria parsing
      // For now, we'll skip this filter
    }
    
    if (filters.treatmentType && filters.treatmentType !== 'all') {
      trials = trials.filter(trial => {
        const trialTreatment = trial.treatmentType.toLowerCase();
        const filterTreatment = filters.treatmentType.toLowerCase();
        return trialTreatment.includes(filterTreatment);
      });
    }
    
    // Apply pagination
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedTrials = trials.slice(startIndex, endIndex);
    
    // Estimate total count (this is approximate since we're filtering client-side)
    const total = trials.length;
    
    return {
      trials: paginatedTrials,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: endIndex < total,
      hasPrevPage: page > 1,
      filters,
      sortBy: filters.sortBy || 'relevance'
    };
  }

  transformTrialData(trial) {
    // API v2 returns data in a nested protocolSection structure
    const protocol = trial.protocolSection || {};
    const identification = protocol.identificationModule || {};
    const status = protocol.statusModule || {};
    const conditions = protocol.conditionsModule || {};
    const design = protocol.designModule || {};
    const description = protocol.descriptionModule || {};
    const eligibility = protocol.eligibilityModule || {};
    const locations = protocol.contactsLocationsModule || {};
    const interventions = protocol.armsInterventionsModule || {};
    const sponsor = protocol.sponsorCollaboratorsModule || {};
    
    return {
      id: identification.nctId || 'Unknown',
      title: identification.briefTitle || identification.officialTitle || 'No title available',
      phase: this.formatPhases(design.phases) || 'Not specified',
      condition: this.formatConditions(conditions.conditions) || 'Not specified',
      location: this.formatLocation(locations.locations) || 'Location not specified',
      status: status.overallStatus || 'Unknown',
      participants: this.formatParticipants(design.enrollmentInfo),
      description: description.briefSummary || 'No description available',
      eligibility: eligibility.eligibilityCriteria || 'Eligibility criteria not specified',
      sponsor: this.getSponsorName(sponsor),
      treatmentType: this.formatInterventions(interventions.interventions),
      trialSize: this.getTrialSize(design.enrollmentInfo),
      zipCode: this.getLocationZip(locations.locations),
      coordinates: this.getCoordinates(locations.locations),
      eligibilityCriteria: this.parseEligibilityCriteria(eligibility.eligibilityCriteria),
      startDate: status.startDateStruct?.date || 'Not specified',
      completionDate: status.completionDateStruct?.date || 'Not specified',
      studyType: design.studyType || 'Not specified'
    };
  }

  formatPhases(phases) {
    if (!phases || phases.length === 0) return 'Not specified';
    return phases.join(', ');
  }

  formatConditions(conditions) {
    if (!conditions || conditions.length === 0) return 'Not specified';
    return conditions.join(', ');
  }

  formatLocation(locations) {
    if (!locations || locations.length === 0) return 'Location not specified';
    
    const location = locations[0]; // Get first location
    const parts = [];
    
    if (location.facility) parts.push(location.facility);
    if (location.city) parts.push(location.city);
    if (location.state) parts.push(location.state);
    if (location.country) parts.push(location.country);
    
    return parts.length > 0 ? parts.join(', ') : 'Location not specified';
  }

  formatParticipants(enrollmentInfo) {
    if (!enrollmentInfo) return 'Not specified';
    
    const count = enrollmentInfo.count;
    const type = enrollmentInfo.type;
    
    if (count && type) {
      return `${count} (${type.toLowerCase()})`;
    } else if (count) {
      return count.toString();
    }
    
    return 'Not specified';
  }

  getSponsorName(sponsorModule) {
    if (!sponsorModule) return 'Not specified';
    
    const leadSponsor = sponsorModule.leadSponsor;
    if (leadSponsor && leadSponsor.name) {
      return leadSponsor.name;
    }
    
    return 'Not specified';
  }

  formatInterventions(interventions) {
    if (!interventions || interventions.length === 0) return 'Not specified';
    
    const types = interventions.map(intervention => intervention.type || 'Unknown');
    return [...new Set(types)].join(', ');
  }

  getTrialSize(enrollmentInfo) {
    if (!enrollmentInfo || !enrollmentInfo.count) return 'Unknown';
    
    const count = enrollmentInfo.count;
    if (count <= 50) return 'Small (≤50)';
    if (count <= 200) return 'Medium (51-200)';
    if (count <= 1000) return 'Large (201-1000)';
    return 'Very Large (>1000)';
  }

  getLocationZip(locations) {
    if (!locations || locations.length === 0) return null;
    return locations[0].zip || null;
  }

  getCoordinates(locations) {
    if (!locations || locations.length === 0) return null;
    
    const location = locations[0];
    if (location.geoPoint && location.geoPoint.lat && location.geoPoint.lon) {
      return {
        lat: location.geoPoint.lat,
        lng: location.geoPoint.lon
      };
    }
    
    return null;
  }

  parseEligibilityCriteria(criteria) {
    if (!criteria) return [];
    
    // Simple parsing - split by common delimiters and clean up
    const lines = criteria.split(/[\n\r]+/).filter(line => line.trim().length > 0);
    return lines.map(line => line.trim()).filter(line => line.length > 0);
  }

  extractUniqueValues(trials, fieldName) {
    const values = new Set();
    
    trials.forEach(trial => {
      let value = null;
      
      switch (fieldName) {
        case 'condition':
          value = trial.protocolSection?.conditionsModule?.conditions?.[0];
          break;
        case 'phase':
          value = trial.protocolSection?.designModule?.phases?.[0];
          break;
        case 'locationCity':
          value = trial.protocolSection?.contactsLocationsModule?.locations?.[0]?.city;
          break;
        case 'status':
          value = trial.protocolSection?.statusModule?.overallStatus;
          break;
        case 'interventionType':
          value = trial.protocolSection?.armsInterventionsModule?.interventions?.[0]?.type;
          break;
      }
      
      if (value && value.trim()) {
        values.add(value.trim());
      }
    });
    
    return Array.from(values).sort();
  }
}

module.exports = new ClinicalTrialsApi();
