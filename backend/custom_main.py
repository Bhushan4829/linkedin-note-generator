# from fastapi import FastAPI, Request, UploadFile, File, Form, Depends
# from fastapi.middleware.cors import CORSMiddleware
# from pydantic import BaseModel
# from typing import Optional
# import os
# import openai
# from openai import OpenAI
# from dotenv import load_dotenv
# from supabase import create_client, Client as SupabaseClient
# from decryption import decrypt_api_key  # Assuming you have a decryption module
# # ENV SETUP
# load_dotenv()
# SUPABASE_URL = os.environ.get("VITE_SUPABASE_URL")
# SUPABASE_KEY = os.environ.get("VITE_SUPABASE_ANON_KEY")
# supabase: SupabaseClient = create_client(SUPABASE_URL, SUPABASE_KEY)

# app = FastAPI()
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# class Profile(BaseModel):
#     name: str
#     headline: str
#     user_id: str  # user_id to tie request to user

# DEFAULT_NOTE_PROMPT = "You are a LinkedIn note generator. Create engaging and professional notes for {name} whose headline is '{headline}'. Keep it under 300 characters."
# DEFAULT_EMAIL_PROMPT = "Write a brief cold email introduction (under 100 words) to someone named '{name}' who is '{headline}'."
# DEFAULT_INMAIL_PROMPT = "Draft a LinkedIn InMail message (under 500 characters) to '{name}' with headline '{headline}'."

# def get_user_preferences(user_id):
#     res = supabase.table("user_preferences").select("*").eq("user_id", user_id).single().execute()
#     return res.data

# def get_user_files(user_id, file_type):
#     files = supabase.table("user_context_files").select("*").eq("user_id", user_id).eq("file_type", file_type).execute()
#     return files.data

# def llm_generate(api_key: str, system_prompt: str, user_prompt: str, max_tokens=300) -> str:
#     client = OpenAI(api_key=api_key)
#     response = client.chat.completions.create(
#         model="gpt-3.5-turbo",
#         messages=[
#             {"role": "system", "content": system_prompt},
#             {"role": "user", "content": user_prompt}
#         ],
#         max_tokens=max_tokens,
#         temperature=0.7,
#     )
#     return response.choices[0].message.content.strip()

# @app.post("/generate_message")
# async def generate_message(profile: Profile, message_type: str = Form(...)):
#     user_id = profile.user_id
#     prefs = get_user_preferences(user_id) or {}
#     # Decide prompt per type, fallback to default
#     if message_type == "note":
#         user_prompt_template = prefs.get("note_prompt") or DEFAULT_NOTE_PROMPT
#         max_tokens = 300
#     elif message_type == "email":
#         user_prompt_template = prefs.get("email_prompt") or DEFAULT_EMAIL_PROMPT
#         max_tokens = 250
#     elif message_type == "inmail":
#         user_prompt_template = prefs.get("inmail_prompt") or DEFAULT_INMAIL_PROMPT
#         max_tokens = 200
#     else:
#         return {"error": "Invalid message_type"}

#     # Context assembly (add resume/JD/context if toggled)
#     context_parts = []
#     if prefs.get("use_resume"):
#         resume_files = get_user_files(user_id, "resume")
#         context_parts += [f"Resume: {f['file_url']}" for f in resume_files]  # For real app: extract text!
#     plain_text_jd = prefs.get("jobdesc_text")
#     if prefs.get("use_jobdesc"):
#         if plain_text_jd:
#             context_parts.append(f"Job Desc: {plain_text_jd}")
#         else:
#             jd_files = get_user_files(user_id, "jobdesc")
#             context_parts += [f"Job Desc: {f['file_url']}" for f in jd_files]
#     if prefs.get("use_context_files"):
#         cf_files = get_user_files(user_id, "context")
#         context_parts += [f"Context: {f['file_url']}" for f in cf_files]
#     context_text = "\n".join(context_parts) if context_parts else ""

