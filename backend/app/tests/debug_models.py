# debug_models.py
import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GOOGLE_API_KEY")

if not api_key:
    print("❌ Error: GOOGLE_API_KEY not found in .env")
    exit(1)

genai.configure(api_key=api_key)

print(f"🔑 Checking models for API Key ending in ...{api_key[-4:]}")
print("---------------------------------------------------")

try:
    print("Fetching available models...")
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            print(f"✅ Found: {m.name}")
except Exception as e:
    print(f"❌ Error listing models: {e}")