import React from 'react';
import { ExternalLink, FileText, Bookmark } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { ProcessedJob } from '../../utils/job-engine/types';

interface JobCardProps {
  job: any; // Using any because the UI uses an extended version of ProcessedJob from adzuna.ts
  hideMatchScore?: boolean;
}

export default function JobCard({ job, hideMatchScore = false }: JobCardProps) {
  const navigate = useNavigate();

  const handleCreateResume = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Navigate to resume builder, passing the job description via state
    navigate('/resume', { state: { targetJob: job } });
  };

  const handleSaveJob = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Simple local storage save for now
    const saved = JSON.parse(localStorage.getItem('savedJobs') || '[]');
    if (!saved.find((s: any) => s.url === job.url)) {
      saved.push(job);
      localStorage.setItem('savedJobs', JSON.stringify(saved));
      alert('Job saved!');
    } else {
      alert('Job is already saved.');
    }
  };

  return (
    <div 
      onClick={() => window.open(job.url, '_blank')} 
      className="group relative bg-[#1a1a1a] border border-white/5 rounded-2xl p-6 hover:bg-white/5 hover:border-white/20 transition-all cursor-pointer overflow-hidden flex flex-col h-full"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="text-xs text-[#56c2fc] font-medium tracking-wide uppercase mb-1">{job.company}</div>
          <h4 className="text-lg font-medium text-white group-hover:text-[#4642ff] transition-colors leading-tight">{job.title}</h4>
        </div>
        <div className="text-right shrink-0 ml-4">
          <div className="text-sm font-medium text-white whitespace-nowrap">{job.salary}</div>
          {!hideMatchScore && (
            <div className="text-xs font-medium mt-1 text-[#56c2fc]">{job.matchScore}% Match</div>
          )}
        </div>
      </div>
      <div className="text-xs text-white/50 mb-4">{job.location} • {job.type}</div>
      <div className="flex flex-wrap gap-2 mb-4">
        {(job.tags || []).slice(0, 3).map((tag: string) => (
          <span key={tag} className="px-2 py-1 bg-white/5 rounded text-xs text-white/60">{tag}</span>
        ))}
      </div>
      <div className="mt-auto pt-4 flex items-center justify-between border-t border-white/5">
        <div className="text-[10px] text-white/40 uppercase tracking-wider font-medium">Found via {job.source}</div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleSaveJob}
            className="p-1.5 text-white/40 hover:text-[#56c2fc] hover:bg-[#56c2fc]/10 rounded-md transition-colors"
            title="Save Job"
          >
            <Bookmark className="w-4 h-4" />
          </button>
          <button 
            onClick={handleCreateResume}
            className="p-1.5 text-white/40 hover:text-[#4642ff] hover:bg-[#4642ff]/10 rounded-md transition-colors"
            title="Create tailored resume"
          >
            <FileText className="w-4 h-4" />
          </button>
          <button 
            className="p-1.5 text-white/40 hover:text-white hover:bg-white/10 rounded-md transition-colors"
            title="View Original"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
