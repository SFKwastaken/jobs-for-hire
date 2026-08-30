import React from 'react';
import type { ResumeData } from '../../../types/resume';

export const TechResume = ({ data }: { data: ResumeData }) => {
  return (
    <div className="flex flex-col h-full font-mono bg-[#0d1117] text-[#c9d1d9] overflow-hidden p-6 border-8 border-[#30363d]">
      {/* Header */}
      <header className="mb-4 border-b border-[#30363d] pb-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[#3fb950] font-bold">&gt;</span>
          <h1 className="text-[calc(1.5rem*var(--font-scale,1))] font-bold text-[#58a6ff] lowercase tracking-tight">{data.personal?.fullName?.replace(/\s+/g, '_') || 'user_name'}</h1>
        </div>
        {data.personal?.professionalTitle && (
          <div className="text-[calc(11px*var(--font-scale,1))] text-[#8b949e] mb-2 flex items-center gap-2">
            <span className="text-[#d2a8ff]">role:</span>
            <span className="text-[#a5d6ff]">"{data.personal.professionalTitle}"</span>
          </div>
        )}
        
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[calc(9px*var(--font-scale,1))] text-[#8b949e]">
          {data.personal?.email && <div><span className="text-[#ff7b72]">email:</span> {data.personal.email}</div>}
          {data.personal?.phone && <div><span className="text-[#ff7b72]">tel:</span> {data.personal.phone}</div>}
          {data.personal?.location && <div><span className="text-[#ff7b72]">loc:</span> {data.personal.location}</div>}
          {data.personal?.linkedin && <div><span className="text-[#ff7b72]">in:</span> {data.personal.linkedin}</div>}
          {data.personal?.portfolio && <div><span className="text-[#ff7b72]">url:</span> {data.personal.portfolio}</div>}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-col gap-4">
        {data.summary && (
          <section className="bg-[#161b22] p-3 rounded border border-[#30363d]">
            <div className="text-[#79c0ff] text-[calc(9px*var(--font-scale,1))] mb-1">/* profile_summary */</div>
            <p className="text-[calc(10px*var(--font-scale,1))] leading-relaxed text-[#c9d1d9]">{data.summary}</p>
          </section>
        )}

        <div className="flex gap-4">
          <div className="w-[60%] flex flex-col gap-4">
            {data.experience?.length > 0 && (
              <section>
                <div className="text-[#79c0ff] text-[calc(9px*var(--font-scale,1))] mb-2">## work_history.md</div>
                <div className="space-y-3">
                  {data.experience.map((exp, i) => (
                    <div key={i} className="border-l-2 border-[#30363d] pl-3">
                      <div className="flex justify-between items-baseline mb-1">
                        <h3 className="font-bold text-[calc(11px*var(--font-scale,1))] text-[#c9d1d9]">{exp.jobTitle} <span className="text-[#8b949e] font-normal">@ {exp.company}</span></h3>
                      </div>
                      <div className="text-[calc(9px*var(--font-scale,1))] text-[#8b949e] mb-1">
                        [{exp.startDate} - {exp.current ? 'HEAD' : exp.endDate}] {exp.location && `(${exp.location})`}
                      </div>
                      {exp.description && <p className="text-[calc(9px*var(--font-scale,1))] text-[#8b949e] mb-1"># {exp.description}</p>}
                      {exp.achievements?.length > 0 && (
                        <ul className="text-[calc(9.5px*var(--font-scale,1))] text-[#c9d1d9] space-y-0.5">
                          {exp.achievements.map((ach, j) => (
                            <li key={j} className="flex gap-1.5 leading-tight">
                              <span className="text-[#3fb950]">-</span> {ach}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          <div className="w-[40%] flex flex-col gap-4">
            {data.skills?.length > 0 && (
              <section>
                <div className="text-[#79c0ff] text-[calc(9px*var(--font-scale,1))] mb-2">const skills = [</div>
                <div className="flex flex-wrap gap-1.5 pl-2">
                  {data.skills.map((skill, i) => (
                    <span key={i} className="text-[calc(9px*var(--font-scale,1))] bg-[#238636] text-white px-1.5 py-0.5 rounded-sm">
                      "{skill}"{i < data.skills.length - 1 ? ',' : ''}
                    </span>
                  ))}
                </div>
                <div className="text-[#79c0ff] text-[calc(9px*var(--font-scale,1))] mt-1">];</div>
              </section>
            )}

            {data.projects?.length > 0 && (
              <section>
                <div className="text-[#79c0ff] text-[calc(9px*var(--font-scale,1))] mb-2">./projects/</div>
                <div className="space-y-2.5">
                  {data.projects.map((proj, i) => (
                    <div key={i} className="bg-[#161b22] p-2 border border-[#30363d] rounded-sm">
                      <h3 className="font-bold text-[calc(10px*var(--font-scale,1))] text-[#58a6ff] mb-0.5">./{proj.name.toLowerCase().replace(/\s+/g, '-')}</h3>
                      {proj.description && <p className="text-[calc(9px*var(--font-scale,1))] text-[#8b949e] leading-tight mb-1">{proj.description}</p>}
                      {proj.technologies?.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {proj.technologies.map((tech, k) => (
                            <span key={k} className="text-[calc(8px*var(--font-scale,1))] text-[#a5d6ff] bg-[#1f6feb]/10 px-1 rounded-sm border border-[#1f6feb]/30">
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {data.education?.length > 0 && (
              <section>
                <div className="text-[#79c0ff] text-[calc(9px*var(--font-scale,1))] mb-2">~/.education</div>
                <div className="space-y-2">
                  {data.education.map((edu, i) => (
                    <div key={i} className="text-[calc(9px*var(--font-scale,1))]">
                      <div className="text-[#d2a8ff] font-bold">{edu.degree}</div>
                      <div className="text-[#8b949e]">{edu.institution}</div>
                      <div className="text-[#8b949e] text-[calc(8px*var(--font-scale,1))] mt-0.5">[{edu.startDate} - {edu.endDate}]</div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
