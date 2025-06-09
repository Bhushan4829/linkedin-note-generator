from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import openai
import os
from openai import OpenAI
from dotenv import load_dotenv
load_dotenv()

# print(os.environ.get("OPENAI_API_KEY"))  # Debugging line to check if the key is set
# openai.api_key = os.environ.get("OPENAI_API_KEY")  # Set this in your environment
client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
app = FastAPI()

# Allow frontend on localhost to call this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Or restrict to your domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Profile(BaseModel):
    name: str
    headline: str
def llm_generate(system_prompt: str, user_prompt: str, max_tokens = 300) -> str:
    """
    Generate a response using OpenAI's LLM.
    """
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",  # or "gpt-4o" if you have access
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        max_tokens=max_tokens,  # Adjust as needed
        temperature=0.7,
    )
    return response.choices[0].message.content.strip()
@app.post("/generate_note")
async def generate_note(profile: Profile):
    user_prompt = f"Generate a LinkedIn note for {profile.name} with the headline: {profile.headline}"
    system_prompt = "You are a LinkedIn note generator. Create engaging and professional notes based on user profiles.make sure the lenght of response is within 300 words."

    note = llm_generate(system_prompt, user_prompt, max_tokens=300)
    return {"note": note}
@app.post("/generate_email")
async def generate_email(profile: Profile):
    user_prompt = (
        f"Write a brief cold email introduction (under 100 words) to someone named '{profile.name}' "
        f"who is '{profile.headline}'. Focus on networking and collaboration. Make it professional but approachable."
    )
    email = llm_generate(
        "You are a helpful assistant for writing cold emails.",
        user_prompt,
        max_tokens=250
    )
    return {"email": email}
@app.post("/generate_inmail")
async def generate_inmail(profile: Profile):
    user_prompt = (
        f"Draft a LinkedIn InMail message (under 500 characters) to '{profile.name}' with headline '{profile.headline}'. "
        f"Purpose is to introduce yourself and explore professional opportunities. Keep it concise and friendly."
    )
    inmail = llm_generate(
        "You are a helpful assistant for writing LinkedIn InMail messages.",
        user_prompt,
        max_tokens=200
    )
    return {"inmail": inmail}
