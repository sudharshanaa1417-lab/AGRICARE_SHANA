from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

# ==========================================
# 1. IoT TELEMETRY SCHEMAS (Matches Arduino)
# ==========================================
class TelemetryCreate(BaseModel):
    device_id: str = "esp8266-01"
    soil_raw: Optional[int] = None
    moisture: Optional[float] = None
    temperature: Optional[float] = None
    humidity: Optional[float] = None
    nitrogen: Optional[int] = None
    phosphorus: Optional[int] = None
    potassium: Optional[int] = None
    water_open: Optional[bool] = False
    medicine_open: Optional[bool] = False
    auto_water: Optional[bool] = True

class TelemetryResponse(TelemetryCreate):
    id: int
    timestamp: datetime

    class Config:
        from_attributes = True

# ==========================================
# 2. DEVICE COMMAND SCHEMAS (Matches Arduino)
# ==========================================
class DeviceCommandPollResponse(BaseModel):
    command: str = ""

class DeviceCommandRequest(BaseModel):
    device_id: str = "esp8266-01"
    command: str # WATER_ON, WATER_OFF, MEDICINE_ON, MEDICINE_OFF, AUTO_ON, AUTO_OFF

class DeviceCommandStatus(BaseModel):
    id: int
    device_id: str
    command: str
    status: str
    requested_at: datetime
    executed_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# ==========================================
# 3. USER & AUTH SCHEMAS
# ==========================================
class UserRegister(BaseModel):
    phone: str
    name: str
    state: str
    district: str
    village: Optional[str] = ""
    pincode: str
    preferred_lang: str = "en"
    farm_name: Optional[str] = ""
    farm_size_acres: Optional[float] = 1.0
    role: Optional[str] = "farmer"

class UserLogin(BaseModel):
    phone: str
    otp: Optional[str] = "123456" # For OTP verification

class UserResponse(UserRegister):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# ==========================================
# 4. AI CROP DIAGNOSIS SCHEMAS
# ==========================================
class AiDiagnosisResult(BaseModel):
    crop: str
    plant_part: str
    health_status: str # Healthy, Unhealthy, Uncertain
    disease_name: Optional[str] = None
    confidence: float # Clearly marked as model confidence
    symptoms: Optional[str] = None
    scientific_recommendation: Optional[str] = None
    home_remedy: Optional[str] = None
    sources: Optional[str] = None
    model_version: str
    image_url: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class MultiImageDiagnosisResponse(BaseModel):
    results: List[AiDiagnosisResult]
    overall_health: str
    summary: str

# ==========================================
# 5. CROP CARE CALENDAR SCHEMAS
# ==========================================
class CropTaskResponse(BaseModel):
    id: int
    crop: str
    day_number: int
    stage: str
    title: str
    irrigation_guide: Optional[str] = None
    nutrient_management: Optional[str] = None
    pest_scouting: Optional[str] = None
    field_maintenance: Optional[str] = None
    expected_observation: Optional[str] = None
    completed: bool
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class TaskToggleRequest(BaseModel):
    completed: bool

# ==========================================
# 6. YIELD PREDICTION SCHEMAS
# ==========================================
class YieldPredictionRequest(BaseModel):
    state: str
    district: str
    soil_type: str
    crop: str
    sowing_month: str
    area_acres: float = 1.0
    irrigation_type: str = "Drip"
    variety: Optional[str] = "Standard Hybrid"
    historical_yield: Optional[float] = None

class YieldPredictionReport(BaseModel):
    crop: str
    location: str
    soil_type: str
    sowing_month: str
    area_acres: float
    predicted_yield_per_acre: float # in Quintals
    total_estimated_yield: float    # in Quintals
    confidence_range: Dict[str, float] # min, max
    suitability_score: str # Excellent, Good, Moderate, Low
    growing_duration_days: int
    limiting_factors: List[str]
    water_nutrient_guidelines: str
    pest_disease_risks: str
    alternative_crops_comparison: List[Dict[str, Any]]
    model_version: str

# ==========================================
# 7. SOLAR FIELD ROBOT SCHEMAS
# ==========================================
class RobotCommandRequest(BaseModel):
    command: str # CONNECT, START, PAUSE, RESUME, STOP, FORWARD, BACKWARD, LEFT, RIGHT, RETURN_HOME, SET_MODE
    distance_ft: Optional[float] = 20.0
    mode: Optional[str] = None # MANUAL, AUTONOMOUS

class RobotTelemetryResponse(BaseModel):
    status: str
    mode: str
    x_pos: float
    y_pos: float
    heading_deg: float
    distance_target_ft: float
    distance_travelled_ft: float
    battery_pct: float
    solar_power_w: float
    obstacle_detected: bool
    last_command: str
    updated_at: datetime

# ==========================================
# 8. CHATBOT SCHEMAS
# ==========================================
class ChatMessageRequest(BaseModel):
    message: str
    language: str = "en"
    crop_context: Optional[str] = None
    soil_moisture_context: Optional[float] = None
    district_context: Optional[str] = None
    image_base64: Optional[str] = None

class ChatMessageResponse(BaseModel):
    reply: str
    detected_intent: str
    sources: List[str]
    audio_available: bool = True
