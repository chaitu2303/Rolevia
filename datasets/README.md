# CareerOS Datasets

This folder contains all datasets used by the CareerOS AI Job Tracking & Career Acceleration platform.
All files are organized by category below.

---

## 📂 O\*NET Occupation Datasets

**Source:** [U.S. Department of Labor O\*NET Resource Center](https://www.onetcenter.org/database.html)  
**License:** Public Domain (U.S. Government Work)  
**Version:** O\*NET 29.3

These datasets power the job matching, career pathing, skill gap analysis, and interest assessment features.

| File | Description | Download |
|------|-------------|----------|
| `Abilities.xlsx` | Cognitive, physical & sensory ability requirements per occupation | [Download](https://www.onetcenter.org/dl_files/database/db_29_3_excel/Abilities.xlsx) |
| `Career Interest Type Keywords.xlsx` | Keywords for each Holland RIASEC interest type | [Download](https://www.onetcenter.org/dl_files/database/db_29_3_excel/Career%20Interest%20Type%20Keywords.xlsx) |
| `Career Interest Types.xlsx` | Holland RIASEC career interest types | [Download](https://www.onetcenter.org/dl_files/database/db_29_3_excel/Career%20Interest%20Types.xlsx) |
| `Education Categories.xlsx` | Education level reference lookup | [Download](https://www.onetcenter.org/dl_files/database/db_29_3_excel/Education%2C%20Training%2C%20and%20Experience%20Categories.xlsx) |
| `Education.xlsx` | Education & training requirements by occupation | [Download](https://www.onetcenter.org/dl_files/database/db_29_3_excel/Education%2C%20Training%2C%20and%20Experience.xlsx) |
| `Essential Skills.xlsx` | Core foundational skills per occupation | [Download](https://www.onetcenter.org/dl_files/database/db_29_3_excel/Skills.xlsx) |
| `Interests Illustrative Activities.xlsx` | Sample activities for each career interest area | [Download](https://www.onetcenter.org/dl_files/database/db_29_3_excel/Interests%20Illustrative%20Activities.xlsx) |
| `Job Zone Reference.xlsx` | Definitions for O\*NET job zones (1–5) | [Download](https://www.onetcenter.org/dl_files/database/db_29_3_excel/Job%20Zone%20Reference.xlsx) |
| `Job Zones.xlsx` | Occupations mapped to job zones | [Download](https://www.onetcenter.org/dl_files/database/db_29_3_excel/Job%20Zones.xlsx) |
| `Knowledge.xlsx` | Knowledge domain requirements per occupation | [Download](https://www.onetcenter.org/dl_files/database/db_29_3_excel/Knowledge.xlsx) |
| `Occupation Data.xlsx` | Core occupation titles, SOC codes & descriptions | [Download](https://www.onetcenter.org/dl_files/database/db_29_3_excel/Occupation%20Data.xlsx) |
| `Software Skills.xlsx` | Technology & software tool requirements | [Download](https://www.onetcenter.org/dl_files/database/db_29_3_excel/Technology%20Skills.xlsx) |
| `Specific Interest Areas to Career Interest Types.xlsx` | Maps specific interest areas to RIASEC types | [Download](https://www.onetcenter.org/dl_files/database/db_29_3_excel/Specific%20Interest%20Areas%20to%20Career%20Interest%20Types.xlsx) |
| `Specific Interest Areas.xlsx` | Granular interest sub-areas | [Download](https://www.onetcenter.org/dl_files/database/db_29_3_excel/Specific%20Interest%20Areas.xlsx) |
| `Technology Skills.xlsx` | Specific technologies/tools used per occupation | [Download](https://www.onetcenter.org/dl_files/database/db_29_3_excel/Technology%20Skills.xlsx) |
| `Training and Experience Categories.xlsx` | Training level category lookup | [Download](https://www.onetcenter.org/dl_files/database/db_29_3_excel/Education%2C%20Training%2C%20and%20Experience%20Categories.xlsx) |
| `Transferable Skills.xlsx` | Cross-domain portable skills | [Download](https://www.onetcenter.org/dl_files/database/db_29_3_excel/Skills.xlsx) |
| `Work Activities.xlsx` | Day-to-day work activities per occupation | [Download](https://www.onetcenter.org/dl_files/database/db_29_3_excel/Work%20Activities.xlsx) |
| `Work Values.xlsx` | Work environment values & preferences | [Download](https://www.onetcenter.org/dl_files/database/db_29_3_excel/Work%20Values.xlsx) |

> **To refresh all O\*NET data**, visit the [O\*NET Downloads Page](https://www.onetcenter.org/database.html#all-files)  
> and download the latest `db_XX_X_excel.zip` package.

---

## 📂 Job Postings Data

### `archive (1)/` — Regional US Job Postings
**Source:** Scraped job posting data by US state  
**Coverage:** NY, SF (Bay Area), TX, WA

| File | Region | Rows (approx.) |
|------|--------|----------------|
| `archive (1)/Data_Job_NY.csv` | New York | ~8,000 |
| `archive (1)/Data_Job_SF.csv` | San Francisco | ~12,000 |
| `archive (1)/Data_Job_TX.csv` | Texas | ~8,500 |
| `archive (1)/Data_Job_WA.csv` | Washington | ~14,000 |

**Features:** Job title, company, skills, salary, location, job description

**Recommended Additional Source:**  
[LinkedIn Job Postings (Kaggle)](https://www.kaggle.com/datasets/arshkon/linkedin-job-postings) — 33,000+ postings with full details

---

## 📂 Company Intelligence Data

### `archive/` — Y Combinator Startup Dataset
**Source:** SeedDB, CrunchBase, AngelList (aggregated by Alice Corona, CC BY-SA 4.0)  
**Coverage:** ~700 YC-backed startups (2005–2014)

| File | Description |
|------|-------------|
| `archive/Startups.csv` | Company name, status, funding rounds, HQ, categories, investors |
| `archive/Founders.csv` | Founder names, company, gender |

**Recommended Additional Source:**  
[Glassdoor Job Reviews (Kaggle)](https://www.kaggle.com/datasets/davidgauthier/glassdoor-job-reviews) — company culture & salary reviews

---

## 📂 Coding Practice Data

| File | Description | Source |
|------|-------------|--------|
| `leetcode.csv` | LeetCode problem list with titles, difficulty, tags, acceptance rates | [Kaggle](https://www.kaggle.com/datasets/gzipchrist/leetcode-problem-dataset) |

---

## 📂 Exploration Notebooks

Reference Jupyter notebooks for data analysis patterns used in the app:

| Notebook | Description |
|----------|-------------|
| `indeed-jobs-analysis.ipynb` | Indeed job posting analysis & feature extraction |
| `linkedin-tech-jobs.ipynb` | LinkedIn tech job trends & salary analysis |
| `predicting-job-type-cat-using-job-description.ipynb` | ML model for job category prediction from descriptions |
| `resume-parser.ipynb` | Resume entity extraction & parsing logic |
| `resume-screening.ipynb` | Resume scoring & ranking algorithms |
| `resume.ipynb` | Resume feature engineering |
| `salary.ipynb` | Salary prediction model exploration |
| `top-global-companies.ipynb` | Top global company analysis |

---

## 🔗 Additional Recommended Datasets

| Dataset | Use Case | Source |
|---------|----------|--------|
| Resume Dataset (2400 resumes) | Resume parsing training | [Kaggle](https://www.kaggle.com/datasets/snehaanbhawal/resume-dataset) |
| STEM Salary Survey | Salary benchmark data | [Kaggle](https://www.kaggle.com/datasets/jackogozaly/data-science-and-stem-salaries) |
| LinkedIn Job Postings | Live job market data | [Kaggle](https://www.kaggle.com/datasets/arshkon/linkedin-job-postings) |
| Glassdoor Reviews | Company culture intel | [Kaggle](https://www.kaggle.com/datasets/davidgauthier/glassdoor-job-reviews) |
| O\*NET Full Excel Package | All occupation data | [O\*NET Center](https://www.onetcenter.org/database.html#all-files) |

---

## 🗑️ Removed (Cleanup Log)

The following were removed as they contained no actual dataset files:

| Removed | Reason |
|---------|--------|
| `awesome-artificial-intelligence-master/` | Empty nested wrapper folder, no data |
| `awesome-machine-learning-master/` | Empty nested wrapper folder, no data |
| `awesome-public-datasets-master/` | Empty nested wrapper folder, no data |
| `developer-roadmap-master/` | Empty nested wrapper, reference repo not data |
| `interviewprep-ai--main/` | Full app source code (Vite/TS app), not a dataset |
