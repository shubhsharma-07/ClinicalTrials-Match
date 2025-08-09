const express = require('express');
const cors = require('cors');
const path = require('path');
const clinicalTrialsApi = require('./clinicalTrialsApi');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());



// Get trials from ClinicalTrials.gov API instead of hardcoded data
let allClinicalTrials = [];

// Eligibility assessment questions
const eligibilityQuestions = [
  {
    id: 1,
    question: "What is your age?",
    type: "number",
    field: "age",
    required: true,
    validation: { min: 0, max: 120 }
  },
  {
    id: 2,
    question: "What type of cancer do you have?",
    type: "select",
    field: "cancerType",
    required: true,
    options: [
      "Non-Small Cell Lung Cancer",
      "HER2-Positive Breast Cancer",
      "Triple Negative Breast Cancer",
      "Relapsed/Refractory Lymphoma",
      "Advanced Colorectal Cancer",
      "Metastatic Castration-Resistant Prostate Cancer",
      "Small Cell Lung Cancer",
      "Early Stage Non-Small Cell Lung Cancer",
      "Acute Myeloid Leukemia",
      "Hodgkin Lymphoma",
      "Borderline Resectable Pancreatic Cancer",
      "Hepatocellular Carcinoma",
      "Glioblastoma Multiforme",
      "Pediatric Brain Tumors",
      "High-Grade Serous Ovarian Cancer",
      "Advanced Cervical Cancer",
      "Advanced Melanoma",
      "Merkel Cell Carcinoma",
      "Soft Tissue Sarcoma",
      "Advanced Thyroid Cancer",
      "Rare Pediatric Cancers",
      "Cancer Survivorship",
      "Various Cancers",
      "High-Risk Breast Cancer",
      "Prostate Cancer Screening",
      "Cancer During Pregnancy",
      "Cancer in HIV+ Patients",
      "Cancer in Transplant Recipients",
      "Malignant Mesothelioma",
      "Cholangiocarcinoma",
      "Endometrial Cancer",
      "Testicular Cancer",
      "Esophageal Cancer",
      "Bladder Cancer",
      "Renal Cell Carcinoma",
      "Head and Neck Cancer",
      "Osteosarcoma",
      "Uveal Melanoma",
      "Geriatric Cancer Assessment"
    ]
  },
  {
    id: 3,
    question: "What is your cancer stage?",
    type: "select",
    field: "stage",
    required: true,
    options: [
      "Stage I",
      "Stage II", 
      "Stage III",
      "Stage IV",
      "Advanced",
      "Metastatic",
      "Early Stage",
      "Intermediate",
      "Any Stage",
      "Borderline Resectable",
      "Relapsed/Refractory"
    ]
  },
  {
    id: 4,
    question: "What is your performance status?",
    type: "select",
    field: "performanceStatus",
    required: true,
    options: [
      "ECOG 0 (Fully active, no restrictions)",
      "ECOG 1 (Strenuous activity limited, but able to carry out light work)",
      "ECOG 2 (Ambulatory, capable of self-care, unable to work)",
      "ECOG 3 (Capable of limited self-care, confined to bed/chair >50% of time)",
      "ECOG 4 (Completely disabled, no self-care, totally confined to bed/chair)",
      "Lansky ≥50 (Pediatric performance scale)",
      "KPS ≥70 (Karnofsky Performance Scale)"
    ]
  },
  {
    id: 5,
    question: "Do you have adequate organ function?",
    type: "select",
    field: "organFunction",
    required: true,
    options: ["Adequate", "Not Adequate"]
  },
  {
    id: 6,
    question: "Have you received previous treatment?",
    type: "select",
    field: "previousTreatment",
    required: false,
    options: [
      "No previous treatment",
      "Previous chemotherapy",
      "Previous immunotherapy", 
      "Previous targeted therapy",
      "Previous hormone therapy",
      "Previous HER2 therapy",
      "Any previous treatment",
      "Complete response to chemotherapy"
    ]
  },
  {
    id: 7,
    question: "Do you have any specific genetic mutations?",
    type: "select",
    field: "geneticMutations",
    required: false,
    options: [
      "None",
      "BRCA mutation",
      "FLT3 mutation",
      "HER2 positive",
      "Specific genetic alteration",
      "Genetic testing available"
    ]
  },
  {
    id: 8,
    question: "What is your location/ZIP code?",
    type: "text",
    field: "location",
    required: false,
    placeholder: "Enter ZIP code or city"
  },
  {
    id: 9,
    question: "Do you have any specific health conditions?",
    type: "multiselect",
    field: "healthConditions",
    required: false,
    options: [
      "Brain metastases",
      "CNS disease",
      "Active infection",
      "Cardiac issues",
      "Liver problems",
      "Pulmonary issues",
      "Bone marrow issues",
      "None of the above"
    ]
  },
  {
    id: 10,
    question: "Are you willing to travel for treatment?",
    type: "select",
    field: "travelWillingness",
    required: false,
    options: [
      "Yes, any distance",
      "Yes, within 100 miles",
      "Yes, within 50 miles",
      "No, local only"
    ]
  },
  
  // Phase 5 Enhanced Questions
  {
    id: 11,
    question: "What types of treatments are you interested in?",
    type: "multiselect",
    field: "treatmentPreferences",
    required: false,
    options: [
      "Surgery",
      "Chemotherapy",
      "Radiation Therapy",
      "Immunotherapy",
      "Targeted Therapy",
      "Hormone Therapy",
      "Stem Cell Therapy",
      "Vaccine Therapy",
      "Proton Therapy",
      "Precision Medicine",
      "Clinical Trials",
      "Any treatment type"
    ]
  },
  {
    id: 12,
    question: "What clinical trial phases are you interested in?",
    type: "multiselect",
    field: "trialPhasePreferences",
    required: false,
    options: [
      "Phase 1 (Safety testing)",
      "Phase 2 (Effectiveness testing)",
      "Phase 3 (Comparison to standard treatment)",
      "Phase 4 (Post-approval studies)",
      "Any phase"
    ]
  },
  {
    id: 13,
    question: "Do you have any special health considerations?",
    type: "multiselect",
    field: "specialConsiderations",
    required: false,
    options: [
      "HIV positive",
      "Organ transplant recipient",
      "Pregnant or planning pregnancy",
      "Pediatric patient (under 18)",
      "Geriatric patient (70+)",
      "Rare cancer type",
      "Genetic mutations",
      "None"
    ]
  },
  {
    id: 14,
    question: "Have you had genetic testing for cancer mutations?",
    type: "select",
    field: "geneticTesting",
    required: false,
    options: [
      "Yes, BRCA1/BRCA2",
      "Yes, Lynch syndrome genes",
      "Yes, other cancer genes",
      "Yes, but don't know which genes",
      "No",
      "Don't know"
    ]
  },
  {
    id: 15,
    question: "How would you describe your overall organ function?",
    type: "select",
    field: "organFunctionOverall",
    required: false,
    options: [
      "Excellent - no known issues",
      "Good - minor issues, well-controlled",
      "Fair - some issues, mostly controlled",
      "Poor - significant issues, may limit treatment options",
      "Unknown"
    ]
  }
];

// Enhanced search and filter function for Phase 3 - Now uses ClinicalTrials.gov API
async function searchTrials(filters) {
  try {
    // Use the ClinicalTrials.gov API instead of hardcoded data
    const apiResults = await clinicalTrialsApi.searchTrials(filters);
    
    // Apply additional client-side filtering for better results
    let filteredTrials = apiResults.trials || [];
    
    // Apply cancer type filter
    if (filters.cancerType && filters.cancerType !== 'all') {
      const cancerTypeLower = filters.cancerType.toLowerCase();
      filteredTrials = filteredTrials.filter(trial => {
        const condition = (trial.condition || '').toLowerCase();
        const title = (trial.title || '').toLowerCase();
        const description = (trial.description || '').toLowerCase();
        
        return condition.includes(cancerTypeLower) || 
               title.includes(cancerTypeLower) || 
               description.includes(cancerTypeLower);
      });
    }
    
    // Apply location filter with more flexible matching
    if (filters.location && filters.location.trim() !== '') {
      const locationFilter = filters.location.toLowerCase().trim();
      filteredTrials = filteredTrials.filter(trial => {
        const trialLocation = (trial.location || '').toLowerCase();
        const trialZip = (trial.zipCode || '').toLowerCase();
        
        // Check if location contains the filter text
        return trialLocation.includes(locationFilter) || 
               trialZip.includes(locationFilter) ||
               // Check for partial matches (e.g., "NY" matches "New York")
               locationFilter.split(' ').some(word => 
                 trialLocation.includes(word) || trialZip.includes(word)
               );
      });
    }
    
    // Apply phase filter
    if (filters.phase && filters.phase !== 'all') {
      const phaseFilter = filters.phase.toLowerCase();
      filteredTrials = filteredTrials.filter(trial => {
        const trialPhase = (trial.phase || '').toLowerCase();
        return trialPhase.includes(phaseFilter) || 
               trialPhase.includes(phaseFilter.replace('phase', ''));
      });
    }
    
    // Apply age range filter
    if (filters.ageRange && filters.ageRange !== 'all') {
      filteredTrials = filteredTrials.filter(trial => {
        const eligibility = (trial.eligibility || '').toLowerCase();
        const ageRange = filters.ageRange;
        
        if (ageRange === '18-30') {
          return eligibility.includes('18') && eligibility.includes('30');
        } else if (ageRange === '31-50') {
          return eligibility.includes('31') || eligibility.includes('50') || 
                 (eligibility.includes('18') && eligibility.includes('75'));
        } else if (ageRange === '51-70') {
          return eligibility.includes('51') || eligibility.includes('70') || 
                 (eligibility.includes('18') && eligibility.includes('75'));
        } else if (ageRange === '70+') {
          return eligibility.includes('70') || eligibility.includes('elderly') || 
                 eligibility.includes('senior');
        }
        return true;
      });
    }
    
    // Apply pagination
    const page = filters.page || 1;
    const limit = filters.limit || 100;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedTrials = filteredTrials.slice(startIndex, endIndex);
    
    // Calculate total and pages
    const total = filteredTrials.length;
    const totalPages = Math.ceil(total / limit);
    
    return {
      trials: paginatedTrials,
      total: total,
      page: page,
      limit: limit,
      totalPages: totalPages,
      hasNextPage: endIndex < total,
      hasPrevPage: page > 1,
      filters: filters,
      sortBy: filters.sortBy || 'relevance'
    };
    
  } catch (error) {
    console.error('Error searching trials via API:', error);
    // Fallback to empty results if API fails
    return {
      trials: [],
      total: 0,
      page: filters.page || 1,
      limit: filters.limit || 100,
      totalPages: 0,
      hasNextPage: false,
      hasPrevPage: false,
      filters,
      sortBy: filters.sortBy || 'relevance'
    };
  }
}

