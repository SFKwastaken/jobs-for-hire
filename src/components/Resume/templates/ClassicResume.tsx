import React from 'react';
import type { ResumeData } from '../../../types/resume';

export const ClassicResume = ({ data }: { data: ResumeData }) => {
  return (
    <div className="flex flex-col h-full font-serif bg-white text-black p-8 px-10 overflow-hidden">
      {/* Header */}
      <header className="text-center mb-5 shrink-0">
        <h1 className="text-[calc(1.5rem*var(--font-scale,1))] font-bold uppercase mb-1">{data.personal?.fullName || 'Your Name'}</h1>
        
        <div className="flex flex-wrap justify-center items-center gap-2 text-[calc(11px*var(--font-scale,1))] text-gray-800">
          {data.personal?.location && <span>{data.personal.location}</span>}
          {data.personal?.location && (data.personal.phone || data.personal.email) && <span>|</span>}
          {data.personal?.phone && <span>{data.personal.phone}</span>}
          {data.personal?.phone && data.personal.email && <span>|</span>}
          {data.personal?.email && <span>{data.personal.email}</span>}
          {data.personal?.linkedin && <><span>|</span><span>{data.personal.linkedin}</span></>}
          {data.personal?.portfolio && <><span>|</span><span>{data.personal.portfolio}</span></>}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-col gap-4">
        {data.summary && (
          <section className="shrink-0">
            <h2 className="text-[calc(12px*var(--font-scale,1))] font-bold uppercase border-b border-black mb-1.5 pb-0.5">Summary</h2>
            <p className="text-[calc(10px*var(--font-scale,1))] leading-relaxed text-justify text-gray-800">{data.summary}</p>
          </section>
        )}

        {data.experience?.length > 0 && (
          <section className="overflow-hidden">
            <h2 className="text-[calc(12px*var(--font-scale,1))] font-bold uppercase border-b border-black mb-2 pb-0.5">Experience</h2>
            <div className="space-y-3">
              {data.experience.map((exp, i) => (
                <div key={i}>
                  <div className="flex justify-between items-baseline mb-0.5">
                    <div className="font-bold text-[calc(11px*var(--font-scale,1))]">{exp.company} {exp.location && <span className="font-normal italic text-gray-700">- {exp.location}</span>}</div>
                    <div className="text-[calc(10px*var(--font-scale,1))] font-semibold">{exp.startDate} – {exp.current ? 'Present' : exp.endDate}</div>
                  </div>
                  <div className="text-[calc(10.5px*var(--font-scale,1))] italic mb-1 text-gray-800">{exp.jobTitle}</div>
                  {exp.description && <p className="text-[calc(10px*var(--font-scale,1))] text-gray-800 mb-1 leading-tight">{exp.description}</p>}
                  {exp.achievements?.length > 0 && (
                    <ul className="list-disc list-outside ml-4 text-[calc(10px*var(--font-scale,1))] text-gray-800 space-y-0.5">
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

        {data.projects?.length > 0 && (
          <section className="overflow-hidden">
            <h2 className="text-[calc(12px*var(--font-scale,1))] font-bold uppercase border-b border-black mb-2 pb-0.5">Projects</h2>
            <div className="space-y-2.5">
              {data.projects.map((proj, i) => (
                <div key={i}>
                  <div className="flex justify-between items-baseline mb-0.5">
                    <h3 className="font-bold text-[calc(11px*var(--font-scale,1))]">{proj.name}</h3>
                  </div>
                  {proj.description && <p className="text-[calc(10px*var(--font-scale,1))] text-gray-800 leading-tight mb-0.5">{proj.description}</p>}
                  {proj.technologies?.length > 0 && (
                    <div className="text-[calc(9px*var(--font-scale,1))] italic text-gray-600">Technologies: {proj.technologies.join(', ')}</div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {data.education?.length > 0 && (
          <section className="shrink-0">
            <h2 className="text-[calc(12px*var(--font-scale,1))] font-bold uppercase border-b border-black mb-2 pb-0.5">Education</h2>
            <div className="space-y-2">
              {data.education.map((edu, i) => (
                <div key={i} className="flex justify-between items-start">
                  <div>
                    <div className="font-bold text-[calc(11px*var(--font-scale,1))]">{edu.institution}</div>
                    <div className="text-[calc(10px*var(--font-scale,1))]">{edu.degree} in {edu.field}</div>
                  </div>
                  <div className="text-[calc(10px*var(--font-scale,1))] font-semibold">{edu.startDate} – {edu.endDate}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {data.skills?.length > 0 && (
          <section className="shrink-0">
            <h2 className="text-[calc(12px*var(--font-scale,1))] font-bold uppercase border-b border-black mb-2 pb-0.5">Skills</h2>
            <div className="text-[calc(10px*var(--font-scale,1))] text-gray-800 leading-relaxed">
              {data.skills.join(', ')}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
