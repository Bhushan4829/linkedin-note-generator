import os
from supabase import create_client
from dotenv import load_dotenv
import logging

# Load env variables
load_dotenv()

SUPABASE_URL = os.environ.get("VITE_SUPABASE_URL")
SUPABASE_KEY = os.environ.get("VITE_SUPABASE_ANON_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

def get_user_preferences(user_id: str) -> dict:
    try:
        res = supabase.table("user_preferences").select("*").eq("user_id", user_id).execute()
        logger.info(f"Raw Supabase Response: {res.data}")
        return res.data[0] if res.data else {}
    except Exception as e:
        logger.error(f"Error fetching preferences: {str(e)}")
        return {}

if __name__ == "__main__":
    # Replace with your test user_id
    user_id = "52b8994e-cdf3-4926-a642-98d58d025509"
    prefs = get_user_preferences(user_id)
    print(f"Preferences for user {user_id}:\n{prefs}")
