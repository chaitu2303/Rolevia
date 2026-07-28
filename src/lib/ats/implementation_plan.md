# Goal: Genuine Dataset-Driven ATS & Local Auto-Fixer

The user wants the ATS report to be 100% genuine and trained on large datasets. They also want an "Auto-Fix" feature that actually rewrites/adjusts the resume text inline, without relying on external paid APIs.

## User Review Required

Please review this plan. Because you want this to run **completely free without APIs**, I cannot use ChatGPT to rewrite the resume. Instead, I will build a local, dataset-driven Auto-Fix engine. Is this acceptable?

## Proposed Changes

### 1. Dataset Integration (`/src/data/ats_datasets/`)
Instead of hardcoding rules, I will build the ATS engine to read from local dataset files.
- **[NEW] `skills_taxonomy.json`**: A massive dataset of thousands of industry skills, tools, and keywords.
- **[NEW] `action_verbs.json`**: A dataset of power verbs vs weak verbs.
*User Action:* Once I create these files, you can open them and add your own "full datasets" to make the ATS as powerful as you want!

### 2. Auto-Fix Engine (`/src/lib/ats/AtsAutoFixer.ts`)
- **[NEW] `AtsAutoFixer.ts`**: A completely local algorithm that takes your resume text and the ATS report, and programmatically modifies the text.
  - It will automatically inject `missingSkills` into a highly-visible "Core Competencies" section.
  - It will automatically replace weak verbs (e.g., "helped", "did") with strong verbs from the dataset (e.g., "Spearheaded", "Architected").
  - It will strip out bad characters that hurt parse rates.

### 3. UI Update (`/src/app/dashboard/ats/page.tsx`)
- **[MODIFY] `page.tsx`**: Add an "Apply Auto-Fix" button next to the report. When clicked, it will instantly show the newly fixed resume text on the screen, ready to copy and paste.

## Verification Plan
1. Ensure the `AtsAutoFixer` successfully injects missing keywords into the resume text.
2. Ensure the ATS score jumps up significantly when the "Auto-Fixed" text is re-scanned.
3. Ensure no external APIs are called during this entire process.
