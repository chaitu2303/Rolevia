'use client';

import type { ResumeContent } from '@/lib/ai/resume-schema';

interface ResumePreviewProps {
  content: ResumeContent;
}

export function ResumePreview({ content }: ResumePreviewProps) {
  const sections = content?.sections ?? [];
  const contact = sections.find(s => s.type === 'contact');
  const summary = sections.find(s => s.type === 'summary');
  const experience = sections.find(s => s.type === 'experience');
  const education = sections.find(s => s.type === 'education');
  const skills = sections.find(s => s.type === 'skills');
  const projects = sections.find(s => s.type === 'projects');
  const certs = sections.find(s => s.type === 'certifications');

  const margins = content?.margins ?? { top: 20, bottom: 20, left: 20, right: 20 };
  const fontSize = content?.fontSize ?? 10;
  const lineSpacing = content?.lineSpacing ?? 1.4;
  const templateId = content?.templateId ?? 'clean';

  const accentColor = {
    emerald: '#059669',
    indigo: '#4f46e5',
    amber: '#d97706',
    default: '#1f2937'
  }[content?.accentColor as 'emerald' | 'indigo' | 'amber' | 'default'] || '#1f2937';

  const font = content?.font ?? 'Inter, sans-serif';
  const pageWidth = content?.pageSize === 'letter' ? '215.9mm' : '210mm';
  const pageMinHeight = content?.pageSize === 'letter' ? '279.4mm' : '297mm';

  const isMinimal = templateId === 'minimal';
  const isTechnical = templateId === 'technical';

  const sectionHeader = (title: string) => (
    <div className="mb-2">
      <h2
        className={`font-bold uppercase tracking-wider border-b-2`}
        style={{
          fontSize: `${fontSize + 1.5}px`,
          paddingBottom: '2px',
          marginBottom: '6px',
          color: accentColor,
          borderColor: isMinimal ? 'transparent' : accentColor,
          textAlign: isMinimal ? 'center' : 'left'
        }}
      >
        {title}
      </h2>
    </div>
  );

  const renderContact = () => {
    if (!contact?.visible || contact.type !== 'contact') return null;
    return (
      <div className={`mb-5 ${isMinimal ? 'text-center' : 'text-left'}`}>
        <h1
          className="font-black tracking-tight"
          style={{ fontSize: `${fontSize + 12}px`, marginBottom: '4px', color: '#111827' }}
        >
          {contact.data.name || 'Your Name'}
        </h1>
        <div 
          className={`flex flex-wrap gap-x-3 gap-y-0.5 text-gray-500 ${isMinimal ? 'justify-center' : 'justify-start'}`} 
          style={{ fontSize: `${fontSize - 1.5}px` }}
        >
          {contact.data.email && <span>{contact.data.email}</span>}
          {contact.data.phone && <><span>·</span><span>{contact.data.phone}</span></>}
          {contact.data.location && <><span>·</span><span>{contact.data.location}</span></>}
          {contact.data.linkedinUrl && <><span>·</span><span className="text-blue-600">{contact.data.linkedinUrl.replace('https://', '')}</span></>}
          {contact.data.githubUrl && <><span>·</span><span className="text-blue-600">{contact.data.githubUrl.replace('https://', '')}</span></>}
        </div>
      </div>
    );
  };

  const renderSummary = () => {
    if (!summary?.visible || summary.type !== 'summary' || !summary.data.text) return null;
    return (
      <div className="mb-4">
        {sectionHeader('Summary')}
        <p className="text-gray-700 leading-relaxed" style={{ fontSize: `${fontSize}px` }}>{summary.data.text}</p>
      </div>
    );
  };

  const renderExperience = () => {
    if (!experience?.visible || experience.type !== 'experience' || experience.data.items.length === 0) return null;
    return (
      <div className="mb-4">
        {sectionHeader('Experience')}
        <div className="space-y-3">
          {experience.data.items.map((item, i) => (
            <div key={item.id ?? i}>
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-bold text-gray-900" style={{ fontSize: `${fontSize + 0.5}px` }}>{item.role}</div>
                  <div className="text-gray-600 italic font-medium">{item.company}</div>
                </div>
                {item.duration && (
                  <div className="text-gray-400 text-right shrink-0 ml-2 font-mono" style={{ fontSize: `${fontSize - 1}px` }}>
                    {item.duration}
                  </div>
                )}
              </div>
              {item.bullets.length > 0 && (
                <ul className="mt-1 space-y-0.5 list-disc list-outside ml-4 text-gray-700">
                  {item.bullets.map((b, bi) => (
                    <li key={bi} style={{ fontSize: `${fontSize}px` }}>{b}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderEducation = () => {
    if (!education?.visible || education.type !== 'education' || education.data.items.length === 0) return null;
    return (
      <div className="mb-4">
        {sectionHeader('Education')}
        <div className="space-y-2">
          {education.data.items.map((item, i) => (
            <div key={item.id ?? i} className="flex justify-between items-start">
              <div>
                <div className="font-bold text-gray-900">{item.degree}{item.field ? ` in ${item.field}` : ''}</div>
                <div className="text-gray-600 font-medium">{item.institution}</div>
                {item.gpa && <div className="text-gray-400 font-mono" style={{ fontSize: `${fontSize - 1.5}px` }}>GPA: {item.gpa}</div>}
              </div>
              {item.year && (
                <div className="text-gray-400 font-mono shrink-0 ml-2" style={{ fontSize: `${fontSize - 1}px` }}>{item.year}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderSkills = () => {
    if (!skills?.visible || skills.type !== 'skills' || skills.data.groups.length === 0) return null;
    return (
      <div className="mb-4">
        {sectionHeader('Skills')}
        <div className="space-y-1">
          {skills.data.groups.map((group, i) => (
            <div key={i} className="flex gap-2">
              <span className="font-bold text-gray-900 shrink-0" style={{ fontSize: `${fontSize}px` }}>{group.category}:</span>
              <span className="text-gray-700" style={{ fontSize: `${fontSize}px` }}>{group.skills.join(', ')}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderProjects = () => {
    if (!projects?.visible || projects.type !== 'projects' || projects.data.items.length === 0) return null;
    return (
      <div className="mb-4">
        {sectionHeader('Projects')}
        <div className="space-y-3">
          {projects.data.items.map((project, i) => (
            <div key={project.id ?? i}>
              <div className="flex items-baseline justify-between">
                <div className="flex items-baseline gap-2">
                  <span className="font-bold text-gray-900">{project.name}</span>
                  {project.techStack && project.techStack.length > 0 && (
                    <span className={`italic font-medium ${isTechnical ? 'font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded border' : 'text-gray-500'}`} style={{ fontSize: `${fontSize - 1}px` }}>
                      [{project.techStack.join(', ')}]
                    </span>
                  )}
                </div>
                {project.url && (
                  <span className="text-blue-600 font-mono shrink-0 ml-2" style={{ fontSize: `${fontSize - 1}px` }}>{project.url}</span>
                )}
              </div>
              {project.description && (
                <p className="text-gray-600 mt-0.5" style={{ fontSize: `${fontSize}px` }}>{project.description}</p>
              )}
              {project.bullets && project.bullets.length > 0 && (
                <ul className="mt-1 space-y-0.5 list-disc list-outside ml-4 text-gray-700">
                  {project.bullets.map((b, bi) => (
                    <li key={bi} style={{ fontSize: `${fontSize}px` }}>{b}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderCerts = () => {
    if (!certs?.visible || certs.type !== 'certifications' || certs.data.items.length === 0) return null;
    return (
      <div className="mb-4">
        {sectionHeader('Certifications')}
        <div className="space-y-1">
          {certs.data.items.map((cert, i) => (
            <div key={cert.id ?? i} className="flex justify-between items-baseline">
              <div>
                <span className="font-bold text-gray-900">{cert.name}</span>
                {cert.issuer && <span className="text-gray-600"> — {cert.issuer}</span>}
              </div>
              {cert.year && (
                <span className="text-gray-400 font-mono shrink-0 ml-2" style={{ fontSize: `${fontSize - 1}px` }}>{cert.year}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const visibleCount = sections.filter(s => s.visible).length;
  if (visibleCount === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-sm bg-white border border-dashed rounded-xl">
        Add sections to see your resume preview.
      </div>
    );
  }

  if (templateId === 'modern') {
    return (
      <div
        className="bg-white shadow-xl print:shadow-none transition-all duration-300"
        style={{
          fontFamily: font,
          fontSize: `${fontSize}px`,
          lineHeight: lineSpacing,
          padding: `${margins.top}mm ${margins.right}mm ${margins.bottom}mm ${margins.left}mm`,
          width: pageWidth,
          minHeight: pageMinHeight,
        }}
        id="resume-preview"
      >
        {renderContact()}
        <div className="grid grid-cols-12 gap-8 mt-6">
          <div className="col-span-4 space-y-6 border-r pr-6 border-slate-100">
            {renderSkills()}
            {renderEducation()}
            {renderCerts()}
          </div>
          <div className="col-span-8 space-y-6">
            {renderSummary()}
            {renderExperience()}
            {renderProjects()}
          </div>
        </div>
      </div>
    );
  }

  if (templateId === 'student') {
    return (
      <div
        className="bg-white shadow-xl print:shadow-none transition-all duration-300"
        style={{
          fontFamily: font,
          fontSize: `${fontSize}px`,
          lineHeight: lineSpacing,
          padding: `${margins.top}mm ${margins.right}mm ${margins.bottom}mm ${margins.left}mm`,
          width: pageWidth,
          minHeight: pageMinHeight,
        }}
        id="resume-preview"
      >
        {renderContact()}
        {renderSummary()}
        {renderEducation()}
        {renderExperience()}
        {renderProjects()}
        {renderSkills()}
        {renderCerts()}
      </div>
    );
  }

  return (
    <div
      className="bg-white shadow-xl print:shadow-none transition-all duration-300"
      style={{
        fontFamily: font,
        fontSize: `${fontSize}px`,
        lineHeight: lineSpacing,
        padding: `${margins.top}mm ${margins.right}mm ${margins.bottom}mm ${margins.left}mm`,
        width: pageWidth,
        minHeight: pageMinHeight,
      }}
      id="resume-preview"
    >
      {renderContact()}
      {renderSummary()}
      {renderExperience()}
      {renderProjects()}
      {renderEducation()}
      {renderSkills()}
      {renderCerts()}
    </div>
  );
}
