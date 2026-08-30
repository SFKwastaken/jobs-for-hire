import { Shader, Swirl, ChromaFlow, FlutedGlass, FilmGrain } from 'shaders/react';
import { ArrowRight, FileText, Bot, Search, CheckCircle2, AlertTriangle, Globe, Briefcase, X, Paperclip, Menu, RefreshCw } from 'lucide-react';
import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import type { ProcessedJob } from './utils/job-engine/types';
import { runJobDiscoveryPipeline } from './utils/job-engine/pipeline';
import { extractTextFromPDF } from './utils/pdfParser';
import { OnboardingFlow } from './components/Onboarding/OnboardingFlow';
import JobCard from './components/JobSearch/JobCard';

const JOB_ROTATIONS = [
  {
    company: "Acme Corp",
    title: "Frontend Developer",
    location: "Remote",
    type: "Full-time",
    salary: "$12–15",
    salarySuffix: "/hr",
    tags: ["React", "TypeScript", "Tailwind", "Next.js"],
    matchScore: 94,
    matchChecks: ["Remote", "Nigeria eligible", "Salary requirement"],
    matchWarnings: ["Requires 2 years experience"],
    source: "Indeed",
    posted: "Posted 2 days ago"
  },
  {
    company: "Nova Studios",
    title: "Video Editor",
    location: "Remote",
    type: "Contract",
    salary: "$30–45",
    salarySuffix: "/hr",
    tags: ["Premiere Pro", "After Effects", "Color Grading", "DaVinci"],
    matchScore: 88,
    matchChecks: ["Remote", "Hourly rate met", "Portfolio matches"],
    matchWarnings: ["Requires heavy motion graphics"],
    source: "Upwork",
    posted: "Posted 5 hrs ago"
  },
  {
    company: "Fintech Solutions",
    title: "Senior Data Scientist",
    location: "Hybrid",
    type: "Full-time",
    salary: "$140k",
    salarySuffix: "/yr",
    tags: ["Python", "Machine Learning", "SQL", "AWS"],
    matchScore: 76,
    matchChecks: ["Python expert", "SQL proficient"],
    matchWarnings: ["Missing financial background", "Weekly office visit"],
    source: "LinkedIn",
    posted: "Posted 1 day ago"
  },
  {
    company: "Oasis Health",
    title: "Registered Nurse",
    location: "On-site",
    type: "Full-time",
    salary: "$85k",
    salarySuffix: "/yr",
    tags: ["BLS Certified", "Pediatrics", "Patient Care", "EMR"],
    matchScore: 99,
    matchChecks: ["License active", "Location match", "Experience level"],
    matchWarnings: [],
    source: "Glassdoor",
    posted: "Posted 3 days ago"
  }
];

const SEARCH_ROTATIONS = [
  {
    prompt: "“Find me short-form video editing jobs that pay at least $10/hour, are fully remote, accept people from Nigeria, and were posted within the last week.”",
    filters: [
      { label: "Job Type", value: "Video Editor" },
      { label: "Content", value: "Short-form" },
      { label: "Location", value: "Remote", icon: true },
      { label: "Eligibility", value: "Nigeria accepted", icon: true },
      { label: "Pay", value: "≥ $10/hour", highlight: true },
      { label: "Posted", value: "Last 7 days" }
    ]
  },
  {
    prompt: "“I'm looking for a senior frontend developer role using React and Next.js, paying over $120k a year, somewhere in New York or hybrid.”",
    filters: [
      { label: "Role", value: "Frontend Dev" },
      { label: "Tech Stack", value: "React, Next.js", icon: true },
      { label: "Location", value: "New York (Hybrid)", icon: true },
      { label: "Pay", value: "> $120k/yr", highlight: true },
      { label: "Level", value: "Senior" },
      { label: "Job Type", value: "Full-time" }
    ]
  },
  {
    prompt: "“Show me freelance graphic design gigs focused on brand identity, paying fixed rates above $500. Show only verified clients.”",
    filters: [
      { label: "Job Type", value: "Freelance" },
      { label: "Niche", value: "Brand Identity" },
      { label: "Pay Type", value: "Fixed Rate" },
      { label: "Budget", value: "≥ $500", highlight: true },
      { label: "Client Info", value: "Verified Only", icon: true },
      { label: "Role", value: "Graphic Designer" }
    ]
  }
];



