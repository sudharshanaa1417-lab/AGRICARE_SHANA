import os
from typing import List
from dotenv import load_dotenv

load_dotenv()

class Settings:
    PROJECT_NAME: str = "AgriCare Backend API"
    VERSION: str = "2.0.0"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./agricare.db")
    
    # Arduino ESP8266 Device Auth
    DEVICE_API_KEY: str = os.getenv("DEVICE_API_KEY", "agricare_live_secret_key_2026")
    
    # Pluggable AI Model Configuration
    AI_MODEL_ENDPOINT: str = os.getenv("AI_MODEL_ENDPOINT", "")
    AI_MODEL_VERSION: str = os.getenv("AI_MODEL_VERSION", "AgriCare-Vision-v2.5")
    AI_MODEL_API_KEY: str = os.getenv("AI_MODEL_API_KEY", "")
    
    # CORS
    ALLOWED_ORIGINS: List[str] = [
        origin.strip() 
        for origin in os.getenv(
            "ALLOWED_ORIGINS", 
            "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,https://agricare.vercel.app,*"
        ).split(",")
    ]
    
    # Weather
    WEATHER_API_KEY: str = os.getenv("WEATHER_API_KEY", "")

settings = Settings()