#     # Format prompt for LLM
#     user_prompt = user_prompt_template.format(
#         name=profile.name,
#         headline=profile.headline,
#         context=context_text
#     )

#     # Use user's OpenAI key (should be decrypted here if encrypted in DB)
#     api_key_encrypted = prefs.get("openai_api_key")
#     if not api_key_encrypted:
#         return {"error": "No OpenAI API key set in preferences"}

#     try:
#         api_key = decrypt_api_key(api_key_encrypted, user_id)
#     except Exception as e:
#         return {"error": f"Could not decrypt OpenAI API key: {str(e)}"}

#     # LLM Call
#     system_prompt = "You are a helpful assistant."
#     result = llm_generate(api_key, system_prompt, user_prompt, max_tokens)

#     # Save message (optional)
#     supabase.table("generated_messages").insert([{
#         "user_id": user_id,
#         "prompt_type": message_type,
#         "input_profile": profile.dict(),
#         "used_prompt": user_prompt,
#         "output_message": result
#     }]).execute()

#     return {message_type: result}

# New code
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from openai import OpenAI
from dotenv import load_dotenv
from supabase import create_client, Client as SupabaseClient
from decryption import decrypt_api_key  # Your decryption util
from typing import Optional
import traceback
import logging
import sys
from fastapi import HTTPException, Header, status
from fastapi.responses import JSONResponse
import jwt
import requests
import pdfplumber
import io
# ENV SETUP
load_dotenv()
DEBUG = os.getenv("DEBUG", "false").lower() == "true"
logging.basicConfig(
    level=logging.DEBUG if DEBUG else logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)
SUPABASE_URL = os.environ.get("VITE_SUPABASE_URL")
SUPABASE_KEY = os.environ.get("VITE_SUPABASE_ANON_KEY")
SUPABASE_JWT_SECRET = os.environ.get("SUPABASE_JWT_SECRET")
supabase: SupabaseClient = create_client(SUPABASE_URL, SUPABASE_KEY)

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# class MessageRequest(BaseModel):
#     name: str
#     headline: str
#     user_id: str
#     message_type: str
#     jobdesc_text: str = ""  # Optional

DEFAULT_NOTE_PROMPT = "You are a LinkedIn note generator. Create engaging and professional notes for {name} whose headline is '{headline}'. Keep it under 300 characters."
DEFAULT_EMAIL_PROMPT = "Write a brief cold email introduction (under 100 words) to someone named '{name}' who is '{headline}'."
DEFAULT_INMAIL_PROMPT = "Draft a LinkedIn InMail message (under 500 characters) to '{name}' with headline '{headline}'."

class MessageRequest(BaseModel):
    name: str
    headline: str
    user_id: str
    message_type: str
    jobdesc_text: str = ""
    custom_prompt: str = ""      # <-- Add this!
    additional_context: str = "" # <-- Add this!
def get_user_preferences_rest(user_id, access_token, project_url):
    url = f"{project_url}/rest/v1/user_preferences?user_id=eq.{user_id}&select=*"
    headers = {
        "apikey": os.environ["VITE_SUPABASE_ANON_KEY"],
        "Authorization": f"Bearer {access_token}",
    }
    resp = requests.get(url, headers=headers)
    resp.raise_for_status()
    data = resp.json()
    return data[0] if data else None
def extract_pdf_text_from_bytes(pdf_bytes):
    with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
        text = ""
        for page in pdf.pages:
            text += page.extract_text() or ""
    return text
def get_user_preferences(user_id: str) -> dict:
    try:
        res = supabase.table("user_preferences").select("*").eq("user_id", user_id).execute()
        logger.debug(f"Preferences for {user_id}: {res.data}")
        return res.data[0] if res.data else {}
    except Exception as e:
        logger.error(f"Error fetching preferences: {str(e)}")
        return {}

