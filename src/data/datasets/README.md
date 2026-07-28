# CareerOS Master Datasets Repository

This directory contains the core intelligence of CareerOS. By loading Kaggle, HuggingFace, ESCO, and O*NET datasets into these JSON files, the platform operates completely independently of external AI APIs.

## Directory Structure
- `/ats` - Keyword lists, scoring weights, and parsing rules.
- `/resumes` - Action verbs, achievement templates, and impact metrics.
- `/jobs` - Job descriptions mapped by role (e.g., Software Engineer, Python Dev).
- `/interviews` - HR, Technical, and Behavioral questions with rubrics.
- `/coding` - Leetcode-style coding questions (Arrays, DP, Graphs).
- `/skills` - Taxonomies, aliases, and weights.
- `/companies` - Hiring patterns and interview rounds for top tech companies.
- `/roadmap` - Step-by-step career learning paths.
- `/salaries` - Compensation data by role and location.

## Instructions
1. Download datasets from Kaggle, HuggingFace, or ESCO.
2. Convert them to JSON (if they are CSVs, you can easily write a Python script or use an online converter).
3. Paste the contents into the appropriate file in this structure.
4. The system will automatically ingest these large files!
