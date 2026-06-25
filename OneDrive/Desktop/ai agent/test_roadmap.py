import sys, os
sys.path.append('C:/Users/D/.gemini/antigravity-ide/scratch/ai-placement-agent')
from app.tools.roadmap_tool import generate_roadmap
result = generate_roadmap.invoke({"target_role": 'ML Engineer', "duration_weeks": 4, "weak_areas": 'general'})
print(result)
