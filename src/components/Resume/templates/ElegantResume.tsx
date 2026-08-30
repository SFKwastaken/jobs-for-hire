import React from 'react';
import type { ResumeData } from '../../../types/resume';

export const ElegantResume = ({ data }: { data: ResumeData }) => {
  return (
    <div className="flex flex-col h-full font-serif bg-[#faf9f6] text-[#2c3e50] overflow-hidden p-8 px-12">
      {/* Header */}
      <header className="text-center mb-6 shrink-0">
        <h1 className="text-[calc(2.25rem*var(--font-scale,1))] font-light tracking-[0.2em] uppercase text-[#1a252f] mb-2">{data.personal?.fullName || 'Your Name'}</h1>
        {data.personal?.professionalTitle && (
          <div className="text-[calc(0.75rem*var(--font-scale,1))] tracking-[0.3em] text-[#7f8c8d] uppercase mb-4">{data.personal.professionalTitle}</div>
        )}
        
        <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-2 text-[calc(9px*var(--font-scale,1))] tracking-wider text-[#95a5a6] uppercase">
          {data.personal?.email && <span>{data.personal.email}</span>}
          {data.personal?.phone && <span>{data.personal.phone}</span>}
          {data.personal?.location && <span>{data.personal.location}</span>}
          {data.personal?.linkedin && <span>{data.personal.linkedin}</span>}
        </div>
        <div className="w-12 h-px bg-[#bdc3c7] mx-auto mt-4"></div>
      </header>

      {/* Main Content */}
      <div className="flex flex-col gap-4 overflow-hidden">
        {data.summary && (
          <section className="text-center shrink-0">
            <p className="text-[calc(10px*var(--font-scale,1))] leading-relaxed text-[#34495e] italic max-w-3xl mx-auto">
              {data.summary}
            </p>
          </section>
        )}

        <div className="flex gap-8 overflow-hidden h-full">
          {/* Left Column (Experience & Projects) */}
          <div className="w-[60%] flex flex-col gap-5 overflow-hidden">
            {data.experience?.length > 0 && (
              <section className="overflow-hidden">
                <h2 className="text-[calc(10px*var(--font-scale,1))] font-bold uppercase tracking-[0.2em] text-[#7f8c8d] mb-4 flex items-center gap-4">
                  Experience
                  <span className="flex-1 h-px bg-[#ecf0f1]"></span>
                </h2>
                <div className="space-y-4">
                  {data.experience.map((exp, i) => (
                    <div key={i}>
                      <div className="flex justify-between items-baseline mb-1">
                        <h3 className="font-semibold text-[calc(11px*var(--font-scale,1))] text-[#2c3e50]">{exp.jobTitle}</h3>
                        <span className="text-[calc(9px*var(--font-scale,1))] tracking-wider text-[#95a5a6] uppercase">
                          {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                        </span>
                      </div>
                      <div className="text-[calc(10px*var(--font-scale,1))] text-[#7f8c8d] mb-1.5 uppercase tracking-wide">
                        {exp.company} <span className="lowercase normal-case font-serif italic text-[#95a5a6]">{exp.location && `in ${exp.location}`}</span>
                      </div>
                      {exp.description && <p className="text-[calc(10px*var(--font-scale,1))] text-[#34495e] mb-1.5 leading-relaxed">{exp.description}</p>}
                      {exp.achievements?.length > 0 && (
                        <ul className="list-disc list-outside ml-4 text-[calc(9.5px*var(--font-scale,1))] text-[#34495e] space-y-1">
                          {exp.achievements.map((ach, j) => (
                            <li key={j} className="leading-relaxed pl-1">{ach}</li>
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
                <h2 className="text-[calc(10px*var(--font-scale,1))] font-bold uppercase tracking-[0.2em] text-[#7f8c8d] mb-4 flex items-center gap-4">
                  Projects
                  <span className="flex-1 h-px bg-[#ecf0f1]"></span>
                </h2>
                <div className="space-y-3">
                  {data.projects.map((proj, i) => (
                    <div key={i}>
                      <h3 className="font-semibold text-[calc(11px*var(--font-scale,1))] text-[#2c3e50] mb-0.5">{proj.name}</h3>
                      {proj.description && <p className="text-[calc(10px*var(--font-scale,1))] text-[#34495e] leading-relaxed mb-1">{proj.description}</p>}
                      {proj.technologies?.length > 0 && (
                        <p className="text-[calc(8.5px*var(--font-scale,1))] uppercase tracking-widest text-[#95a5a6]">{proj.technologies.join(' · ')}</p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Right Column (Education & Skills) */}
          <div className="w-[40%] flex flex-col gap-5 overflow-hidden">
            {data.education?.length > 0 && (
              <section className="shrink-0">
                <h2 className="text-[calc(10px*var(--font-scale,1))] font-bold uppercase tracking-[0.2em] text-[#7f8c8d] mb-4 flex items-center gap-4">
                  Education
                  <span className="flex-1 h-px bg-[#ecf0f1]"></span>
                </h2>
                <div className="space-y-4">
                  {data.education.map((edu, i) => (
                    <div key={i}>
                      <h3 className="font-semibold text-[calc(11px*var(--font-scale,1))] text-[#2c3e50] mb-0.5">{edu.degree}</h3>
                      <div className="text-[calc(10px*var(--font-scale,1))] text-[#7f8c8d] mb-1">{edu.institution}</div>
                      <div className="text-[calc(9px*var(--font-scale,1))] tracking-wider text-[#95a5a6] uppercase">{edu.startDate} – {edu.endDate}</div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {data.skills?.length > 0 && (
              <section className="shrink-0">
                <h2 className="text-[calc(10px*var(--font-scale,1))] font-bold uppercase tracking-[0.2em] text-[#7f8c8d] mb-4 flex items-center gap-4">
                  Expertise
                  <span className="flex-1 h-px bg-[#ecf0f1]"></span>
                </h2>
                <div className="flex flex-col gap-2">
                  {data.skills.map((skill, i) => (
                    <div key={i} className="text-[calc(10px*var(--font-scale,1))] text-[#34495e] tracking-wide">
                      {skill}
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
