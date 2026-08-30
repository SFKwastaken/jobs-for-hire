import React, { useState } from 'react';
import { ArrowRight, Bot, Target } from 'lucide-react';
import type { UserProfile } from '../../lib/profile';

interface Props {
  profile: UserProfile | null;
  onComplete: (additionalInfo: string, targetRole: string, contactInfo: { phone: string, email: string, portfolio: string, location: string }) => void;
  initialJob?: any;
}

export function ResumeWizard({ profile, onComplete, initialJob }: Props) {
  const [step, setStep] = useState(1);
  const [targetRole, setTargetRole] = useState(initialJob?.title || profile?.target_roles?.[0] || '');
  const [experience, setExperience] = useState(initialJob ? `I am tailoring my resume for this specific job posting:\n\nTitle: ${initialJob.title}\nCompany: ${initialJob.company}\nDescription: ${initialJob.description}\n\nPlease tailor my experience to match these requirements.` : '');
  const [contactInfo, setContactInfo] = useState({ phone: '', email: '', portfolio: '', location: '' });
  
  const handleNext = () => {
    if (step === 1 && !targetRole.trim()) return;
    if (step === 1) setStep(2);
    else if (step === 2) setStep(3);
    else onComplete(experience, targetRole, contactInfo);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-6">
      <div className="max-w-2xl w-full bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-full bg-[#4642ff]/20 flex items-center justify-center text-[#56c2fc]">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-white font-medium">AI Assistant</h3>
            <p className="text-white/50 text-sm">Resume Builder</p>
          </div>
        </div>

        {step === 1 ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-medium text-white mb-4">Let's build your resume. What type of role are you targeting?</h2>
            {profile?.target_roles?.length ? (
              <p className="text-white/60 mb-6">We noticed you're interested in {profile.target_roles.join(', ')}.</p>
            ) : null}
            
            <div className="relative mb-8">
              <Target className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input 
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g. Frontend Developer, Video Editor..."
                className="w-full bg-black/50 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-[#4642ff] transition-colors"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleNext()}
              />
            </div>
            
            <div className="flex justify-end">
              <button 
                onClick={handleNext}
                disabled={!targetRole.trim()}
                className="px-6 py-3 bg-white text-black rounded-full font-medium hover:bg-gray-200 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                Next <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : step === 2 ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-medium text-white mb-4">Great. Tell me about your recent work experience or projects.</h2>
            <p className="text-white/60 mb-6">
              Don't worry about formatting or making it sound perfect. Just write down what you did, the tools you used, and what you achieved. I'll turn it into professional resume bullet points.
            </p>
            
            <textarea 
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              placeholder="I worked at Acme Corp where I built websites with React and fixed bugs. I also made a personal project..."
              className="w-full h-48 bg-black/50 border border-white/10 rounded-xl p-4 text-white resize-none focus:outline-none focus:border-[#4642ff] transition-colors mb-8"
              autoFocus
            />
            
            <div className="flex justify-between items-center">
              <button onClick={() => setStep(1)} className="text-white/60 hover:text-white">Back</button>
              <button 
                onClick={handleNext}
                className="px-6 py-3 bg-white text-black rounded-full font-medium hover:bg-gray-200 transition-colors flex items-center gap-2"
              >
                Next <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-medium text-white mb-4">Almost done! Add your contact info (Optional)</h2>
            <p className="text-white/60 mb-6">
              You can add your contact details now so they appear on the final resume. You can skip this and add them later in the studio.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div>
                <label className="block text-sm text-white/70 mb-2">Email</label>
                <input 
                  type="email"
                  value={contactInfo.email}
                  onChange={(e) => setContactInfo({...contactInfo, email: e.target.value})}
                  className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#4642ff] transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm text-white/70 mb-2">Phone</label>
                <input 
                  type="tel"
                  value={contactInfo.phone}
                  onChange={(e) => setContactInfo({...contactInfo, phone: e.target.value})}
                  className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#4642ff] transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm text-white/70 mb-2">Location</label>
                <input 
                  type="text"
                  value={contactInfo.location}
                  onChange={(e) => setContactInfo({...contactInfo, location: e.target.value})}
                  placeholder="e.g. London, UK"
                  className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#4642ff] transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm text-white/70 mb-2">Portfolio / LinkedIn</label>
                <input 
                  type="text"
                  value={contactInfo.portfolio}
                  onChange={(e) => setContactInfo({...contactInfo, portfolio: e.target.value})}
                  className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#4642ff] transition-colors"
                />
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <button onClick={() => setStep(2)} className="text-white/60 hover:text-white">Back</button>
              <button 
                onClick={handleNext}
                className="px-6 py-3 bg-[#4642ff] text-white rounded-full font-medium hover:bg-[#5b4fff] transition-colors flex items-center gap-2"
              >
                Generate Resume <Bot className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
