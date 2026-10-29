from fastapi import APIRouter, Depends, HTTPException, Header, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import Optional, List
from datetime import datetime, timedelta
import random

from app.database import get_db
from app.config import settings
from app.models import TelemetryReading, DeviceCommand, Notification, AuditLog
from app.schemas import (
    TelemetryCreate, TelemetryResponse, 
    DeviceCommandPollResponse, DeviceCommandRequest, DeviceCommandStatus
)

router = APIRouter(tags=["IoT Hardware & Telemetry"])

def verify_device_key(x_api_key: Optional[str] = Header(None)):
    if not x_api_key or x_api_key != settings.DEVICE_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing X-API-Key header. Check your firmware settings."
        )
    return x_api_key

# ====================================================================
# 1. INGESTION ENDPOINT: POST /api/readings (Called by ESP8266 NodeMCU)
# ====================================================================
@router.post("/api/readings", status_code=status.HTTP_201_CREATED)
def ingest_telemetry(
    payload: TelemetryCreate,
    db: Session = Depends(get_db),
    api_key: str = Depends(verify_device_key)
):
    """
    Ingests sensor telemetry directly from Arduino ESP8266 kit.
    Authenticates using X-API-Key header.
    """
    reading = TelemetryReading(
        device_id=payload.device_id,
        timestamp=datetime.utcnow(),
        soil_raw=payload.soil_raw,
        moisture=payload.moisture,
        temperature=payload.temperature,
        humidity=payload.humidity,
        nitrogen=payload.nitrogen if payload.nitrogen != -1 else None,
        phosphorus=payload.phosphorus if payload.phosphorus != -1 else None,
        potassium=payload.potassium if payload.potassium != -1 else None,
        water_open=payload.water_open,
        medicine_open=payload.medicine_open,
        auto_water=payload.auto_water
    )
    db.add(reading)

    # Threshold Check & In-app Notification
    if payload.moisture is not None and payload.moisture < 30.0:
        notif = Notification(
            type="SENSOR_ALERT",
            title="Low Soil Moisture Alert",
            message=f"Device {payload.device_id} detected low moisture: {payload.moisture:.1f}%. Immediate irrigation recommended.",
            severity="warning"
        )
        db.add(notif)

    db.commit()
    db.refresh(reading)
    return {"status": "success", "id": reading.id, "device_id": reading.device_id}

# ====================================================================
# 2. COMMAND POLLING: GET /api/command?device_id=esp8266-01 (Called by ESP8266)
# ====================================================================
@router.get("/api/command", response_model=DeviceCommandPollResponse)
def poll_device_command(
    device_id: str = Query("esp8266-01"),
    db: Session = Depends(get_db),
    api_key: str = Depends(verify_device_key)
):
    """
    Polled every 5 seconds by ESP8266 firmware to receive remote valve/motor commands.
    Returns next pending command string or empty string.
    """
    pending = (
        db.query(DeviceCommand)
        .filter(DeviceCommand.device_id == device_id, DeviceCommand.status == "PENDING")
        .order_by(DeviceCommand.requested_at.asc())
        .first()
    )

    if pending:
        pending.status = "EXECUTED"
        pending.executed_at = datetime.utcnow()
        db.commit()

        # Audit log
        db.add(AuditLog(
            actor=f"device:{device_id}",
            action=f"Dispatched command: {pending.command}",
            category="Hardware",
            details=f"Command ID {pending.id} acknowledged by device poll."
        ))
        db.commit()

        return {"command": pending.command}

    return {"command": ""}

# ====================================================================
# 3. DISPATCH COMMAND: POST /api/command (Called by Web Dashboard)
# ====================================================================
@router.post("/api/command", response_model=DeviceCommandStatus)
def dispatch_command(
    req: DeviceCommandRequest,
    db: Session = Depends(get_db)
):
    """
    Allows user to trigger WATER_ON, WATER_OFF, MEDICINE_ON, MEDICINE_OFF, AUTO_ON, AUTO_OFF.
    Creates a PENDING command for the ESP8266 to pick up.
    """
    valid_commands = ["WATER_ON", "WATER_OFF", "MEDICINE_ON", "MEDICINE_OFF", "AUTO_ON", "AUTO_OFF", "EMERGENCY_STOP"]
    if req.command not in valid_commands:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid command '{req.command}'. Must be one of: {', '.join(valid_commands)}"
        )

    # In case of EMERGENCY_STOP, translate to both valves OFF
    cmd_to_queue = "WATER_OFF" if req.command == "EMERGENCY_STOP" else req.command

    cmd = DeviceCommand(
        device_id=req.device_id,
        command=cmd_to_queue,
        status="PENDING",
        requested_at=datetime.utcnow()
    )
    db.add(cmd)

    db.add(AuditLog(
        actor="farmer_dashboard",
        action=f"Requested command {req.command}",
        category="Hardware",
        details=f"Dispatched to target device {req.device_id}"
    ))

    db.commit()
    db.refresh(cmd)
    return cmd

