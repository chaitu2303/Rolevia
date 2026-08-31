export interface ResumeHealthScore {
  overallHealth: number; // 0-100
  dimensions: {
    content: number;
    ats: number;
    impact: number;
    clarity: number;
    evidence: number;
  };
  topImprovements: string[];
}

export function computeLiveResumeHealth(resumeData: any): ResumeHealthScore {
  // A fast, synchronous heuristic scorer for live resume health.
  // In a real app, this analyzes the current JSON state of the resume builder.
  
  let content = 0;
  let ats = 0;
  let impact = 0;
  let clarity = 0;
  let evidence = 0;
  const improvements: string[] = [];

  // Very basic heuristic simulation based on presence of data
  if (resumeData?.contact?.email && resumeData?.contact?.phone) {
    ats += 20;
    content += 10;
  } else {
    improvements.push('Add contact email and phone number for ATS parsing.');
  }

  const exps = resumeData?.experience || [];
  if (exps.length > 0) {
    content += 40;
    
    // Check for bullets and impact metrics
    let totalBullets = 0;
    let totalMetrics = 0;
    
    exps.forEach((exp: any) => {
      const bullets = exp.bullets || [];
      totalBullets += bullets.length;
      
      bullets.forEach((bullet: string) => {
        if (/\d+%|\$\d+|\d+x/i.test(bullet)) {
          totalMetrics++;
        }
      });
    });

    if (totalBullets > 3) ats += 30;
    if (totalBullets > 5) clarity += 40;
    
    if (totalMetrics > 0) {
      impact += Math.min(totalMetrics * 20, 50);
      evidence += Math.min(totalMetrics * 20, 50);
    } else {
      improvements.push('Quantify your experience bullets with numbers or percentages.');
    }
  } else {
    improvements.push('Add your work experience.');
  }

  const skills = resumeData?.skills || [];
  if (skills.length > 5) {
    ats += 30;
    content += 30;
    evidence += 20;
  } else {
    improvements.push('Add more relevant skills to pass ATS filters.');
  }

  // Ensure values don't exceed 100 or fall below 0
  const clamp = (val: number) => Math.max(0, Math.min(100, val));
  
  content = clamp(content);
  ats = clamp(ats);
  impact = clamp(impact);
  clarity = clamp(clarity);
  evidence = clamp(evidence);

  const overallHealth = Math.round((content + ats + impact + clarity + evidence) / 5);

  return {
    overallHealth,
    dimensions: {
      content,
      ats,
      impact,
      clarity,
      evidence
    },
    topImprovements: improvements.slice(0, 3)
  };
}