def get_user_files(user_id: str, file_type: str) -> list:
    try:
        res = supabase.table("user_context_files").select("*").eq("user_id", user_id).eq("file_type", file_type).execute()
        return res.data
    except Exception as e:
        logger.error(f"Error fetching files: {str(e)}")
        return []
def get_file_content(bucket: str, path: str) -> str:
    try:
        res = supabase.storage.from_(bucket).download(path)
        if res:
            if path.endswith('.pdf'):
                return extract_pdf_text_from_bytes(res)
            else:
                return res.decode('utf-8')
    except Exception as e:
        logger.error(f"Error downloading file {path} from {bucket}: {str(e)}")
        return ""
def insert_generated_message_rest(insert_data, access_token, project_url):
    url = f"{project_url}/rest/v1/generated_messages"
    headers = {
        "apikey": os.environ["VITE_SUPABASE_ANON_KEY"],
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json",
        "Prefer": "return=representation",
    }
    resp = requests.post(url, headers=headers, json=insert_data)
    # If RLS blocks, this will 401; catch for logs/debug
    if resp.status_code not in (200, 201):
        raise Exception(f"Failed insert: {resp.status_code}, {resp.text}")
    return resp.json()
def get_user_files_rest(user_id, file_type, access_token, project_url):
    url = f"{project_url}/rest/v1/user_context_files?user_id=eq.{user_id}&file_type=eq.{file_type}&select=*"
    headers = {
        "apikey": os.environ["VITE_SUPABASE_ANON_KEY"],
        "Authorization": f"Bearer {access_token}",
    }
    resp = requests.get(url, headers=headers)
    resp.raise_for_status()
    return resp.json()

def llm_generate(api_key: str, system_prompt: str, user_prompt: str, max_tokens=300) -> str:
    client = OpenAI(api_key=api_key)
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        max_tokens=max_tokens,
        temperature=0.7,
    )
    return response.choices[0].message.content.strip()
def get_file_by_id(file_id: str) -> dict:
    res = supabase.table("user_context_files").select("*").eq("id", file_id).single().execute()
    return res.data if res.data else None

def set_parsed_text(file_id: str, text: str):
    supabase.table("user_context_files").update({"parsed_text": text}).eq("id", file_id).execute()

def generate_signed_url(bucket: str, path: str, expires_in=3600) -> str:
    res = supabase.storage.from_(bucket).create_signed_url(path, expires_in)
    if not res or not res.data or not res.data.get("signedURL"):
        raise HTTPException(status_code=404, detail="Failed to generate signed URL.")
    return res.data["signedURL"]

def extract_pdf_text_from_bytes(pdf_bytes: bytes) -> str:
    with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
        return "\n".join([page.extract_text() or "" for page in pdf.pages])

def get_bucket_name(file_type: str) -> str:
    if file_type == "resume":
        return "resumes"
    elif file_type == "jobdesc":
        return "jobdescs"
    else:
        return "context"
def get_active_resume_text(user_prefs: dict) -> Optional[str]:
    active_resume_id = user_prefs.get("active_resume_id")
    if not active_resume_id:
        return None

    file_record = get_file_by_id(active_resume_id)
    if not file_record:
        return None

    # If parsed, return from cache
    if file_record.get("parsed_text"):
        return file_record["parsed_text"]

    # Else: generate signed url, download, parse, cache
    bucket = get_bucket_name(file_record["file_type"])
    file_url = file_record["file_url"]
    signed_url = generate_signed_url(bucket, file_url)
    pdf_bytes = requests.get(signed_url).content
    text = extract_pdf_text_from_bytes(pdf_bytes)
    set_parsed_text(active_resume_id, text)
    return text

