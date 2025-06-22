import os
import io
import requests
from fastapi import FastAPI, HTTPException, Header, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import pdfplumber

from supabase import create_client, Client as SupabaseClient

# ENV SETUP
load_dotenv()
SUPABASE_URL = os.environ.get("VITE_SUPABASE_URL")
SUPABASE_KEY = os.environ.get("VITE_SUPABASE_ANON_KEY")
supabase: SupabaseClient = create_client(SUPABASE_URL, SUPABASE_KEY)

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------- Models -------------
class ResumeRequest(BaseModel):
    user_id: str

# ------------- Helpers -------------

def get_user_preferences(user_id: str) -> dict:
    res = supabase.table("user_preferences").select("*").eq("user_id", user_id).execute()
    return res.data[0] if res.data else {}

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
    # You can improve this mapping if needed
    if file_type == "resume":
        return "resumes"
    elif file_type == "jobdesc":
        return "jobdescs"
    else:
        return "context"