// Enhanced eligibility scoring function with sophisticated rule-based matching
function calculateEligibilityScore(trial, answers) {
  console.log('=== calculateEligibilityScore START ===');
  console.log('Trial object:', {
    id: trial.id,
    condition: trial.condition,
    title: trial.title,
    description: trial.description,
    eligibility: trial.eligibility,
    phase: trial.phase,
    status: trial.status,
    location: trial.location,
    sponsor: trial.sponsor
  });
  console.log('Answers:', answers);
  
  let score = 0;
  let totalPoints = 0;
  let matchDetails = [];
  
  // Cancer type match (highest weight - 40 points)
  if (answers['cancerType'] && answers['cancerType'] !== 'Other') {
    const cancerTypeLower = answers['cancerType'].toLowerCase();
    const trialCondition = (trial.condition || '').toLowerCase();
    const trialTitle = (trial.title || '').toLowerCase();
    const trialDescription = (trial.description || '').toLowerCase();
    
    // Exact match gets full points
    if (trialCondition.includes(cancerTypeLower) || trialTitle.includes(cancerTypeLower)) {
      score += 40;
      matchDetails.push({
        factor: 'Cancer Type',
        match: true,
        weight: 'High (40 points)',
        description: `Your cancer type (${answers['cancerType']}) exactly matches this trial's condition`,
        points: 40
      });
    } else {
      // Check for related cancer types
      const cancerRelations = {
        'lung': ['pulmonary', 'respiratory', 'bronchogenic', 'non-small cell', 'nsclc', 'small cell', 'sclc'],
        'breast': ['mammary', 'ductal', 'lobular', 'triple negative', 'her2+', 'her2 positive'],
        'colorectal': ['colon', 'rectal', 'bowel', 'intestinal', 'adenocarcinoma'],
        'lymphoma': ['lymphatic', 'lymph', 'hodgkin', 'non-hodgkin', 'nhl', 'hl'],
        'leukemia': ['leukemic', 'blood cancer', 'acute', 'chronic', 'myeloid', 'lymphocytic'],
        'prostate': ['prostatic', 'adenocarcinoma', 'castration resistant'],
        // Phase 5 Enhanced Cancer Relations
        'mesothelioma': ['pleural mesothelioma', 'peritoneal mesothelioma', 'asbestos-related'],
        'cholangiocarcinoma': ['bile duct cancer', 'biliary cancer', 'fgfr2 fusion', 'idh1 mutation'],
        'endometrial': ['uterine cancer', 'endometrium', 'uterine adenocarcinoma'],
        'testicular': ['testis cancer', 'germ cell tumor', 'seminoma', 'non-seminoma'],
        'esophageal': ['esophagus cancer', 'esophageal adenocarcinoma', 'squamous cell'],
        'bladder': ['urinary bladder', 'transitional cell carcinoma', 'urothelial'],
        'renal': ['kidney cancer', 'renal cell carcinoma', 'rcc', 'clear cell'],
        'head and neck': ['oropharyngeal', 'laryngeal', 'nasopharyngeal', 'oral cancer'],
        'osteosarcoma': ['bone cancer', 'skeletal sarcoma', 'high-risk bone'],
        'uveal': ['eye cancer', 'ocular melanoma', 'choroidal melanoma', 'iris melanoma'],
        'pediatric': ['childhood cancer', 'pediatric oncology', 'rare pediatric'],
        'geriatric': ['elderly cancer', 'senior oncology', 'aging cancer']
      };
      
      if (cancerRelations[cancerTypeLower]) {
        const hasRelated = cancerRelations[cancerTypeLower].some(related => 
          trialCondition.includes(related) || trialTitle.includes(related) || trialDescription.includes(related)
        );
        if (hasRelated) {
          score += 30; // Partial match
          matchDetails.push({
            factor: 'Cancer Type',
            match: true,
            weight: 'High (30 points)',
            description: `Your cancer type (${answers['cancerType']}) is related to this trial's condition`,
            points: 30
          });
        } else {
          matchDetails.push({
            factor: 'Cancer Type',
            match: false,
            weight: 'High (0 points)',
            description: `Your cancer type (${answers['cancerType']}) doesn't match this trial's condition`,
            points: 0
          });
        }
      } else {
        matchDetails.push({
          factor: 'Cancer Type',
          match: false,
          weight: 'High (0 points)',
          description: `Your cancer type (${answers['cancerType']}) doesn't match this trial's condition`,
          points: 0
        });
      }
    }
  } else if (answers['cancerType'] === 'Other') {
    // Generic cancer matching for "Other" category
    const trialText = `${trial.condition || ''} ${trial.title || ''} ${trial.description || ''}`.toLowerCase();
    if (trialText.includes('cancer') || trialText.includes('tumor') || trialText.includes('neoplasm')) {
      score += 25; // Reduced points for generic match
      matchDetails.push({
        factor: 'Cancer Type',
        match: true,
        weight: 'High (25 points)',
        description: 'Your cancer type matches this general cancer trial',
        points: 25
      });
    } else {
      matchDetails.push({
        factor: 'Cancer Type',
        match: false,
        weight: 'High (0 points)',
        description: 'This trial is not for your type of cancer',
        points: 0
      });
    }
  }
  totalPoints += 40;
  
  // Cancer stage match (high weight - 25 points)
  if (answers['stage']) {
    const stage = answers['stage'].toLowerCase();
    const trialEligibility = (trial.eligibility || '').toLowerCase();
    const trialDescription = (trial.description || '').toLowerCase();
    
    let stageScore = 0;
    let stageMatch = false;
    
    if (stage.includes('early') || stage.includes('stage i-ii')) {
      if (trialEligibility.includes('early') || trialDescription.includes('early stage') || 
          trialDescription.includes('stage i') || trialDescription.includes('stage ii')) {
        stageScore = 25;
        stageMatch = true;
      }
    } else if (stage.includes('advanced') || stage.includes('stage iii-iv')) {
      if (trialEligibility.includes('advanced') || trialDescription.includes('advanced') || 
          trialDescription.includes('stage iii') || trialDescription.includes('stage iv')) {
        stageScore = 25;
        stageMatch = true;
      }
    } else if (stage.includes('metastatic')) {
      if (trialEligibility.includes('metastatic') || trialDescription.includes('metastatic')) {
        stageScore = 25;
        stageMatch = true;
      }
    } else if (stage.includes('remission')) {
      if (trialEligibility.includes('remission') || trialDescription.includes('remission')) {
        stageScore = 25;
        stageMatch = true;
      }
    }
    
    score += stageScore;
    matchDetails.push({
      factor: 'Cancer Stage',
      match: stageMatch,
      weight: 'High (25 points)',
      description: stageMatch ? 
        `Your cancer stage (${answers['stage']}) matches this trial's requirements` :
        `Your cancer stage (${answers['stage']}) may not meet this trial's requirements`,
      points: stageScore
    });
  }
  totalPoints += 25;
  
  // Age match (medium weight - 20 points)
  if (answers['age']) {
    const age = parseInt(answers['age']);
    const trialEligibility = (trial.eligibility || '').toLowerCase();
    
    let ageScore = 0;
    let ageMatch = false;
    
    // Check various age patterns in eligibility
    if (trialEligibility.includes('18') && trialEligibility.includes('75')) {
      if (age >= 18 && age <= 75) {
        ageScore = 20;
        ageMatch = true;
      }
    } else if (trialEligibility.includes('18') && trialEligibility.includes('70')) {
      if (age >= 18 && age <= 70) {
        ageScore = 20;
        ageMatch = true;
      }
    } else if (trialEligibility.includes('pediatric') || trialEligibility.includes('child')) {
      if (age < 18) {
        ageScore = 20;
        ageMatch = true;
      }
    } else if (trialEligibility.includes('elderly') || trialEligibility.includes('senior')) {
      if (age >= 65) {
        ageScore = 20;
        ageMatch = true;
      }
    } else if (trialEligibility.includes('adult')) {
      if (age >= 18) {
        ageScore = 15; // Partial match
        ageMatch = true;
      }
    }
    
    score += ageScore;
    matchDetails.push({
      factor: 'Age',
      match: ageMatch,
      weight: 'Medium (20 points)',
      description: ageMatch ? 
        `Your age (${age}) meets this trial's age requirements` :
        `Your age (${age}) may not meet this trial's age requirements`,
      points: ageScore
    });
  }
  totalPoints += 20;
  
  // Treatment history match (medium weight - 20 points)
  if (answers['previousTreatment']) {
    const treatment = answers['previousTreatment'].toLowerCase();
    const trialEligibility = (trial.eligibility || '').toLowerCase();
    const trialDescription = (trial.description || '').toLowerCase();
    
    let treatmentScore = 0;
    let treatmentMatch = false;
    
    // Check for treatment compatibility
    if (treatment === 'no treatment yet') {
      if (trialEligibility.includes('no previous') || trialEligibility.includes('treatment naive')) {
        treatmentScore = 20;
        treatmentMatch = true;
      }
    } else if (treatment === 'chemotherapy') {
      if (trialEligibility.includes('previous chemotherapy') || trialEligibility.includes('chemo')) {
        treatmentScore = 20;
        treatmentMatch = true;
      } else if (trialEligibility.includes('no previous') && !trialEligibility.includes('chemotherapy')) {
        treatmentScore = 0; // Incompatible
      } else {
        treatmentScore = 10; // Neutral
        treatmentMatch = true;
      }
    } else if (treatment === 'immunotherapy') {
      if (trialEligibility.includes('previous immunotherapy') || trialEligibility.includes('immune')) {
        treatmentScore = 20;
        treatmentMatch = true;
      } else if (trialEligibility.includes('no previous') && !trialEligibility.includes('immunotherapy')) {
        treatmentScore = 0; // Incompatible
      } else {
        treatmentScore = 10; // Neutral
        treatmentMatch = true;
      }
    } else {
      // Other treatments get neutral score
      treatmentScore = 10;
      treatmentMatch = true;
    }
    
    score += treatmentScore;
    matchDetails.push({
      factor: 'Treatment History',
      match: treatmentMatch,
      weight: 'Medium (20 points)',
      description: treatmentMatch ? 
        `Your treatment history (${answers['previousTreatment']}) is compatible with this trial` :
        `Your treatment history (${answers['previousTreatment']}) may not be compatible`,
      points: treatmentScore
    });
  }
  totalPoints += 20;
  
  // Performance status match (medium weight - 15 points)
  if (answers['performanceStatus']) {
    const health = answers['performanceStatus'].toLowerCase();
    const trialEligibility = (trial.eligibility || '').toLowerCase();
    
    let healthScore = 0;
    let healthMatch = false;
    
    if (health === 'excellent' || health === 'good') {
      if (trialEligibility.includes('good') || trialEligibility.includes('excellent') || 
          trialEligibility.includes('performance status') || trialEligibility.includes('overall health')) {
        healthScore = 15;
        healthMatch = true;
      } else {
        healthScore = 10; // Neutral
        healthMatch = true;
      }
    } else if (health === 'fair') {
      if (trialEligibility.includes('fair') || trialEligibility.includes('adequate')) {
        healthScore = 15;
        healthMatch = true;
      } else {
        healthScore = 5; // Reduced score
        healthMatch = true;
      }
    } else if (health === 'poor') {
      if (trialEligibility.includes('poor') || trialEligibility.includes('limited')) {
        healthScore = 15;
        healthMatch = true;
      } else {
        healthScore = 0; // Incompatible
      }
    }
    
    score += healthScore;
    matchDetails.push({
      factor: 'Health Status',
      match: healthMatch,
      weight: 'Medium (15 points)',
      description: healthMatch ? 
        `Your performance status (${answers['performanceStatus']}) meets this trial's requirements` :
        `Your performance status (${answers['performanceStatus']}) may not meet this trial's requirements`,
      points: healthScore
    });
  }
  totalPoints += 15;
  
  // Location and travel match (lowest weight - 10 points)
  if (answers['travelWillingness']) {
    const travel = answers['travelWillingness'].toLowerCase();
    let locationScore = 0;
    let locationMatch = false;
    
    if (travel.includes('100') || travel.includes('state') || travel.includes('country')) {
      locationScore = 10; // Willing to travel far
      locationMatch = true;
    } else if (travel.includes('50')) {
      locationScore = 8; // Moderate travel
      locationMatch = true;
    } else if (travel.includes('25')) {
      locationScore = 5; // Limited travel
      locationMatch = true;
    }
    
    score += locationScore;
    matchDetails.push({
      factor: 'Travel Willingness',
      match: locationMatch,
      weight: 'Low (10 points)',
      description: `Your travel preference (${answers['travelWillingness']}) is compatible with trial participation`,
      points: locationScore
    });
  }
  totalPoints += 10;
  
  // Phase 5 Enhanced Scoring - Treatment Preferences (medium weight - 15 points)
  if (answers['treatment-preferences']) {
    const preferences = Array.isArray(answers['treatment-preferences']) ? 
      answers['treatment-preferences'] : [answers['treatment-preferences']];
    
    let preferenceScore = 0;
    let preferenceMatch = false;
    
    preferences.forEach(pref => {
      const prefLower = pref.toLowerCase();
      const trialText = `${trial.title || ''} ${trial.description || ''} ${trial.eligibility || ''}`.toLowerCase();
      
      if (prefLower === 'any treatment type') {
        preferenceScore = 15;
        preferenceMatch = true;
      } else if (prefLower === 'surgery' && trialText.includes('surgery')) {
        preferenceScore = Math.max(preferenceScore, 15);
        preferenceMatch = true;
      } else if (prefLower === 'immunotherapy' && trialText.includes('immunotherapy')) {
        preferenceScore = Math.max(preferenceScore, 15);
        preferenceMatch = true;
      } else if (prefLower === 'targeted therapy' && trialText.includes('targeted')) {
        preferenceScore = Math.max(preferenceScore, 15);
        preferenceMatch = true;
      } else if (prefLower === 'chemotherapy' && trialText.includes('chemotherapy')) {
        preferenceScore = Math.max(preferenceScore, 15);
        preferenceMatch = true;
      } else if (prefLower === 'radiation therapy' && trialText.includes('radiation')) {
        preferenceScore = Math.max(preferenceScore, 15);
        preferenceMatch = true;
      } else if (prefLower === 'hormone therapy' && trialText.includes('hormone')) {
        preferenceScore = Math.max(preferenceScore, 15);
        preferenceMatch = true;
      } else if (prefLower === 'stem cell therapy' && trialText.includes('stem cell')) {
        preferenceScore = Math.max(preferenceScore, 15);
        preferenceMatch = true;
      } else if (prefLower === 'vaccine therapy' && trialText.includes('vaccine')) {
        preferenceScore = Math.max(preferenceScore, 15);
        preferenceMatch = true;
      } else if (prefLower === 'proton therapy' && trialText.includes('proton')) {
        preferenceScore = Math.max(preferenceScore, 15);
        preferenceMatch = true;
      } else if (prefLower === 'precision medicine' && trialText.includes('precision')) {
        preferenceScore = Math.max(preferenceScore, 15);
        preferenceMatch = true;
      } else if (prefLower === 'clinical trials' && trialText.includes('trial')) {
        preferenceScore = Math.max(preferenceScore, 15);
        preferenceMatch = true;
      }
    });
    
    score += preferenceScore;
    matchDetails.push({
      factor: 'Treatment Preferences',
      match: preferenceMatch,
      weight: 'Medium (15 points)',
      description: preferenceMatch ? 
        `Your treatment preferences match this trial's approach` :
        `Your treatment preferences may not align with this trial`,
      points: preferenceScore
    });
  }
  totalPoints += 15;
  
  // Phase 5 Enhanced Scoring - Trial Phase Preferences (medium weight - 12 points)
  if (answers['trial-phase-preferences']) {
    const phasePrefs = Array.isArray(answers['trial-phase-preferences']) ? 
      answers['trial-phase-preferences'] : [answers['trial-phase-preferences']];
    
    let phaseScore = 0;
    let phaseMatch = false;
    
    phasePrefs.forEach(pref => {
      const prefLower = pref.toLowerCase();
      const trialPhase = (trial.phase || '').toLowerCase();
      
      if (prefLower.includes('any phase')) {
        phaseScore = 12;
        phaseMatch = true;
      } else if (prefLower.includes('phase 1') && trialPhase.includes('phase 1')) {
        phaseScore = Math.max(phaseScore, 12);
        phaseMatch = true;
      } else if (prefLower.includes('phase 2') && trialPhase.includes('phase 2')) {
        phaseScore = Math.max(phaseScore, 12);
        phaseMatch = true;
      } else if (prefLower.includes('phase 3') && trialPhase.includes('phase 3')) {
        phaseScore = Math.max(phaseScore, 12);
        phaseMatch = true;
      } else if (prefLower.includes('phase 4') && trialPhase.includes('phase 4')) {
        phaseScore = Math.max(phaseScore, 12);
        phaseMatch = true;
      }
    });
    
    score += phaseScore;
    matchDetails.push({
      factor: 'Trial Phase Preferences',
      match: phaseMatch,
      weight: 'Medium (12 points)',
      description: phaseMatch ? 
        `Your preferred trial phases match this trial (${trial.phase})` :
        `Your preferred trial phases don't match this trial (${trial.phase})`,
      points: phaseScore
    });
  }
  totalPoints += 12;
  
  // Phase 5 Enhanced Scoring - Special Considerations (medium weight - 10 points)
  if (answers['special-considerations']) {
    const considerations = Array.isArray(answers['special-considerations']) ? 
      answers['special-considerations'] : [answers['special-considerations']];
    
    let considerationScore = 0;
    let considerationMatch = false;
    
    considerations.forEach(consideration => {
      const considerationLower = consideration.toLowerCase();
      const trialText = `${trial.title || ''} ${trial.description || ''} ${trial.eligibility || ''}`.toLowerCase();
      
      if (considerationLower === 'none') {
        considerationScore = 10;
        considerationMatch = true;
      } else if (considerationLower.includes('hiv') && trialText.includes('hiv')) {
        considerationScore = Math.max(considerationScore, 10);
        considerationMatch = true;
      } else if (considerationLower.includes('transplant') && trialText.includes('transplant')) {
        considerationScore = Math.max(considerationScore, 10);
        considerationMatch = true;
      } else if (considerationLower.includes('pregnant') && trialText.includes('pregnancy')) {
        considerationScore = Math.max(considerationScore, 10);
        considerationMatch = true;
      } else if (considerationLower.includes('pediatric') && trialText.includes('pediatric')) {
        considerationScore = Math.max(considerationScore, 10);
        considerationMatch = true;
      } else if (considerationLower.includes('geriatric') && trialText.includes('geriatric')) {
        considerationScore = Math.max(considerationScore, 10);
        considerationMatch = true;
      } else if (considerationLower.includes('rare cancer') && trialText.includes('rare')) {
        considerationScore = Math.max(considerationScore, 10);
        considerationMatch = true;
      } else if (considerationLower.includes('genetic mutations') && trialText.includes('genetic')) {
        considerationScore = Math.max(considerationScore, 10);
        considerationMatch = true;
      }
    });
    
    score += considerationScore;
    matchDetails.push({
      factor: 'Special Considerations',
      match: considerationMatch,
      weight: 'Medium (10 points)',
      description: considerationMatch ? 
        `Your special considerations are addressed by this trial` :
        `This trial may not address your special considerations`,
      points: considerationScore
    });
  }
  totalPoints += 10;
  
  // Phase 5 Enhanced Scoring - Genetic Testing (low weight - 8 points)
  if (answers['genetic-testing']) {
    const geneticTesting = answers['genetic-testing'].toLowerCase();
    const trialText = `${trial.title || ''} ${trial.description || ''} ${trial.eligibility || ''}`.toLowerCase();
    
    let geneticScore = 0;
    let geneticMatch = false;
    
    if (geneticTesting.includes('brca') && trialText.includes('brca')) {
      geneticScore = 8;
      geneticMatch = true;
    } else if (geneticTesting.includes('lynch') && trialText.includes('lynch')) {
      geneticScore = 8;
      geneticMatch = true;
    } else if (geneticTesting.includes('other cancer genes') && trialText.includes('genetic')) {
      geneticScore = 6;
      geneticMatch = true;
    } else if (geneticTesting === 'no' || geneticTesting === 'don\'t know') {
      geneticScore = 5; // Neutral score
      geneticMatch = true;
    }
    
    score += geneticScore;
    matchDetails.push({
      factor: 'Genetic Testing',
      match: geneticMatch,
      weight: 'Low (8 points)',
      description: geneticMatch ? 
        `Your genetic testing status is compatible with this trial` :
        `Your genetic testing status may not be compatible`,
      points: geneticScore
    });
  }
  totalPoints += 8;
  
  // Phase 5 Enhanced Scoring - Overall Organ Function (low weight - 5 points)
  if (answers['organ-function-overall']) {
    const organFunction = answers['organ-function-overall'].toLowerCase();
    const trialText = `${trial.title || ''} ${trial.description || ''} ${trial.eligibility || ''}`.toLowerCase();
    
    let organScore = 0;
    let organMatch = false;
    
    if (organFunction.includes('excellent') || organFunction.includes('good')) {
      if (trialText.includes('adequate') || trialText.includes('good') || trialText.includes('excellent')) {
        organScore = 5;
        organMatch = true;
      } else {
        organScore = 3; // Partial match
        organMatch = true;
      }
    } else if (organFunction.includes('fair')) {
      if (trialText.includes('adequate') || trialText.includes('fair')) {
        organScore = 5;
        organMatch = true;
      } else {
        organScore = 2; // Reduced score
        organMatch = true;
      }
    } else if (organFunction.includes('poor')) {
      if (trialText.includes('adequate') || trialText.includes('limited')) {
        organScore = 3; // Reduced score
        organMatch = true;
      } else {
        organScore = 0; // Incompatible
      }
    }
    
    score += organScore;
    matchDetails.push({
      factor: 'Overall Organ Function',
      match: organMatch,
      weight: 'Low (5 points)',
      description: organMatch ? 
        `Your organ function status is compatible with this trial` :
        `Your organ function status may limit trial participation`,
      points: organScore
    });
  }
  totalPoints += 5;
  
  // Calculate final percentage
  const finalScore = Math.round((score / totalPoints) * 100);
  
  console.log('=== calculateEligibilityScore COMPLETED ===');
  console.log('Final score:', finalScore, 'Raw score:', score, 'Total points:', totalPoints);
  
  return {
    score: finalScore,
    rawScore: score,
    totalPoints: totalPoints,
    matchDetails: matchDetails,
    matchLevel: getMatchLevel(finalScore)
  };
}

