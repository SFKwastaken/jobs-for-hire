import React from 'react';
import type { ResumeData } from '../../../types/resume';

export const ExecutiveResume = ({ data }: { data: ResumeData }) => {
  return (
    <div className="flex flex-col h-full font-serif bg-white text-gray-900 overflow-hidden p-6">
      {/* Header */}
      <header className="text-center mb-4">
        <h1 className="text-[calc(1.875rem*var(--font-scale,1))] font-bold uppercase tracking-widest text-[#1a1a1a] mb-1">{data.personal?.fullName || 'Your Name'}</h1>
        {data.personal?.professionalTitle && <div className="text-[calc(0.875rem*var(--font-scale,1))] font-semibold tracking-wider text-gray-600 uppercase mb-2">{data.personal.professionalTitle}</div>}
        
        <div className="flex flex-wrap justify-center items-center gap-2 text-[calc(9px*var(--font-scale,1))] text-gray-500 uppercase tracking-widest border-t border-b border-gray-300 py-1">
          {data.personal?.email && <span>{data.personal.email}</span>}
          {data.personal?.phone && <><span>•</span><span>{data.personal.phone}</span></>}
          {data.personal?.location && <><span>•</span><span>{data.personal.location}</span></>}
          {data.personal?.linkedin && <><span>•</span><span>{data.personal.linkedin}</span></>}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-col gap-3">
        {data.summary && (
          <section>
            <p className="text-[calc(10px*var(--font-scale,1))] leading-relaxed text-justify text-gray-700 first-letter:text-[calc(1.5rem*var(--font-scale,1))] first-letter:font-bold first-letter:mr-1 first-letter:float-left">
              {data.summary}
            </p>
          </section>
        )}

        {data.experience?.length > 0 && (
          <section>
            <h2 className="text-[calc(0.75rem*var(--font-scale,1))] font-bold uppercase tracking-widest text-center text-[#1a1a1a] mb-2 border-b-2 border-black pb-1">Professional Experience</h2>
            <div className="space-y-3">
              {data.experience.map((exp, i) => (
                <div key={i}>
                  <div className="flex justify-between items-baseline mb-0.5">
                    <h3 className="font-bold text-[calc(11px*var(--font-scale,1))] text-black uppercase">{exp.company}</h3>
                    <span className="text-[calc(9px*var(--font-scale,1))] font-semibold tracking-wider text-gray-600 uppercase">
                      {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline mb-1">
                    <div className="text-[calc(10.5px*var(--font-scale,1))] italic text-gray-800 font-semibold">{exp.jobTitle}</div>
                    <div className="text-[calc(9px*var(--font-scale,1))] text-gray-500 uppercase tracking-wider">{exp.location}</div>
                  </div>
                  {exp.description && <p className="text-[calc(9.5px*var(--font-scale,1))] text-gray-700 mb-1 leading-tight">{exp.description}</p>}
                  {exp.achievements?.length > 0 && (
                    <ul className="list-disc list-outside ml-4 text-[calc(9.5px*var(--font-scale,1))] text-gray-700 space-y-0.5">
                      {exp.achievements.map((ach, j) => (
                        <li key={j} className="leading-tight pl-1">{ach}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="flex gap-4">
          <div className="w-1/2 flex flex-col gap-3">
            {data.projects?.length > 0 && (
              <section>
                <h2 className="text-[calc(0.75rem*var(--font-scale,1))] font-bold uppercase tracking-widest text-center text-[#1a1a1a] mb-2 border-b-2 border-black pb-1">Key Initiatives</h2>
                <div className="space-y-2">
                  {data.projects.map((proj, i) => (
                    <div key={i}>
                      <h3 className="font-bold text-[calc(10.5px*var(--font-scale,1))] text-black mb-0.5">{proj.name}</h3>
                      {proj.description && <p className="text-[calc(9px*var(--font-scale,1))] text-gray-700 leading-tight mb-0.5">{proj.description}</p>}
                      {proj.technologies?.length > 0 && (
                        <p className="text-[calc(8px*var(--font-scale,1))] uppercase tracking-wider text-gray-500">[{proj.technologies.join(' • ')}]</p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
          
          <div className="w-1/2 flex flex-col gap-3">
            {data.education?.length > 0 && (
              <section>
                <h2 className="text-[calc(0.75rem*var(--font-scale,1))] font-bold uppercase tracking-widest text-center text-[#1a1a1a] mb-2 border-b-2 border-black pb-1">Education</h2>
                <div className="space-y-2">
                  {data.education.map((edu, i) => (
                    <div key={i}>
                      <div className="font-bold text-[calc(10.5px*var(--font-scale,1))] text-black">{edu.institution}</div>
                      <div className="text-[calc(9.5px*var(--font-scale,1))] italic text-gray-800">{edu.degree}</div>
                      <div className="text-[calc(8px*var(--font-scale,1))] uppercase tracking-wider text-gray-500 mt-0.5">{edu.startDate} – {edu.endDate}</div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {data.skills?.length > 0 && (
              <section>
                <h2 className="text-[calc(0.75rem*var(--font-scale,1))] font-bold uppercase tracking-widest text-center text-[#1a1a1a] mb-2 border-b-2 border-black pb-1">Core Competencies</h2>
                <div className="flex flex-wrap gap-x-2 gap-y-1">
                  {data.skills.map((skill, i) => (
                    <span key={i} className="text-[calc(9px*var(--font-scale,1))] text-gray-700 uppercase tracking-widest border border-gray-200 px-1.5 py-0.5">
                      {skill}
                    </span>
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