export default function App() {
  const { currentUser, logout } = useAuth();
  
  // -- Personalization State --
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [personalizedJobs, setPersonalizedJobs] = useState<ProcessedJob[]>([]);
  const [isFetchingFeed, setIsFetchingFeed] = useState(false);

  // Load Profile on Auth
  useEffect(() => {
    async function loadProfile() {
      if (!currentUser) {
        setUserProfile(null);
        setIsLoadingProfile(false);
        return;
      }
      try {
        const { getUserProfile } = await import('./lib/profile');
        const profile = await getUserProfile(currentUser.uid);
        setUserProfile(profile);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoadingProfile(false);
      }
    }
    loadProfile();
  }, [currentUser]);

  // Fetch Personalized Jobs
  useEffect(() => {
    async function fetchPersonalizedJobs() {
      if (!userProfile?.onboarding_completed) return;
      setIsFetchingFeed(true);
      try {
        const { discoverJobsForProfile } = await import('./utils/adzuna');
        const { deduplicateJobs, rankJobsForProfile } = await import('./utils/ranking');
        
        const rawJobs = await discoverJobsForProfile(userProfile);
        const uniqueJobs = deduplicateJobs(rawJobs);
        const rankedJobs = rankJobsForProfile(uniqueJobs, userProfile);
        
        setPersonalizedJobs(rankedJobs);
      } catch (e) {
        console.error("Failed to fetch personalized feed", e);
      } finally {
        setIsFetchingFeed(false);
      }
    }
    fetchPersonalizedJobs();
  }, [userProfile]);


  const feedSource = personalizedJobs.length > 0 ? personalizedJobs : JOB_ROTATIONS;
  const [jobIndex, setJobIndex] = useState(0);
  const [searchIndex, setSearchIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [progressMsg, setProgressMsg] = useState("");
  const [refreshMsg, setRefreshMsg] = useState("");
  const [searchResults, setSearchResults] = useState<ProcessedJob[]>([]);
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.type !== "application/pdf") {
      alert("Only PDF files are supported currently.");
      return;
    }
    
    setResumeFile(file);
    try {
      const text = await extractTextFromPDF(file, (msg) => {
        setIsSearching(true);
        setProgressMsg(msg);
      });
      
      if (!text || text.trim().length < 50) {
        throw new Error("Could not extract enough text from this PDF. It might be a scanned image or formatting we can't read. Please try a different text-based PDF.");
      }
      
      setResumeText(text);
      handleSearch(text, searchQuery.trim() ? searchQuery : "Find remote jobs that match my resume profile");
      if (!searchQuery.trim()) {
        setSearchQuery("Find remote jobs that match my resume profile");
      }
    } catch (err: any) {
      alert(err.message);
      setResumeFile(null);
      setResumeText("");
      setIsSearching(false);
    }
  };

  const handleSearch = async (overrideResumeText?: string, overrideSearchQuery?: string) => {
    const activeQuery = overrideSearchQuery || searchQuery;
    if (!activeQuery.trim()) return;
    
    const now = Date.now();
    const today = new Date().toDateString();
    const lastSearch = localStorage.getItem('lastSmartSearch');
    const searchLimitsStr = localStorage.getItem('smartSearchLimits');
    
    let searchLimits = searchLimitsStr ? JSON.parse(searchLimitsStr) : { date: today, count: 0 };
    
    // Reset count if it's a new day
    if (searchLimits.date !== today) {
      searchLimits = { date: today, count: 0 };
    }
    
    // Check daily limit (max 6)
    if (searchLimits.count >= 6) {
      alert("You have reached your daily limit of 6 AI Smart Searches. Please try again tomorrow!");
      return;
    }
    
    const cooldown = 5 * 60 * 1000; // 5 minutes
    
    if (lastSearch) {
      const timeSince = now - parseInt(lastSearch, 10);
      if (timeSince < cooldown) {
        const minutesLeft = Math.ceil((cooldown - timeSince) / 60000);
        alert(`Please wait ${minutesLeft} minute${minutesLeft > 1 ? 's' : ''} before running another AI search.`);
        return;
      }
    }
    
    // Update tracking
    searchLimits.count += 1;
    localStorage.setItem('smartSearchLimits', JSON.stringify(searchLimits));
    localStorage.setItem('lastSmartSearch', now.toString());
    
    setIsSearching(true);
    setProgressMsg("Starting job search...");
    
    try {
      const activeResumeText = overrideResumeText !== undefined ? overrideResumeText : resumeText;
      const finalQuery = activeResumeText 
        ? `${activeQuery}\n\n--- RESUME/CV CONTEXT ---\n${activeResumeText}` 
        : activeQuery;
        
      const results = await runJobDiscoveryPipeline(finalQuery, (msg) => {
        setProgressMsg(msg);
      });
      
      setSearchResults(results);
      setIsSearching(false);
      setIsModalOpen(true);
    } catch (e: any) {
      console.error(e);
      setProgressMsg("Search failed: " + e.message);
      setTimeout(() => setIsSearching(false), 3000);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setResumeFile(null);
    setResumeText("");
  };

  const handleRefreshFeed = async () => {
    if (!userProfile?.onboarding_completed) return;
    
    const now = Date.now();
    const lastRefresh = localStorage.getItem('lastFeedRefresh_v2');
    const cooldown = 5 * 60 * 1000; // 5 minutes
    
    if (lastRefresh) {
      const timePassed = now - parseInt(lastRefresh, 10);
      if (timePassed < cooldown) {
        const minsLeft = Math.ceil((cooldown - timePassed) / 60000);
        setRefreshMsg(`Available in ${minsLeft} min`);
        setTimeout(() => setRefreshMsg(""), 3000);
        return;
      }
    }

    setIsFetchingFeed(true);
    setRefreshMsg("Refreshing...");
    try {
      const { discoverJobsForProfile } = await import('./utils/adzuna');
      const { deduplicateJobs, rankJobsForProfile } = await import('./utils/ranking');
      
      const rawJobs = await discoverJobsForProfile(userProfile);
      const uniqueJobs = deduplicateJobs(rawJobs);
      const rankedJobs = rankJobsForProfile(uniqueJobs, userProfile);
      
      setPersonalizedJobs(rankedJobs);
      localStorage.setItem('lastFeedRefresh_v2', now.toString());
      setRefreshMsg("Feed updated!");
    } catch (e) {
      console.error("Failed to refresh feed", e);
      setRefreshMsg("Failed to update");
    } finally {
      setIsFetchingFeed(false);
      setTimeout(() => setRefreshMsg(""), 3000);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setSearchIndex((prev) => (prev + 1) % SEARCH_ROTATIONS.length);
    }, 6000); // 6 seconds to allow reading the prompt
    return () => clearInterval(interval);
  }, []);

  const currentSearch = SEARCH_ROTATIONS[searchIndex];

  useEffect(() => {
    const interval = setInterval(() => {
      setJobIndex((prev) => (prev + 1) % feedSource.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [feedSource]);

  const currentJob = feedSource[jobIndex % feedSource.length] || feedSource[0];

  // Global scroll for the page
  const { scrollY } = useScroll();
  
  // Parallax for the WebGPU shader background (moves down slightly as we scroll down)
  const bgY = useTransform(scrollY, [0, 1000], [0, 300]);
  
  // Hero content fades and moves up faster
  const heroContentY = useTransform(scrollY, [0, 600], [0, -200]);
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);

  // Job Universe
  const universeRef = useRef<HTMLElement>(null);
  const { scrollYProgress: universeProgress } = useScroll({ target: universeRef, offset: ["start end", "end start"] });
  const universeNumberY = useTransform(universeProgress, [0, 1], [50, -50]);

  // Resume Match Section
  const resumeRef = useRef<HTMLElement>(null);
  const { scrollYProgress: resumeProgress } = useScroll({ target: resumeRef, offset: ["start end", "end start"] });
  const resumeTextY = useTransform(resumeProgress, [0, 1], [50, -50]);
  const resumeMockupY = useTransform(resumeProgress, [0, 1], [150, -150]); // Faster

  // Smart Search Section
  const searchRef = useRef<HTMLElement>(null);
  const { scrollYProgress: searchProgress } = useScroll({ target: searchRef, offset: ["start end", "end start"] });
  const searchHeadingY = useTransform(searchProgress, [0, 1], [50, -50]);
  const userBubbleY = useTransform(searchProgress, [0, 1], [100, -100]);
  const sysBubbleY = useTransform(searchProgress, [0, 1], [200, -200]); // Much faster

  // Job Card Showcase
  const cardRef = useRef<HTMLElement>(null);
  const { scrollYProgress: cardProgress } = useScroll({ target: cardRef, offset: ["start end", "end start"] });
  const cardHeadingY = useTransform(cardProgress, [0, 1], [50, -50]);
  const cardY = useTransform(cardProgress, [0, 1], [150, -150]);
  const cardRotate = useTransform(cardProgress, [0, 0.5, 1], [-8, 0, 8]);
  // Spring physics for buttery smooth rotation
  const smoothCardRotate = useSpring(cardRotate, { stiffness: 100, damping: 30, restDelta: 0.001 });

  if (isLoadingProfile) {
    return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">Loading your profile...</div>;
  }

  if (currentUser && !userProfile?.onboarding_completed) {
    return <OnboardingFlow onComplete={(profile) => setUserProfile(profile)} />;
  }

  return (
    <div className="bg-[#0a0a0a] text-white font-sans antialiased selection:bg-[#4642ff] selection:text-white overflow-hidden">
      
      {/* 1. HERO SECTION */}
      <main className="relative isolate flex flex-col min-h-screen overflow-hidden">
        {/* Shader wrapper with parallax */}
        <motion.div className="absolute inset-0 z-0" aria-hidden="true" style={{ y: bgY }}>
          <Shader style={{ width: '100%', height: '100%', display: 'block' }}>
            <Swirl colorA="#0a0a0a" colorB="#171720" detail={1.7} />
            <ChromaFlow baseColor="#0a0a0a" downColor="#4642ff" leftColor="#56c2fc" rightColor="#5b4fff" upColor="#7f66ff" momentum={13} radius={3.5} />
            <FlutedGlass aberration={0.61} angle={31} frequency={8} highlight={0.15} highlightSoftness={0} lightAngle={-90} refraction={4} shape="rounded" softness={1} speed={0.15} />
            <FilmGrain strength={0.05} />
          </Shader>
        </motion.div>

        {/* Header */}
        <header className="relative z-20 flex items-center justify-between px-4 py-3 mx-4 mt-6 sm:mx-12 sm:px-6 sm:py-4 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl reveal" style={{ "--reveal-delay": "0s" } as React.CSSProperties}>
          <a href="#" className="flex items-center gap-2 text-xl font-medium tracking-tight text-white shrink-0">
            <img src="/logo.png" alt="Logo" className="w-9 h-9 object-contain rounded-xl overflow-hidden shrink-0" />
            <span>JobsForHire<span className="text-[#4642ff]">*</span></span>
          </a>
          <nav className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-8 text-sm text-white/60">
            <Link to={currentUser ? "/resume" : "/auth"} className="hover:text-white transition-colors">Resume</Link>
            <Link to={currentUser ? "/profile" : "/auth"} className="hover:text-white transition-colors">Profile</Link>
            <Link to={currentUser ? "/jobs" : "/auth"} className="hover:text-white transition-colors">Job Search</Link>
          </nav>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex">
              {currentUser ? (
                <div className="flex items-center gap-3 sm:gap-4 shrink-0 min-w-0">
                  <span className="hidden sm:block text-sm text-white/70 truncate max-w-[130px] md:max-w-[200px]" title={userProfile?.username || currentUser.displayName || currentUser.email || ""}>
                    {userProfile?.username || currentUser.displayName || currentUser.email}
                  </span>
                  <div className="h-5 w-px bg-white/20 hidden sm:block"></div>
                  <button onClick={() => logout()} className="shrink-0 rounded-full bg-transparent border border-white/20 text-white px-4 sm:px-5 py-2 text-sm font-medium hover:bg-white/10 transition-colors">
                    Log Out
                  </button>
                </div>
              ) : (
                <Link to="/auth" className="shrink-0 rounded-full bg-white text-[#16161d] px-5 py-2 text-sm font-medium hover:bg-[#4642ff] hover:text-white transition-colors">
                  Log In
                </Link>
              )}
            </div>
            
            <button 
              className="md:hidden p-2 -mr-2 text-white/70 hover:text-white"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </header>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0a0a0a]/95 backdrop-blur-md md:hidden"
            >
              <div className="absolute top-7 right-6">
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 -mr-2 text-white/70 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <nav className="flex flex-col items-center gap-8 text-xl font-medium">
                <Link to={currentUser ? "/resume" : "/auth"} onClick={() => setIsMobileMenuOpen(false)} className="hover:text-white transition-colors text-white/80">Resume</Link>
                <Link to={currentUser ? "/profile" : "/auth"} onClick={() => setIsMobileMenuOpen(false)} className="hover:text-white transition-colors text-white/80">Profile</Link>
                <Link to={currentUser ? "/jobs" : "/auth"} onClick={() => setIsMobileMenuOpen(false)} className="hover:text-white transition-colors text-white/80">Job Search</Link>
                
                <div className="h-px w-12 bg-white/20 my-2"></div>
                
                {currentUser ? (
                  <button 
                    onClick={() => { logout(); setIsMobileMenuOpen(false); }} 
                    className="text-white hover:text-white/80 transition-colors"
                  >
                    Log Out
                  </button>
                ) : (
                  <Link 
                    to="/auth" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-[#4642ff] hover:text-[#5b4fff] transition-colors"
                  >
                    Log In
                  </Link>
                )}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Central Search with parallax */}
        <motion.section 
          className="relative z-10 flex flex-col items-center justify-center flex-1 px-6 reveal" 
          style={{ "--reveal-delay": "0.15s", y: heroContentY, opacity: heroOpacity } as any}
        >
          <div className="w-full max-w-2xl bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex flex-col gap-4">
            <h2 className="text-white/90 font-medium text-lg">Upload your resume or tell us what you're looking for...</h2>
            
            {!isSearching ? (
              <div className="relative">
                <textarea 
                  className="w-full h-32 bg-transparent resize-none outline-none text-white text-xl placeholder:text-white/30"
                  placeholder='"Find remote frontend jobs paying $10-$15/hr that accept applicants from Nigeria..."'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                ></textarea>
                
                <div className="flex items-center justify-between mt-2">
                  <div>
                    <input 
                      type="file" 
                      accept=".pdf" 
                      ref={fileInputRef} 
                      className="hidden" 
                      onChange={handleFileUpload} 
                    />
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="rounded-full bg-white/10 text-white/70 px-4 py-2 text-sm font-medium hover:bg-white/20 hover:text-white transition-colors flex items-center gap-2"
                    >
                      <Paperclip className="w-4 h-4" />
                      Attach Resume
                    </button>
                    {resumeFile && (
                      <div className="flex items-center gap-2 mt-2 bg-[#4642ff]/20 text-[#56c2fc] px-3 py-1.5 rounded-full text-xs font-medium border border-[#4642ff]/30">
                        <FileText className="w-3 h-3" />
                        {resumeFile.name}
                        <button onClick={() => { setResumeFile(null); setResumeText(""); if (fileInputRef.current) fileInputRef.current.value = ""; }} className="ml-1 hover:text-white">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                  <button onClick={() => handleSearch()} disabled={!searchQuery.trim()} className="rounded-full bg-white text-[#16161d] px-5 py-2.5 flex items-center gap-2 hover:bg-[#4642ff] hover:text-white transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed">
                    Find My Jobs <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-40 gap-4 py-4">
                 <div className="text-[#56c2fc] text-xl font-medium animate-pulse">Finding your jobs...</div>
                 <p className="text-white/80 text-sm text-center">{progressMsg}</p>
                 <button onClick={() => setIsSearching(false)} className="mt-2 text-sm text-white/40 hover:text-white transition-colors">Cancel Search</button>
              </div>
            )}
          </div>
        </motion.section>

        {/* Headline row with parallax */}
        <motion.section 
          className="relative z-10 mt-auto flex items-end justify-between gap-10 px-6 pb-10 sm:px-12 sm:pb-14"
          style={{ y: heroContentY, opacity: heroOpacity }}
        >
          <div className="max-w-3xl">
            <h1 className="reveal text-[clamp(3rem,7.5vw,6rem)] leading-[0.95] font-medium tracking-[-0.03em] text-balance text-white" style={{ "--reveal-delay": "0.25s" } as React.CSSProperties}>
              Find jobs that <em className="font-serif font-normal italic text-[#56c2fc]">actually fit you.</em>
            </h1>
          </div>
        </motion.section>
        
        {/* Glass dark blur fade to next section */}
        <div 
          className="absolute bottom-0 left-0 w-full h-48 bg-gradient-to-t from-[#0a0a0a] to-transparent pointer-events-none z-10 backdrop-blur-md"
          style={{ maskImage: 'linear-gradient(to top, black 10%, transparent)', WebkitMaskImage: 'linear-gradient(to top, black 10%, transparent)' }}
        ></div>
      </main>

      {currentUser && userProfile?.onboarding_completed && (
        <section className="py-24 px-6 sm:px-12 max-w-7xl mx-auto bg-[#0a0a0a] relative z-20">
          <div className="mb-12 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div>
              <h2 className="text-4xl font-semibold mb-2 tracking-tight">Your Personalized Feed</h2>
              <p className="text-white/60 text-lg flex items-center gap-2">
                {isFetchingFeed ? <span className="text-[#56c2fc] animate-pulse">Updating your personalized feed...</span> : 'Based on your onboarding preferences.'}
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              {refreshMsg && (
                <span className="text-sm text-[#56c2fc] font-medium animate-pulse">{refreshMsg}</span>
              )}
              <button 
                onClick={handleRefreshFeed}
                disabled={isFetchingFeed}
                className="flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-sm font-medium transition-all text-white/80 hover:text-white disabled:opacity-50 active:scale-95"
              >
                <RefreshCw className={`w-4 h-4 ${isFetchingFeed ? 'animate-spin' : ''}`} />
                Refresh Feed
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {personalizedJobs.length > 0 ? personalizedJobs.map((job, idx) => (
              <JobCard key={idx} job={job} />
            )) : (
              !isFetchingFeed && (
                <div className="col-span-full py-12 text-center border border-white/10 rounded-2xl bg-white/5">
                  <p className="text-white/60 text-lg">No matches found yet. Try broadening your preferences.</p>
                </div>
              )
            )}
          </div>
        </section>
      )}

      {(!currentUser || !userProfile?.onboarding_completed) && (
        <>
          {/* 2. JOB UNIVERSE */}
          <section ref={universeRef} className="py-24 border-b border-white/5 bg-[#0a0a0a] relative overflow-hidden flex flex-col items-center justify-center z-20">
        <motion.div className="text-center mb-10" style={{ y: universeNumberY }}>
          <h2 className="text-5xl font-medium tracking-tight mb-2">23,481,203</h2>
          <p className="text-white/50 text-sm uppercase tracking-widest">Jobs Indexed in Real-Time</p>
        </motion.div>
        
        <div className="flex flex-wrap justify-center items-center gap-10 px-6 opacity-60 max-w-5xl relative z-10">
           <span className="text-xl font-bold tracking-tight">Indeed</span>
           <span className="text-xl font-semibold tracking-tight">LinkedIn</span>
           <span className="text-xl font-medium tracking-tighter">Glassdoor</span>
           <span className="text-xl font-bold italic tracking-tighter">Upwork</span>
           <span className="text-xl font-medium tracking-widest">Jobberman</span>
           <span className="text-xl font-bold tracking-tight">Remote.co</span>
           <span className="text-xl font-serif italic">WeWorkRemotely</span>
        </div>
      </section>

      {/* 3. RESUME MATCH SYSTEM */}
      <section ref={resumeRef} className="py-32 px-6 sm:px-12 max-w-7xl mx-auto border-b border-white/5 bg-[#0a0a0a] relative z-20">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <motion.div style={{ y: resumeTextY }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#4642ff]/10 text-[#56c2fc] text-sm font-medium mb-6">
              <Bot className="w-4 h-4" /> The Resume Match System
            </div>
            <h2 className="text-4xl sm:text-5xl font-medium tracking-tight mb-6 text-balance">
              We read your resume like a <em className="font-serif italic text-[#4642ff]">human</em> recruiter.
            </h2>
            <p className="text-xl text-white/60 mb-8 text-balance">
              Stop relying on keyword bingo. Upload your PDF and JobsForHire extracts your true skills, experience level, and preferences to build a holistic Job Profile.
            </p>
            <ul className="space-y-4">
              {['Extracts deeply nested skills (React, Node.js)', 'Understands your experience level (Junior vs Senior)', 'You can edit anything the AI extracts'].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-white/80">
                  <CheckCircle2 className="w-5 h-5 text-[#56c2fc]" />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
          
          <motion.div className="relative" style={{ y: resumeMockupY }}>
            <div className="bg-[#121217] border border-white/10 rounded-2xl p-6 relative z-10 shadow-2xl">
              <div className="flex items-center gap-4 border-b border-white/10 pb-4 mb-4">
                <div className="w-12 h-12 rounded-lg bg-[#4642ff]/20 flex items-center justify-center">
                  <FileText className="text-[#56c2fc]" />
                </div>
                <div>
                  <div className="font-medium">john_doe_resume.pdf</div>
                  <div className="text-xs text-white/50">Processing... 100%</div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="text-xs uppercase tracking-wider text-white/50 mb-2">Extracted Skills</div>
                  <div className="flex flex-wrap gap-2">
                    {['React', 'JavaScript', 'TypeScript', 'Tailwind', 'Node.js'].map(skill => (
                      <span key={skill} className="px-2 py-1 rounded bg-white/5 text-sm">{skill}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider text-white/50 mb-2">Preferences Detected</div>
                  <div className="flex gap-4">
                    <span className="flex items-center gap-1 text-sm"><Globe className="w-3 h-3 text-[#56c2fc]"/> Remote</span>
                    <span className="flex items-center gap-1 text-sm"><Briefcase className="w-3 h-3 text-[#56c2fc]"/> Full-time</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Background decorative glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-[#4642ff]/20 blur-[100px] -z-10 rounded-full pointer-events-none"></div>
          </motion.div>
        </div>
      </section>

      {/* 4. SMART SEARCH */}
      <section ref={searchRef} className="py-32 px-6 sm:px-12 mx-auto max-w-6xl border-b border-white/5 bg-[#0a0a0a] relative z-20">
        <div className="relative w-full rounded-[2.5rem] group">
          <div className="relative bg-[#111111] border border-white/10 rounded-[2.5rem] p-8 sm:p-16 overflow-hidden">
            <motion.div className="max-w-2xl mb-16 relative z-10" style={{ y: searchHeadingY }}>
              <h2 className="text-4xl sm:text-6xl font-semibold tracking-tight mb-6">
                Search like you <br/><em className="font-serif italic text-transparent bg-clip-text bg-gradient-to-r from-[#56c2fc] to-white">speak with us.</em>
              </h2>
              <p className="text-xl text-white/50 leading-relaxed">
                Don't understand boolean search? No problem. Just describe your ideal job naturally, and we build the perfect filters behind the scenes.
              </p>
            </motion.div>

            <div className="flex flex-col gap-8 relative z-10 max-w-4xl mx-auto">
              <AnimatePresence mode="wait">
                <motion.div 
                  key={searchIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4 }}
                  className="flex flex-col gap-8 w-full"
                >
                  {/* User Prompt */}
                  <motion.div className="bg-white text-black p-6 sm:p-8 rounded-3xl rounded-tl-sm self-start max-w-2xl relative" style={{ y: userBubbleY }}>
                    <p className="font-medium text-xl leading-snug">{currentSearch.prompt}</p>
                  </motion.div>
                  
                  {/* System Response */}
                  <motion.div className="bg-[#1a1a1a] border border-white/5 p-6 sm:p-8 rounded-3xl rounded-tr-sm self-end max-w-3xl w-full relative" style={{ y: sysBubbleY }}>
                    <div className="flex items-center gap-3 mb-8 text-[#56c2fc] font-medium tracking-wide">
                      <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-[#56c2fc]/10">
                        <Search className="w-4 h-4" />
                      </div>
                      Translating into Smart Filters...
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {currentSearch.filters.map((filter, i) => (
                        <div key={i} className="bg-white/5 border border-white/5 rounded-2xl p-5">
                          <div className="text-[10px] text-white/40 uppercase tracking-widest font-medium mb-2">{filter.label}</div>
                          <div className={`text-sm font-medium flex items-center gap-2 ${filter.highlight ? 'text-transparent bg-clip-text bg-gradient-to-r from-[#56c2fc] to-white' : 'text-white/80'}`}>
                            {filter.icon && <CheckCircle2 className="w-3 h-3 text-[#56c2fc]" />} {filter.value}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* 5. JOB CARD SHOWCASE */}
      <section ref={cardRef} className="py-32 px-6 sm:px-12 max-w-7xl mx-auto border-b border-white/5 bg-[#0a0a0a] relative z-20">
        <motion.div className="text-center max-w-3xl mx-auto mb-16" style={{ y: cardHeadingY }}>
          {personalizedJobs.length > 0 ? (
            <>
              <h2 className="text-4xl sm:text-5xl font-medium tracking-tight mb-6">
                Recommended for <em className="font-serif italic text-[#4642ff]">You</em>
              </h2>
              <p className="text-xl text-white/60 flex items-center justify-center gap-2">
                {isFetchingFeed ? <span className="text-[#56c2fc] animate-pulse">Updating your personalized feed...</span> : `Based on your profile.`}
              </p>
            </>
          ) : (
            <>
              <h2 className="text-4xl sm:text-5xl font-medium tracking-tight mb-6">
                The <em className="font-serif italic text-[#4642ff]">94%</em> Match
              </h2>
              <p className="text-xl text-white/60">
                JobsForHire is more than Google for jobs. We instantly show you exactly why you should (or shouldn't) apply.
              </p>
            </>
          )}
        </motion.div>

        <div className="flex justify-center relative perspective-[1000px]">
          {/* Job Card Mockup with 3D Parallax Tilt */}
          <motion.div 
            className="relative w-full max-w-xl group"
            style={{ y: cardY, rotateX: smoothCardRotate }}
          >
            <div className="relative bg-[#111111] border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl">
              
              {/* Top Accent Line */}
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#56c2fc]/50 to-transparent"></div>

              <AnimatePresence mode="wait">
                <motion.div 
                  key={jobIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4 }}
                  className="w-full h-full"
                >
                  <div className="p-8 sm:p-10">
                    <div className="flex justify-between items-start mb-8">
                      <div>
                        <div className="flex items-center gap-3 text-white/50 text-sm mb-3 font-medium uppercase tracking-wider">
                          <span className="w-2 h-2 rounded-full bg-white/80 shadow-[0_0_10px_rgba(255,255,255,0.8)]"></span> {currentJob.company}
                        </div>
                        <h3 className="text-3xl font-semibold tracking-tight text-white mb-2">{currentJob.title}</h3>
                        <div className="text-white/40 text-sm flex items-center gap-2">
                          <Globe className="w-4 h-4" /> {currentJob.location} <span className="text-white/20">•</span> <Briefcase className="w-4 h-4" /> {currentJob.type}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-medium text-white">{currentJob.salary}<span className="text-white/40 text-sm">{currentJob.salarySuffix}</span></div>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-10 min-h-[32px]">
                      {(currentJob.tags || []).map(tech => (
                        <span key={tech} className="px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.05] text-xs font-medium text-white/60 hover:text-white/90 hover:bg-white/[0.08] transition-colors">{tech}</span>
                      ))}
                    </div>

                    {/* Match Score - Solid style */}
                    <div className="relative bg-white/5 rounded-2xl p-6 border border-white/5 overflow-hidden group/match">
                      <div className="flex justify-between items-end mb-4 relative z-10">
                        <div className="text-xs uppercase tracking-widest text-white/50 font-medium">Your Match Profile</div>
                        <div className="text-6xl font-serif italic text-[#56c2fc]">{currentJob.matchScore}%</div>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="relative w-full bg-black/40 rounded-full h-1.5 mb-6 overflow-hidden z-10">
                        <motion.div 
                          className="absolute top-0 left-0 h-full bg-[#56c2fc] rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${currentJob.matchScore}%` }}
                          transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                        ></motion.div>
                      </div>
                      
                      <div className="space-y-3 relative z-10 min-h-[120px]">
                        {(currentJob.matchChecks || []).map((check, i) => (
                          <div key={check} className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-3 text-white/70"><CheckCircle2 className="w-4 h-4 text-[#56c2fc]" /> {check}</span>
                          </div>
                        ))}
                        {(currentJob.matchWarnings || []).map((warning, i) => (
                          <div key={warning} className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-3 text-white/40"><AlertTriangle className="w-4 h-4 text-white/30" /> {warning}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white/[0.02] px-6 sm:px-8 py-5 border-t border-white/[0.05] flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0 relative z-10">
                    <div className="text-[10px] sm:text-xs text-white/40 flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2 uppercase tracking-wider font-medium w-full sm:w-auto">
                      <span className="text-[#56c2fc]">Found via {currentJob.source} ↗</span>
                      <span className="text-white/20">•</span>
                      <span>{currentJob.posted}</span>
                    </div>
                    <div className="flex gap-3 sm:gap-4 w-full sm:w-auto">
                      <button className="flex-1 sm:flex-none px-4 sm:px-5 py-2.5 text-sm font-medium text-white/50 hover:text-white transition-colors border border-white/[0.05] sm:border-transparent rounded-full sm:rounded-none">Save</button>
                      <button className="flex-1 sm:flex-none px-6 py-2.5 bg-white text-black rounded-full text-sm font-semibold hover:bg-neutral-200 transition-all">View Job</button>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 6. CTA / FOOTER */}
      <footer className="py-24 sm:py-32 px-6 text-center relative overflow-hidden bg-[#0a0a0a] z-20">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-64 bg-[#4642ff]/10 blur-[120px] -z-10 rounded-full pointer-events-none"></div>
        
        <h2 className="text-4xl sm:text-6xl font-medium tracking-tight mb-8">
          Ready to find jobs that <em className="font-serif italic text-[#4642ff]">fit?</em>
        </h2>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button className="px-8 py-4 rounded-full bg-white text-[#16161d] font-medium hover:bg-[#4642ff] hover:text-white transition-colors shadow-xl">
            Upload Your Resume
          </button>
          <button className="px-8 py-4 rounded-full bg-white/10 text-white font-medium hover:bg-white/20 transition-colors border border-white/10">
            Start Smart Search
          </button>
        </div>
        
        <div className="mt-24 flex items-center justify-center gap-2 text-white/30 text-sm">
          <img src="/logo.png" alt="Logo" className="w-5 h-5 rounded opacity-50 grayscale" />
          <span>© 2026 JobsForHire. All rights reserved.</span>
        </div>
      </footer>

      {/* 7. SEARCH RESULTS MODAL - MOVED OUTSIDE OF CONDITION */}
      </>
      )}

      {/* 7. SEARCH RESULTS MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeModal}></div>
            
            {/* Modal Content */}
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="relative w-full max-w-2xl bg-[#111111] border border-white/10 rounded-3xl overflow-hidden shadow-2xl z-10 flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5 sticky top-0 z-20">
                <div>
                  <h3 className="text-xl font-medium tracking-tight text-white">Top Matching Jobs</h3>
                  <p className="text-sm text-white/50">Found {searchResults.length} results based on your prompt</p>
                </div>
                <button onClick={closeModal} className="p-2 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="overflow-y-auto p-6 space-y-4">
                {searchResults.length === 0 && (
                  <div className="text-center py-12 text-white/50">
                    <p className="text-lg mb-2">No matching jobs found right now.</p>
                    <p className="text-sm">Try broadening your search or modifying your requirements.</p>
                  </div>
                )}
                
                {searchResults.map((job, i) => (
                  <div 
                    key={i} 
                    onClick={() => {
                      if (currentUser) {
                        window.open(job.url || job.raw?.sourceUrl || '#', '_blank');
                      } else {
                        navigate('/auth');
                      }
                    }}
                    className="group relative bg-[#1a1a1a] border border-white/5 rounded-2xl p-5 hover:bg-white/5 hover:border-white/20 transition-all cursor-pointer overflow-hidden"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="text-xs text-[#56c2fc] font-medium tracking-wide uppercase mb-1">{job.company || job.raw?.company}</div>
                        <h4 className="text-lg font-medium text-white group-hover:text-[#4642ff] transition-colors">{job.title || job.raw?.title}</h4>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-medium text-white">{job.salary || job.raw?.salary?.originalText || "Undisclosed"}</div>
                        <div className={`text-xs font-medium mt-1 ${(job.matchScore ?? job.analysis?.matchScore ?? 0) > 70 ? 'text-[#56c2fc]' : (job.matchScore ?? job.analysis?.matchScore ?? 0) > 30 ? 'text-yellow-500' : 'text-red-400'}`}>{(job.matchScore ?? job.analysis?.matchScore ?? 0)}% Match</div>
                      </div>
                    </div>
                    
                    <div className="text-xs text-white/50 mb-3">{job.location || job.raw?.location}</div>

                    <div className="flex flex-wrap gap-2 mb-3">
                      {(job.tags || job.raw?.skills || []).slice(0, 3).map((tag: string) => (
                        <span key={tag} className="px-2 py-1 bg-white/5 rounded text-xs text-white/60">{tag}</span>
                      ))}
                    </div>

                    <div className="text-sm text-white/70 italic bg-white/5 p-3 rounded-xl mb-4 border border-white/10">
                      {job.analysis?.whyItMatches || "No match evaluation available."}
                    </div>
                    
                    <div className="text-[10px] sm:text-xs text-[#56c2fc] uppercase tracking-wider font-medium mb-1">
                      Found via {job.source || job.raw?.source} ↗
                    </div>
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-[#4642ff]/90 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                      <span className="text-white font-medium flex items-center gap-2">
                        {currentUser ? 'View Job' : 'Sign in to view'} <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
