import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getResume } from '../lib/resume';
import type { Resume } from '../types/resume';
import { ResumePreview } from '../components/Resume/ResumePreview';
import { ArrowLeft, Loader2, Download } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';

export default function ResumeViewer() {
  const { id } = useParams<{ id: string }>();
  const [resume, setResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(true);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id) {
      getResume(id).then(res => {
        setResume(res);
        setLoading(false);
      });
    }
  }, [id]);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: resume ? `${resume.title || 'Resume'} - JobsForHire` : 'Resume',
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">
        <Loader2 className="w-8 h-8 animate-spin text-[#4642ff]" />
      </div>
    );
  }

  if (!resume) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center text-white">
        <h2 className="text-2xl font-bold mb-4">Resume not found</h2>
        <Link to="/profile" className="px-4 py-2 bg-[#4642ff] rounded-full hover:bg-[#5b4fff] transition-colors">
          Back to Profile
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center py-8 overflow-x-auto">
      <div className="w-full min-w-[210mm] max-w-[210mm] flex justify-between items-center mb-8 px-4">
        <Link to="/profile" className="flex items-center gap-2 hover:text-white/70 transition-colors">
          <ArrowLeft className="w-5 h-5" /> Back to Profile
        </Link>
        <button 
          onClick={handlePrint}
          className="px-4 py-2 bg-[#4642ff] hover:bg-[#5b4fff] rounded-full font-medium transition-colors flex items-center gap-2 text-sm"
        >
          <Download className="w-4 h-4" /> Download PDF
        </button>
      </div>
      
      <div className="w-[210mm] h-[297mm] bg-white shadow-2xl overflow-hidden flex-shrink-0" ref={printRef}>
        <ResumePreview 
          data={resume.resumeData as any} 
          template={resume.template as any} 
          hideWrapper={true} 
        />
      </div>
    </div>
  );
}