// Helper function to determine match level
function getMatchLevel(score) {
  if (score >= 90) return 'Excellent Match';
  if (score >= 80) return 'Very Good Match';
  if (score >= 70) return 'Good Match';
  if (score >= 60) return 'Fair Match';
  if (score >= 40) return 'Partial Match';
  return 'Poor Match';
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend is running' });
});

// Get all trials endpoint
app.get('/api/trials', async (req, res) => {
  try {
    // Use the ClinicalTrials.gov API to get all trials without any filters
    const results = await clinicalTrialsApi.searchTrials({
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 1000 // Increased default limit
    });
    res.json(results.trials || []); // Return just the trials array for getAllTrials
  } catch (error) {
    console.error('Error fetching all trials:', error);
    res.status(500).json({ 
      error: 'Failed to fetch trials',
      message: error.message 
    });
  }
});

// Search trials with filters endpoint (MUST come before /:id route)
app.get('/api/trials/search', async (req, res) => {
  try {
    const filters = {
      cancerType: req.query.cancerType || 'all',
      location: req.query.location || '',
      phase: req.query.phase || 'all',
      ageRange: req.query.ageRange || 'all',
      searchText: req.query.searchText || '',
      status: req.query.status || 'all',
      sponsor: req.query.sponsor || 'all',
      treatmentType: req.query.treatmentType || 'all',
      trialSize: req.query.trialSize || 'all',
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 100, // Increased default limit
      sortBy: req.query.sortBy || 'relevance',
      sortOrder: req.query.sortOrder || 'desc'
    };
    
    // Use the ClinicalTrials.gov API
    const results = await searchTrials(filters);
    res.json(results);
  } catch (error) {
    console.error('Error in search endpoint:', error);
    res.status(500).json({ 
      error: 'Failed to search trials',
      message: error.message 
    });
  }
});