def build_context(user_id: str, prefs: dict, request: MessageRequest, access_token) -> str:
    context_parts = []
    
    # Job Description
    if request.jobdesc_text:
        context_parts.append(f"JOB DESCRIPTION:\n{request.jobdesc_text}")
    elif prefs.get("use_jobdesc"):
        jd_files = get_user_files_rest(user_id, "jobdesc",access_token, SUPABASE_URL)
        for f in jd_files:
            content = get_file_content("jobdescs", f["file_url"])
            if content:
                context_parts.append(f"JOB DESCRIPTION ({f['file_name']}):\n{content}")
    
    # Resume
    if prefs.get("use_resume") and prefs.get("active_resume_id"):
        resume_text = get_active_resume_text(prefs)
        if resume_text:
            context_parts.append(f"RESUME (active):\n{resume_text}")
    
    # Additional Context
    if request.additional_context:
        context_parts.append(f"ADDITIONAL CONTEXT:\n{request.additional_context}")
    
    # Other Context Files
    if prefs.get("use_context_files"):
        cf_files = get_user_files_rest(user_id, "context",access_token, SUPABASE_URL)
        for f in cf_files:
            content = get_file_content("context", f["file_url"])
            if content:
                context_parts.append(f"CONTEXT FILE ({f['file_name']}):\n{content}")
    
    return "\n\n".join(context_parts) if context_parts else "No additional context provided"
@app.post("/generate_message")
async def generate_message(request: MessageRequest, authorization: str = Header(None)):
    try:
        # Get user access token from Authorization header
        if not authorization or not authorization.startswith("Bearer "):
            raise HTTPException(status_code=401, detail="Missing or invalid authorization header")
        access_token = authorization.split(" ")[1]
        
        # You still need the user_id, you can extract from request.user_id or decode the JWT (best practice)
        user_id = request.user_id
        
        # Use REST call to fetch user preferences (honors RLS)
        prefs = get_user_preferences_rest(user_id, access_token, SUPABASE_URL)
        if not prefs:
            logger.warning(f"No preferences found for user {user_id}")

        # Select prompt template
        prompt_templates = {
            "note": request.custom_prompt or prefs.get("note_prompt") or DEFAULT_NOTE_PROMPT,
            "email": request.custom_prompt or prefs.get("email_prompt") or DEFAULT_EMAIL_PROMPT,
            "inmail": request.custom_prompt or prefs.get("inmail_prompt") or DEFAULT_INMAIL_PROMPT
        }
        user_prompt_template = prompt_templates[request.message_type]
        max_tokens = {"note": 300, "email": 500, "inmail": 500}[request.message_type]

        # Build context
        context_text = build_context(user_id, prefs, request,access_token)
        logger.debug(f"Context text: {context_text[:200]}...")  # Log first 200 chars

        # Format final prompt
        user_prompt = user_prompt_template.format(
            name=request.name,
            headline=request.headline,
            context=context_text
        )
        user_prompt = f"{user_prompt}\n\n Target: {request.name} ({request.headline})\n\nContext: {context_text}"
        # Get and decrypt API key
        api_key_encrypted = prefs.get("openai_api_key")
        print(f"Encrypted API Key: {api_key_encrypted}")  # Debug log
        if not api_key_encrypted:
            raise HTTPException(status_code=400, detail="No OpenAI API key configured")
        
        api_key = decrypt_api_key(api_key_encrypted, user_id)

        # Generate response
        system_prompt = "You are a professional communication assistant. Generate responses that are clear, concise, and appropriate for professional contexts."
        result = llm_generate(api_key, system_prompt, user_prompt, max_tokens)

        # Save to database
        try:
            insert_data = {
                "user_id": user_id,
                "prompt_type": request.message_type,
                "input_profile": request.dict(),
                "used_prompt": user_prompt,
                "output_message": result
            }
            insert_generated_message_rest(insert_data, access_token, SUPABASE_URL)
            logger.info(f"Saved message for user {user_id} via REST")
        except Exception as e:
            logger.error(f"Failed to save message: {str(e)}")

        return {
            "success": True,
            "type": request.message_type,
            "message": result,
            "context_used": context_text,
            "prompt_used": user_prompt
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in generate_message: {str(e)}\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=str(e))

    # return {req.message_type: result}
