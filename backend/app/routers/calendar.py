from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.database import get_db
from app.models import CropCareTask
from app.schemas import CropTaskResponse, TaskToggleRequest

router = APIRouter(prefix="/api/calendar", tags=["Crop Care Calendar"])

# Standard agronomic schedules for major crops (Day 1 to Harvest)
CROP_CALENDARS = {
    "tomato": [
        {
            "day_number": 1,
            "stage": "Nursery & Sowing",
            "title": "Seedbed Preparation & Sowing",
            "irrigation": "Light sprinkling with fine rose can twice daily. Avoid flooding.",
            "nutrition": "Incorporate well-decomposed FYM (10 kg/sq.m) + Trichoderma viride @ 50g.",
            "scouting": "Check for ant activity and damping-off fungus in nursery bed.",
            "field_maint": "Erect 50% agro-shade net over seedling beds.",
            "observation": "Moist soil, intact seed covers without crust formation."
        },
        {
            "day_number": 7,
            "stage": "Seedling Germination",
            "title": "Germination & First True Leaves",
            "irrigation": "Morning irrigation only to prevent overnight foliar dampness.",
            "nutrition": "Foliar drench of 19:19:19 (NPK) @ 2 g/L to boost root elongation.",
            "scouting": "Inspect for tiny flea beetles or cutworm damage on tender cotyledons.",
            "field_maint": "Thin out crowded seedlings to maintain 5 cm inter-plant space.",
            "observation": "85%+ uniform germination with vibrant green cotyledons."
        },
        {
            "day_number": 25,
            "stage": "Transplanting",
            "title": "Main Field Transplanting",
            "irrigation": "Pre-irrigate ridges to field capacity 24 hours prior to transplanting.",
            "nutrition": "Basal dose: DAP 50 kg + MOP 30 kg + Neem cake 100 kg per acre.",
            "scouting": "Dip roots in Pseudomonas fluorescens (5g/L) for 20 mins to prevent wilt.",
            "field_maint": "Transplant in late afternoon at 60 cm x 45 cm spacing on raised beds.",
            "observation": "Erect seedlings showing minimal transplant shock after 48 hrs."
        },
        {
            "day_number": 45,
            "stage": "Vegetative & Branching",
            "title": "Staking & First Top Dressing",
            "irrigation": "Drip irrigation every 2 days (maintain 35-45% soil moisture).",
            "nutrition": "Top dress Urea 25 kg + Micronutrient mix (Zinc, Iron) foliar spray.",
            "scouting": "Look for leaf miner serpentine mines and early blight target spots.",
            "field_maint": "Install bamboo stakes and tie primary stems with soft twine.",
            "observation": "Strong primary and secondary branches with dark green canopy."
        },
        {
            "day_number": 65,
            "stage": "Flowering & Fruit Set",
            "title": "Pollination & Fruit Retention",
            "irrigation": "Maintain strictly uniform moisture; moisture fluctuation triggers Blossom End Rot.",
            "nutrition": "Apply Calcium Nitrate @ 5 kg/acre via drip + Boron 20% @ 1 g/L spray.",
            "scouting": "Check flower clusters for thrips, whiteflies, and fruit borer eggs.",
            "field_maint": "Prune suckers (side shoots below first flower cluster).",
            "observation": "Abundant yellow flowers setting into marble-sized green fruits."
        },
        {
            "day_number": 90,
            "stage": "Harvesting",
            "title": "First Picking at Breaker Stage",
            "irrigation": "Withhold irrigation 2 days prior to harvest to enhance fruit brix/shelf-life.",
            "nutrition": "SOP (0-0-50) @ 3 g/L to enhance fruit color and firmness.",
            "scouting": "Monitor fruit borer entry holes near calyx.",
            "field_maint": "Harvest in plastic crates with soft lining during cool morning hours.",
            "observation": "Firm fruits showing pink-red star at blossom end (Breaker stage)."
        }
    ],
    "rice": [
        {
            "day_number": 1,
            "stage": "Land Preparation",
            "title": "Wet Puddling & Basal Fertilization",
            "irrigation": "Puddle soil thoroughly with 5 cm standing water.",
            "nutrition": "Basal application: DAP 40 kg, MOP 20 kg, Zinc Sulphate 10 kg/acre.",
            "scouting": "Inspect for snail infestation in nursery and field channels.",
            "field_maint": "Level field perfectly with wooden leveler plank.",
            "observation": "Silky puddled mud without standing weed clods."
        },
        {
            "day_number": 18,
            "stage": "Transplanting",
            "title": "Transplanting Seedlings",
            "irrigation": "Maintain shallow 2 cm water depth to aid seedling anchoring.",
            "nutrition": "Avoid urea during first 5 days post-transplant.",
            "scouting": "Check for whorl maggot and green leafhopper nymphs.",
            "field_maint": "Plant 2-3 seedlings per hill at 20 cm x 15 cm spacing.",
            "observation": "Upright tillers taking root within 4 days."
        },
        {
            "day_number": 40,
            "stage": "Tillering",
            "title": "Maximum Tillering & First Weeding",
            "irrigation": "Practice Alternate Wetting and Drying (AWD). Let water drop 5 cm below surface.",
            "nutrition": "Top dress Urea 30 kg mixed with neem oil (neem-coated urea effect).",
            "scouting": "Scout for 'Dead Hearts' caused by Yellow Stem Borer larvae.",
            "field_maint": "Run Cono Weeder between rows to incorporate weeds and aerate roots.",
            "observation": "15-20 vigorous tillers per hill."
        },
        {
            "day_number": 75,
            "stage": "Panicle Initiation",
            "title": "Booting & Panicle Emergence",
            "irrigation": "Maintain continuous 3-5 cm water layer (critical moisture-sensitive stage).",
            "nutrition": "Apply MOP 15 kg/acre to strengthen culms against lodging.",
            "scouting": "Inspect flag leaves for blast spindle lesions and sheath blight spots.",
            "field_maint": "Keep field bunds trimmed to discourage rodent burrowing.",
            "observation": "Swollen flag leaf sheaths with emerging milk-stage panicles."
        },
        {
            "day_number": 115,
            "stage": "Maturity & Harvest",
            "title": "Golden Grain Harvest",
            "irrigation": "Drain field completely 10-12 days before anticipated harvest date.",
            "nutrition": "No fertilization required.",
            "scouting": "Check grain moisture content (ideal harvest moisture is 20-22%).",
            "field_maint": "Reap with combine harvester or sickle when 85% of grains turn straw-gold.",
            "observation": "Uniform golden yellow panicles bending with heavy grain weight."
        }
    ]
}