// Get available filter options endpoint (MUST come before /:id route)
app.get('/api/trials/filters', async (req, res) => {
  try {
    // Use the ClinicalTrials.gov API to get available filters
    const filters = await clinicalTrialsApi.getAvailableFilters();
    
    res.json({
      success: true,
      filters: filters,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('Filter options error:', error);
    res.status(500).json({ 
      error: 'Internal server error while fetching filter options',
      message: error.message 
    });
  }
});

// Get trial statistics endpoint (MUST come before /:id route)
app.get('/api/trials/stats', async (req, res) => {
  try {
    // Use the ClinicalTrials.gov API to get trial statistics
    const stats = await clinicalTrialsApi.getTrialStats();
    
    res.json({
      success: true,
      statistics: stats,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('Trial statistics error:', error);
    res.status(500).json({ 
      error: 'Internal server error while fetching trial statistics',
      message: error.message 
    });
  }
});

// Enhanced trial details endpoint
app.get('/api/trials/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Use the ClinicalTrials.gov API to get trial details
    const trial = await clinicalTrialsApi.getTrialById(id);
    
    if (!trial) {
      return res.status(404).json({ 
        error: 'Trial not found',
        message: `No clinical trial found with ID: ${id}` 
      });
    }
    
    // Parse eligibility string into array for better frontend consumption
    const eligibilityArray = trial.eligibility ? trial.eligibility.split(',').map(item => item.trim()) : [];
    
    // Enhanced trial response with new data structure
    const enhancedTrial = {
      ...trial,
      eligibility: eligibilityArray,
      eligibilityCount: eligibilityArray.length,
      lastUpdated: new Date().toISOString(),
      contactInfo: {
        phone: "1-800-CLINICAL",
        email: "trials@clinicalcenter.gov",
        website: "https://clinicaltrials.gov"
      }
    };
    
    res.json({
      success: true,
      data: enhancedTrial
    });
    
  } catch (error) {
    console.error('Trial details error:', error);
    res.status(500).json({ 
      error: 'Internal server error while fetching trial details',
      message: error.message 
    });
  }
});

// Helper function to calculate relevance score for search results
function calculateRelevanceScore(trial, searchText) {
  const searchLower = searchText.toLowerCase();
  let score = 0;
  
  // Title match gets highest score
  if (trial.title && trial.title.toLowerCase().includes(searchLower)) {
    score += 100;
  }
  
  // Description match gets medium score
  if (trial.description && trial.description.toLowerCase().includes(searchLower)) {
    score += 50;
  }
  
  // Condition match gets medium score
  if (trial.condition && trial.condition.toLowerCase().includes(searchLower)) {
    score += 50;
  }
  
  // Sponsor match gets low score
  if (trial.sponsor && trial.sponsor.toLowerCase().includes(searchLower)) {
    score += 25;
  }
  
  return score;
}

// Helper function to calculate enhanced relevance score
function calculateEnhancedRelevanceScore(trial, searchText, filters) {
  const searchLower = searchText.toLowerCase();
  let score = 0;

  // Title match (highest weight - 100 points)
  if (trial.title && trial.title.toLowerCase().includes(searchLower)) {
    score += 100;
    
    // Bonus for exact title match
    if (trial.title && trial.title.toLowerCase() === searchLower) {
      score += 50;
    }
    
    // Bonus for title starting with search term
    if (trial.title && trial.title.toLowerCase().startsWith(searchLower)) {
      score += 25;
    }
  }

  // Description match (medium weight - 50 points)
  if (trial.description && trial.description.toLowerCase().includes(searchLower)) {
    score += 50;
    
    // Bonus for multiple occurrences in description
    const occurrences = (trial.description && trial.description.toLowerCase().match(new RegExp(searchLower, 'g')) || []).length;
    score += Math.min(20, occurrences * 5); // Max 20 bonus points
  }

  // Condition match (medium weight - 50 points)
  if (trial.condition && trial.condition.toLowerCase().includes(searchLower)) {
    score += 50;
    
    // Bonus for exact condition match
    if (trial.condition && trial.condition.toLowerCase() === searchLower) {
      score += 25;
    }
  }

  // Sponsor match (low weight - 25 points)
  if (trial.sponsor && trial.sponsor.toLowerCase().includes(searchLower)) {
    score += 25;
    
    // Bonus for prestigious institutions
    const prestigiousInstitutions = ['university', 'medical center', 'cancer center', 'institute', 'clinic'];
    if (prestigiousInstitutions.some(inst => trial.sponsor && trial.sponsor.toLowerCase().includes(inst))) {
      score += 10;
    }
  }

  // Eligibility match (medium weight - 40 points)
  if (trial.eligibility && trial.eligibility.toLowerCase().includes(searchLower)) {
    score += 40;
  }

  // Status match (low weight - 15 points)
  if (filters.status && filters.status !== 'all' && trial.status && trial.status.toLowerCase() === filters.status.toLowerCase()) {
    score += 15;
  }

  // Location match (lowest weight - 10 points)
  if (filters.location) {
    const trialLocationLower = (trial.location || '').toLowerCase();
    const locationLower = filters.location.toLowerCase();
    if (trialLocationLower.includes(locationLower)) {
      score += 10;
      
      // Bonus for exact city match
      if (trialLocationLower.includes(locationLower) && locationLower.length > 3) {
        score += 5;
      }
    }
  }

  // Phase relevance bonus (10 points)
  if (filters.phase && filters.phase !== 'all') {
    const phaseMap = {
      'phase1': 'Phase 1',
      'phase2': 'Phase 2', 
      'phase3': 'Phase 3',
      'phase4': 'Phase 4',
      'early': ['Phase 1', 'Phase 2'],
      'late': ['Phase 3', 'Phase 4']
    };
    
    if (Array.isArray(phaseMap[filters.phase])) {
      if (phaseMap[filters.phase].includes(trial.phase)) {
        score += 10;
      }
    } else if (phaseMap[filters.phase] === trial.phase) {
      score += 10;
    }
  }

  // Cancer type relevance bonus (15 points)
  if (filters.cancerType && filters.cancerType !== 'all') {
    const cancerTypeLower = filters.cancerType.toLowerCase();
    const trialCondition = (trial.condition || '').toLowerCase();
    const trialTitle = (trial.title || '').toLowerCase();
    
    if (trialCondition.includes(cancerTypeLower) || trialTitle.includes(cancerTypeLower)) {
      score += 15;
      
      // Bonus for exact cancer type match
      if (trialCondition === cancerTypeLower || (trialTitle && trialTitle.includes(cancerTypeLower))) {
        score += 10;
      }
    }
  }

  // Treatment type relevance bonus (20 points)
  if (filters.treatmentType && filters.treatmentType !== 'all') {
    const treatmentTypes = {
      'immunotherapy': ['immunotherapy', 'immune therapy', 'checkpoint inhibitor', 'car-t', 't-cell'],
      'targeted': ['targeted therapy', 'targeted', 'precision medicine', 'genetic', 'molecular'],
      'chemotherapy': ['chemotherapy', 'chemo', 'cytotoxic'],
      'radiation': ['radiation', 'radiotherapy', 'radiation therapy'],
      'surgery': ['surgery', 'surgical', 'resection'],
      'hormone': ['hormone therapy', 'hormonal', 'endocrine'],
      'vaccine': ['vaccine', 'vaccination', 'preventive'],
      'stem_cell': ['stem cell', 'bone marrow', 'transplant']
    };
    
    if (treatmentTypes[filters.treatmentType]) {
      const hasTreatmentType = treatmentTypes[filters.treatmentType].some(type => 
        (trial.title && trial.title.toLowerCase().includes(type)) || (trial.description && trial.description.toLowerCase().includes(type))
      );
      if (hasTreatmentType) {
        score += 20;
      }
    }
  }

  // Recency bonus (5 points for newer trials)
  const trialId = trial.id;
  if (trialId.includes('NCT05') || trialId.includes('NCT06')) {
    score += 5; // Newer trial IDs
  }

  // Participant count bonus (5 points for smaller trials - more personalized)
  const participantCount = extractParticipantCount(trial.participants);
  if (participantCount > 0 && participantCount <= 100) {
    score += 5;
  }

  return score;
}

// Helper function to calculate mock distance (in miles)
function calculateMockDistance(userLocation, trialLocation) {
  const userCity = userLocation.toLowerCase();
  const trialCity = trialLocation.toLowerCase();

  const distances = {
    'new york': 0,
    'nyc': 0,
    'manhattan': 0,
    'brooklyn': 0,
    'queens': 0,
    'bronx': 0,
    'staten island': 0,
    'houston': 1000, // Mock distance for Houston
    'md anderson': 1000,
    'texas medical center': 1000,
    'baylor college': 1000,
    'baltimore': 500,
    'johns hopkins': 500,
    'maryland': 500,
    'baltimore medical center': 500,
    'university of maryland': 500,
    'rochester': 1000,
    'mayo clinic': 1000,
    'minnesota': 1000,
    'rochester medical center': 1000,
    'los angeles': 2000,
    'ucla': 2000,
    'california': 2000,
    'usc': 2000,
    'cedars-sinai': 2000,
    'city of hope': 2000,
    'dana-farber': 1000,
    'massachusetts general': 1000,
    'boston medical center': 1000,
    'harvard': 1000,
    'university of chicago': 1500,
    'northwestern': 1500,
    'rush medical center': 1500,
    'university of pennsylvania': 1200,
    'fox chase': 1200,
    'jefferson': 1200,
    'fred hutchinson': 3000,
    'university of washington': 3000,
    'seattle cancer care': 3000,
    'emory university': 1800,
    'winship cancer institute': 1800,
    'georgia': 1800,
    'miami': 2500,
    'sylvester comprehensive': 2500,
    'university of miami': 2500,
    'florida': 2500,
    'orlando': 2500,
    'tampa': 2500,
    'jacksonville': 2500,
    'university of colorado': 2500,
    'colorado cancer center': 2500,
    'cleveland clinic': 1700,
    'case western': 1700,
    'ohio': 1700,
    'columbus': 1700,
    'cincinnati': 1700,
    'pittsburgh': 1400,
    'upmc': 1400,
    'pennsylvania': 1400,
    'vanderbilt': 1600,
    'tennessee': 1600,
    'sarah cannon': 1600
  };

  if (distances[userCity] && distances[trialCity]) {
    return distances[userCity] + distances[trialCity]; // Mock combined distance
  }
  return 1000; // Default distance if cities not found
}

// Enhanced distance calculation with ZIP code support
function calculateEnhancedDistance(userLocation, trialLocation) {
  // If locations are the same city, return 0
  if (userLocation.toLowerCase() === trialLocation.toLowerCase()) {
    return 0;
  }
  
  // Check if it's a ZIP code (5 digits)
  const zipCodeRegex = /^\d{5}$/;
  if (zipCodeRegex.test(userLocation)) {
    // Mock ZIP code distance calculation
    return calculateZIPCodeDistance(userLocation, trialLocation);
  }
  
  // Use city-based distance calculation
  return calculateMockDistance(userLocation, trialLocation);
}

// Mock ZIP code distance calculation
function calculateZIPCodeDistance(userZIP, trialLocation) {
  // This is a simplified mock calculation
  // In a real implementation, you'd use a geocoding service or ZIP code database
  
  const zipPrefix = userZIP.substring(0, 3);
  const trialLocationLower = trialLocation.toLowerCase();
  
  // Mock distances based on ZIP code regions
  if (zipPrefix.startsWith('10') || zipPrefix.startsWith('11')) { // NYC area
    if (trialLocationLower.includes('new york') || trialLocationLower.includes('nyc')) {
      return Math.floor(Math.random() * 50); // 0-50 miles
    }
    return 100 + Math.floor(Math.random() * 200); // 100-300 miles
  } else if (zipPrefix.startsWith('77')) { // Houston area
    if (trialLocationLower.includes('houston') || trialLocationLower.includes('texas')) {
      return Math.floor(Math.random() * 50);
    }
    return 100 + Math.floor(Math.random() * 200);
  } else if (zipPrefix.startsWith('21')) { // Baltimore area
    if (trialLocationLower.includes('baltimore') || trialLocationLower.includes('maryland')) {
      return Math.floor(Math.random() * 50);
    }
    return 100 + Math.floor(Math.random() * 200);
  } else if (zipPrefix.startsWith('55')) { // Minnesota area
    if (trialLocationLower.includes('rochester') || trialLocationLower.includes('minnesota')) {
      return Math.floor(Math.random() * 50);
    }
    return 100 + Math.floor(Math.random() * 200);
  } else if (zipPrefix.startsWith('90')) { // California area
    if (trialLocationLower.includes('los angeles') || trialLocationLower.includes('california')) {
      return Math.floor(Math.random() * 50);
    }
    return 100 + Math.floor(Math.random() * 200);
  }
  
  // Default distance for unknown ZIP codes
  return 500 + Math.floor(Math.random() * 1000);
}

// Helper function to extract participant count from string
function extractParticipantCount(participantsString) {
  const match = participantsString.match(/\d+/);
  return match ? parseInt(match[0]) : 0;
}

// Enhanced search statistics with more detailed analytics
function calculateSearchStats(results, filters) {
  const totalTrials = allClinicalTrials.length;
  const matchedTrials = results.length;
  
  // Calculate filter usage statistics
  const activeFilters = Object.keys(filters).filter(key => 
    filters[key] && filters[key] !== 'all' && filters[key] !== ''
  );
  
  // Calculate phase distribution
  const phaseDistribution = {};
  results.forEach(trial => {
    phaseDistribution[trial.phase] = (phaseDistribution[trial.phase] || 0) + 1;
  });
  
  // Calculate status distribution
  const statusDistribution = {};
  results.forEach(trial => {
    statusDistribution[trial.status] = (statusDistribution[trial.status] || 0) + 1;
  });
  
  // Calculate location distribution
  const locationDistribution = {};
  results.forEach(trial => {
    const city = trial.location.split(',')[0].trim();
    locationDistribution[city] = (locationDistribution[city] || 0) + 1;
  });
  
  // Calculate condition distribution
  const conditionDistribution = {};
  results.forEach(trial => {
    conditionDistribution[trial.condition] = (conditionDistribution[trial.condition] || 0) + 1;
  });
  
  // Calculate average participant count
  const totalParticipants = results.reduce((sum, trial) => {
    return sum + extractParticipantCount(trial.participants);
  }, 0);
  const avgParticipants = results.length > 0 ? Math.round(totalParticipants / results.length) : 0;
  
  // Calculate search relevance score (if search text is provided)
  let avgRelevanceScore = 0;
  if (filters.searchText) {
    const relevanceScores = results.map(trial => 
      calculateEnhancedRelevanceScore(trial, filters.searchText, filters)
    );
    avgRelevanceScore = relevanceScores.length > 0 ? 
      Math.round(relevanceScores.reduce((sum, score) => sum + score, 0) / relevanceScores.length) : 0;
  }

  return {
    totalTrials,
    matchedTrials,
    matchPercentage: Math.round((matchedTrials / totalTrials) * 100),
    filtersApplied: activeFilters.length,
    activeFilters: activeFilters,
    phaseDistribution,
    statusDistribution,
    locationDistribution: Object.entries(locationDistribution)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5), // Top 5 locations
    conditionDistribution: Object.entries(conditionDistribution)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5), // Top 5 conditions
    avgParticipants,
    avgRelevanceScore,
    searchEfficiency: filters.searchText ? 
      Math.round((matchedTrials / totalTrials) * 100) : null
  };
}

