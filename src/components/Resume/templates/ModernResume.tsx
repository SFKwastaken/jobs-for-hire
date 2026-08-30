import React from 'react';
import type { ResumeData } from '../../../types/resume';

export const ModernResume = ({ data }: { data: ResumeData }) => {
  return (
    <div className="flex flex-col h-full font-sans bg-white overflow-hidden">
      {/* Header */}
      <div className="bg-[#1e3a8a] text-white p-4 px-6">
        <h1 className="text-[calc(1.875rem*var(--font-scale,1))] font-light tracking-wide mb-1">{data.personal?.fullName?.toUpperCase() || 'YOUR NAME'}</h1>
        {data.personal?.professionalTitle && <div className="text-[calc(1.25rem*var(--font-scale,1))] text-blue-200 tracking-wider mb-2">{data.personal.professionalTitle}</div>}
        
        <div className="flex flex-wrap gap-4 text-[calc(0.75rem*var(--font-scale,1))] text-blue-100/80 mt-2">
          {data.personal?.email && <span className="flex items-center gap-1">✉ {data.personal.email}</span>}
          {data.personal?.phone && <span className="flex items-center gap-1">☎ {data.personal.phone}</span>}
          {data.personal?.location && <span className="flex items-center gap-1">📍 {data.personal.location}</span>}
          {data.personal?.linkedin && <span className="flex items-center gap-1">in/ {data.personal.linkedin}</span>}
        </div>
      </div>

      <div className="flex flex-1">
        {/* Left Sidebar */}
        <div className="w-[35%] bg-blue-50 p-4 pt-5 border-r border-blue-100 flex flex-col gap-4">
          {data.summary && (
            <div>
              <h2 className="bg-[#1e3a8a] text-white px-2 py-0.5 text-[calc(0.75rem*var(--font-scale,1))] font-bold tracking-widest inline-block rounded-full mb-2 uppercase">Profile</h2>
              <p className="text-[calc(10px*var(--font-scale,1))] leading-tight text-gray-700 text-justify">{data.summary}</p>
            </div>
          )}

          {data.skills?.length > 0 && (
            <div>
              <h2 className="bg-[#1e3a8a] text-white px-2 py-0.5 text-[calc(0.75rem*var(--font-scale,1))] font-bold tracking-widest inline-block rounded-full mb-2 uppercase">Skills</h2>
              <div className="flex flex-col gap-1.5">
                {data.skills.map((skill, i) => (
                  <div key={i} className="text-[calc(10px*var(--font-scale,1))] text-gray-700 border-b border-blue-100 pb-0.5">{skill}</div>
                ))}
              </div>
            </div>
          )}
          
          {data.education?.length > 0 && (
            <div>
              <h2 className="bg-[#1e3a8a] text-white px-2 py-0.5 text-[calc(0.75rem*var(--font-scale,1))] font-bold tracking-widest inline-block rounded-full mb-2 uppercase">Education</h2>
              <div className="space-y-2">
                {data.education.map((edu, i) => (
                  <div key={i}>
                    <div className="text-[calc(9px*var(--font-scale,1))] text-blue-600 font-bold mb-0.5">{edu.startDate} – {edu.endDate}</div>
                    <h3 className="font-bold text-[calc(10px*var(--font-scale,1))] text-gray-800">{edu.degree}</h3>
                    <div className="text-[calc(10px*var(--font-scale,1))] text-gray-600 italic">{edu.institution}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Main Content */}
        <div className="w-[65%] p-4 pt-5 flex flex-col gap-4">
          {data.experience?.length > 0 && (
            <div>
              <h2 className="text-[calc(13px*var(--font-scale,1))] font-bold text-[#1e3a8a] border-b-2 border-blue-100 pb-1 mb-2 flex items-center gap-2 uppercase tracking-wider">
                <span className="w-4 h-4 bg-[#1e3a8a] text-white rounded-md flex items-center justify-center text-[calc(10px*var(--font-scale,1))]">💼</span>
                Work Experience
              </h2>
              <div className="space-y-2.5">
                {data.experience.map((exp, i) => (
                  <div key={i} className="relative pl-3 border-l-2 border-blue-200">
                    <div className="absolute w-2 h-2 bg-white border-2 border-[#1e3a8a] rounded-full -left-[5px] top-1"></div>
                    <div className="text-[calc(10px*var(--font-scale,1))] text-gray-500 font-medium mb-0.5">{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</div>
                    <h3 className="font-bold text-[calc(11px*var(--font-scale,1))] text-gray-800 leading-tight">{exp.jobTitle}</h3>
                    <div className="text-[calc(10px*var(--font-scale,1))] text-blue-600 font-medium mb-0.5">{exp.company} {exp.location && `| ${exp.location}`}</div>
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
            <div>
              <h2 className="text-[calc(13px*var(--font-scale,1))] font-bold text-[#1e3a8a] border-b-2 border-blue-100 pb-1 mb-2 flex items-center gap-2 uppercase tracking-wider">
                <span className="w-4 h-4 bg-[#1e3a8a] text-white rounded-md flex items-center justify-center text-[calc(10px*var(--font-scale,1))]">🚀</span>
                Projects
              </h2>
              <div className="space-y-2">
                {data.projects.map((proj, i) => (
                  <div key={i}>
                    <h3 className="font-bold text-[calc(11px*var(--font-scale,1))] text-gray-800">{proj.name}</h3>
                    {proj.description && <p className="text-[calc(10px*var(--font-scale,1))] text-gray-700 my-0.5 leading-tight">{proj.description}</p>}
                    {proj.technologies?.length > 0 && (
                      <p className="text-[calc(9px*var(--font-scale,1))] text-blue-600 font-medium">Tech: {proj.technologies.join(', ')}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
