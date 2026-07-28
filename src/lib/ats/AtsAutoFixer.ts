import verbsData from '@/data/ats_datasets/action_verbs.json';

/**
 * Deterministic Auto-Fixer
 * Applies fixes directly to the resume text without requiring an AI API.
 */

export function autoFixResumeText(rawText: string, missingSkills: string[]): string {
  let newText = rawText;

  // 1. Inject Missing Skills
  if (missingSkills.length > 0) {
    const skillsString = missingSkills.join(', ');
    
    // Check if there's already a Skills section to append to
    const skillsRegex = /(skills|technologies|core competencies|technical skills):?/i;
    const match = newText.match(skillsRegex);
    
    if (match && match.index !== undefined) {
      // Find the end of the line where skills were mentioned
      const lineEnd = newText.indexOf('\n', match.index);
      if (lineEnd !== -1) {
        newText = newText.slice(0, lineEnd) + `, ${skillsString}` + newText.slice(lineEnd);
      } else {
        newText += `\n${skillsString}`;
      }
    } else {
      // Prepend a Core Competencies section right after contact info (heuristically line 3 or 4)
      const lines = newText.split('\n');
      if (lines.length > 3) {
        lines.splice(3, 0, `\nCORE COMPETENCIES\n${skillsString}\n`);
        newText = lines.join('\n');
      } else {
        newText += `\n\nCORE COMPETENCIES\n${skillsString}`;
      }
    }
  }

  // 2. Replace Weak Verbs with Power Verbs
  const weakVerbs = Object.keys(verbsData.weak_verbs_mapping);
  const words = newText.split(/(\s+)/); // Preserve whitespace
  
  for (let i = 0; i < words.length; i++) {
    const word = words[i].toLowerCase().replace(/[^a-z]/g, '');
    if (weakVerbs.includes(word)) {
      const powerVerb = verbsData.weak_verbs_mapping[word as keyof typeof verbsData.weak_verbs_mapping];
      // Try to preserve capitalization
      if (words[i][0] === words[i][0].toUpperCase()) {
        words[i] = words[i].replace(new RegExp(word, 'i'), powerVerb.charAt(0).toUpperCase() + powerVerb.slice(1));
      } else {
        words[i] = words[i].replace(new RegExp(word, 'i'), powerVerb);
      }
    }
  }
  newText = words.join('');

  // 3. Strip ATS-unfriendly characters
  newText = newText.replace(/[│┌┐└┘├┤┬┴┼═╠╣╦╩╬]/g, ''); // Box drawing chars
  newText = newText.replace(/\|[-]+\|/g, ''); // Markdown table borders

  return newText;
}