// Get eligibility questions endpoint
app.get('/api/eligibility/questions', (req, res) => {
  res.json(eligibilityQuestions);
});

// In-memory storage for assessment results (in production, use a database)
const assessmentResults = new Map();

// Enhanced eligibility assessment endpoint
app.post('/api/eligibility/assess', async (req, res) => {
  try {
    console.log('=== ELIGIBILITY ASSESSMENT START ===');
    const answers = req.body;
    console.log('Received answers:', answers);
    
    if (!answers || Object.keys(answers).length === 0) {
      return res.status(400).json({
        error: 'Assessment answers are required',
        message: 'Please provide answers to the eligibility questions'
      });
    }
    
    // Validate required answers
    const requiredFields = ['age', 'cancerType', 'stage', 'performanceStatus', 'organFunction'];
    const missingFields = requiredFields.filter(field => !answers[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: `Please answer all required questions: ${missingFields.join(', ')}`,
        missingFields: missingFields
      });
    }
    
    console.log('Required fields validation passed');
    
    // Get trials from the API for eligibility assessment
    const filters = {
      page: 1,
      limit: 100 // Limit to first 100 trials for assessment
    };
    console.log('Calling searchTrials with filters:', filters);
    const apiResults = await searchTrials(filters);
    const trials = apiResults.trials || [];
    console.log(`Retrieved ${trials.length} trials from searchTrials`);
    
    if (trials.length > 0) {
      console.log('Sample trial structure:', {
        id: trials[0].id,
        title: trials[0].title,
        condition: trials[0].condition,
        phase: trials[0].phase,
        status: trials[0].status,
        location: trials[0].location,
        sponsor: trials[0].sponsor,
        participants: trials[0].participants,
        description: trials[0].description,
        eligibility: trials[0].eligibility
      });
    }
    
    console.log('Starting eligibility score calculation...');
    
    // Calculate eligibility scores for trials
    const trialScores = trials.map((trial, index) => {
      try {
        console.log(`Processing trial ${index + 1}/${trials.length}: ${trial.id || 'No ID'}`);
        const eligibilityResult = calculateEligibilityScore(trial, answers);
        console.log(`Eligibility score calculated for trial ${index + 1}:`, eligibilityResult.score);
        return {
          trial: {
            id: trial.id,
            title: trial.title,
            condition: trial.condition,
            phase: trial.phase,
            status: trial.status,
            location: trial.location,
            sponsor: trial.sponsor,
            participants: trial.participants,
            description: trial.description,
            eligibility: trial.eligibility
          },
          eligibilityScore: eligibilityResult.score,
          matchLevel: eligibilityResult.matchLevel,
          rawScore: eligibilityResult.rawScore,
          totalPoints: eligibilityResult.totalPoints,
          matchDetails: eligibilityResult.matchDetails,
          distance: calculateMockDistance(answers['location'] || 'New York', trial.location),
          phasePriority: getPhasePriority(trial.phase),
          statusPriority: getStatusPriority(trial.status)
        };
      } catch (trialError) {
        console.error(`Error processing trial ${index + 1}:`, trialError);
        console.error('Trial data:', trial);
        throw trialError;
      }
    });
    
    console.log(`Successfully processed ${trialScores.length} trials`);
    
    console.log('Starting trial sorting...');
    
    // Sort by eligibility score (descending) and then by other factors
    trialScores.sort((a, b) => {
      // Primary sort: eligibility score
      if (b.eligibilityScore !== a.eligibilityScore) {
        return b.eligibilityScore - a.eligibilityScore;
      }
      
      // Secondary sort: phase priority (Phase 1 gets higher priority for innovation)
      if (a.phasePriority !== b.phasePriority) {
        return b.phasePriority - a.phasePriority;
      }
      
      // Tertiary sort: status priority (recruiting gets higher priority)
      if (a.statusPriority !== b.statusPriority) {
        return b.statusPriority - a.statusPriority;
      }
      
      // Quaternary sort: distance (closer trials get higher priority)
      return a.distance - b.distance;
    });
    
    console.log('Trial sorting completed');
    
    // Get top matches (top 5 with score >= 40, or top 3 if fewer matches)
    const topMatches = trialScores.filter(trial => trial.eligibilityScore >= 40).slice(0, 5);
    const otherTrials = trialScores.filter(trial => trial.eligibilityScore < 40).slice(0, 3);
    
    console.log(`Top matches: ${topMatches.length}, Other trials: ${otherTrials.length}`);
    
    console.log('Generating assessment insights...');
    const insights = generateAssessmentInsights(answers, trialScores);
    console.log('Assessment insights generated');
    
    console.log('Generating next steps...');
    const nextSteps = generateNextSteps(topMatches, answers);
    console.log('Next steps generated');
    
    // Create comprehensive assessment result
    const assessmentId = generateAssessmentId();
    const assessmentResult = {
      id: assessmentId,
      timestamp: new Date().toISOString(),
      answers: answers,
      summary: {
        totalTrials: trials.length,
        excellentMatches: trialScores.filter(t => t.matchLevel === 'Excellent Match').length,
        veryGoodMatches: trialScores.filter(t => t.matchLevel === 'Very Good Match').length,
        goodMatches: trialScores.filter(t => t.matchLevel === 'Good Match').length,
        fairMatches: trialScores.filter(t => t.matchLevel === 'Fair Match').length,
        partialMatches: trialScores.filter(t => t.matchLevel === 'Partial Match').length,
        poorMatches: trialScores.filter(t => t.matchLevel === 'Poor Match').length,
        averageScore: Math.round(trialScores.reduce((sum, t) => sum + t.eligibilityScore, 0) / trialScores.length),
        bestScore: Math.max(...trialScores.map(t => t.eligibilityScore)),
        worstScore: Math.min(...trialScores.map(t => t.eligibilityScore))
      },
      recommendations: {
        topMatches: topMatches,
        otherTrials: otherTrials,
        totalRecommendations: topMatches.length + otherTrials.length
      },
      insights: insights,
      nextSteps: nextSteps
    };
    
    console.log('Assessment result created successfully');
    
    // Store assessment result
    assessmentResults.set(assessmentId, assessmentResult);
    
    console.log('=== ELIGIBILITY ASSESSMENT COMPLETED SUCCESSFULLY ===');
    
    // Return comprehensive result
    res.json({
      success: true,
      message: 'Eligibility assessment completed successfully',
      assessmentId: assessmentId,
      result: assessmentResult
    });
    
  } catch (error) {
    console.error('Error in eligibility assessment:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to process eligibility assessment',
      details: error.message
    });
  }
});

