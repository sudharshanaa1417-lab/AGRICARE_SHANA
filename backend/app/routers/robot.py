from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
import math

from app.database import get_db
from app.models import RobotTelemetry, AuditLog
from app.schemas import RobotCommandRequest, RobotTelemetryResponse

router = APIRouter(prefix="/api/robot", tags=["Solar Field Robot"])

# In-memory robot controller state (initialized on startup)
_ROBOT_STATE = {
    "status": "IDLE", # IDLE, RUNNING_AUTONOMOUS, RETURNING, PAUSED, EMERGENCY_STOP
    "mode": "MANUAL", # MANUAL, AUTONOMOUS
    "x_pos": 10.0,    # feet
    "y_pos": 10.0,    # feet
    "heading_deg": 90.0, # Facing East (forward along row)
    "distance_target_ft": 20.0,
    "distance_travelled_ft": 0.0,
    "battery_pct": 94.0,
    "solar_power_w": 48.5,
    "obstacle_detected": False,
    "last_command": "STOP",
    "updated_at": datetime.utcnow()
}

@router.get("/telemetry", response_model=RobotTelemetryResponse)
def get_robot_telemetry(db: Session = Depends(get_db)):
    """Fetches real-time solar field robot status, coordinates, battery, and heading"""
    _ROBOT_STATE["updated_at"] = datetime.utcnow()
    return RobotTelemetryResponse(**_ROBOT_STATE)

@router.post("/command", response_model=RobotTelemetryResponse)
def send_robot_command(
    req: RobotCommandRequest,
    db: Session = Depends(get_db)
):
    """
    Submits command to the solar field robot rover.
    Handles autonomous 20ft mission sequence, manual jog, emergency stop, and mode changes.
    """
    cmd = req.command.upper()
    _ROBOT_STATE["last_command"] = cmd
    _ROBOT_STATE["updated_at"] = datetime.utcnow()

    if cmd == "CONNECT":
        _ROBOT_STATE["status"] = "IDLE"
        _ROBOT_STATE["battery_pct"] = 94.0
        _ROBOT_STATE["obstacle_detected"] = False

    elif cmd == "SET_MODE" and req.mode:
        _ROBOT_STATE["mode"] = req.mode.upper()

    elif cmd == "START":
        # Autonomous 20ft forward -> U-Turn -> Return mission
        _ROBOT_STATE["status"] = "RUNNING_AUTONOMOUS"
        _ROBOT_STATE["mode"] = "AUTONOMOUS"
        _ROBOT_STATE["distance_target_ft"] = req.distance_ft if req.distance_ft else 20.0
        _ROBOT_STATE["distance_travelled_ft"] = 0.0
        _ROBOT_STATE["x_pos"] = 10.0
        _ROBOT_STATE["y_pos"] = 10.0
        _ROBOT_STATE["heading_deg"] = 90.0

    elif cmd == "PAUSE":
        if _ROBOT_STATE["status"] in ["RUNNING_AUTONOMOUS", "RETURNING"]:
            _ROBOT_STATE["status"] = "PAUSED"

    elif cmd == "RESUME":
        if _ROBOT_STATE["status"] == "PAUSED":
            _ROBOT_STATE["status"] = "RUNNING_AUTONOMOUS"

    elif cmd == "STOP" or cmd == "EMERGENCY_STOP":
        _ROBOT_STATE["status"] = "EMERGENCY_STOP" if cmd == "EMERGENCY_STOP" else "IDLE"
        _ROBOT_STATE["last_command"] = cmd

    elif cmd == "FORWARD":
        _ROBOT_STATE["status"] = "MOVING"
        _ROBOT_STATE["mode"] = "MANUAL"
        rad = math.radians(_ROBOT_STATE["heading_deg"])
        _ROBOT_STATE["x_pos"] = round(_ROBOT_STATE["x_pos"] + 2.0 * math.cos(rad), 1)
        _ROBOT_STATE["y_pos"] = round(_ROBOT_STATE["y_pos"] + 2.0 * math.sin(rad), 1)
        _ROBOT_STATE["distance_travelled_ft"] = round(_ROBOT_STATE["distance_travelled_ft"] + 2.0, 1)

    elif cmd == "BACKWARD":
        _ROBOT_STATE["status"] = "MOVING"
        _ROBOT_STATE["mode"] = "MANUAL"
        rad = math.radians(_ROBOT_STATE["heading_deg"])
        _ROBOT_STATE["x_pos"] = round(_ROBOT_STATE["x_pos"] - 2.0 * math.cos(rad), 1)
        _ROBOT_STATE["y_pos"] = round(_ROBOT_STATE["y_pos"] - 2.0 * math.sin(rad), 1)

    elif cmd == "LEFT":
        _ROBOT_STATE["heading_deg"] = (_ROBOT_STATE["heading_deg"] - 45.0) % 360.0

    elif cmd == "RIGHT":
        _ROBOT_STATE["heading_deg"] = (_ROBOT_STATE["heading_deg"] + 45.0) % 360.0

    elif cmd == "RETURN_HOME":
        _ROBOT_STATE["status"] = "RETURNING"
        _ROBOT_STATE["x_pos"] = 10.0
        _ROBOT_STATE["y_pos"] = 10.0
        _ROBOT_STATE["heading_deg"] = 90.0

    # Audit log
    db.add(AuditLog(
        actor="farmer_dashboard",
        action=f"Robot Command: {cmd}",
        category="Robot",
        details=f"Target dist: {_ROBOT_STATE['distance_target_ft']} ft, Mode: {_ROBOT_STATE['mode']}"
    ))
    db.commit()

    return RobotTelemetryResponse(**_ROBOT_STATE)
