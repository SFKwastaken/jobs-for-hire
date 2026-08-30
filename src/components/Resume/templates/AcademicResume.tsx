import React from 'react';
import type { ResumeData } from '../../../types/resume';

export const AcademicResume = ({ data }: { data: ResumeData }) => {
  return (
    <div className="flex flex-col h-full font-serif bg-white text-black overflow-hidden p-8 px-10">
      {/* Header */}
      <header className="text-center mb-5 pb-3 border-b-2 border-double border-gray-400">
        <h1 className="text-[calc(1.5rem*var(--font-scale,1))] font-bold uppercase tracking-wide mb-1">{data.personal?.fullName || 'Your Name'}</h1>
        
        <div className="flex flex-wrap justify-center items-center gap-x-2 gap-y-1 text-[calc(10px*var(--font-scale,1))] text-gray-800">
          {data.personal?.location && <span>{data.personal.location}</span>}
          {data.personal?.location && (data.personal.phone || data.personal.email) && <span>•</span>}
          {data.personal?.phone && <span>{data.personal.phone}</span>}
          {data.personal?.phone && data.personal.email && <span>•</span>}
          {data.personal?.email && <span>{data.personal.email}</span>}
        </div>
        {(data.personal?.linkedin || data.personal?.portfolio) && (
          <div className="flex flex-wrap justify-center items-center gap-x-2 text-[calc(10px*var(--font-scale,1))] text-gray-800 mt-1">
            {data.personal?.linkedin && <span>LinkedIn: {data.personal.linkedin}</span>}
            {data.personal?.linkedin && data.personal?.portfolio && <span>•</span>}
            {data.personal?.portfolio && <span>Portfolio: {data.personal.portfolio}</span>}
          </div>
        )}
      </header>

      {/* Main Content */}
      <div className="flex flex-col gap-3">
        {data.education?.length > 0 && (
          <section>
            <h2 className="text-[calc(12px*var(--font-scale,1))] font-bold uppercase tracking-widest text-black mb-2 pb-0.5 border-b border-gray-300 text-center">Education</h2>
            <div className="space-y-3">
              {data.education.map((edu, i) => (
                <div key={i} className="flex justify-between items-start">
                  <div className="w-[80%]">
                    <div className="font-bold text-[calc(11px*var(--font-scale,1))] text-black">{edu.institution}</div>
                    <div className="text-[calc(10px*var(--font-scale,1))] italic text-gray-800">{edu.degree} in {edu.field}</div>
                    {edu.description && <p className="text-[calc(9.5px*var(--font-scale,1))] text-gray-700 mt-0.5 leading-tight">{edu.description}</p>}
                  </div>
                  <div className="w-[20%] text-right text-[calc(10px*var(--font-scale,1))] text-gray-700 whitespace-nowrap">
                    {edu.startDate} – {edu.endDate}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {data.experience?.length > 0 && (
          <section>
            <h2 className="text-[calc(12px*var(--font-scale,1))] font-bold uppercase tracking-widest text-black mb-2 pb-0.5 border-b border-gray-300 text-center">Academic & Professional Experience</h2>
            <div className="space-y-3">
              {data.experience.map((exp, i) => (
                <div key={i}>
                  <div className="flex justify-between items-baseline mb-0.5">
                    <div className="font-bold text-[calc(11px*var(--font-scale,1))] text-black">
                      {exp.jobTitle}, <span className="italic font-normal">{exp.company}</span>
                    </div>
                    <div className="text-[calc(10px*var(--font-scale,1))] text-gray-700 whitespace-nowrap">
                      {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                    </div>
                  </div>
                  <div className="text-[calc(9.5px*var(--font-scale,1))] text-gray-600 mb-1">{exp.location}</div>
                  {exp.achievements?.length > 0 ? (
                    <ul className="list-disc list-outside ml-4 text-[calc(9.5px*var(--font-scale,1))] text-gray-800 space-y-0.5">
                      {exp.achievements.map((ach, j) => (
                        <li key={j} className="leading-tight pl-1">{ach}</li>
                      ))}
                    </ul>
                  ) : (
                    exp.description && <p className="text-[calc(9.5px*var(--font-scale,1))] text-gray-800 leading-tight">{exp.description}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {data.projects?.length > 0 && (
          <section>
            <h2 className="text-[calc(12px*var(--font-scale,1))] font-bold uppercase tracking-widest text-black mb-2 pb-0.5 border-b border-gray-300 text-center">Research & Projects</h2>
            <div className="space-y-2.5">
              {data.projects.map((proj, i) => (
                <div key={i}>
                  <div className="font-bold text-[calc(11px*var(--font-scale,1))] text-black mb-0.5">{proj.name}</div>
                  {proj.description && <p className="text-[calc(9.5px*var(--font-scale,1))] text-gray-800 leading-tight">{proj.description}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {data.skills?.length > 0 && (
          <section>
            <h2 className="text-[calc(12px*var(--font-scale,1))] font-bold uppercase tracking-widest text-black mb-2 pb-0.5 border-b border-gray-300 text-center">Technical Skills</h2>
            <p className="text-[calc(10px*var(--font-scale,1))] text-gray-800 leading-relaxed text-center">
              {data.skills.join(' • ')}
            </p>
          </section>
        )}
        
        {data.summary && (
          <section>
             <h2 className="text-[calc(12px*var(--font-scale,1))] font-bold uppercase tracking-widest text-black mb-2 pb-0.5 border-b border-gray-300 text-center">Abstract / Summary</h2>
            <p className="text-[calc(10px*var(--font-scale,1))] leading-relaxed text-justify text-gray-800">
              {data.summary}
            </p>
          </section>
        )}
      </div>
    </div>
  );
};