// Helper function to generate unique assessment ID
function generateAssessmentId() {
  return `assessment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Helper function to get phase priority for sorting
function getPhasePriority(phase) {
  const priorities = {
    'Phase 1': 100,
    'Phase 2': 80,
    'Phase 3': 60,
    'Phase 4': 40
  };
  return priorities[phase] || 0;
}

// Helper function to get status priority for sorting
function getStatusPriority(status) {
  const priorities = {
    'Recruiting': 100,
    'Active': 80,
    'Open': 60,
    'Not Recruiting': 40,
    'Completed': 20,
    'Terminated': 0
  };
  return priorities[status] || 0;
}

// Helper function to generate assessment insights
function generateAssessmentInsights(answers, trialScores) {
  const insights = [];
  
  // Cancer type insights
  const cancerType = answers['cancerType'];
  if (cancerType && cancerType !== 'Other') {
    const cancerTrials = trialScores.filter(t => t.matchDetails.some(d => d.factor === 'Cancer Type' && d.match));
    if (cancerTrials.length > 0) {
      insights.push({
        type: 'positive',
        category: 'Cancer Type',
        message: `Found ${cancerTrials.length} trials specifically for ${cancerType} cancer`,
        trials: cancerTrials.slice(0, 3).map(t => ({ id: t.trial.id, title: t.trial.title }))
      });
    } else {
      insights.push({
        type: 'warning',
        category: 'Cancer Type',
        message: `Limited trials available for ${cancerType} cancer. Consider expanding your search criteria.`,
        suggestion: 'Look for trials with related cancer types or broader eligibility criteria'
      });
    }
  }
  
  // Age insights
  const age = parseInt(answers['age']);
  if (age) {
    if (age < 18) {
      insights.push({
        type: 'info',
        category: 'Age',
        message: 'You qualify for pediatric trials. These often have specialized care and monitoring.',
        trials: trialScores.filter(t => t.trial.eligibility && t.trial.eligibility.toLowerCase().includes('pediatric')).slice(0, 2).map(t => ({ id: t.trial.id, title: t.trial.title }))
      });
    } else if (age >= 65) {
      insights.push({
        type: 'info',
        category: 'Age',
        message: 'You qualify for elderly-specific trials. These consider age-related health factors.',
        trials: trialScores.filter(t => t.trial.eligibility && t.trial.eligibility.toLowerCase().includes('elderly')).slice(0, 2).map(t => ({ id: t.trial.id, title: t.trial.title }))
      });
    }
  }
  
  // Treatment history insights
  const treatment = answers['previousTreatment'];
  if (treatment === 'no treatment yet') {
    insights.push({
      type: 'positive',
      category: 'Treatment History',
      message: 'Being treatment-naive gives you access to more trial options, including first-line treatments.',
      trials: trialScores.filter(t => t.trial.eligibility && t.trial.eligibility.toLowerCase().includes('no previous')).slice(0, 2).map(t => ({ id: t.trial.id, title: t.trial.title }))
    });
  } else if (treatment === 'chemotherapy' || treatment === 'immunotherapy') {
    insights.push({
      type: 'info',
      category: 'Treatment History',
      message: `Previous ${treatment} experience may qualify you for trials testing new combinations or second-line treatments.`,
      trials: trialScores.filter(t => t.trial.eligibility && t.trial.eligibility.toLowerCase().includes('previous')).slice(0, 2).map(t => ({ id: t.trial.id, title: t.trial.title }))
    });
  }
  
  // Location insights
  const travel = answers['travelWillingness'];
  if (travel && typeof travel === 'string') {
    if (travel.includes('100') || travel.includes('state') || travel.includes('country')) {
      insights.push({
        type: 'positive',
        category: 'Location',
        message: 'Your willingness to travel widely significantly increases your trial options.',
        trials: trialScores.slice(0, 3).map(t => ({ id: t.trial.id, title: t.trial.title, location: t.trial.location }))
      });
    } else if (travel.includes('25')) {
      insights.push({
        type: 'warning',
        category: 'Location',
        message: 'Limited travel may restrict your trial options. Consider expanding your travel radius.',
        suggestion: 'Look for trials in nearby major cities or academic medical centers'
      });
    }
  }
  
  // Overall match quality insights
  const excellentMatches = trialScores.filter(t => t.matchLevel === 'Excellent Match').length;
  if (excellentMatches >= 3) {
    insights.push({
      type: 'positive',
      category: 'Overall Match',
      message: `Excellent! You have ${excellentMatches} high-quality trial matches.`,
      suggestion: 'Focus on trials with the highest scores and best phase/status combinations'
    });
  } else if (excellentMatches === 0) {
    insights.push({
      type: 'warning',
      category: 'Overall Match',
      message: 'No excellent matches found. Consider adjusting your criteria or expanding your search.',
      suggestion: 'Look for trials with "Good Match" or "Fair Match" ratings that may still be suitable'
    });
  }
  
  return insights;
}

// Helper function to generate next steps
function generateNextSteps(topMatches, answers) {
  const nextSteps = [];
  
  if (topMatches.length === 0) {
    nextSteps.push({
      priority: 'high',
      action: 'Expand Search Criteria',
      description: 'Consider broadening your eligibility criteria or travel radius',
      details: 'Look for trials with different cancer types, phases, or locations'
    });
  } else {
    nextSteps.push({
      priority: 'high',
      action: 'Contact Top Trial Sites',
      description: `Reach out to the top ${Math.min(3, topMatches.length)} trial sites`,
      details: 'Call or email the trial coordinators to discuss your eligibility and next steps'
    });
    
    if (topMatches.some(t => t.trial.phase === 'Phase 1')) {
      nextSteps.push({
        priority: 'medium',
        action: 'Research Phase 1 Trials',
        description: 'Learn about the risks and benefits of early-phase trials',
        details: 'Phase 1 trials test safety and dosage, not effectiveness'
      });
    }
    
    if (topMatches.some(t => t.trial.status === 'Recruiting')) {
      nextSteps.push({
        priority: 'medium',
        action: 'Prepare for Screening',
        description: 'Gather medical records and prepare for initial screening',
        details: 'Most trials require recent medical history, lab results, and imaging studies'
      });
    }
  }
  
  nextSteps.push({
    priority: 'low',
    action: 'Consult Your Doctor',
    description: 'Discuss trial options with your oncologist',
    details: 'Your doctor can help evaluate trial suitability and coordinate with trial sites'
  });
  
  return nextSteps;
}

// Get search suggestions endpoint
app.get('/api/search/suggestions', (req, res) => {
  const query = req.query.q || '';
  const type = req.query.type || 'all'; // all, cancer, location, sponsor, treatment
  
  if (!query || query.length < 2) {
    return res.json({ suggestions: [] });
  }
  
  const queryLower = query.toLowerCase();
  const suggestions = [];
  
  if (type === 'all' || type === 'cancer') {
    // Cancer type suggestions
    const cancerTypes = [
      'Breast Cancer', 'Lung Cancer', 'Colorectal Cancer', 'Lymphoma', 'Leukemia',
      'Prostate Cancer', 'Pancreatic Cancer', 'Ovarian Cancer', 'Melanoma', 'Brain Cancer'
    ];
    
    cancerTypes.forEach(cancer => {
      if (cancer.toLowerCase().includes(queryLower)) {
        suggestions.push({
          type: 'cancer',
          value: cancer,
          display: cancer,
          category: 'Cancer Type'
        });
      }
    });
  }
  
  if (type === 'all' || type === 'location') {
    // Location suggestions
    const locations = [
      'New York', 'Houston', 'Baltimore', 'Rochester', 'Los Angeles',
      'Boston', 'Chicago', 'Philadelphia', 'Seattle', 'Atlanta',
      'Miami', 'Denver', 'Cleveland', 'Pittsburgh', 'Nashville'
    ];
    
    locations.forEach(location => {
      if (location.toLowerCase().includes(queryLower)) {
        suggestions.push({
          type: 'location',
          value: location,
          display: location,
          category: 'Location'
        });
      }
    });
  }
  
  if (type === 'all' || type === 'sponsor') {
    // Sponsor suggestions
    const sponsors = [
      'University', 'Medical Center', 'Cancer Center', 'Institute', 'Clinic',
      'Pharmaceutical', 'Government', 'Nonprofit', 'Foundation'
    ];
    
    sponsors.forEach(sponsor => {
      if (sponsor.toLowerCase().includes(queryLower)) {
        suggestions.push({
          type: 'sponsor',
          value: sponsor,
          display: sponsor,
          category: 'Institution Type'
        });
      }
    });
  }
  
  if (type === 'all' || type === 'treatment') {
    // Treatment type suggestions
    const treatments = [
      'Immunotherapy', 'Targeted Therapy', 'Chemotherapy', 'Radiation Therapy',
      'Surgery', 'Hormone Therapy', 'Vaccine', 'Stem Cell Therapy'
    ];
    
    treatments.forEach(treatment => {
      if (treatment.toLowerCase().includes(queryLower)) {
        suggestions.push({
          type: 'treatment',
          value: treatment,
          display: treatment,
          category: 'Treatment Type'
        });
      }
    });
  }
  
  // Add dynamic suggestions from actual trial data
  if (type === 'all') {
    allClinicalTrials.forEach(trial => {
      // Title suggestions
      if (trial.title && trial.title.toLowerCase().includes(queryLower)) {
        const existing = suggestions.find(s => s.value === trial.title);
        if (!existing) {
          suggestions.push({
            type: 'trial',
            value: trial.title,
            display: trial.title,
            category: 'Trial Title',
            trialId: trial.id
          });
        }
      }
      
      // Condition suggestions
      if (trial.condition && trial.condition.toLowerCase().includes(queryLower)) {
        const existing = suggestions.find(s => s.value === trial.condition);
        if (!existing) {
          suggestions.push({
            type: 'condition',
            value: trial.condition,
            display: trial.condition,
            category: 'Medical Condition'
          });
        }
      }
    });
  }
  
  // Sort suggestions by relevance and limit results
  suggestions.sort((a, b) => {
    // Exact matches first
    if (a.value.toLowerCase() === queryLower) return -1;
    if (b.value.toLowerCase() === queryLower) return 1;
    
    // Starts with query
    if (a.value.toLowerCase().startsWith(queryLower)) return -1;
    if (b.value.toLowerCase().startsWith(queryLower)) return 1;
    
    // Contains query
    return a.value.toLowerCase().indexOf(queryLower) - b.value.toLowerCase().indexOf(queryLower);
  });
  
  // Limit to top 10 suggestions
  const limitedSuggestions = suggestions.slice(0, 10);
  
  res.json({
    query: query,
    type: type,
    suggestions: limitedSuggestions,
    total: suggestions.length
  });
});

// Get assessment result by ID
app.get('/api/eligibility/assessment/:id', (req, res) => {
  const { id } = req.params;
  
  if (!assessmentResults || !assessmentResults.has(id)) {
    return res.status(404).json({ error: 'Assessment not found' });
  }
  
  const assessment = assessmentResults.get(id);
  res.json(assessment);
});

// Helper function to get detailed match information
function getMatchDetails(trial, answers) {
  const details = [];
  
  // Cancer type match
  if (answers['cancerType'] && answers['cancerType'] !== 'Other') {
    const cancerTypeLower = answers['cancerType'].toLowerCase();
    const trialCondition = (trial.condition || '').toLowerCase();
    const trialTitle = (trial.title || '').toLowerCase();
    const trialDescription = (trial.description || '').toLowerCase();

    if (trialCondition.includes(cancerTypeLower) || trialTitle.includes(cancerTypeLower)) {
      details.push({
        factor: 'Cancer Type',
        match: true,
        weight: 'High (40 points)',
        description: `Your cancer type (${answers['cancerType']}) exactly matches this trial's condition`,
        points: 40
      });
    } else {
      // Check for related cancer types
      const cancerRelations = {
        'lung': ['pulmonary', 'respiratory', 'bronchogenic', 'non-small cell', 'nsclc', 'small cell', 'sclc'],
        'breast': ['mammary', 'ductal', 'lobular', 'triple negative', 'her2+', 'her2 positive'],
        'colorectal': ['colon', 'rectal', 'bowel', 'intestinal', 'adenocarcinoma'],
        'lymphoma': ['lymphatic', 'lymph', 'hodgkin', 'non-hodgkin', 'nhl', 'hl'],
        'leukemia': ['leukemic', 'blood cancer', 'acute', 'chronic', 'myeloid', 'lymphocytic'],
        'prostate': ['prostatic', 'adenocarcinoma', 'castration resistant']
      };
      
      if (cancerRelations[cancerTypeLower]) {
        const hasRelated = cancerRelations[cancerTypeLower].some(related => 
          trialCondition.includes(related) || trialTitle.includes(related) || trialDescription.includes(related)
        );
        if (hasRelated) {
          details.push({
            factor: 'Cancer Type',
            match: true,
            weight: 'High (30 points)',
            description: `Your cancer type (${answers['cancerType']}) is related to this trial's condition`,
            points: 30
          });
        } else {
          details.push({
            factor: 'Cancer Type',
            match: false,
            weight: 'High (0 points)',
            description: `Your cancer type (${answers['cancerType']}) doesn't match this trial's condition`,
            points: 0
          });
        }
      } else {
        details.push({
          factor: 'Cancer Type',
          match: false,
          weight: 'High (0 points)',
          description: `Your cancer type (${answers['cancerType']}) doesn't match this trial's condition`,
          points: 0
        });
      }
    }
  } else if (answers['cancerType'] === 'Other') {
    // Generic cancer matching for "Other" category
    const trialText = `${trial.condition || ''} ${trial.title || ''} ${trial.description || ''}`.toLowerCase();
    if (trialText.includes('cancer') || trialText.includes('tumor') || trialText.includes('neoplasm')) {
      details.push({
        factor: 'Cancer Type',
        match: true,
        weight: 'High (25 points)',
        description: 'Your cancer type matches this general cancer trial',
        points: 25
      });
    } else {
      details.push({
        factor: 'Cancer Type',
        match: false,
        weight: 'High (0 points)',
        description: 'This trial is not for your type of cancer',
        points: 0
      });
    }
  }
  
  // Cancer stage match
  if (answers['stage']) {
    const stage = answers['stage'].toLowerCase();
    const trialEligibility = (trial.eligibility || '').toLowerCase();
    const trialDescription = (trial.description || '').toLowerCase();

    let stageScore = 0;
    let stageMatch = false;
    
    if (stage.includes('early') || stage.includes('stage i-ii')) {
      if (trialEligibility.includes('early') || trialDescription.includes('early stage') || 
          trialDescription.includes('stage i') || trialDescription.includes('stage ii')) {
        stageScore = 25;
        stageMatch = true;
      }
    } else if (stage.includes('advanced') || stage.includes('stage iii-iv')) {
      if (trialEligibility.includes('advanced') || trialDescription.includes('advanced') || 
          trialDescription.includes('stage iii') || trialDescription.includes('stage iv')) {
        stageScore = 25;
        stageMatch = true;
      }
    } else if (stage.includes('metastatic')) {
      if (trialEligibility.includes('metastatic') || trialDescription.includes('metastatic')) {
        stageScore = 25;
        stageMatch = true;
      }
    } else if (stage.includes('remission')) {
      if (trialEligibility.includes('remission') || trialDescription.includes('remission')) {
        stageScore = 25;
        stageMatch = true;
      }
    }
    
    details.push({
      factor: 'Cancer Stage',
      match: stageMatch,
      weight: 'High (25 points)',
      description: stageMatch ? 
        `Your cancer stage (${answers['stage']}) matches this trial's requirements` :
        `Your cancer stage (${answers['stage']}) may not meet this trial's requirements`,
      points: stageScore
    });
  }
  
  // Age match
  if (answers['age']) {
    const age = parseInt(answers['age']);
    const trialEligibility = (trial.eligibility || '').toLowerCase();
    
    let ageScore = 0;
    let ageMatch = false;
    
    // Check various age patterns in eligibility
    if (trialEligibility.includes('18') && trialEligibility.includes('75')) {
      if (age >= 18 && age <= 75) {
        ageScore = 20;
        ageMatch = true;
      }
    } else if (trialEligibility.includes('18') && trialEligibility.includes('70')) {
      if (age >= 18 && age <= 70) {
        ageScore = 20;
        ageMatch = true;
      }
    } else if (trialEligibility.includes('pediatric') || trialEligibility.includes('child')) {
      if (age < 18) {
        ageScore = 20;
        ageMatch = true;
      }
    } else if (trialEligibility.includes('elderly') || trialEligibility.includes('senior')) {
      if (age >= 65) {
        ageScore = 20;
        ageMatch = true;
      }
    } else if (trialEligibility.includes('adult')) {
      if (age >= 18) {
        ageScore = 15; // Partial match
        ageMatch = true;
      }
    }
    
    details.push({
      factor: 'Age',
      match: ageMatch,
      weight: 'Medium (20 points)',
      description: ageMatch ? 
        `Your age (${age}) meets this trial's age requirements` :
        `Your age (${age}) may not meet this trial's age requirements`,
      points: ageScore
    });
  }
  
  // Treatment history match
  if (answers['previousTreatment']) {
    const treatment = answers['previousTreatment'].toLowerCase();
    const trialEligibility = (trial.eligibility || '').toLowerCase();
    const trialDescription = (trial.description || '').toLowerCase();

    let treatmentScore = 0;
    let treatmentMatch = false;
    
    // Check for treatment compatibility
    if (treatment === 'no treatment yet') {
      if (trialEligibility.includes('no previous') || trialEligibility.includes('treatment naive')) {
        treatmentScore = 20;
        treatmentMatch = true;
      }
    } else if (treatment === 'chemotherapy') {
      if (trialEligibility.includes('previous chemotherapy') || trialEligibility.includes('chemo')) {
        treatmentScore = 20;
        treatmentMatch = true;
      } else if (trialEligibility.includes('no previous') && !trialEligibility.includes('chemotherapy')) {
        treatmentScore = 0; // Incompatible
      } else {
        treatmentScore = 10; // Neutral
        treatmentMatch = true;
      }
    } else if (treatment === 'immunotherapy') {
      if (trialEligibility.includes('previous immunotherapy') || trialEligibility.includes('immune')) {
        treatmentScore = 20;
        treatmentMatch = true;
      } else if (trialEligibility.includes('no previous') && !trialEligibility.includes('immunotherapy')) {
        treatmentScore = 0; // Incompatible
      } else {
        treatmentScore = 10; // Neutral
        treatmentMatch = true;
      }
    } else {
      // Other treatments get neutral score
      treatmentScore = 10;
      treatmentMatch = true;
    }
    
    details.push({
      factor: 'Treatment History',
      match: treatmentMatch,
      weight: 'Medium (20 points)',
      description: treatmentMatch ? 
        `Your treatment history (${answers['previousTreatment']}) is compatible with this trial` :
        `Your treatment history (${answers['previousTreatment']}) may not be compatible`,
      points: treatmentScore
    });
  }
  
  // Performance status match
  if (answers['performanceStatus']) {
    const health = answers['performanceStatus'].toLowerCase();
    const trialEligibility = (trial.eligibility || '').toLowerCase();

    let healthScore = 0;
    let healthMatch = false;
    
    if (health === 'excellent' || health === 'good') {
      if (trialEligibility.includes('good') || trialEligibility.includes('excellent') || 
          trialEligibility.includes('performance status') || trialEligibility.includes('overall health')) {
        healthScore = 15;
        healthMatch = true;
      } else {
        healthScore = 10; // Neutral
        healthMatch = true;
      }
    } else if (health === 'fair') {
      if (trialEligibility.includes('fair') || trialEligibility.includes('adequate')) {
        healthScore = 15;
        healthMatch = true;
      } else {
        healthScore = 5; // Reduced score
        healthMatch = true;
      }
    } else if (health === 'poor') {
      if (trialEligibility.includes('poor') || trialEligibility.includes('limited')) {
        healthScore = 15;
        healthMatch = true;
      } else {
        healthScore = 0; // Incompatible
      }
    }
    
    details.push({
      factor: 'Health Status',
      match: healthMatch,
      weight: 'Medium (15 points)',
      description: healthMatch ? 
        `Your performance status (${answers['performanceStatus']}) meets this trial's requirements` :
        `Your performance status (${answers['performanceStatus']}) may not meet this trial's requirements`,
      points: healthScore
    });
  }
  
  // Location and travel match
  if (answers['travelWillingness'] && typeof answers['travelWillingness'] === 'string') {
    const travel = answers['travelWillingness'].toLowerCase();
    let locationScore = 0;
    let locationMatch = false;
    
    if (travel.includes('100') || travel.includes('state') || travel.includes('country')) {
      locationScore = 10; // Willing to travel far
      locationMatch = true;
    } else if (travel.includes('50')) {
      locationScore = 8; // Moderate travel
      locationMatch = true;
    } else if (travel.includes('25')) {
      locationScore = 5; // Limited travel
      locationMatch = true;
    }
    
    details.push({
      factor: 'Travel Willingness',
      match: locationMatch,
      weight: 'Low (10 points)',
      description: `Your travel preference (${answers['travelWillingness']}) is compatible with trial participation`,
      points: locationScore
    });
  }
  
  return details;
}