# ====================================================================
# 4. LATEST TELEMETRY FOR DASHBOARD: GET /api/telemetry/latest
# ====================================================================
@router.get("/api/telemetry/latest")
def get_latest_telemetry(
    device_id: str = Query("esp8266-01"),
    db: Session = Depends(get_db)
):
    latest = (
        db.query(TelemetryReading)
        .filter(TelemetryReading.device_id == device_id)
        .order_by(desc(TelemetryReading.timestamp))
        .first()
    )

    if not latest:
        return {
            "status": "WAITING_FOR_DATA",
            "device_id": device_id,
            "connected": False,
            "message": "Waiting for device data. Please power on your NodeMCU ESP8266 kit.",
            "reading": None
        }

    now = datetime.utcnow()
    diff_sec = (now - latest.timestamp).total_seconds()
    is_online = diff_sec < 45.0  # Polling is 5s, offline if >45s without packet
    is_stale = diff_sec >= 45.0 and diff_sec < 180.0

    connection_status = "ONLINE" if is_online else ("STALE" if is_stale else "OFFLINE")

    return {
        "status": connection_status,
        "device_id": device_id,
        "connected": is_online,
        "seconds_ago": int(diff_sec),
        "last_seen": latest.timestamp.isoformat(),
        "reading": {
            "soil_raw": latest.soil_raw,
            "moisture": latest.moisture,
            "temperature": latest.temperature,
            "humidity": latest.humidity,
            "nitrogen": latest.nitrogen,
            "phosphorus": latest.phosphorus,
            "potassium": latest.potassium,
            "water_open": latest.water_open,
            "medicine_open": latest.medicine_open,
            "auto_water": latest.auto_water
        }
    }

# ====================================================================
# 5. HISTORICAL SENSOR DATA: GET /api/telemetry/history
# ====================================================================
@router.get("/api/telemetry/history")
def get_telemetry_history(
    device_id: str = Query("esp8266-01"),
    hours: int = Query(24, ge=1, le=720),
    db: Session = Depends(get_db)
):
    cutoff = datetime.utcnow() - timedelta(hours=hours)
    readings = (
        db.query(TelemetryReading)
        .filter(TelemetryReading.device_id == device_id, TelemetryReading.timestamp >= cutoff)
        .order_by(TelemetryReading.timestamp.asc())
        .all()
    )

    if not readings:
        return {
            "device_id": device_id,
            "total_points": 0,
            "data": [],
            "stats": None
        }

    moistures = [r.moisture for r in readings if r.moisture is not None]
    temps = [r.temperature for r in readings if r.temperature is not None]
    humids = [r.humidity for r in readings if r.humidity is not None]

    stats = {
        "moisture": {
            "min": round(min(moistures), 1) if moistures else None,
            "max": round(max(moistures), 1) if moistures else None,
            "avg": round(sum(moistures) / len(moistures), 1) if moistures else None
        },
        "temperature": {
            "min": round(min(temps), 1) if temps else None,
            "max": round(max(temps), 1) if temps else None,
            "avg": round(sum(temps) / len(temps), 1) if temps else None
        },
        "humidity": {
            "min": round(min(humids), 1) if humids else None,
            "max": round(max(humids), 1) if humids else None,
            "avg": round(sum(humids) / len(humids), 1) if humids else None
        }
    }

    return {
        "device_id": device_id,
        "total_points": len(readings),
        "stats": stats,
        "data": [
            {
                "timestamp": r.timestamp.isoformat(),
                "moisture": r.moisture,
                "temperature": r.temperature,
                "humidity": r.humidity,
                "nitrogen": r.nitrogen,
                "phosphorus": r.phosphorus,
                "potassium": r.potassium,
                "water_open": r.water_open,
                "medicine_open": r.medicine_open,
                "auto_water": r.auto_water
            }
            for r in readings
        ]
    }

# ====================================================================
# 6. DEMO SEED FOR SIMULATION / DISCONNECTED MODE
# ====================================================================
@router.post("/api/telemetry/demo-seed")
def seed_demo_readings(
    device_id: str = Query("esp8266-01"),
    db: Session = Depends(get_db)
):
    """Generates 24 realistic points for testing charts before hardware connects"""
    now = datetime.utcnow()
    for i in range(24):
        t = now - timedelta(hours=24 - i)
        base_temp = 26.0 + 4.0 * (1 - abs(i - 14) / 10.0) # Peaks around 2 PM
        reading = TelemetryReading(
            device_id=device_id,
            timestamp=t,
            soil_raw=random.randint(480, 560),
            moisture=round(38.0 + random.uniform(-4.0, 6.0), 1),
            temperature=round(base_temp + random.uniform(-1.0, 1.0), 1),
            humidity=round(62.0 + random.uniform(-5.0, 5.0), 1),
            nitrogen=random.randint(40, 55),
            phosphorus=random.randint(20, 28),
            potassium=random.randint(95, 120),
            water_open=False,
            medicine_open=False,
            auto_water=True
        )
        db.add(reading)
    db.commit()
    return {"status": "seeded", "points": 24}
