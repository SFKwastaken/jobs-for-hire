import React from 'react';
import type { ResumeData } from '../../../types/resume';

export const StartupResume = ({ data }: { data: ResumeData }) => {
  return (
    <div className="flex flex-col h-full font-sans bg-gray-50 text-gray-800 overflow-hidden p-6 gap-4">
      {/* Header Card */}
      <header className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white p-5 rounded-2xl shadow-lg shrink-0">
        <h1 className="text-[calc(1.875rem*var(--font-scale,1))] font-black tracking-tight mb-1">{data.personal?.fullName || 'Your Name'}</h1>
        {data.personal?.professionalTitle && <div className="text-[calc(0.875rem*var(--font-scale,1))] font-medium text-violet-200 mb-3">{data.personal.professionalTitle}</div>}
        
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-[calc(10px*var(--font-scale,1))] font-medium">
          {data.personal?.email && <span className="bg-white/10 px-2 py-0.5 rounded-full backdrop-blur-sm">{data.personal.email}</span>}
          {data.personal?.phone && <span className="bg-white/10 px-2 py-0.5 rounded-full backdrop-blur-sm">{data.personal.phone}</span>}
          {data.personal?.location && <span className="bg-white/10 px-2 py-0.5 rounded-full backdrop-blur-sm">{data.personal.location}</span>}
          {data.personal?.linkedin && <span className="bg-white/10 px-2 py-0.5 rounded-full backdrop-blur-sm">{data.personal.linkedin}</span>}
          {data.personal?.portfolio && <span className="bg-white/10 px-2 py-0.5 rounded-full backdrop-blur-sm">{data.personal.portfolio}</span>}
        </div>
      </header>

      {/* Main Content Grid */}
      <div className="flex gap-4 overflow-hidden h-full">
        {/* Left Column */}
        <div className="w-[65%] flex flex-col gap-4 overflow-hidden">
          {data.summary && (
            <section className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 shrink-0">
              <h2 className="text-[calc(0.75rem*var(--font-scale,1))] font-bold text-violet-600 uppercase tracking-wider mb-2">About Me</h2>
              <p className="text-[calc(10.5px*var(--font-scale,1))] leading-relaxed text-gray-600">{data.summary}</p>
            </section>
          )}

          {data.experience?.length > 0 && (
            <section className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex-1 overflow-hidden">
              <h2 className="text-[calc(0.75rem*var(--font-scale,1))] font-bold text-violet-600 uppercase tracking-wider mb-3">Experience</h2>
              <div className="space-y-4">
                {data.experience.map((exp, i) => (
                  <div key={i} className="relative pl-4 border-l-2 border-violet-200">
                    <div className="absolute w-2.5 h-2.5 bg-violet-600 rounded-full -left-[5.5px] top-1 ring-4 ring-white"></div>
                    <div className="flex justify-between items-baseline mb-0.5">
                      <h3 className="font-bold text-[calc(12px*var(--font-scale,1))] text-gray-900">{exp.jobTitle}</h3>
                      <span className="text-[calc(9px*var(--font-scale,1))] font-bold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full">
                        {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                      </span>
                    </div>
                    <div className="text-[calc(10px*var(--font-scale,1))] font-medium text-gray-500 mb-1">
                      {exp.company} {exp.location && `• ${exp.location}`}
                    </div>
                    {exp.description && <p className="text-[calc(10px*var(--font-scale,1))] text-gray-600 mb-1.5">{exp.description}</p>}
                    {exp.achievements?.length > 0 && (
                      <ul className="text-[calc(10px*var(--font-scale,1))] text-gray-600 space-y-1">
                        {exp.achievements.map((ach, j) => (
                          <li key={j} className="flex gap-2 leading-tight">
                            <span className="text-violet-400 mt-0.5">▹</span> {ach}
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

        {/* Right Column */}
        <div className="w-[35%] flex flex-col gap-4 overflow-hidden">
          {data.skills?.length > 0 && (
            <section className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 shrink-0">
              <h2 className="text-[calc(0.75rem*var(--font-scale,1))] font-bold text-violet-600 uppercase tracking-wider mb-3">Skills</h2>
              <div className="flex flex-wrap gap-1.5">
                {data.skills.map((skill, i) => (
                  <span key={i} className="text-[calc(9.5px*var(--font-scale,1))] font-semibold text-gray-700 bg-gray-100 px-2.5 py-1 rounded-lg">
                    {skill}
                  </span>
                ))}
              </div>
            </section>
          )}

          {data.projects?.length > 0 && (
            <section className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex-1 overflow-hidden">
              <h2 className="text-[calc(0.75rem*var(--font-scale,1))] font-bold text-violet-600 uppercase tracking-wider mb-3">Projects</h2>
              <div className="space-y-3">
                {data.projects.map((proj, i) => (
                  <div key={i} className="group">
                    <h3 className="font-bold text-[calc(11px*var(--font-scale,1))] text-gray-900 mb-0.5">{proj.name}</h3>
                    {proj.description && <p className="text-[calc(9.5px*var(--font-scale,1))] text-gray-500 leading-tight mb-1.5">{proj.description}</p>}
                    {proj.technologies?.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {proj.technologies.map((tech, k) => (
                          <span key={k} className="text-[calc(8px*var(--font-scale,1))] font-medium text-violet-600 bg-violet-50 px-1.5 py-0.5 rounded text-center border border-violet-100">
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
            <section className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 shrink-0">
              <h2 className="text-[calc(0.75rem*var(--font-scale,1))] font-bold text-violet-600 uppercase tracking-wider mb-3">Education</h2>
              <div className="space-y-2.5">
                {data.education.map((edu, i) => (
                  <div key={i}>
                    <h3 className="font-bold text-[calc(10.5px*var(--font-scale,1))] text-gray-900">{edu.degree}</h3>
                    <div className="text-[calc(10px*var(--font-scale,1))] text-gray-500 mb-0.5">{edu.institution}</div>
                    <div className="text-[calc(9px*var(--font-scale,1))] text-violet-500 font-medium">{edu.startDate} – {edu.endDate}</div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};