// Helper function to generate assessment summary
function generateAssessmentSummary(answers, matches) {
  const cancerType = answers['cancerType'] || 'your condition';
  const age = answers['age'] || 'your age';
  
  if (matches.length === 0) {
    return {
      title: 'No Matches Found',
      description: `We couldn't find any trials that match your profile. Consider expanding your search criteria or consulting with your healthcare provider.`,
      recommendations: [
        'Try broadening your search criteria',
        'Consult with your healthcare provider about other options',
        'Check back later for new trials'
      ]
    };
  }
  
  const topMatch = matches[0];
  const matchCount = matches.length;
  
  return {
    title: `${matchCount} Trial${matchCount > 1 ? 's' : ''} Found`,
    description: `We found ${matchCount} clinical trial${matchCount > 1 ? 's' : ''} that match your profile. The best match is "${topMatch.title}" with a ${topMatch.matchScore}% compatibility score.`,
    recommendations: [
      'Review the trial details carefully',
      'Discuss with your healthcare provider',
      'Contact the trial coordinator for more information',
      'Consider multiple trials to increase your options'
    ]
  };
}

const server = app.listen(PORT, '127.0.0.1', () => {
  const actualPort = server.address().port;
  console.log(`Backend server running on http://127.0.0.1:${actualPort}`);
  console.log('Available endpoints:');
  console.log('  GET /api/health - Health check');
  console.log('  GET /api/trials - Get all trials');
  console.log('  GET /api/trials/:id - Get trial by ID with enhanced details');
  console.log('  GET /api/trials/search - Search trials with filters, pagination, and sorting');
  console.log('  GET /api/eligibility/questions - Get assessment questions');
  console.log('  POST /api/eligibility/assess - Process assessment and return matches');
  console.log('  GET /api/eligibility/assessment/:id - Get assessment result by ID');
  console.log('  GET /api/search/suggestions - Get search suggestions and autocomplete');
  console.log('');
  console.log('Implementation Status:');
  console.log('Phase 2 Core API Endpoints: ✅ COMPLETED');
  console.log('Phase 3 Search & Filtering Logic: ✅ COMPLETED');
  console.log('Phase 4 Assessment Engine: ✅ COMPLETED');
  console.log(`\nFrontend should connect to: http://127.0.0.1:${actualPort}/api`);
});



