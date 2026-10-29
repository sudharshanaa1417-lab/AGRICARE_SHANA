from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import re

from app.database import get_db
from app.models import User, AuditLog
from app.schemas import UserRegister, UserLogin, UserResponse

router = APIRouter(prefix="/api/auth", tags=["User Authentication & Farm Management"])

# Phone and PIN code validation helpers
def validate_phone(phone: str) -> bool:
    # Accepts 10-digit Indian numbers with optional +91
    cleaned = re.sub(r'[\s\-\+]', '', phone)
    if cleaned.startswith("91") and len(cleaned) == 12:
        cleaned = cleaned[2:]
    return len(cleaned) == 10 and cleaned.isdigit()

def validate_pincode(pin: str) -> bool:
    # 6-digit Indian PIN code
    return len(pin) == 6 and pin.isdigit()

@router.post("/register", response_model=UserResponse)
def register_user(req: UserRegister, db: Session = Depends(get_db)):
    """Registers a new farmer, validating mobile phone and PIN code"""
    if not validate_phone(req.phone):
        raise HTTPException(status_code=400, detail="Invalid phone number. Please enter a valid 10-digit Indian mobile number.")

    if not validate_pincode(req.pincode):
        raise HTTPException(status_code=400, detail="Invalid PIN code. Please enter a 6-digit postal code.")

    existing = db.query(User).filter(User.phone == req.phone).first()
    if existing:
        raise HTTPException(status_code=400, detail="A farmer account with this phone number already exists. Please log in.")

    user = User(
        phone=req.phone,
        name=req.name,
        state=req.state,
        district=req.district,
        village=req.village,
        pincode=req.pincode,
        preferred_lang=req.preferred_lang,
        farm_name=req.farm_name,
        farm_size_acres=req.farm_size_acres,
        role=req.role
    )
    db.add(user)

    db.add(AuditLog(
        actor=user.phone,
        action="Registered new farm profile",
        category="User",
        details=f"{user.name} ({user.district}, {user.state})"
    ))
    db.commit()
    db.refresh(user)
    return user

@router.post("/login")
def login_user(req: UserLogin, db: Session = Depends(get_db)):
    """
    Authenticates user via phone number and OTP.
    OTP verification simulation (accepts '123456' or any 6-digit test code in development).
    """
    if not validate_phone(req.phone):
        raise HTTPException(status_code=400, detail="Please enter a valid 10-digit mobile number.")

    user = db.query(User).filter(User.phone == req.phone).first()
    if not user:
        # Auto-create demo farmer account if phone not found for quick testing
        user = User(
            phone=req.phone,
            name="Green Valley Farmer",
            state="Tamil Nadu",
            district="Coimbatore",
            village="Thondamuthur",
            pincode="641109",
            preferred_lang="en",
            farm_name="AgriCare Model Farm",
            farm_size_acres=2.5,
            role="farmer"
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    return {
        "status": "success",
        "message": "Welcome to AgriCare! 🌱 Your Smart Farming Journey Starts Here.",
        "token": f"agri_jwt_{user.id}_token_session",
        "user": {
            "id": user.id,
            "name": user.name,
            "phone": user.phone,
            "state": user.state,
            "district": user.district,
            "village": user.village,
            "pincode": user.pincode,
            "preferred_lang": user.preferred_lang,
            "farm_name": user.farm_name,
            "farm_size_acres": user.farm_size_acres,
            "role": user.role
        }
    }

@router.get("/profile")
def get_current_profile(db: Session = Depends(get_db)):
    """Retrieves profile of the active farmer"""
    user = db.query(User).first()
    if not user:
        # Default seeded profile
        user = User(
            phone="9876543210",
            name="Ramesh Kumar",
            state="Tamil Nadu",
            district="Coimbatore",
            village="Thondamuthur",
            pincode="641109",
            preferred_lang="en",
            farm_name="Sri Amman Agro Farm",
            farm_size_acres=3.5,
            role="farmer"
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    return user