@router.get("/tasks", response_model=List[CropTaskResponse])
def get_crop_tasks(
    crop: str = Query("tomato"),
    db: Session = Depends(get_db)
):
    """Retrieves Day 1 to Harvest daily agronomic timeline tasks for selected crop"""
    crop_key = crop.lower()
    existing = db.query(CropCareTask).filter(CropCareTask.crop == crop_key).order_by(CropCareTask.day_number.asc()).all()

    if not existing:
        # Seed standard crop schedule
        templates = CROP_CALENDARS.get(crop_key, CROP_CALENDARS["tomato"])
        new_tasks = []
        for t in templates:
            task = CropCareTask(
                crop=crop_key,
                day_number=t["day_number"],
                stage=t["stage"],
                title=t["title"],
                irrigation_guide=t["irrigation"],
                nutrient_management=t["nutrition"],
                pest_scouting=t["scouting"],
                field_maintenance=t["field_maint"],
                expected_observation=t["observation"],
                completed=False
            )
            db.add(task)
            new_tasks.append(task)
        db.commit()
        for t in new_tasks:
            db.refresh(t)
        return new_tasks

    return existing

@router.patch("/tasks/{task_id}/toggle")
def toggle_task_completion(
    task_id: int,
    req: TaskToggleRequest,
    db: Session = Depends(get_db)
):
    """Marks a daily farming task as completed or pending, updating timestamp"""
    task = db.query(CropCareTask).filter(CropCareTask.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Crop task not found")

    task.completed = req.completed
    task.completed_at = datetime.utcnow() if req.completed else None
    db.commit()
    db.refresh(task)
    return {"status": "success", "id": task.id, "completed": task.completed, "completed_at": task.completed_at}