// Phase 5 Enhanced Geolocation Endpoint
app.get('/api/geolocation/nearby-trials', (req, res) => {
  try {
    const { lat, lng, radius = 100, limit = 20 } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({
        error: 'Missing coordinates',
        message: 'Latitude and longitude are required'
      });
    }

    const userLocation = { lat: parseFloat(lat), lng: parseFloat(lng) };
    const radiusMiles = parseInt(radius);
    
    // Calculate distances and filter trials within radius
    const nearbyTrials = allClinicalTrials
      .map(trial => {
        if (trial.coordinates) {
          const distance = calculateEnhancedDistance(userLocation, trial.coordinates);
          return { ...trial, distance };
        }
        return null;
      })
      .filter(trial => trial && trial.distance <= radiusMiles)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, parseInt(limit));

    // Group by distance ranges
    const distanceGroups = {
      '0-25 miles': nearbyTrials.filter(t => t.distance <= 25),
      '26-50 miles': nearbyTrials.filter(t => t.distance > 25 && t.distance <= 50),
      '51-100 miles': nearbyTrials.filter(t => t.distance > 50 && t.distance <= 100)
    };

    res.json({
      success: true,
      userLocation,
      radius: radiusMiles,
      totalNearby: nearbyTrials.length,
      trials: nearbyTrials,
      distanceGroups,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('Geolocation error:', error);
    res.status(500).json({
      error: 'Internal server error while processing geolocation request',
      details: error.message
    });
  }
});

// Phase 5 Enhanced Cancer Type Analysis Endpoint
app.get('/api/analytics/cancer-types', (req, res) => {
  try {
    const cancerTypeStats = {};
    
    allClinicalTrials.forEach(trial => {
      const condition = trial.condition;
      if (!cancerTypeStats[condition]) {
        cancerTypeStats[condition] = {
          count: 0,
          phases: {},
          statuses: {},
          treatmentTypes: {},
          locations: [],
          totalParticipants: 0
        };
      }
      
      cancerTypeStats[condition].count++;
      
      // Phase distribution
      const phase = trial.phase;
      cancerTypeStats[condition].phases[phase] = (cancerTypeStats[condition].phases[phase] || 0) + 1;
      
      // Status distribution
      const status = trial.status;
      cancerTypeStats[condition].statuses[status] = (cancerTypeStats[condition].statuses[status] || 0) + 1;
      
      // Treatment type distribution
      if (trial.treatmentType) {
        cancerTypeStats[condition].treatmentTypes[trial.treatmentType] = 
          (cancerTypeStats[condition].treatmentTypes[trial.treatmentType] || 0) + 1;
      }
      
      // Location tracking
      const city = trial.location.split(',')[0].trim();
      if (!cancerTypeStats[condition].locations.includes(city)) {
        cancerTypeStats[condition].locations.push(city);
      }
      
      // Participant count
      const participantCount = extractParticipantCount(trial.participants);
      if (participantCount) {
        cancerTypeStats[condition].totalParticipants += participantCount;
      }
    });

    // Sort by trial count
    const sortedCancerTypes = Object.entries(cancerTypeStats)
      .sort(([,a], [,b]) => b.count - a.count);

    res.json({
      success: true,
      totalCancerTypes: sortedCancerTypes.length,
      cancerTypeStats: Object.fromEntries(sortedCancerTypes),
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('Cancer type analytics error:', error);
    res.status(500).json({
      error: 'Internal server error while processing cancer type analytics',
      details: error.message
    });
  }
});

// Phase 5 Enhanced Assessment Insights Endpoint
app.get('/api/eligibility/insights/:assessmentId', (req, res) => {
  try {
    const { assessmentId } = req.params;
    
    if (!assessmentResults || !assessmentResults.has(assessmentId)) {
      return res.status(404).json({ error: 'Assessment not found' });
    }
    
    const assessment = assessmentResults.get(assessmentId);
    const { answers, trialScores } = assessment;
    
    // Generate enhanced insights
    const enhancedInsights = {
      cancerTypeInsights: generateCancerTypeInsights(answers, trialScores),
      eligibilityInsights: generateEligibilityInsights(answers, trialScores),
      locationInsights: generateLocationInsights(answers, trialScores),
      treatmentInsights: generateTreatmentInsights(answers, trialScores),
      phaseInsights: generatePhaseInsights(answers, trialScores),
      recommendations: generateEnhancedRecommendations(answers, trialScores)
    };

    res.json({
      success: true,
      assessmentId,
      insights: enhancedInsights,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('Enhanced insights error:', error);
    res.status(500).json({
      error: 'Internal server error while generating enhanced insights',
      details: error.message
    });
  }
});

// Phase 5 Enhanced Helper Functions
function generateCancerTypeInsights(answers, trialScores) {
  const cancerType = answers['cancerType'];
  if (!cancerType || cancerType === 'Other') return null;
  
  const exactMatches = trialScores.filter(t => 
    t.trial.condition && t.trial.condition.toLowerCase().includes(cancerType.toLowerCase())
  );
  
  const relatedMatches = trialScores.filter(t => 
    t.trial.condition && !t.trial.condition.toLowerCase().includes(cancerType.toLowerCase()) &&
    t.eligibilityScore >= 70
  );
  
  return {
    exactMatches: exactMatches.length,
    relatedMatches: relatedMatches.length,
    topExactMatch: exactMatches[0] || null,
    topRelatedMatch: relatedMatches[0] || null,
    message: `Found ${exactMatches.length} exact matches and ${relatedMatches.length} related trials for ${cancerType}`
  };
}

function generateEligibilityInsights(answers, trialScores) {
  const insights = [];
  
  // Age insights
  const age = parseInt(answers['age']);
  if (age) {
    const ageAppropriateTrials = trialScores.filter(t => {
      const criteria = t.trial.eligibilityCriteria?.age;
      if (criteria) {
        return age >= criteria.min && age <= criteria.max;
      }
      return true;
    });
    
    insights.push({
      type: 'age',
      message: `Your age (${age}) is appropriate for ${ageAppropriateTrials.length} trials`,
      trials: ageAppropriateTrials.slice(0, 3)
    });
  }
  
  // Performance status insights
  const performanceStatus = answers['performanceStatus'];
  if (performanceStatus) {
    const statusAppropriateTrials = trialScores.filter(t => 
      t.eligibilityScore >= 80
    );
    
    insights.push({
      type: 'performance',
      message: `Your performance status allows participation in ${statusAppropriateTrials.length} trials`,
      trials: statusAppropriateTrials.slice(0, 3)
    });
  }
  
  return insights;
}

function generateLocationInsights(answers, trialScores) {
  const userLocation = answers['location'];
  if (!userLocation) return null;
  
  const locationTrials = trialScores.filter(t => 
    t.trial.location && t.trial.location.toLowerCase().includes(userLocation.toLowerCase())
  );
  
  const nearbyTrials = trialScores.filter(t => 
    t.trial.location && !t.trial.location.toLowerCase().includes(userLocation.toLowerCase()) &&
    t.eligibilityScore >= 75
  );
  
  return {
    localTrials: locationTrials.length,
    nearbyTrials: nearbyTrials.length,
    topLocalTrial: locationTrials[0] || null,
    topNearbyTrial: nearbyTrials[0] || null,
    message: `Found ${locationTrials.length} local trials and ${nearbyTrials.length} nearby trials`
  };
}

function generateTreatmentInsights(answers, trialScores) {
  const treatmentPreference = answers['treatment-preferences'];
  if (!treatmentPreference) return null;
  
  const preferredTreatmentTrials = trialScores.filter(t => 
    t.trial.treatmentType && 
    t.trial.treatmentType.toLowerCase().includes(treatmentPreference.toLowerCase())
  );
  
  return {
    preferredTreatmentTrials: preferredTreatmentTrials.length,
    topPreferredTrial: preferredTreatmentTrials[0] || null,
    message: `Found ${preferredTreatmentTrials.length} trials matching your treatment preference`
  };
}

function generatePhaseInsights(answers, trialScores) {
  const phasePreference = answers['trial-phase-preferences'];
  if (!phasePreference) return null;
  
  const preferredPhaseTrials = trialScores.filter(t => 
    t.trial.phase === phasePreference
  );
  
  return {
    preferredPhaseTrials: preferredPhaseTrials.length,
    topPreferredPhaseTrial: preferredPhaseTrials[0] || null,
    message: `Found ${preferredPhaseTrials.length} trials in your preferred phase (${phasePreference})`
  };
}

function generateEnhancedRecommendations(answers, trialScores) {
  const recommendations = [];
  
  // Top match recommendation
  const topMatch = trialScores[0];
  if (topMatch && topMatch.eligibilityScore >= 90) {
    recommendations.push({
      type: 'top_match',
      priority: 'high',
      message: `Excellent match: ${topMatch.trial.title}`,
      trial: topMatch.trial,
      score: topMatch.eligibilityScore
    });
  }
  
  // Local trial recommendation
  const userLocation = answers['location'];
  if (userLocation) {
    const localTrials = trialScores.filter(t => 
      t.trial.location && t.trial.location.toLowerCase().includes(userLocation.toLowerCase()) &&
      t.eligibilityScore >= 80
    );
    
    if (localTrials.length > 0) {
      recommendations.push({
        type: 'local_trial',
        priority: 'medium',
        message: `Local trial available: ${localTrials[0].trial.title}`,
        trial: localTrials[0].trial,
        score: localTrials[0].eligibilityScore
      });
    }
  }
  
  // Phase-specific recommendation
  const phasePreference = answers['trial-phase-preferences'];
  if (phasePreference) {
    const phaseTrials = trialScores.filter(t => 
      t.trial.phase === phasePreference &&
      t.eligibilityScore >= 75
    );
    
    if (phaseTrials.length > 0) {
      recommendations.push({
        type: 'phase_specific',
        priority: 'medium',
        message: `Phase ${phasePreference} trial: ${phaseTrials[0].trial.title}`,
        trial: phaseTrials[0].trial,
        score: phaseTrials[0].eligibilityScore
      });
    }
  }
  
  return recommendations;
}

// Start server
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
  console.log('Available endpoints:');
  console.log('  GET /api/health - Health check');
  console.log('  GET /api/trials - Get all trials');
  console.log('  GET /api/trials/:id - Get trial by ID with enhanced details');
  console.log('  GET /api/trials/search - Search trials with filters, pagination, and sorting');
  console.log('  GET /api/eligibility/questions - Get assessment questions');
  console.log('  POST /api/eligibility/assess - Process assessment and return matches');
  console.log('  GET /api/eligibility/assessment/:id - Get assessment result by ID');
  console.log('  GET /api/search/suggestions - Get search suggestions and autocomplete');
  console.log('  GET /api/geolocation/nearby-trials - Phase 5 Enhanced Geolocation');
  console.log('  GET /api/analytics/cancer-types - Phase 5 Cancer Type Analytics');
  console.log('  GET /api/eligibility/insights/:id - Phase 5 Enhanced Assessment Insights');
  console.log('  GET /api/trials/filters - Get available filter options');
  console.log('  GET /api/trials/stats - Get trial statistics');
  console.log(`Database loaded with ${allClinicalTrials.length} clinical trials`);
  console.log('Phase 2 Core API Endpoints: ✅ COMPLETED');
  console.log('Phase 3 Search & Filtering Logic: ✅ COMPLETED');
  console.log('Phase 4 Assessment Engine: ✅ COMPLETED');
  console.log('Phase 5 Data Enhancement: ✅ COMPLETED');
  console.log('  - Enhanced mock dataset with 60+ trials covering diverse cancer types');
  console.log('  - Enhanced eligibility questions and scoring system');
  console.log('  - Enhanced search and filtering logic');
  console.log('  - Enhanced assessment engine with detailed insights');
  console.log('  - Enhanced geolocation features with distance calculations');
  console.log('  - Enhanced cancer type analytics and recommendations');
});
