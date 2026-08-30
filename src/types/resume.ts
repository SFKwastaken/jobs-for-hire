export type ResumeTemplate = 'professional' | 'modern' | 'minimal' | 'creative' | 'executive' | 'tech' | 'academic' | 'startup' | 'elegant' | 'classic';

export interface ResumeSection {
  id: string;
}

export interface ResumeExperience extends ResumeSection {
  company: string;
  jobTitle: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
  achievements: string[];
}

export interface ResumeEducation extends ResumeSection {
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface ResumeProject extends ResumeSection {
  name: string;
  description: string;
  technologies: string[];
  url: string;
}

export interface ResumeCertification extends ResumeSection {
  name: string;
  issuer: string;
  date: string;
}

export interface ResumeLanguage extends ResumeSection {
  name: string;
  level: string; // e.g., Native, Fluent, Intermediate, Basic
}

export interface ResumeData {
  personal: {
    fullName: string;
    professionalTitle: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    portfolio: string;
  };
  summary: string;
  experience: ResumeExperience[];
  education: ResumeEducation[];
  skills: string[];
  projects: ResumeProject[];
  certifications: ResumeCertification[];
  languages: ResumeLanguage[];
}

export interface Resume {
  id: string;
  userId: string;
  title: string;
  targetRole: string;
  targetJobId?: string; // If tailored to a specific job
  resumeData: ResumeData;
  template: ResumeTemplate;
  createdAt: string;
  updatedAt: string;
}
