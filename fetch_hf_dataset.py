import json
import os
from datasets import load_dataset

def main():
    print("Downloading dataset from Hugging Face: ck0815185/Interview_questions-bucket")
    
    # Load dataset
    try:
        dataset = load_dataset("ck0815185/Interview_questions-bucket", split="train")
    except Exception as e:
        print(f"Error loading dataset: {e}")
        return

    questions_list = []
    
    print(f"Loaded {len(dataset)} rows. Processing...")
    
    # Analyze the dataset structure and format it to our schema
    for i, row in enumerate(dataset):
        # We need to map their columns to our schema
        # Typically interview datasets have 'question' and 'answer' or similar.
        # Let's inspect the keys from the first row dynamically
        if i == 0:
            print(f"Dataset columns: {list(row.keys())}")
            
        # Assuming common column names for questions and answers
        question_text = row.get("question", row.get("Question", row.get("text", "")))
        answer_text = row.get("answer", row.get("Answer", row.get("response", "")))
        
        if not question_text:
            continue
            
        questions_list.append({
            "role": "General", # We don't know the exact role from the dataset usually, unless specified
            "round": "Technical/HR", 
            "difficulty": "Unknown",
            "question": question_text,
            "expected_answer": answer_text,
            "follow_up": "",
            "evaluation_rubric": []
        })

    # Prepare final JSON structure
    output_data = {
        "description": "Interview Questions from Hugging Face (ck0815185/Interview_questions-bucket)",
        "source": "Hugging Face",
        "questions": questions_list
    }

    # Ensure output directory exists
    output_dir = "src/data/datasets/interviews"
    os.makedirs(output_dir, exist_ok=True)
    
    # Save to JSON
    output_path = os.path.join(output_dir, "hf_interview_questions.json")
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(output_data, f, indent=2, ensure_ascii=False)
        
    print(f"Successfully processed {len(questions_list)} questions and saved to {output_path}")

if __name__ == "__main__":
    main()
