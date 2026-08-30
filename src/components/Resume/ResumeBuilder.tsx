import React, { useRef, useState, useEffect } from 'react';
import { ArrowLeft, Download, Settings, Save, LayoutTemplate, PenTool, Undo, Redo } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { ResumePreview } from './ResumePreview';
import { ContentEditor } from './ContentEditor';
import type { ResumeData, ResumeTemplate } from '../../types/resume';

interface Props {
  initialData: ResumeData;
  onBack: () => void;
  onSave: (data: ResumeData, template: ResumeTemplate) => void;
  isSaving: boolean;
}

const TEMPLATES: { id: ResumeTemplate, name: string, desc: string }[] = [
  { id: 'professional', name: 'Professional', desc: 'Classic, conservative, ATS-optimized' },
  { id: 'modern', name: 'Modern', desc: 'Clean sans-serif, bold headers' },
  { id: 'minimal', name: 'Minimal', desc: 'Ultra-clean, spacious typography' },
  { id: 'creative', name: 'Creative', desc: 'Bold colors, asymmetrical design' },
  { id: 'executive', name: 'Executive', desc: 'Authoritative, serif-heavy layout' },
  { id: 'tech', name: 'Tech', desc: 'Monospace, dark mode aesthetic' },
  { id: 'academic', name: 'Academic', desc: 'Optimized for dense publications' },
  { id: 'startup', name: 'Startup', desc: 'Vibrant gradients, playful layout' },
  { id: 'elegant', name: 'Elegant', desc: 'Thin serifs, minimalist luxury' },
  { id: 'classic', name: 'Classic', desc: 'Standard chronological resume' },
];

export function ResumeBuilder({ initialData, onBack, onSave, isSaving }: Props) {
  const [data, setData] = useState<ResumeData>(initialData);
  const [template, setTemplate] = useState<ResumeTemplate>('professional');
  const [activeTab, setActiveTab] = useState<'design' | 'content'>('content');
  
  // History state for Undo/Redo
  const [history, setHistory] = useState<ResumeData[]>([initialData]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const printRef = useRef<HTMLDivElement>(null);

  const handleDataChange = (newData: ResumeData) => {
    setData(newData);
    
    // We update history on every discrete change from ContentEditor.
    // (Since the accordion bug is fixed, typing is smooth, but we'll debounce it if needed later)
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newData);
    if (newHistory.length > 50) newHistory.shift();
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setData(history[historyIndex - 1]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setData(history[historyIndex + 1]);
    }
  };

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `${data.personal.fullName || 'Resume'} - JobsForHire`,
  });

  return (
    <div className="flex flex-col h-screen bg-[#0a0a0a] text-white overflow-hidden">
      {/* Top Navbar */}
      <header className="h-16 flex items-center justify-between px-6 bg-white/5 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/70 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-medium tracking-tight">Resume Studio</h1>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-full border border-white/10 mr-2">
            <button 
              onClick={handleUndo} 
              disabled={historyIndex === 0}
              className="p-1.5 rounded-full hover:bg-white/10 transition-colors text-white/70 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
              title="Undo"
            >
              <Undo className="w-4 h-4" />
            </button>
            <button 
              onClick={handleRedo}
              disabled={historyIndex === history.length - 1}
              className="p-1.5 rounded-full hover:bg-white/10 transition-colors text-white/70 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
              title="Redo"
            >
              <Redo className="w-4 h-4" />
            </button>
          </div>

          <button 
            onClick={() => onSave(data, template)}
            disabled={isSaving}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full font-medium transition-colors flex items-center gap-2 text-sm disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'Save to Cloud'}
          </button>
          
          <button 
            onClick={handlePrint}
            className="px-4 py-2 bg-[#4642ff] hover:bg-[#5b4fff] rounded-full font-medium transition-colors flex items-center gap-2 text-sm"
          >
            <Download className="w-4 h-4" />
            Download PDF
          </button>
        </div>
      </header>

      {/* Main Studio Area */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Left Sidebar - Controls */}
        <div className="w-[22rem] bg-white/5 border-r border-white/10 flex flex-col hidden md:flex shrink-0">
          <div className="flex border-b border-white/10">
            <button 
              onClick={() => setActiveTab('design')}
              className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-colors border-b-2 ${activeTab === 'design' ? 'border-[#4642ff] text-[#56c2fc]' : 'border-transparent text-white/50 hover:text-white/80 hover:bg-white/5'}`}
            >
              <div className="flex items-center justify-center gap-2">
                <LayoutTemplate className="w-4 h-4" /> Design
              </div>
            </button>
            <button 
              onClick={() => setActiveTab('content')}
              className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-colors border-b-2 ${activeTab === 'content' ? 'border-[#4642ff] text-[#56c2fc]' : 'border-transparent text-white/50 hover:text-white/80 hover:bg-white/5'}`}
            >
              <div className="flex items-center justify-center gap-2">
                <PenTool className="w-4 h-4" /> Content
              </div>
            </button>
          </div>

          <div className="p-6 flex-1 overflow-y-auto">
            {activeTab === 'design' ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-4">Template</label>
                  <div className="grid grid-cols-2 gap-2">
                    {TEMPLATES.map(t => (
                      <button 
                        key={t.id}
                        onClick={() => setTemplate(t.id)}
                        className={`px-3 py-2 text-left rounded-xl border text-sm transition-all ${template === t.id ? 'bg-[#4642ff]/20 border-[#4642ff] text-[#56c2fc]' : 'bg-black/20 border-white/10 text-white/70 hover:border-white/30'}`}
                      >
                        <div className="font-medium">{t.name}</div>
                        <div className="text-[10px] leading-tight text-white/40 mt-0.5">{t.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <ContentEditor data={data} onChange={handleDataChange} />
            )}
          </div>
        </div>

        {/* Center - Live Preview */}
        <div className="flex-1 bg-[#16161d] overflow-y-auto p-4 sm:p-8 flex justify-center items-start">
          <div className="shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            <ResumePreview ref={printRef} data={data} template={template} />
          </div>
        </div>
        
        {/* Right Sidebar - AI Assistant */}
        <div className="w-80 bg-white/5 border-l border-white/10 flex flex-col hidden lg:flex shrink-0">
          <div className="p-6 flex-1 flex flex-col">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#56c2fc] mb-6">AI Assistant</h2>
            
            <div className="bg-[#4642ff]/10 border border-[#4642ff]/20 rounded-xl p-4 mb-6">
              <h3 className="font-medium text-white mb-2">Resume Score</h3>
              <div className="flex items-end gap-2 mb-2">
                <span className="text-3xl font-bold text-[#56c2fc]">92</span>
                <span className="text-white/50 mb-1">/100</span>
              </div>
              <p className="text-xs text-white/70">ATS Compatibility and Impact</p>
            </div>
            
            <div className="space-y-3 flex-1">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 shrink-0" />
                <p className="text-sm text-white/80">Strong action verbs used in Experience.</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-yellow-500 mt-1.5 shrink-0" />
                <p className="text-sm text-white/80">Consider adding more measurable metrics (e.g. percentages, revenue).</p>
              </div>
            </div>
            
            <button className="w-full px-4 py-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-sm font-medium transition-colors text-left mt-auto">
              Re-analyze Resume
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
