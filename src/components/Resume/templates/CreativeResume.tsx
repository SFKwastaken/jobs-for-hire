import React from 'react';
import type { ResumeData } from '../../../types/resume';

export const CreativeResume = ({ data }: { data: ResumeData }) => {
  return (
    <div className="flex flex-col h-full font-sans bg-amber-50 text-gray-900 overflow-hidden">
      {/* Header */}
      <header className="p-5 flex justify-between items-end border-b-4 border-amber-500 bg-white shadow-sm shrink-0">
        <div>
          <h1 className="text-[calc(1.875rem*var(--font-scale,1))] font-black text-amber-900 tracking-tighter uppercase mb-0.5">{data.personal?.fullName || 'Your Name'}</h1>
          {data.personal?.professionalTitle && <div className="text-[calc(0.875rem*var(--font-scale,1))] font-bold text-amber-600 uppercase tracking-widest">{data.personal.professionalTitle}</div>}
        </div>
        <div className="text-right text-[calc(10px*var(--font-scale,1))] font-medium text-gray-600 flex flex-col gap-0.5">
          {data.personal?.email && <span>{data.personal.email}</span>}
          {data.personal?.phone && <span>{data.personal.phone}</span>}
          {data.personal?.location && <span>{data.personal.location}</span>}
          {data.personal?.portfolio && <span className="text-amber-600">{data.personal.portfolio}</span>}
        </div>
      </header>

      <div className="flex flex-1 p-5 gap-6 overflow-hidden">
        {/* Left Column */}
        <div className="w-[30%] flex flex-col gap-5 shrink-0">
          {data.skills?.length > 0 && (
            <section>
              <h2 className="text-[calc(0.75rem*var(--font-scale,1))] font-black uppercase text-amber-900 mb-2 border-b-2 border-amber-200 pb-1">Expertise</h2>
              <div className="flex flex-wrap gap-1.5">
                {data.skills.map((skill, i) => (
                  <span key={i} className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded-sm text-[calc(9px*var(--font-scale,1))] font-bold uppercase tracking-wider">
                    {skill}
                  </span>
                ))}
              </div>
            </section>
          )}

          {data.education?.length > 0 && (
            <section>
              <h2 className="text-[calc(0.75rem*var(--font-scale,1))] font-black uppercase text-amber-900 mb-2 border-b-2 border-amber-200 pb-1">Education</h2>
              <div className="space-y-3">
                {data.education.map((edu, i) => (
                  <div key={i}>
                    <div className="font-bold text-[calc(10px*var(--font-scale,1))] text-gray-800">{edu.degree}</div>
                    <div className="text-[calc(9px*var(--font-scale,1))] text-amber-700 font-medium">{edu.institution}</div>
                    <div className="text-[calc(9px*var(--font-scale,1))] text-gray-500">{edu.startDate} – {edu.endDate}</div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right Column */}
        <div className="w-[70%] flex flex-col gap-4">
          {data.summary && (
            <section>
              <p className="text-[calc(10px*var(--font-scale,1))] leading-tight font-medium text-gray-700 italic border-l-2 border-amber-400 pl-3">
                "{data.summary}"
              </p>
            </section>
          )}

          {data.experience?.length > 0 && (
            <section>
              <h2 className="text-[calc(0.75rem*var(--font-scale,1))] font-black uppercase text-amber-900 mb-2 border-b-2 border-amber-200 pb-1">Experience</h2>
              <div className="space-y-3">
                {data.experience.map((exp, i) => (
                  <div key={i} className="relative">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <h3 className="font-bold text-[calc(11px*var(--font-scale,1))] text-gray-900">{exp.jobTitle}</h3>
                      <span className="text-[calc(9px*var(--font-scale,1))] font-bold text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded">
                        {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                      </span>
                    </div>
                    <div className="text-[calc(10px*var(--font-scale,1))] font-bold text-gray-600 mb-0.5">
                      {exp.company} {exp.location && <span className="font-normal text-gray-400">| {exp.location}</span>}
                    </div>
                    {exp.description && <p className="text-[calc(10px*var(--font-scale,1))] text-gray-700 mb-1">{exp.description}</p>}
                    {exp.achievements?.length > 0 && (
                      <ul className="list-disc list-outside ml-3.5 text-[calc(9.5px*var(--font-scale,1))] text-gray-700 space-y-0.5">
                        {exp.achievements.map((ach, j) => (
                          <li key={j} className="leading-tight">{ach}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {data.projects?.length > 0 && (
            <section>
              <h2 className="text-[calc(0.75rem*var(--font-scale,1))] font-black uppercase text-amber-900 mb-2 border-b-2 border-amber-200 pb-1">Featured Projects</h2>
              <div className="grid grid-cols-2 gap-3">
                {data.projects.map((proj, i) => (
                  <div key={i} className="bg-white p-2 rounded shadow-sm border border-amber-100 border-l-4 border-l-amber-400">
                    <h3 className="font-bold text-[calc(10px*var(--font-scale,1))] text-gray-900 mb-0.5">{proj.name}</h3>
                    {proj.description && <p className="text-[calc(9px*var(--font-scale,1))] text-gray-600 leading-tight mb-1">{proj.description}</p>}
                    {proj.technologies?.length > 0 && (
                      <div className="text-[calc(8px*var(--font-scale,1))] text-amber-700 font-medium">Tech: {proj.technologies.join(', ')}</div>
                    )}
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
