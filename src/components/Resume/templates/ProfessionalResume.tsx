import React from 'react';
import type { ResumeData } from '../../../types/resume';

export const ProfessionalResume = ({ data }: { data: ResumeData }) => {
  return (
    <div className="flex h-full font-sans text-gray-800">
      {/* Left Dark Sidebar */}
      <div className="w-[32%] bg-[#2a303c] text-white p-4 flex flex-col gap-4 h-full shrink-0">
        <div className="mb-1 border-b border-white/20 pb-4 shrink-0">
          <h1 className="text-[calc(1.25rem*var(--font-scale,1))] font-bold leading-tight tracking-tight mb-1">{data.personal?.fullName || 'Your Name'}</h1>
          {data.personal?.professionalTitle && <div className="text-[calc(0.875rem*var(--font-scale,1))] text-emerald-400 font-medium">{data.personal.professionalTitle}</div>}
        </div>

        <div className="flex flex-col gap-2 text-[calc(0.75rem*var(--font-scale,1))] text-white/80">
          <h2 className="text-white font-bold tracking-widest uppercase mb-1 border-b border-white/20 pb-1">Contact</h2>
          {data.personal?.email && <div>{data.personal.email}</div>}
          {data.personal?.phone && <div>{data.personal.phone}</div>}
          {data.personal?.location && <div>{data.personal.location}</div>}
        </div>

        <div className="flex flex-col gap-2 text-[calc(0.75rem*var(--font-scale,1))] text-white/80">
          <h2 className="text-white font-bold tracking-widest uppercase mb-1 border-b border-white/20 pb-1">Links</h2>
          {data.personal?.linkedin && <div className="truncate">{data.personal.linkedin}</div>}
          {data.personal?.portfolio && <div className="truncate">{data.personal.portfolio}</div>}
        </div>

        {data.skills?.length > 0 && (
          <div>
            <h2 className="text-white font-bold tracking-widest uppercase mb-2 border-b border-white/20 pb-1">Key Skills</h2>
            <ul className="flex flex-col gap-1.5 text-[calc(0.75rem*var(--font-scale,1))] text-white/80">
              {data.skills.map((skill, i) => (
                <li key={i} className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-emerald-400 rounded-full"></div>
                  {skill}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {data.education?.length > 0 && (
          <div>
            <h2 className="text-white font-bold tracking-widest uppercase mb-2 border-b border-white/20 pb-1">Education</h2>
            <div className="space-y-2.5">
              {data.education.map((edu, i) => (
                <div key={i} className="text-[calc(10px*var(--font-scale,1))]">
                  <div className="font-bold text-white mb-0.5">{edu.degree}</div>
                  <div className="text-emerald-400">{edu.institution}</div>
                  <div className="text-white/60 mt-0.5">{edu.startDate} – {edu.endDate}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right Main Content */}
      <div className="w-[68%] bg-white p-5 flex flex-col gap-4 overflow-hidden">
        {data.summary && (
          <div className="shrink-0">
            <h2 className="text-[calc(13px*var(--font-scale,1))] font-bold tracking-widest text-[#2a303c] uppercase mb-1.5 flex items-center gap-2">
              About Me
              <div className="h-px bg-gray-200 flex-1 ml-4"></div>
            </h2>
            <p className="text-[calc(10px*var(--font-scale,1))] leading-tight text-gray-700 text-justify">{data.summary}</p>
          </div>
        )}

        {data.experience?.length > 0 && (
          <div className="mb-2">
            <h2 className="text-[calc(13px*var(--font-scale,1))] font-bold tracking-widest text-[#2a303c] uppercase mb-2 flex items-center gap-2 shrink-0">
              Professional Experience
              <div className="h-px bg-gray-200 flex-1 ml-4"></div>
            </h2>
            <div className="space-y-2.5">
              {data.experience.map((exp, i) => (
                <div key={i}>
                  <div className="flex justify-between items-baseline mb-0.5">
                    <h3 className="font-bold text-[calc(11px*var(--font-scale,1))] text-gray-900">{exp.jobTitle}</h3>
                    <span className="text-[calc(10px*var(--font-scale,1))] font-medium text-emerald-600 whitespace-nowrap">
                      {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                    </span>
                  </div>
                  <div className="text-[calc(10px*var(--font-scale,1))] font-medium text-gray-600 mb-0.5">
                    {exp.company} {exp.location && `| ${exp.location}`}
                  </div>
                  {exp.description && <p className="text-[calc(10px*var(--font-scale,1))] text-gray-700 mb-0.5">{exp.description}</p>}
                  {exp.achievements?.length > 0 && (
                    <ul className="list-disc list-outside ml-3.5 text-[calc(10px*var(--font-scale,1))] text-gray-700 space-y-0.5">
                      {exp.achievements.map((ach, j) => (
                        <li key={j} className="leading-tight">{ach}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {data.projects?.length > 0 && (
          <div className="mb-2">
            <h2 className="text-[calc(13px*var(--font-scale,1))] font-bold tracking-widest text-[#2a303c] uppercase mb-2 flex items-center gap-2">
              Projects
              <div className="h-px bg-gray-200 flex-1 ml-4"></div>
            </h2>
            <div className="space-y-2">
              {data.projects.map((proj, i) => (
                <div key={i}>
                  <div className="flex justify-between items-baseline mb-0.5">
                    <h3 className="font-bold text-[calc(11px*var(--font-scale,1))] text-gray-900">{proj.name}</h3>
                  </div>
                  {proj.description && <p className="text-[calc(10px*var(--font-scale,1))] text-gray-700 my-0.5 leading-tight">{proj.description}</p>}
                  {proj.technologies?.length > 0 && (
                    <p className="text-[calc(9px*var(--font-scale,1))] font-medium text-gray-500 mt-0.5">Technologies: {proj.technologies.join(', ')}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
