export interface SearchProfile {
  rawQuery: string;
  roles: string[];
  alternativeRoles: string[];
  skills: string[];
  technologies: string[];
  keywords: string[];
  excludedKeywords: string[];
  location: {
    country?: string;
    city?: string;
    region?: string;
  };
  remote: boolean;
  remoteType?: "fully_remote" | "remote" | "hybrid" | "onsite" | "unknown";
  countriesAllowed: string[];
  experienceLevel?: "intern" | "entry" | "junior" | "mid" | "senior" | "lead" | "unknown";
  salaryRequirements: {
    hourly?: { min?: number; max?: number; currency?: string; };
    monthly?: { min?: number; max?: number; currency?: string; };
    yearly?: { min?: number; max?: number; currency?: string; };
  };
  employmentTypes: string[];
  preferredSources?: string[];
  semanticDescription: string;
}

export interface SearchResult {
  title: string;
  url: string;
  description?: string;
  raw_content?: string;
  source?: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  description?: string;
  location?: string;
  country?: string;
  remote: boolean;
  remoteType?: string;
  eligibleCountries?: string[];
  salary?: {
    min?: number;
    max?: number;
    currency?: string;
    period?: "hour" | "month" | "year";
    originalText?: string;
  };
  employmentType?: string;
  experienceLevel?: string;
  skills: string[];
  technologies: string[];
  source: string;
  sourceDomain: string;
  sourceUrl: string;
  applyUrl?: string;
  postedDate?: string;
  discoveredAt: string;
  verificationStatus: "verified" | "partially_verified" | "unverified" | "expired" | "rejected";
  extractionConfidence: number;
}

export interface JobMatchAnalysis {
  matchScore: number;
  matchingSkills: string[];
  missingSkills: string[];
  whyItMatches: string;
  concerns: string[];
  roleRelevance: number;
  skillRelevance: number;
  experienceFit: number;
  remoteFit: number;
  salaryFit: number;
}

export interface ProcessedJob {
  raw: Job;
  analysis: JobMatchAnalysis;
}
