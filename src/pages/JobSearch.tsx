import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, Filter, X, Briefcase, DollarSign, Clock, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { executeJobSearch, type SearchFilters } from '../utils/adzuna';
import type { ProcessedJob } from '../utils/job-engine/types';
import JobCard from '../components/JobSearch/JobCard';
import { useAuth } from '../contexts/AuthContext';
import { getUserProfile } from '../lib/profile';

export default function JobSearch() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<ProcessedJob[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  
  // Filter States
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [location, setLocation] = useState(searchParams.get('loc') || '');
  const [country, setCountry] = useState(searchParams.get('country') || 'United States');
  const [remote, setRemote] = useState(searchParams.get('remote') === 'true');
  const [jobTypes, setJobTypes] = useState<string[]>(searchParams.getAll('type'));
  const [salaryMin, setSalaryMin] = useState<number>(Number(searchParams.get('minSal')) || 0);
  const [experience, setExperience] = useState<string[]>(searchParams.getAll('exp'));

  // Expand/Collapse States for Sidebar
  const [expandedSections, setExpandedSections] = useState({
    type: true,
    arrangement: true,
    salary: true,
    experience: true,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    // Update URL
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (location) params.set('loc', location);
    if (country) params.set('country', country);
    if (remote) params.set('remote', 'true');
    if (salaryMin) params.set('minSal', salaryMin.toString());
    jobTypes.forEach(t => params.append('type', t));
    experience.forEach(e => params.append('exp', e));
    
    setSearchParams(params);
    setIsMobileFiltersOpen(false);
    
    // Execute Search
    setIsSearching(true);
    setHasSearched(true);
    try {
      const filters: SearchFilters = {
        query,
        location,
        country,
        remote,
        jobTypes,
        salaryMin,
        experience,
        datePosted: 'any'
      };
      const jobs = await executeJobSearch(filters);
      setResults(jobs);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const applyProfilePreferences = async () => {
    if (!currentUser) {
      navigate('/auth');
      return;
    }
    const profile = await getUserProfile(currentUser.uid);
    if (profile) {
      if (profile.target_roles?.length) setQuery(profile.target_roles[0]);
      if (profile.location?.country) setCountry(profile.location.country);
      if (profile.location?.city) setLocation(profile.location.city);
      if (profile.work_preference?.toLowerCase().includes('remote')) setRemote(true);
      if (profile.salary?.minimum) setSalaryMin(profile.salary.minimum);
      // Trigger search
      setTimeout(() => handleSearch(), 100);
    }
  };

  // Run search on mount if params exist
  useEffect(() => {
    if (searchParams.get('q') || searchParams.get('type') || searchParams.get('loc')) {
      handleSearch();
    }
  }, []);

  const handleCheckboxChange = (setter: React.Dispatch<React.SetStateAction<string[]>>, list: string[], value: string) => {
    if (list.includes(value)) {
      setter(list.filter(item => item !== value));
    } else {
      setter([...list, value]);
    }
  };

  return (
    <div className="bg-[#0a0a0a] text-white min-h-screen flex flex-col font-sans">
      
      {/* Header NavBar (Simplified version of App.tsx navbar) */}
      <header className="sticky top-0 z-40 flex items-center justify-between px-6 py-4 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/10">
        <Link to="/" className="flex items-center gap-2 text-xl font-medium tracking-tight text-white hover:text-white/80 transition-colors">
          <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain rounded-xl overflow-hidden shrink-0" />
          <span className="hidden sm:inline">JobsForHire<span className="text-[#4642ff]">*</span></span>
        </Link>
        
        <nav className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-8 text-sm text-white/60">
          <Link to={currentUser ? "/resume" : "/auth"} className="hover:text-white transition-colors">Resume</Link>
          <Link to={currentUser ? "/profile" : "/auth"} className="hover:text-white transition-colors">Profile</Link>
          <Link to={currentUser ? "/jobs" : "/auth"} className="text-white transition-colors font-medium">Job Search</Link>
        </nav>
        
        <div>
          {currentUser ? (
            <Link to="/profile" className="text-sm font-medium hover:text-[#4642ff] transition-colors flex items-center gap-2">
              My Profile
            </Link>
          ) : (
            <Link to="/auth" className="rounded-full bg-white text-[#16161d] px-5 py-2 text-sm font-medium hover:bg-[#4642ff] hover:text-white transition-colors">
              Log In
            </Link>
          )}
        </div>
      </header>

      <div className="flex flex-col md:flex-row flex-1 w-full">
        
        {/* Mobile Filter Toggle */}
        <div className="md:hidden fixed bottom-6 right-6 z-50">
          <button 
            onClick={() => setIsMobileFiltersOpen(true)}
            className="p-4 bg-[#4642ff] rounded-full shadow-lg shadow-[#4642ff]/20 text-white flex items-center justify-center"
          >
            <Filter className="w-6 h-6" />
          </button>
        </div>

        {/* Filters Sidebar */}
        <aside className={`
          fixed inset-y-0 left-0 z-50 w-80 bg-[#121212] border-r border-white/10 transform transition-transform duration-300 overflow-y-auto
          md:relative md:translate-x-0 md:shrink-0
          ${isMobileFiltersOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-8 md:hidden">
              <h2 className="text-xl font-medium">Filters</h2>
              <button onClick={() => setIsMobileFiltersOpen(false)} className="p-2 text-white/60 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <button 
              onClick={applyProfilePreferences}
              className="w-full mb-8 py-2.5 px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-medium text-[#56c2fc] hover:text-white transition-colors flex items-center justify-center gap-2"
            >
              Use my profile preferences
            </button>

            {/* Job Type */}
            <div className="mb-6">
              <button onClick={() => toggleSection('type')} className="flex items-center justify-between w-full text-left mb-3">
                <span className="font-medium flex items-center gap-2"><Briefcase className="w-4 h-4 text-white/50" /> Job Type</span>
                {expandedSections.type ? <ChevronUp className="w-4 h-4 text-white/50" /> : <ChevronDown className="w-4 h-4 text-white/50" />}
              </button>
              {expandedSections.type && (
                <div className="space-y-2 pl-6">
                  {['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance'].map(type => (
                    <label key={type} className="flex items-center gap-3 text-sm text-white/70 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        checked={jobTypes.includes(type)}
                        onChange={() => handleCheckboxChange(setJobTypes, jobTypes, type)}
                        className="w-4 h-4 rounded border-white/20 bg-transparent text-[#4642ff] focus:ring-[#4642ff] focus:ring-offset-0 cursor-pointer"
                      />
                      <span className="group-hover:text-white transition-colors">{type}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Work Arrangement */}
            <div className="mb-6">
              <button onClick={() => toggleSection('arrangement')} className="flex items-center justify-between w-full text-left mb-3">
                <span className="font-medium flex items-center gap-2"><MapPin className="w-4 h-4 text-white/50" /> Arrangement</span>
                {expandedSections.arrangement ? <ChevronUp className="w-4 h-4 text-white/50" /> : <ChevronDown className="w-4 h-4 text-white/50" />}
              </button>
              {expandedSections.arrangement && (
                <div className="space-y-2 pl-6">
                  <label className="flex items-center gap-3 text-sm text-white/70 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={remote}
                      onChange={(e) => setRemote(e.target.checked)}
                      className="w-4 h-4 rounded border-white/20 bg-transparent text-[#4642ff] focus:ring-[#4642ff] focus:ring-offset-0 cursor-pointer"
                    />
                    <span className="group-hover:text-white transition-colors">Remote Only</span>
                  </label>
                </div>
              )}
            </div>

            {/* Experience */}
            <div className="mb-6">
              <button onClick={() => toggleSection('experience')} className="flex items-center justify-between w-full text-left mb-3">
                <span className="font-medium flex items-center gap-2"><Clock className="w-4 h-4 text-white/50" /> Experience Level</span>
                {expandedSections.experience ? <ChevronUp className="w-4 h-4 text-white/50" /> : <ChevronDown className="w-4 h-4 text-white/50" />}
              </button>
              {expandedSections.experience && (
                <div className="space-y-2 pl-6">
                  {['Entry level', 'Junior', 'Mid-level', 'Senior', 'Lead'].map(exp => (
                    <label key={exp} className="flex items-center gap-3 text-sm text-white/70 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        checked={experience.includes(exp)}
                        onChange={() => handleCheckboxChange(setExperience, experience, exp)}
                        className="w-4 h-4 rounded border-white/20 bg-transparent text-[#4642ff] focus:ring-[#4642ff] focus:ring-offset-0 cursor-pointer"
                      />
                      <span className="group-hover:text-white transition-colors">{exp}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Salary */}
            <div className="mb-8">
              <button onClick={() => toggleSection('salary')} className="flex items-center justify-between w-full text-left mb-3">
                <span className="font-medium flex items-center gap-2"><DollarSign className="w-4 h-4 text-white/50" /> Salary (Minimum)</span>
                {expandedSections.salary ? <ChevronUp className="w-4 h-4 text-white/50" /> : <ChevronDown className="w-4 h-4 text-white/50" />}
              </button>
              {expandedSections.salary && (
                <div className="pl-6 pt-2">
                  <input 
                    type="range" 
                    min="0" 
                    max="200000" 
                    step="5000"
                    value={salaryMin}
                    onChange={(e) => setSalaryMin(Number(e.target.value))}
                    className="w-full accent-[#4642ff] h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="mt-2 text-sm font-medium text-[#56c2fc]">
                    {salaryMin > 0 ? `$${salaryMin.toLocaleString()}+` : 'Any salary'}
                  </div>
                </div>
              )}
            </div>

            <button 
              onClick={handleSearch}
              className="w-full py-3 bg-[#4642ff] hover:bg-[#5b4fff] rounded-xl text-sm font-medium transition-colors"
            >
              Apply Filters
            </button>

          </div>
        </aside>

        {/* Main Search Area */}
        <main className="flex-1 p-6 md:p-8 lg:p-12 overflow-y-auto">
          
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-medium mb-8">Find your next opportunity</h1>
            
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="bg-white/5 border border-white/10 rounded-2xl p-2 mb-12 flex flex-col md:flex-row gap-2">
              <div className="flex-1 flex items-center px-4 py-2 border-b md:border-b-0 md:border-r border-white/10">
                <Search className="w-5 h-5 text-white/40 mr-3" />
                <input 
                  type="text" 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Job title, keywords, or company" 
                  className="w-full bg-transparent border-none text-white focus:outline-none focus:ring-0 placeholder-white/40"
                />
              </div>
              <div className="flex-1 flex items-center px-4 py-2 border-b md:border-b-0 md:border-r border-white/10">
                <MapPin className="w-5 h-5 text-white/40 mr-3" />
                <input 
                  type="text" 
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="City, state, or zip" 
                  className="w-full bg-transparent border-none text-white focus:outline-none focus:ring-0 placeholder-white/40 disabled:opacity-50"
                  disabled={remote}
                />
              </div>
              <button 
                type="submit"
                disabled={isSearching}
                className="px-8 py-3 md:py-4 bg-[#4642ff] hover:bg-[#5b4fff] text-white rounded-xl font-medium transition-colors flex items-center justify-center min-w-[120px] disabled:opacity-50"
              >
                {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Search'}
              </button>
            </form>

            {/* Results Header */}
            {hasSearched && (
              <div className="flex items-center justify-between mb-6 pb-6 border-b border-white/10">
                <h3 className="text-xl font-medium">
                  {results.length} jobs found
                </h3>
                <div className="flex items-center gap-2 text-sm text-white/60">
                  <span>Sort by:</span>
                  <select className="bg-transparent border-none focus:ring-0 cursor-pointer font-medium text-white p-0">
                    <option className="bg-[#121212]">Relevance</option>
                    <option className="bg-[#121212]">Date Posted</option>
                  </select>
                </div>
              </div>
            )}

            {/* Results Grid */}
            {isSearching ? (
              <div className="grid grid-cols-1 gap-6">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-[#1a1a1a] border border-white/5 rounded-2xl p-6 h-[200px]">
                    <div className="w-1/4 h-3 bg-white/10 rounded mb-4"></div>
                    <div className="w-1/2 h-5 bg-white/20 rounded mb-8"></div>
                    <div className="w-1/3 h-3 bg-white/10 rounded mb-4"></div>
                    <div className="w-full h-12 bg-white/5 rounded mt-4"></div>
                  </div>
                ))}
              </div>
            ) : hasSearched && results.length === 0 ? (
              <div className="text-center py-20 bg-white/5 border border-white/10 rounded-2xl">
                <Search className="w-12 h-12 text-white/20 mx-auto mb-4" />
                <h3 className="text-xl font-medium mb-2">No jobs matched all your filters</h3>
                <p className="text-white/60 mb-6">Try broadening your search or removing some restrictive filters.</p>
                <button 
                  onClick={() => { setRemote(false); setJobTypes([]); setExperience([]); setSalaryMin(0); setTimeout(handleSearch, 100); }}
                  className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-full font-medium transition-colors"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {results.map((job, idx) => (
                  <JobCard key={idx} job={job} hideMatchScore={true} />
                ))}
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}
