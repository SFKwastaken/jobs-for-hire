import React, { forwardRef, useEffect, useRef } from 'react';
import type { ResumeData, ResumeTemplate } from '../../types/resume';

import { MinimalResume } from './templates/MinimalResume';
import { ModernResume } from './templates/ModernResume';
import { ProfessionalResume } from './templates/ProfessionalResume';
import { CreativeResume } from './templates/CreativeResume';
import { ExecutiveResume } from './templates/ExecutiveResume';
import { TechResume } from './templates/TechResume';
import { AcademicResume } from './templates/AcademicResume';
import { StartupResume } from './templates/StartupResume';
import { ElegantResume } from './templates/ElegantResume';
import { ClassicResume } from './templates/ClassicResume';

interface Props {
  data: ResumeData;
  template: ResumeTemplate;
  hideWrapper?: boolean;
}

export const ResumePreview = forwardRef<HTMLDivElement, Props>(({ data, template, hideWrapper = false }, ref) => {
  const localContainerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const setRefs = (element: HTMLDivElement) => {
    localContainerRef.current = element;
    if (typeof ref === 'function') {
      ref(element);
    } else if (ref) {
      ref.current = element;
    }
  };

  useEffect(() => {
    if (!localContainerRef.current || !contentRef.current) return;
    
    let scale = 1.0;
    const content = contentRef.current;
    const container = localContainerRef.current;
    
    // Reset scale
    content.style.setProperty('--font-scale', '1');
    
    // Wait a tick for the DOM to update
    const timer = setTimeout(() => {
      const containerH = container.clientHeight;
      const templateEl = content.firstElementChild as HTMLElement;
      if (!templateEl) return;

      // Temporarily remove h-full constraints to measure natural height
      templateEl.style.height = 'auto';
      templateEl.style.minHeight = '0';
      
      let contentH = templateEl.offsetHeight;
      
      // Auto-scale to fit
      if (contentH > containerH) {
        // Shrink
        while (contentH > containerH && scale > 0.45) {
          scale -= 0.02;
          content.style.setProperty('--font-scale', scale.toString());
          contentH = templateEl.offsetHeight; // Force reflow
        }
      } else if (contentH < containerH * 0.85) {
        // Grow
        while (contentH < containerH * 0.95 && scale < 1.3) {
          scale += 0.02;
          content.style.setProperty('--font-scale', scale.toString());
          contentH = templateEl.offsetHeight;
        }
      }
      
      // Restore the template layout so backgrounds stretch!
      templateEl.style.height = '';
      templateEl.style.minHeight = '';
    }, 10);
    
    return () => clearTimeout(timer);
  }, [data, template]);

  const innerContent = (
    <div 
      ref={setRefs} 
      className="w-[210mm] h-[297mm] overflow-hidden bg-white mx-auto shadow-2xl print:shadow-none print:w-[210mm] print:h-[297mm]"
    >
      <div ref={contentRef} className="w-full h-full">
        {template === 'modern' && <ModernResume data={data} />}
        {template === 'professional' && <ProfessionalResume data={data} />}
        {template === 'minimal' && <MinimalResume data={data} />}
        {template === 'creative' && <CreativeResume data={data} />}
        {template === 'executive' && <ExecutiveResume data={data} />}
        {template === 'tech' && <TechResume data={data} />}
        {template === 'academic' && <AcademicResume data={data} />}
        {template === 'startup' && <StartupResume data={data} />}
        {template === 'elegant' && <ElegantResume data={data} />}
        {template === 'classic' && <ClassicResume data={data} />}
      </div>
    </div>
  );

  if (hideWrapper) {
    return innerContent;
  }

  return (
    <div className="w-full h-full bg-zinc-900 flex justify-center overflow-auto shadow-2xl print:shadow-none print:bg-white pt-8 pb-12 print:p-0">
      {innerContent}
    </div>
  );
});

ResumePreview.displayName = 'ResumePreview';
