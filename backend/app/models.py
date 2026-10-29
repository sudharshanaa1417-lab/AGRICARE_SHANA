import datetime
from sqlalchemy import Column, Integer, Float, String, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    phone = Column(String(20), unique=True, index=True, nullable=False)
    name = Column(String(100), nullable=False)
    state = Column(String(50), nullable=False)
    district = Column(String(50), nullable=False)
    village = Column(String(100), nullable=True)
    pincode = Column(String(10), nullable=False)
    preferred_lang = Column(String(10), default="en")
    farm_name = Column(String(100), nullable=True)
    farm_size_acres = Column(Float, nullable=True)
    role = Column(String(20), default="farmer") # farmer, manager, admin
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    tasks = relationship("CropCareTask", back_populates="user")
    diagnoses = relationship("CropDiagnosis", back_populates="user")

class TelemetryReading(Base):
    __tablename__ = "telemetry_readings"
    
    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(String(50), index=True, nullable=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    soil_raw = Column(Integer, nullable=True)
    moisture = Column(Float, nullable=True)
    temperature = Column(Float, nullable=True)
    humidity = Column(Float, nullable=True)
    nitrogen = Column(Integer, nullable=True)
    phosphorus = Column(Integer, nullable=True)
    potassium = Column(Integer, nullable=True)
    water_open = Column(Boolean, default=False)
    medicine_open = Column(Boolean, default=False)
    auto_water = Column(Boolean, default=True)

class DeviceCommand(Base):
    __tablename__ = "device_commands"
    
    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(String(50), index=True, nullable=False)
    command = Column(String(50), nullable=False) # WATER_ON, WATER_OFF, MEDICINE_ON, MEDICINE_OFF, AUTO_ON, AUTO_OFF
    status = Column(String(20), default="PENDING") # PENDING, EXECUTED, FAILED, EXPIRED
    requested_at = Column(DateTime, default=datetime.datetime.utcnow)
    executed_at = Column(DateTime, nullable=True)
    error_details = Column(String(255), nullable=True)

class CropDiagnosis(Base):
    __tablename__ = "crop_diagnoses"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    crop = Column(String(50), nullable=False)
    plant_part = Column(String(30), default="leaf")
    health_status = Column(String(20), nullable=False) # Healthy, Unhealthy, Uncertain
    disease_name = Column(String(100), nullable=True)
    confidence = Column(Float, nullable=False)
    symptoms = Column(Text, nullable=True)
    scientific_recommendation = Column(Text, nullable=True)
    home_remedy = Column(Text, nullable=True)
    sources = Column(Text, nullable=True)
    image_url = Column(Text, nullable=True)
    model_version = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    user = relationship("User", back_populates="diagnoses")

class CropCareTask(Base):
    __tablename__ = "crop_care_tasks"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    crop = Column(String(50), nullable=False)
    day_number = Column(Integer, nullable=False)
    stage = Column(String(50), nullable=False) # Sowing, Vegetative, Flowering, Fruiting, Maturity
    title = Column(String(150), nullable=False)
    irrigation_guide = Column(Text, nullable=True)
    nutrient_management = Column(Text, nullable=True)
    pest_scouting = Column(Text, nullable=True)
    field_maintenance = Column(Text, nullable=True)
    expected_observation = Column(Text, nullable=True)
    completed = Column(Boolean, default=False)
    completed_at = Column(DateTime, nullable=True)
    
    user = relationship("User", back_populates="tasks")

class RobotTelemetry(Base):
    __tablename__ = "robot_telemetry"
    
    id = Column(Integer, primary_key=True, index=True)
    status = Column(String(30), default="IDLE") # IDLE, MOVING, RETURNING, PAUSED, EMERGENCY_STOP
    mode = Column(String(20), default="MANUAL") # MANUAL, AUTONOMOUS
    x_pos = Column(Float, default=0.0) # feet
    y_pos = Column(Float, default=0.0) # feet
    heading_deg = Column(Float, default=0.0) # 0 to 360 degrees
    distance_target_ft = Column(Float, default=20.0)
    distance_travelled_ft = Column(Float, default=0.0)
    battery_pct = Column(Float, default=94.0)
    solar_power_w = Column(Float, default=45.2)
    obstacle_detected = Column(Boolean, default=False)
    last_command = Column(String(50), default="STOP")
    updated_at = Column(DateTime, default=datetime.datetime.utcnow)

class YieldPredictionRecord(Base):
    __tablename__ = "yield_predictions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    state = Column(String(50), nullable=False)
    district = Column(String(50), nullable=False)
    soil_type = Column(String(50), nullable=False)
    crop = Column(String(50), nullable=False)
    sowing_month = Column(String(20), nullable=False)
    area_acres = Column(Float, default=1.0)
    irrigation_type = Column(String(50), default="Drip")
    predicted_yield_quintals = Column(Float, nullable=False)
    confidence_min = Column(Float, nullable=False)
    confidence_max = Column(Float, nullable=False)
    factors = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Notification(Base):
    __tablename__ = "notifications"
    
    id = Column(Integer, primary_key=True, index=True)
    type = Column(String(30), nullable=False) # SENSOR_ALERT, DISEASE_ALERT, VALVE_ACTION, ROBOT_FAULT
    title = Column(String(100), nullable=False)
    message = Column(Text, nullable=False)
    severity = Column(String(20), default="info") # info, warning, critical
    read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    actor = Column(String(100), default="system")
    action = Column(String(100), nullable=False)
    category = Column(String(50), nullable=False) # IoT, Hardware, AI, User, Robot
    details = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
