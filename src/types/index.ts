export interface CompanyProfile {
  name: string;
  industry: string;
  sentiment: number;
  growth: string;
  website?: string;
}

export interface Strategy {
  core: string;
  revenue: string[];
  future: string;
}

export interface SalaryRange {
  min: number;
  max: number;
  avg: number;
  currency: string;
}

export interface NewsItem {
  title: string;
  source: string;
  date: string;
  type: 'positive' | 'negative' | 'neutral';
  link?: string;
}

export interface Discussion {
  topic: string;
  score: number;
  comment: string;
  link?: string;
}

export interface MarketData {
  salaryRange: SalaryRange;
  news: NewsItem[];
  discussions: Discussion[];
}

export interface Skills {
  hard: string[];
  soft: string[];
}

export interface Advice {
  step: number;
  title: string;
  desc: string;
}

export interface Product {
  name: string;
  description: string;
  link?: string;
}

export interface JobDetails {
  remote: boolean;
  overtime: boolean;
  responsibilities: string[];
}

export interface WhiteboardChallenge {
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export interface AnalysisResult {
  jobTitle: string;
  companyProfile: CompanyProfile;
  strategy: Strategy;
  products: Product[];
  jobDetails: JobDetails;
  whiteboard?: WhiteboardChallenge[];
  marketData: MarketData;
  skills: Skills;
  advice: Advice[];
}
