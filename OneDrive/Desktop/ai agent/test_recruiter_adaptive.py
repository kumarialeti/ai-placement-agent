"""
Test script for the new Adaptive Mock Interview flow and Recruiter Dashboard.
"""
import httpx
import json
import time

BASE = "http://127.0.0.1:8000/api/v1"

def run_tests():
    print("=" * 60)
    print("Testing Adaptive Mock Interview & Recruiter Dashboard")
    print("=" * 60)

    # 1. Register or Login
    print("\n[1] AUTHENTICATING...")
    r = httpx.post(f"{BASE}/auth/register", json={
        "email": "candidate_test@domain.com",
        "username": "candidate_test",
        "password": "candidate_pwd123",
        "full_name": "Candidate Jane Doe"
    })
    
    if r.status_code == 201:
        data = r.json()
        token = data["access_token"]
        print("    Successfully registered new candidate!")
    else:
        print("    User already exists, logging in...")
        r = httpx.post(f"{BASE}/auth/login", json={
            "email": "candidate_test@domain.com",
            "password": "candidate_pwd123"
        })
        assert r.status_code == 200, f"Login failed: {r.text}"
        token = r.json()["access_token"]
        print("    Successfully logged in candidate!")

    headers = {"Authorization": f"Bearer {token}"}

    # 2. Start Mock Interview
    print("\n[2] STARTING ADAPTIVE INTERVIEW...")
    r = httpx.post(f"{BASE}/interview/start", json={
        "topic": "NLP and RAG Systems",
        "difficulty": "intermediate"
    }, headers=headers, timeout=60.0)
    
    assert r.status_code == 200, f"Start failed: {r.text}"
    start_data = r.json()
    session_id = start_data["session_id"]
    questions = start_data["questions"]
    
    print(f"    Session ID: {session_id}")
    print(f"    Total initial questions returned: {len(questions)}")
    assert len(questions) == 1, "Should only generate 1 starting question!"
    
    question = questions[0]
    print(f"    AI Opening Question: {question['question']}")

    # 3. Submit Answer
    print("\n[3] SUBMITTING AUDIO ANSWER TRANSCRIPT...")
    answer_text = "I worked on RAG systems where we implemented sentence-transformer embeddings and stored them in ChromaDB vector store."
    print(f"    Candidate Answer: '{answer_text}'")
    
    r = httpx.post(f"{BASE}/interview/answer", json={
        "session_id": session_id,
        "question_id": question["question_id"],
        "answer": answer_text
    }, headers=headers, timeout=60.0)
    
    assert r.status_code == 200, f"Submit answer failed: {r.text}"
    answer_result = r.json()
    
    print(f"    AI Evaluation Score: {answer_result['score']}/10")
    print(f"    Breakdown Scores:")
    eval_data = answer_result["evaluation"]
    print(f"      - Technical Knowledge: {eval_data.get('technical_knowledge')}/10")
    print(f"      - Communication: {eval_data.get('communication')}/10")
    print(f"      - Confidence: {eval_data.get('confidence')}/10")
    print(f"      - Relevance: {eval_data.get('relevance')}/10")
    
    assert "technical_knowledge" in eval_data, "Should include technical_knowledge score"
    assert "communication" in eval_data, "Should include communication score"
    assert "confidence" in eval_data, "Should include confidence score"
    assert "relevance" in eval_data, "Should include relevance score"
    
    next_question = answer_result["next_question"]
    print(f"    AI Follow-up Question: {next_question['question'] if next_question else 'None'}")
    assert next_question is not None, "Adaptive follow-up question should be generated!"

    # 4. Complete Session
    print("\n[4] COMPLETING INTERVIEW SESSION...")
    r = httpx.post(f"{BASE}/interview/complete/{session_id}", headers=headers)
    assert r.status_code == 200, f"Complete session failed: {r.text}"
    complete_data = r.json()
    print(f"    Completed Session. Final Average Score: {complete_data['average_score']}/10")

    # 5. Check Recruiter Dashboard API
    print("\n[5] QUERYING RECRUITER DASHBOARD ENDPOINT...")
    r = httpx.get(f"{BASE}/recruiter/sessions", headers=headers)
    assert r.status_code == 200, f"Recruiter endpoint failed: {r.text}"
    recruiter_data = r.json()
    
    print(f"    Total candidate sessions listed: {len(recruiter_data)}")
    
    # Find our session in the recruiter listings
    recruiter_session = None
    for s in recruiter_data:
        if s["session_id"] == session_id:
            recruiter_session = s
            break
            
    assert recruiter_session is not None, "Our test session must be listed in the recruiter dashboard!"
    print(f"    Recruiter Record Details:")
    print(f"      - Candidate: {recruiter_session['candidate']['full_name']} ({recruiter_session['candidate']['email']})")
    print(f"      - Latest Resume: {recruiter_session['candidate']['latest_resume']}")
    print(f"      - Target Topic: {recruiter_session['topic']}")
    print(f"      - Recruiter Rating Averages:")
    print(f"        - Technical Knowledge: {recruiter_session['averages']['technical_knowledge']}/10")
    print(f"        - Communication: {recruiter_session['averages']['communication']}/10")
    print(f"        - Confidence: {recruiter_session['averages']['confidence']}/10")
    print(f"        - Relevance: {recruiter_session['averages']['relevance']}/10")
    
    print(f"      - Transcript Log length: {len(recruiter_session['answers'])} QA pairs")
    
    first_qa = recruiter_session['answers'][0]
    print(f"        - Question asked: {first_qa['question']}")
    print(f"        - Answer recorded: {first_qa['user_answer']}")
    print(f"        - Detail Score feedback breakdown contains technical_knowledge: {first_qa['metrics']['technical_knowledge']}/10")

    print("\n" + "=" * 60)
    print("[SUCCESS] BACKEND VERIFICATION COMPLETE: ALL ADAPTIVE INTERVIEW & RECRUITER DASHBOARD TESTS PASSED!")
    print("=" * 60)

if __name__ == "__main__":
    run_tests()
