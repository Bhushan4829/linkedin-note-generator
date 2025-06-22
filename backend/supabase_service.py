from supabase import create_client, Client
from typing import Optional, List
import os
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

class SupabaseService:
    @staticmethod
    def get_user_preferences(user_id: str) -> dict:
        """Get user's preferences and related data"""
        response = supabase.table('preferences')\
            .select("*")\
            .eq('user_id', user_id)\
            .order('created_at', desc=True)\
            .execute()
        return response.data

    @staticmethod
    def get_primary_resume(user_id: str) -> Optional[dict]:
        """Get user's primary resume"""
        response = supabase.table('resumes')\
            .select("*")\
            .eq('user_id', user_id)\
            .eq('is_primary', True)\
            .execute()
        return response.data[0] if response.data else None

    @staticmethod
    def upload_resume(user_id: str, file_path: str, is_primary: bool = False) -> dict:
        """Upload resume to Supabase storage"""
        # Upload file to storage
        file_name = os.path.basename(file_path)
        bucket = supabase.storage.from_('resumes')
        
        with open(file_path, 'rb') as file:
            bucket.upload(file_name, file)
            
        # Save metadata
        response = supabase.table('resumes').insert({
            'user_id': user_id,
            'file_path': file_name,
            'is_primary': is_primary,
            'uploaded_at': 'now()'
        }).execute()
        
        return response.data[0]

    @staticmethod
    def get_job_descriptions(user_id: str) -> List[dict]:
        """Get all job descriptions for user"""
        response = supabase.table('job_descriptions')\
            .select("*")\
            .eq('user_id', user_id)\
            .order('created_at', desc=True)\
            .execute()
        return response.data
