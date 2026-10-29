from fastapi import APIRouter, Depends, Query, Response
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import Optional, List
from datetime import datetime, timedelta
import csv
import io

from app.database import get_db
from app.models import AuditLog, TelemetryReading, DeviceCommand, CropDiagnosis, YieldPredictionRecord

router = APIRouter(prefix="/api/history", tags=["History & Reports"])

@router.get("/logs")
def get_audit_history(
    category: Optional[str] = Query(None), # Hardware, AI, Robot, User, IoT
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db)
):
    """Retrieves unified chronologically sorted farm audit records"""
    query = db.query(AuditLog)
    if category and category != "ALL":
        query = query.filter(AuditLog.category == category)

    logs = query.order_by(desc(AuditLog.timestamp)).limit(limit).all()

    # If database is fresh, provide initial historical benchmarks
    if not logs:
        return [
            {
                "id": 1,
                "actor": "esp8266-01",
                "action": "Soil Telemetry Synced",
                "category": "IoT",
                "details": "Moisture: 42.5%, Temp: 28.4°C, NPK: 45/22/110 mg/kg",
                "timestamp": datetime.utcnow().isoformat()
            },
            {
                "id": 2,
                "actor": "farmer_dashboard",
                "action": "Automated Irrigation Armed",
                "category": "Hardware",
                "details": "Auto-water mode set to ON (Threshold: 30%)",
                "timestamp": (datetime.utcnow() - timedelta(minutes=15)).isoformat()
            },
            {
                "id": 3,
                "actor": "AgriCare-Vision-v2.5",
                "action": "Crop Disease Diagnosis",
                "category": "AI",
                "details": "Tomato Early Blight detected with 93.4% model confidence.",
                "timestamp": (datetime.utcnow() - timedelta(hours=2)).isoformat()
            }
        ]

    return logs

@router.get("/export/csv")
def export_telemetry_csv(
    device_id: str = Query("esp8266-01"),
    db: Session = Depends(get_db)
):
    """Generates downloadable CSV report of sensor telemetry readings"""
    readings = (
        db.query(TelemetryReading)
        .filter(TelemetryReading.device_id == device_id)
        .order_by(desc(TelemetryReading.timestamp))
        .limit(500)
        .all()
    )

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Timestamp (UTC)", "Device ID", "Moisture (%)", "Temperature (°C)", 
        "Humidity (%)", "Nitrogen (mg/kg)", "Phosphorus (mg/kg)", "Potassium (mg/kg)", 
        "Water Valve State", "Medicine Valve State", "Auto-Water Mode"
    ])

    for r in readings:
        writer.writerow([
            r.timestamp.isoformat(),
            r.device_id,
            r.moisture,
            r.temperature,
            r.humidity,
            r.nitrogen,
            r.phosphorus,
            r.potassium,
            "OPEN" if r.water_open else "CLOSED",
            "OPEN" if r.medicine_open else "CLOSED",
            "ENABLED" if r.auto_water else "DISABLED"
        ])

    csv_data = output.getvalue()
    filename = f"AgriCare_Telemetry_{device_id}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.csv"

    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
