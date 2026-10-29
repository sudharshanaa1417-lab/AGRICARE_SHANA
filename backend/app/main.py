from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime

from app.config import settings
from app.database import Base, engine
from app.routers import iot, ai_crop, calendar, market, yield_pred, robot, chatbot, auth, history

# Initialize SQL database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="""
    ## AgriCare — AI-Powered Autonomous Pest Detection and Crop Monitoring System
    Tagline: **"Grow Smarter. Farm Better. Harvest More."**
    
    ### Key Features:
    * **IoT Cloud Telemetry (`/api/readings`)**: Authenticated endpoint matching NodeMCU ESP8266 sketch.
    * **Remote Valve & Motor Actuation (`/api/command`)**: Polled by ESP8266 and dispatched by Dashboard.
    * **Pluggable AI Inference (`/api/ai`)**: Computer vision pest & crop disease diagnosis with IPM recommendations.
    * **Agronomic Calendar (`/api/calendar`)**: Day 1 to Harvest daily farming tasks.
    * **Market Price Intelligence (`/api/market`)**: Daily Indian mandi modal prices.
    * **Yield Prediction Engine (`/api/yield`)**: 6-step agricultural harvest estimation.
    * **Solar Field Robot (`/api/robot`)**: Autonomous field navigation rover controller.
    * **AgriCare Advisor Chatbot (`/api/chat`)**: Context-aware multilingual AI farm advisor.
    """
)

# CORS Middleware (Permits Vercel, Localhost, and Mobile PWAs)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Permissive for easy Vercel & mobile testing
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers
app.include_router(iot.router)
app.include_router(ai_crop.router)
app.include_router(calendar.router)
app.include_router(market.router)
app.include_router(yield_pred.router)
app.include_router(robot.router)
app.include_router(chatbot.router)
app.include_router(auth.router)
app.include_router(history.router)

@app.get("/health")
def healthcheck():
    """Health check endpoint for Render service monitoring"""
    return {
        "status": "HEALTHY",
        "timestamp": datetime.utcnow().isoformat(),
        "project": "AgriCare Backend",
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT
    }

@app.get("/")
def root():
    return {
        "system": "AgriCare Smart Agriculture Cloud API",
        "tagline": "Grow Smarter. Farm Better. Harvest More.",
        "documentation": "/docs",
        "status": "Online"
    }
