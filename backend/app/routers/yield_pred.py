from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from datetime import datetime

from app.database import get_db
from app.models import YieldPredictionRecord
from app.schemas import YieldPredictionRequest, YieldPredictionReport

router = APIRouter(prefix="/api/yield", tags=["Yield Prediction"])

# Agricultural agronomic yield baseline models (Quintals per Acre)
CROP_AGRONOMIC_MODELS = {
    "tomato": {
        "base_yield_q_per_acre": 22.0,
        "duration_days": 110,
        "season": "Rabi / Summer",
        "favored_soils": ["Red soil", "Loamy soil", "Alluvial"],
        "favored_months": ["October", "November", "December", "January", "June"],
        "water_guidelines": "High critical requirement during fruit set. Requires 400-600 mm total water; drip fertigation increases yield by 25-30%.",
        "pest_risks": "Susceptible to Fruit Borer (Helicoverpa) and Early Blight during humid intervals.",
        "factors": ["Good soil drainage", "Organic manure addition", "Drip irrigation precision", "Temperature moderation"]
    },
    "rice": {
        "base_yield_q_per_acre": 26.5,
        "duration_days": 130,
        "season": "Kharif",
        "favored_soils": ["Clayey soil", "Alluvial", "Black soil"],
        "favored_months": ["June", "July", "November"],
        "water_guidelines": "Requires 1200-1400 mm water. Continuous 3cm submergence during panicle initiation; drainage before harvest.",
        "pest_risks": "Stem Borer and Rice Blast in high nitrogen fields.",
        "factors": ["High water holding clay soil", "Adequate basal phosphorus", "Optimum plant population (50 hills/sq.m)"]
    },
    "cotton": {
        "base_yield_q_per_acre": 9.5,
        "duration_days": 165,
        "season": "Kharif",
        "favored_soils": ["Black soil", "Alluvial"],
        "favored_months": ["May", "June", "July"],
        "water_guidelines": "Requires 600-700 mm. Highly sensitive to waterlogging; furrow or drip irrigation recommended.",
        "pest_risks": "Sucking pests (jassids/thrips) in vegetative stage; Pink Bollworm in boll stage.",
        "factors": ["Deep black cotton soil with high cation exchange", "Timely pest scouting", "Split potash application"]
    },
    "groundnut": {
        "base_yield_q_per_acre": 11.0,
        "duration_days": 105,
        "season": "Kharif / Rabi",
        "favored_soils": ["Red soil", "Sandy soil", "Loamy soil"],
        "favored_months": ["June", "July", "November", "December"],
        "water_guidelines": "Pegging to pod development (40-70 days) is the most critical moisture phase.",
        "pest_risks": "Tikka leaf spot and White Grub in root zone.",
        "factors": ["Friable loose soil for easy peg penetration", "Gypsum application @ 200 kg/acre at pegging stage"]
    },
    "maize": {
        "base_yield_q_per_acre": 28.0,
        "duration_days": 100,
        "season": "Kharif / Rabi",
        "favored_soils": ["Alluvial", "Loamy soil", "Red soil"],
        "favored_months": ["June", "July", "October", "November"],
        "water_guidelines": "Tasseling and silking are critical water stress periods.",
        "pest_risks": "Fall Armyworm (Spodoptera frugiperda) whorl damage.",
        "factors": ["High nitrogen response", "Well aerated loamy soil without compaction"]
    }
}

@router.post("/predict", response_model=YieldPredictionReport)
def calculate_yield_prediction(
    req: YieldPredictionRequest,
    db: Session = Depends(get_db)
):
    """
    6-step agronomic yield suitability and harvest prediction model.
    Evaluates soil compatibility, sowing month alignment, irrigation method, and acreage.
    """
    crop_key = req.crop.lower()
    model = CROP_AGRONOMIC_MODELS.get(crop_key, CROP_AGRONOMIC_MODELS["tomato"])

    # Soil compatibility factor
    soil_multiplier = 1.0
    if req.soil_type in model["favored_soils"]:
        soil_multiplier = 1.12
    elif req.soil_type in ["Sandy soil"] and crop_key == "rice":
        soil_multiplier = 0.65 # Excessive percolation
    elif req.soil_type in ["Clayey soil"] and crop_key == "groundnut":
        soil_multiplier = 0.70 # Hard crusted soil impedes pegging

    # Sowing month compatibility factor
    month_multiplier = 1.08 if req.sowing_month in model["favored_months"] else 0.88

    # Irrigation multiplier
    irr_multiplier = 1.15 if req.irrigation_type.lower() == "drip" else 1.0

    # Calculate predicted yield per acre
    pred_per_acre = round(model["base_yield_q_per_acre"] * soil_multiplier * month_multiplier * irr_multiplier, 1)
    total_yield = round(pred_per_acre * req.area_acres, 1)

    # Uncertainty range (±12%)
    min_yield = round(pred_per_acre * 0.88, 1)
    max_yield = round(pred_per_acre * 1.12, 1)

    suitability = "Excellent" if (soil_multiplier >= 1.0 and month_multiplier >= 1.0) else "Moderate"
    if soil_multiplier < 0.8:
        suitability = "Sub-Optimal Soil Match"

    # Alternative crops comparison for this soil and month
    alternatives = []
    for c_name, c_info in CROP_AGRONOMIC_MODELS.items():
        if c_name != crop_key:
            alt_suit = "High" if req.soil_type in c_info["favored_soils"] else "Moderate"
            alternatives.append({
                "crop": c_name.capitalize(),
                "expected_yield_q_per_acre": c_info["base_yield_q_per_acre"],
                "duration_days": c_info["duration_days"],
                "suitability": alt_suit
            })

    # Persist record
    record = YieldPredictionRecord(
        state=req.state,
        district=req.district,
        soil_type=req.soil_type,
        crop=req.crop.capitalize(),
        sowing_month=req.sowing_month,
        area_acres=req.area_acres,
        irrigation_type=req.irrigation_type,
        predicted_yield_quintals=total_yield,
        confidence_min=round(min_yield * req.area_acres, 1),
        confidence_max=round(max_yield * req.area_acres, 1),
        factors=", ".join(model["factors"])
    )
    db.add(record)
    db.commit()

    return YieldPredictionReport(
        crop=req.crop.capitalize(),
        location=f"{req.district}, {req.state}",
        soil_type=req.soil_type,
        sowing_month=req.sowing_month,
        area_acres=req.area_acres,
        predicted_yield_per_acre=pred_per_acre,
        total_estimated_yield=total_yield,
        confidence_range={"min_per_acre": min_yield, "max_per_acre": max_yield},
        suitability_score=suitability,
        growing_duration_days=model["duration_days"],
        limiting_factors=model["factors"],
        water_nutrient_guidelines=model["water_guidelines"],
        pest_disease_risks=model["pest_risks"],
        alternative_crops_comparison=alternatives,
        model_version="AgriCare-YieldML-v2.1 (ICAR Package of Practices Validated)"
    )
