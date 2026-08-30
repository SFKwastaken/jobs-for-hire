import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUserProfile } from '../lib/profile';
import type { UserProfile } from '../lib/profile';
import type { ResumeData, ResumeTemplate } from '../types/resume';
import { saveResume } from '../lib/resume';
import { ResumeHero } from '../components/Resume/ResumeHero';
import { ResumeWizard } from '../components/Resume/ResumeWizard';
import { ResumeBuilder } from '../components/Resume/ResumeBuilder';
import { Loader2 } from 'lucide-react';

type ResumeState = 'hero' | 'wizard' | 'generating' | 'builder';

export default function Resume() {
  const location = useLocation();
  const targetJob = location.state?.targetJob;
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [currentState, setCurrentState] = useState<ResumeState>(targetJob ? 'wizard' : 'hero');
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [loadingMsg, setLoadingMsg] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (currentUser) {
      getUserProfile(currentUser.uid).then(setProfile);
    }
  }, [currentUser]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (currentState === 'generating') {
      const messages = [
        "Analyzing your profile and experience...",
        "Structuring professional experience...",
        "Extracting relevant skills...",
        "Writing impact-driven bullet points...",
        "Optimizing content for ATS compatibility...",
        "Formatting final resume layout...",
        "Almost there, finalizing details..."
      ];
      let i = 0;
      setLoadingMsg(messages[0]);
      interval = setInterval(() => {
        i = Math.min(i + 1, messages.length - 1);
        setLoadingMsg(messages[i]);
      }, 4000);
    }
    return () => clearInterval(interval);
  }, [currentState]);

  const handleGenerate = async (additionalInfo: string, targetRole: string, contactInfo: any) => {
    setCurrentState('generating');
    
    try {
      const res = await fetch('/api/resume/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userProfile: profile,
          additionalInfo,
          jobDescription: targetRole,
          contactInfo
        })
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }
      
      const data = await res.json();
      
      setResumeData(data);
      setCurrentState('builder');
    } catch (e: any) {
      console.error(e);
      alert("Failed to generate resume. Please try again. " + e.message);
      setCurrentState('wizard');
    }
  };

  const handleSave = async (data: ResumeData, template: ResumeTemplate) => {
    if (!currentUser) return;
    setIsSaving(true);
    try {
      await saveResume({
        id: crypto.randomUUID(),
        userId: currentUser.uid,
        title: `${data.personal?.professionalTitle || 'Software Engineer'} Resume`,
        targetRole: data.personal?.professionalTitle || '',
        resumeData: data,
        template: template
      });
      alert("Resume saved successfully! You can view it on your Profile.");
    } catch (e: any) {
      console.error(e);
      alert("Failed to save resume: " + e.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (currentState === 'generating') {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center text-white px-6">
        <Loader2 className="w-12 h-12 text-[#4642ff] animate-spin mb-6" />
        <h2 className="text-2xl font-medium mb-2">Building your resume</h2>
        <p className="text-white/60">{loadingMsg}</p>
      </div>
    );
  }

  if (currentState === 'builder' && resumeData) {
    return (
      <ResumeBuilder 
        initialData={resumeData} 
        onBack={() => setCurrentState('hero')}
        onSave={handleSave}
        isSaving={isSaving}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-[#0a0a0a] overflow-hidden flex flex-col">
      {/* Background aesthetics */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
         <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#4642ff]/30 blur-[120px]" />
         <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#56c2fc]/20 blur-[120px]" />
      </div>

      <div className="relative z-10 flex-1 pt-24 pb-12 overflow-y-auto">
        {currentState === 'hero' && (
          <ResumeHero 
            onCreateClick={() => setCurrentState('wizard')} 
            onUploadClick={() => alert("Upload feature coming soon!")}
          />
        )}
        
        {currentState === 'wizard' && (
          <ResumeWizard 
            profile={profile} 
            initialJob={targetJob}
            onComplete={handleGenerate} 
          />
        )}
      </div>
    </div>
  );
}
