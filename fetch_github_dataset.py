import json
import os
import requests

def main():
    print("Fetching '30-seconds-of-interviews' JSON dataset from GitHub...")
    
    # URL to the raw JSON file of a popular open-source interview dataset
    url = "https://raw.githubusercontent.com/Chalarangelo/30-seconds-of-interviews/master/data/questions.json"
    
    try:
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()
    except Exception as e:
        print(f"Failed to fetch dataset: {e}")
        return

    questions_list = []
    
    print(f"Loaded {len(data)} questions. Converting to CareerOS format...")
    
    # 30-seconds-of-interviews structure:
    # { "id": "...", "title": "...", "tags": ["..."], "html": { "question": "...", "answer": "..." } }
    
    for item in data:
        # Strip simple HTML tags for the text version, or keep them if preferred
        question_html = item.get("html", {}).get("question", "")
        answer_html = item.get("html", {}).get("answer", "")
        
        # Very basic HTML stripping for clean JSON
        import re
        q_clean = re.sub('<[^<]+>', '', question_html).strip()
        a_clean = re.sub('<[^<]+>', '', answer_html).strip()
        
        tags = item.get("tags", [])
        role = "Frontend Developer" if "javascript" in tags or "css" in tags or "html" in tags else "Software Engineer"
        
        questions_list.append({
            "role": role,
            "round": "Technical",
            "difficulty": "Medium", # Defaulting
            "question": item.get("title", q_clean),
            "expected_answer": a_clean,
            "follow_up": f"Can you explain more about how this relates to {tags[0] if tags else 'web development'}?",
            "evaluation_rubric": [
                "Understands core concepts",
                f"Correctly applies {tags[0] if tags else 'the technology'}"
            ]
        })

    # Prepare final JSON structure
    output_data = {
        "description": "30 Seconds of Interviews Dataset (Chalarangelo)",
        "source": "GitHub - Chalarangelo/30-seconds-of-interviews",
        "questions": questions_list
    }

    # Ensure output directory exists
    output_dir = "src/data/datasets/interviews"
    os.makedirs(output_dir, exist_ok=True)
    
    # Save to JSON
    output_path = os.path.join(output_dir, "frontend_interview_questions.json")
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(output_data, f, indent=2, ensure_ascii=False)
        
    print(f"Successfully processed {len(questions_list)} questions and saved to {output_path}")

if __name__ == "__main__":
    main()
