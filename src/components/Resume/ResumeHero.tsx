import React from 'react';
import { Bot, FileText, Sparkles, CheckCircle2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface Props {
  onCreateClick: () => void;
  onUploadClick: () => void;
}

export function ResumeHero({ onCreateClick, onUploadClick }: Props) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 relative pb-12">
      <Link to="/" className="fixed top-8 left-8 flex items-center gap-2 text-white/60 hover:text-white transition-colors z-50">
        <ArrowLeft className="w-5 h-5" /> Back to Home
      </Link>
      
      <div className="fixed bottom-6 right-8 text-white/30 text-xs font-medium tracking-wider uppercase pointer-events-none z-50">
        AI Powered Resume Studio
      </div>
      
      <div className="max-w-3xl w-full text-center mb-12">
        <h1 className="text-5xl sm:text-6xl font-medium tracking-tight text-white mb-6 leading-tight">
          Turn your experience into a <span className="font-serif italic font-normal text-[#56c2fc]">professional resume</span> in minutes.
        </h1>
        
        <p className="text-xl text-white/60 max-w-2xl mx-auto mb-12">
          Our AI analyzes your profile, career goals, and skills to generate a highly optimized, ATS-friendly resume tailored for the jobs you want.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button 
            onClick={onCreateClick}
            className="w-full sm:w-auto px-8 py-4 bg-white text-[#0a0a0a] rounded-full font-medium text-lg hover:bg-gray-100 transition-all flex items-center justify-center gap-2"
          >
            <Bot className="w-5 h-5" />
            Create My Resume
          </button>
          
          <div className="text-white/40 text-sm font-medium">OR</div>
          
          <button 
            onClick={onUploadClick}
            className="w-full sm:w-auto px-8 py-4 bg-white/5 text-white border border-white/10 rounded-full font-medium text-lg hover:bg-white/10 transition-all flex items-center justify-center gap-2"
          >
            <FileText className="w-5 h-5" />
            Upload Existing Resume
          </button>
        </div>
      </div>

      {/* Feature grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl w-full text-left">
        {[
          { title: "AI-Powered Writing", desc: "No more writer's block. We write the bullets." },
          { title: "ATS-Friendly", desc: "Formats designed to pass screening systems." },
          { title: "Job Tailoring", desc: "Matches your experience to real job descriptions." },
          { title: "Professional Polish", desc: "Clean, elegant templates ready to export." }
        ].map((feature, i) => (
          <div key={i} className="p-5 rounded-2xl bg-white/5 border border-white/5">
            <CheckCircle2 className="w-5 h-5 text-[#56c2fc] mb-3" />
            <h3 className="text-white font-medium mb-1">{feature.title}</h3>
            <p className="text-white/50 text-sm">{feature.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
