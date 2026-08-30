import React from 'react';
import type { ResumeData } from '../../../types/resume';

export const MinimalResume = ({ data }: { data: ResumeData }) => {
  return (
    <div className="p-[5mm] font-serif text-gray-900 h-full flex flex-col">
      <header className="text-center border-b-2 border-black pb-1 mb-2 shrink-0">
        <h1 className="text-[calc(1.25rem*var(--font-scale,1))] font-bold uppercase tracking-wider mb-0.5">{data.personal?.fullName || 'Your Name'}</h1>
        {data.personal?.professionalTitle && <div className="text-[calc(13px*var(--font-scale,1))] text-gray-700">{data.personal.professionalTitle}</div>}
        
        <div className="flex flex-wrap justify-center gap-x-2 gap-y-0.5 text-[calc(10px*var(--font-scale,1))] mt-1 text-gray-600">
          {data.personal?.email && <span>{data.personal.email}</span>}
          {data.personal?.phone && <><span>|</span><span>{data.personal.phone}</span></>}
          {data.personal?.location && <><span>|</span><span>{data.personal.location}</span></>}
          {data.personal?.linkedin && <><span>|</span><span className="text-black">{data.personal.linkedin}</span></>}
          {data.personal?.portfolio && <><span>|</span><span className="text-black">{data.personal.portfolio}</span></>}
        </div>
      </header>

      {data.summary && (
        <section className="mb-2 shrink-0">
          <p className="text-[calc(10px*var(--font-scale,1))] leading-tight text-justify">{data.summary}</p>
        </section>
      )}

      {data.experience?.length > 0 && (
        <section className="mb-2">
          <h2 className="text-[calc(13px*var(--font-scale,1))] font-bold uppercase tracking-widest border-b border-black pb-0.5 mb-1 shrink-0">Experience</h2>
          <div className="space-y-2">
            {data.experience.map((exp, i) => (
              <div key={i}>
                <div className="flex justify-between items-baseline mb-0.5">
                  <h3 className="font-bold text-[calc(11px*var(--font-scale,1))]">{exp.jobTitle}</h3>
                  <span className="text-[calc(10px*var(--font-scale,1))] font-medium">{exp.startDate} – {exp.current ? 'Present' : exp.endDate}</span>
                </div>
                <div className="flex justify-between items-baseline mb-0.5 text-[calc(10px*var(--font-scale,1))] italic text-gray-700">
                  <span>{exp.company}</span>
                  <span>{exp.location}</span>
                </div>
                {exp.description && <p className="text-[calc(10px*var(--font-scale,1))] mb-0.5">{exp.description}</p>}
                {exp.achievements?.length > 0 && (
                  <ul className="list-disc list-outside ml-3.5 text-[calc(10px*var(--font-scale,1))] space-y-0.5">
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
        <section className="mb-2">
          <h2 className="text-[calc(13px*var(--font-scale,1))] font-bold uppercase tracking-widest border-b border-black pb-0.5 mb-1 shrink-0">Projects</h2>
          <div className="space-y-2">
            {data.projects.map((proj, i) => (
              <div key={i}>
                <div className="flex justify-between items-baseline mb-0.5">
                  <h3 className="font-bold text-[calc(11px*var(--font-scale,1))]">{proj.name}</h3>
                  {proj.url && <span className="text-[calc(10px*var(--font-scale,1))]">{proj.url}</span>}
                </div>
                {proj.description && <p className="text-[calc(10px*var(--font-scale,1))] mb-0.5 leading-tight">{proj.description}</p>}
                {proj.technologies?.length > 0 && (
                  <p className="text-[calc(9px*var(--font-scale,1))] text-gray-600 mt-0.5">Technologies: {proj.technologies.join(', ')}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {data.education?.length > 0 && (
        <section className="mb-2">
          <h2 className="text-[calc(13px*var(--font-scale,1))] font-bold uppercase tracking-widest border-b border-black pb-0.5 mb-1 shrink-0">Education</h2>
          <div className="space-y-1.5">
            {data.education.map((edu, i) => (
              <div key={i} className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-[calc(11px*var(--font-scale,1))]">{edu.institution}</h3>
                  <div className="text-[calc(10px*var(--font-scale,1))] italic">{edu.degree} in {edu.field}</div>
                  {edu.description && <p className="text-[calc(10px*var(--font-scale,1))] mt-0.5 leading-tight">{edu.description}</p>}
                </div>
                <span className="text-[calc(10px*var(--font-scale,1))] font-medium whitespace-nowrap">{edu.startDate} – {edu.endDate}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {data.skills?.length > 0 && (
        <section className="mb-2 shrink-0">
          <h2 className="text-[calc(13px*var(--font-scale,1))] font-bold uppercase tracking-widest border-b border-black pb-0.5 mb-1 shrink-0">Skills</h2>
          <p className="text-[calc(10px*var(--font-scale,1))] leading-tight">{data.skills.join(' • ')}</p>
        </section>
      )}
    </div>
  );
};
