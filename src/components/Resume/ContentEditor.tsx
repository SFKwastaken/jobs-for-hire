import React from 'react';
import { Plus, Trash2, ChevronDown } from 'lucide-react';
import type { ResumeData } from '../../types/resume';

interface Props {
  data: ResumeData;
  onChange: (data: ResumeData) => void;
}

const Section = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <details className="group border border-white/10 rounded-xl mb-4 bg-black/20 overflow-hidden">
    <summary className="flex items-center justify-between p-4 cursor-pointer select-none text-sm font-semibold hover:bg-white/5 transition-colors">
      {title}
      <ChevronDown className="w-4 h-4 text-white/50 group-open:rotate-180 transition-transform" />
    </summary>
    <div className="p-4 border-t border-white/5 bg-black/40 space-y-4">
      {children}
    </div>
  </details>
);

export function ContentEditor({ data, onChange }: Props) {
  // Helpers
  const updatePersonal = (field: string, value: string) => {
    onChange({ ...data, personal: { ...data.personal, [field]: value } });
  };

  const updateArrayItem = <K extends keyof ResumeData>(key: K, index: number, field: string, value: any) => {
    const newArr = [...(data[key] as any[])];
    newArr[index] = { ...newArr[index], [field]: value };
    onChange({ ...data, [key]: newArr });
  };

  const removeArrayItem = <K extends keyof ResumeData>(key: K, index: number) => {
    const newArr = [...(data[key] as any[])];
    newArr.splice(index, 1);
    onChange({ ...data, [key]: newArr });
  };

  const addExperience = () => {
    onChange({
      ...data,
      experience: [
        ...data.experience,
        {
          company: 'New Company',
          jobTitle: 'Job Title',
          location: '',
          description: '',
          startDate: '2025',
          endDate: 'Present',
          current: true,
          achievements: [],
          id: Date.now().toString()
        }
      ]
    });
  };

  const addEducation = () => {
    onChange({
      ...data,
      education: [
        ...data.education,
        {
          institution: 'University',
          degree: 'Bachelor',
          field: 'Field of Study',
          description: '',
          startDate: '2020',
          endDate: '2024',
          id: Date.now().toString()
        }
      ]
    });
  };

  const addProject = () => {
    onChange({
      ...data,
      projects: [
        ...data.projects,
        {
          name: 'New Project',
          description: '',
          technologies: [],
          url: '',
          id: Date.now().toString()
        }
      ]
    });
  };

  const updateExperienceAchievements = (index: number, text: string) => {
    const bullets = text.split('\n').filter(b => b.trim());
    updateArrayItem('experience', index, 'achievements', bullets);
  };

  return (
    <div className="space-y-2">
      <Section title="Personal Details">
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-white/60 mb-1">Full Name</label>
            <input type="text" value={data.personal.fullName || ''} onChange={e => updatePersonal('fullName', e.target.value)} className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm focus:border-[#4642ff] outline-none" />
          </div>
          <div>
            <label className="block text-xs text-white/60 mb-1">Professional Title</label>
            <input type="text" value={data.personal.professionalTitle || ''} onChange={e => updatePersonal('professionalTitle', e.target.value)} className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm focus:border-[#4642ff] outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-white/60 mb-1">Email</label>
              <input type="email" value={data.personal.email || ''} onChange={e => updatePersonal('email', e.target.value)} className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm focus:border-[#4642ff] outline-none" />
            </div>
            <div>
              <label className="block text-xs text-white/60 mb-1">Phone</label>
              <input type="text" value={data.personal.phone || ''} onChange={e => updatePersonal('phone', e.target.value)} className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm focus:border-[#4642ff] outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-white/60 mb-1">Location</label>
              <input type="text" value={data.personal.location || ''} onChange={e => updatePersonal('location', e.target.value)} className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm focus:border-[#4642ff] outline-none" />
            </div>
            <div>
              <label className="block text-xs text-white/60 mb-1">LinkedIn</label>
              <input type="text" value={data.personal.linkedin || ''} onChange={e => updatePersonal('linkedin', e.target.value)} className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm focus:border-[#4642ff] outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-white/60 mb-1">Portfolio / Website</label>
            <input type="text" value={data.personal.portfolio || ''} onChange={e => updatePersonal('portfolio', e.target.value)} className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm focus:border-[#4642ff] outline-none" />
          </div>
        </div>
      </Section>

      <Section title="Professional Summary">
        <div>
          <textarea 
            rows={5}
            value={data.summary || ''} 
            onChange={e => onChange({ ...data, summary: e.target.value })} 
            className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm focus:border-[#4642ff] outline-none resize-y" 
            placeholder="Write a brief professional summary..."
          />
        </div>
      </Section>

      <Section title="Experience">
        {data.experience?.map((exp, i) => (
          <div key={i} className="bg-white/5 border border-white/10 p-3 rounded-lg relative group/item mb-4">
            <button onClick={() => removeArrayItem('experience', i)} className="absolute top-2 right-2 p-1 text-red-400 opacity-0 group-hover/item:opacity-100 hover:bg-red-400/20 rounded transition-all">
              <Trash2 className="w-4 h-4" />
            </button>
            
            <div className="space-y-3 mt-2">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-white/60 mb-1">Company</label>
                  <input type="text" value={exp.company} onChange={e => updateArrayItem('experience', i, 'company', e.target.value)} className="w-full bg-black/40 border border-white/10 rounded px-2 py-1.5 text-xs outline-none focus:border-[#4642ff]" />
                </div>
                <div>
                  <label className="block text-xs text-white/60 mb-1">Job Title</label>
                  <input type="text" value={exp.jobTitle} onChange={e => updateArrayItem('experience', i, 'jobTitle', e.target.value)} className="w-full bg-black/40 border border-white/10 rounded px-2 py-1.5 text-xs outline-none focus:border-[#4642ff]" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-white/60 mb-1">Location</label>
                  <input type="text" value={exp.location || ''} onChange={e => updateArrayItem('experience', i, 'location', e.target.value)} className="w-full bg-black/40 border border-white/10 rounded px-2 py-1.5 text-xs outline-none focus:border-[#4642ff]" />
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="block text-xs text-white/60 mb-1">Start</label>
                    <input type="text" value={exp.startDate} onChange={e => updateArrayItem('experience', i, 'startDate', e.target.value)} className="w-full bg-black/40 border border-white/10 rounded px-2 py-1.5 text-xs outline-none focus:border-[#4642ff]" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs text-white/60 mb-1">End</label>
                    <input type="text" value={exp.endDate} onChange={e => updateArrayItem('experience', i, 'endDate', e.target.value)} disabled={exp.current} className="w-full bg-black/40 border border-white/10 rounded px-2 py-1.5 text-xs outline-none focus:border-[#4642ff] disabled:opacity-50" />
                  </div>
                </div>
              </div>
              <label className="flex items-center gap-2 text-xs text-white/80 cursor-pointer">
                <input type="checkbox" checked={exp.current} onChange={e => updateArrayItem('experience', i, 'current', e.target.checked)} className="rounded bg-black/40 border-white/10 accent-[#4642ff]" />
                I currently work here
              </label>
              <div>
                <label className="block text-xs text-white/60 mb-1">Description (Optional)</label>
                <textarea rows={2} value={exp.description || ''} onChange={e => updateArrayItem('experience', i, 'description', e.target.value)} className="w-full bg-black/40 border border-white/10 rounded px-2 py-1.5 text-xs outline-none focus:border-[#4642ff]" />
              </div>
              <div>
                <label className="block text-xs text-white/60 mb-1">Bullet Points (One per line)</label>
                <textarea 
                  rows={4} 
                  value={exp.achievements?.join('\n') || ''} 
                  onChange={e => updateExperienceAchievements(i, e.target.value)} 
                  className="w-full bg-black/40 border border-white/10 rounded px-2 py-1.5 text-xs outline-none focus:border-[#4642ff] leading-relaxed" 
                  placeholder="Managed team of 5...&#10;Increased revenue by 20%..."
                />
              </div>
            </div>
          </div>
        ))}
        <button onClick={addExperience} className="w-full py-2 border border-dashed border-white/20 rounded-lg text-sm text-white/60 hover:text-white hover:border-white/40 hover:bg-white/5 transition-colors flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" /> Add Role
        </button>
      </Section>

      <Section title="Education">
        {data.education?.map((edu, i) => (
          <div key={i} className="bg-white/5 border border-white/10 p-3 rounded-lg relative group/item mb-4">
            <button onClick={() => removeArrayItem('education', i)} className="absolute top-2 right-2 p-1 text-red-400 opacity-0 group-hover/item:opacity-100 hover:bg-red-400/20 rounded transition-all">
              <Trash2 className="w-4 h-4" />
            </button>
            <div className="space-y-3 mt-2">
              <div>
                <label className="block text-xs text-white/60 mb-1">Institution</label>
                <input type="text" value={edu.institution} onChange={e => updateArrayItem('education', i, 'institution', e.target.value)} className="w-full bg-black/40 border border-white/10 rounded px-2 py-1.5 text-xs outline-none focus:border-[#4642ff]" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-white/60 mb-1">Degree</label>
                  <input type="text" value={edu.degree} onChange={e => updateArrayItem('education', i, 'degree', e.target.value)} className="w-full bg-black/40 border border-white/10 rounded px-2 py-1.5 text-xs outline-none focus:border-[#4642ff]" />
                </div>
                <div>
                  <label className="block text-xs text-white/60 mb-1">Field of Study</label>
                  <input type="text" value={edu.field} onChange={e => updateArrayItem('education', i, 'field', e.target.value)} className="w-full bg-black/40 border border-white/10 rounded px-2 py-1.5 text-xs outline-none focus:border-[#4642ff]" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-white/60 mb-1">Start Date</label>
                  <input type="text" value={edu.startDate} onChange={e => updateArrayItem('education', i, 'startDate', e.target.value)} className="w-full bg-black/40 border border-white/10 rounded px-2 py-1.5 text-xs outline-none focus:border-[#4642ff]" />
                </div>
                <div>
                  <label className="block text-xs text-white/60 mb-1">End Date</label>
                  <input type="text" value={edu.endDate} onChange={e => updateArrayItem('education', i, 'endDate', e.target.value)} className="w-full bg-black/40 border border-white/10 rounded px-2 py-1.5 text-xs outline-none focus:border-[#4642ff]" />
                </div>
              </div>
            </div>
          </div>
        ))}
        <button onClick={addEducation} className="w-full py-2 border border-dashed border-white/20 rounded-lg text-sm text-white/60 hover:text-white hover:border-white/40 hover:bg-white/5 transition-colors flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" /> Add Education
        </button>
      </Section>

      <Section title="Projects">
        {data.projects?.map((proj, i) => (
          <div key={i} className="bg-white/5 border border-white/10 p-3 rounded-lg relative group/item mb-4">
            <button onClick={() => removeArrayItem('projects', i)} className="absolute top-2 right-2 p-1 text-red-400 opacity-0 group-hover/item:opacity-100 hover:bg-red-400/20 rounded transition-all">
              <Trash2 className="w-4 h-4" />
            </button>
            <div className="space-y-3 mt-2">
              <div>
                <label className="block text-xs text-white/60 mb-1">Project Name</label>
                <input type="text" value={proj.name} onChange={e => updateArrayItem('projects', i, 'name', e.target.value)} className="w-full bg-black/40 border border-white/10 rounded px-2 py-1.5 text-xs outline-none focus:border-[#4642ff]" />
              </div>
              <div>
                <label className="block text-xs text-white/60 mb-1">Description</label>
                <textarea rows={3} value={proj.description} onChange={e => updateArrayItem('projects', i, 'description', e.target.value)} className="w-full bg-black/40 border border-white/10 rounded px-2 py-1.5 text-xs outline-none focus:border-[#4642ff]" />
              </div>
              <div>
                <label className="block text-xs text-white/60 mb-1">Technologies (Comma separated)</label>
                <input 
                  type="text" 
                  value={proj.technologies?.join(', ') || ''} 
                  onChange={e => updateArrayItem('projects', i, 'technologies', e.target.value.split(',').map(s => s.trim()).filter(Boolean))} 
                  className="w-full bg-black/40 border border-white/10 rounded px-2 py-1.5 text-xs outline-none focus:border-[#4642ff]" 
                  placeholder="React, Node, Firebase"
                />
              </div>
            </div>
          </div>
        ))}
        <button onClick={addProject} className="w-full py-2 border border-dashed border-white/20 rounded-lg text-sm text-white/60 hover:text-white hover:border-white/40 hover:bg-white/5 transition-colors flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" /> Add Project
        </button>
      </Section>

      <Section title="Skills">
        <div>
          <label className="block text-xs text-white/60 mb-2">Enter all skills separated by commas</label>
          <textarea 
            rows={4}
            value={data.skills?.join(', ') || ''} 
            onChange={e => onChange({ ...data, skills: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} 
            className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-sm focus:border-[#4642ff] outline-none leading-relaxed" 
            placeholder="JavaScript, TypeScript, React..."
          />
        </div>
      </Section>
    </div>
  );
}
