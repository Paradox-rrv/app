from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")


# ============ MODELS ============

class Brand(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    name: str
    logo: str

class PhoneModel(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    brand_id: str
    name: str
    base_price: int
    image: str

class Question(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    text: str
    category: str
    deduction_percentage: float
    is_blocking: bool
    yes_deducts: bool

class PriceCalculationRequest(BaseModel):
    model_id: str
    answers: Dict[str, bool]

class PriceCalculationResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    base_price: int
    final_price: int
    deductions: List[Dict[str, Any]]
    is_blocked: bool
    block_reason: Optional[str] = None

class PhoneForSale(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    brand: str
    model: str
    price: int
    condition: str
    image: str
    description: str
    specs: Dict[str, str]
    in_stock: bool

class LeadSubmission(BaseModel):
    name: str
    phone: str
    area: str
    preferred_time: str
    phone_model: Optional[str] = None
    offered_price: Optional[int] = None
    remarks: Optional[str] = None
    lead_type: str

class LeadResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    name: str
    phone: str
    area: str
    lead_type: str
    created_at: str


# ============ ROUTES ============

@api_router.get("/")
async def root():
    return {"message": "PhoneXchange Patna API"}

@api_router.get("/brands", response_model=List[Brand])
async def get_brands():
    brands = await db.brands.find({}, {"_id": 0}).to_list(100)
    return brands

@api_router.get("/models/{brand_id}", response_model=List[PhoneModel])
async def get_models(brand_id: str):
    models = await db.phone_models.find({"brand_id": brand_id}, {"_id": 0}).to_list(100)
    return models

@api_router.get("/questions", response_model=List[Question])
async def get_questions():
    questions = await db.questions.find({}, {"_id": 0}).to_list(100)
    return questions

@api_router.post("/calculate-price", response_model=PriceCalculationResponse)
async def calculate_price(request: PriceCalculationRequest):
    phone_model = await db.phone_models.find_one({"id": request.model_id}, {"_id": 0})
    if not phone_model:
        raise HTTPException(status_code=404, detail="Phone model not found")
    
    base_price = phone_model["base_price"]
    questions = await db.questions.find({}, {"_id": 0}).to_list(100)
    
    deductions = []
    total_deduction_percentage = 0
    is_blocked = False
    block_reason = None
    
    for question in questions:
        answer = request.answers.get(question["id"], False)
        
        if question["is_blocking"]:
            if (question["yes_deducts"] and answer) or (not question["yes_deducts"] and not answer):
                is_blocked = True
                block_reason = question["text"]
                break
        
        if question["yes_deducts"] and answer:
            deductions.append({
                "question": question["text"],
                "percentage": question["deduction_percentage"]
            })
            total_deduction_percentage += question["deduction_percentage"]
        elif not question["yes_deducts"] and not answer:
            deductions.append({
                "question": question["text"],
                "percentage": question["deduction_percentage"]
            })
            total_deduction_percentage += question["deduction_percentage"]
    
    if is_blocked:
        final_price = 0
    else:
        final_price = int(base_price * (1 - total_deduction_percentage / 100))
    
    return PriceCalculationResponse(
        base_price=base_price,
        final_price=final_price,
        deductions=deductions,
        is_blocked=is_blocked,
        block_reason=block_reason
    )

@api_router.get("/phones-for-sale", response_model=List[PhoneForSale])
async def get_phones_for_sale(brand: Optional[str] = None, min_price: Optional[int] = None, max_price: Optional[int] = None):
    query = {"in_stock": True}
    if brand:
        query["brand"] = brand
    if min_price is not None or max_price is not None:
        query["price"] = {}
        if min_price is not None:
            query["price"]["$gte"] = min_price
        if max_price is not None:
            query["price"]["$lte"] = max_price
    
    phones = await db.phones_for_sale.find(query, {"_id": 0}).to_list(100)
    return phones

@api_router.get("/phones-for-sale/{phone_id}", response_model=PhoneForSale)
async def get_phone_detail(phone_id: str):
    phone = await db.phones_for_sale.find_one({"id": phone_id}, {"_id": 0})
    if not phone:
        raise HTTPException(status_code=404, detail="Phone not found")
    return phone

@api_router.post("/submit-lead", response_model=LeadResponse)
async def submit_lead(lead: LeadSubmission):
    lead_id = str(uuid.uuid4())
    created_at = datetime.now(timezone.utc).isoformat()
    
    lead_doc = {
        "id": lead_id,
        "name": lead.name,
        "phone": lead.phone,
        "area": lead.area,
        "preferred_time": lead.preferred_time,
        "phone_model": lead.phone_model,
        "offered_price": lead.offered_price,
        "remarks": lead.remarks,
        "lead_type": lead.lead_type,
        "created_at": created_at
    }
    
    await db.leads.insert_one(lead_doc)
    
    return LeadResponse(
        id=lead_id,
        name=lead.name,
        phone=lead.phone,
        area=lead.area,
        lead_type=lead.lead_type,
        created_at=created_at
    )


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()


# ============ SEED DATA ============
@app.on_event("startup")
async def seed_database():
    """Seed initial data if collections are empty"""
    
    # Check if already seeded
    if await db.brands.count_documents({}) > 0:
        logger.info("Database already seeded")
        return
    
    logger.info("Seeding database...")
    
    # Brands
    brands = [
        {"id": "samsung", "name": "Samsung", "logo": "/brands/samsung.png"},
        {"id": "xiaomi", "name": "Xiaomi", "logo": "/brands/xiaomi.png"},
        {"id": "oneplus", "name": "OnePlus", "logo": "/brands/oneplus.png"},
        {"id": "realme", "name": "Realme", "logo": "/brands/realme.png"},
        {"id": "vivo", "name": "Vivo", "logo": "/brands/vivo.png"},
        {"id": "oppo", "name": "Oppo", "logo": "/brands/oppo.png"},
    ]
    await db.brands.insert_many(brands)
    
    # Phone Models
    models = [
        {"id": "sam-s23", "brand_id": "samsung", "name": "Galaxy S23", "base_price": 45000, "image": "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400"},
        {"id": "sam-s22", "brand_id": "samsung", "name": "Galaxy S22", "base_price": 38000, "image": "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400"},
        {"id": "sam-a54", "brand_id": "samsung", "name": "Galaxy A54", "base_price": 28000, "image": "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400"},
        {"id": "xi-13pro", "brand_id": "xiaomi", "name": "13 Pro", "base_price": 42000, "image": "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400"},
        {"id": "xi-12", "brand_id": "xiaomi", "name": "12", "base_price": 32000, "image": "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400"},
        {"id": "xi-note12", "brand_id": "xiaomi", "name": "Redmi Note 12 Pro", "base_price": 22000, "image": "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400"},
        {"id": "op-11", "brand_id": "oneplus", "name": "11", "base_price": 48000, "image": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400"},
        {"id": "op-nord3", "brand_id": "oneplus", "name": "Nord 3", "base_price": 28000, "image": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400"},
        {"id": "real-11pro", "brand_id": "realme", "name": "11 Pro+", "base_price": 30000, "image": "https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=400"},
        {"id": "real-narzo", "brand_id": "realme", "name": "Narzo 60", "base_price": 18000, "image": "https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=400"},
    ]
    await db.phone_models.insert_many(models)
    
    # Questions
    questions = [
        {"id": "q1", "text": "Does the phone turn ON?", "category": "Basic Functionality", "deduction_percentage": 0, "is_blocking": True, "yes_deducts": False},
        {"id": "q2", "text": "Does the phone charge properly?", "category": "Basic Functionality", "deduction_percentage": 15, "is_blocking": False, "yes_deducts": False},
        {"id": "q3", "text": "Is the touchscreen fully responsive?", "category": "Basic Functionality", "deduction_percentage": 12, "is_blocking": False, "yes_deducts": False},
        {"id": "q4", "text": "Are physical buttons working?", "category": "Basic Functionality", "deduction_percentage": 5, "is_blocking": False, "yes_deducts": False},
        {"id": "q5", "text": "Is fingerprint sensor working?", "category": "Basic Functionality", "deduction_percentage": 3, "is_blocking": False, "yes_deducts": False},
        {"id": "q6", "text": "Is face unlock working?", "category": "Basic Functionality", "deduction_percentage": 2, "is_blocking": False, "yes_deducts": False},
        {"id": "q7", "text": "Are speakers functioning correctly?", "category": "Basic Functionality", "deduction_percentage": 4, "is_blocking": False, "yes_deducts": False},
        {"id": "q8", "text": "Is microphone working?", "category": "Basic Functionality", "deduction_percentage": 8, "is_blocking": False, "yes_deducts": False},
        {"id": "q9", "text": "Is vibration motor working?", "category": "Basic Functionality", "deduction_percentage": 2, "is_blocking": False, "yes_deducts": False},
        {"id": "q10", "text": "Is WiFi working?", "category": "Basic Functionality", "deduction_percentage": 5, "is_blocking": False, "yes_deducts": False},
        {"id": "q11", "text": "Is Bluetooth working?", "category": "Basic Functionality", "deduction_percentage": 3, "is_blocking": False, "yes_deducts": False},
        {"id": "q12", "text": "Is mobile network detected?", "category": "Basic Functionality", "deduction_percentage": 10, "is_blocking": False, "yes_deducts": False},
        {"id": "q13", "text": "Is GPS working?", "category": "Basic Functionality", "deduction_percentage": 2, "is_blocking": False, "yes_deducts": False},
        {"id": "q14", "text": "Is the screen cracked or broken?", "category": "Display", "deduction_percentage": 20, "is_blocking": False, "yes_deducts": True},
        {"id": "q15", "text": "Are there dead pixels or lines on screen?", "category": "Display", "deduction_percentage": 15, "is_blocking": False, "yes_deducts": True},
        {"id": "q16", "text": "Is there screen discoloration?", "category": "Display", "deduction_percentage": 10, "is_blocking": False, "yes_deducts": True},
        {"id": "q17", "text": "Is there touch delay or ghost touch?", "category": "Display", "deduction_percentage": 12, "is_blocking": False, "yes_deducts": True},
        {"id": "q18", "text": "Is brightness normal?", "category": "Display", "deduction_percentage": 5, "is_blocking": False, "yes_deducts": False},
        {"id": "q19", "text": "Has display been replaced before?", "category": "Display", "deduction_percentage": 8, "is_blocking": False, "yes_deducts": True},
        {"id": "q20", "text": "Is battery backup normal (lasts full day)?", "category": "Battery", "deduction_percentage": 15, "is_blocking": False, "yes_deducts": False},
        {"id": "q21", "text": "Does phone heat abnormally?", "category": "Battery", "deduction_percentage": 10, "is_blocking": False, "yes_deducts": True},
        {"id": "q22", "text": "Is battery swelling?", "category": "Battery", "deduction_percentage": 25, "is_blocking": False, "yes_deducts": True},
        {"id": "q23", "text": "Has battery been replaced before?", "category": "Battery", "deduction_percentage": 5, "is_blocking": False, "yes_deducts": True},
        {"id": "q24", "text": "Is fast charging working?", "category": "Battery", "deduction_percentage": 5, "is_blocking": False, "yes_deducts": False},
        {"id": "q25", "text": "Is rear camera working?", "category": "Camera", "deduction_percentage": 12, "is_blocking": False, "yes_deducts": False},
        {"id": "q26", "text": "Is front camera working?", "category": "Camera", "deduction_percentage": 8, "is_blocking": False, "yes_deducts": False},
        {"id": "q27", "text": "Is there blurry or focus issue?", "category": "Camera", "deduction_percentage": 10, "is_blocking": False, "yes_deducts": True},
        {"id": "q28", "text": "Is flash working?", "category": "Camera", "deduction_percentage": 3, "is_blocking": False, "yes_deducts": False},
        {"id": "q29", "text": "Is camera glass cracked?", "category": "Camera", "deduction_percentage": 8, "is_blocking": False, "yes_deducts": True},
        {"id": "q30", "text": "Are there major dents or cracks on body?", "category": "Body", "deduction_percentage": 15, "is_blocking": False, "yes_deducts": True},
        {"id": "q31", "text": "Is back panel damaged?", "category": "Body", "deduction_percentage": 12, "is_blocking": False, "yes_deducts": True},
        {"id": "q32", "text": "Is frame bent?", "category": "Body", "deduction_percentage": 18, "is_blocking": False, "yes_deducts": True},
        {"id": "q33", "text": "Are there water damage signs?", "category": "Water Damage", "deduction_percentage": 25, "is_blocking": False, "yes_deducts": True},
        {"id": "q34", "text": "Is there rust or corrosion near ports?", "category": "Water Damage", "deduction_percentage": 15, "is_blocking": False, "yes_deducts": True},
        {"id": "q35", "text": "Has phone been exposed to water?", "category": "Water Damage", "deduction_percentage": 20, "is_blocking": False, "yes_deducts": True},
        {"id": "q36", "text": "Are there moisture warnings?", "category": "Water Damage", "deduction_percentage": 10, "is_blocking": False, "yes_deducts": True},
        {"id": "q37", "text": "Is Google account removed?", "category": "Security", "deduction_percentage": 0, "is_blocking": True, "yes_deducts": False},
        {"id": "q38", "text": "Is screen lock removed?", "category": "Security", "deduction_percentage": 5, "is_blocking": False, "yes_deducts": False},
        {"id": "q39", "text": "Is IMEI valid?", "category": "Security", "deduction_percentage": 0, "is_blocking": True, "yes_deducts": False},
        {"id": "q40", "text": "Is device blacklisted?", "category": "Security", "deduction_percentage": 0, "is_blocking": True, "yes_deducts": True},
        {"id": "q41", "text": "Has any part been replaced?", "category": "Repair History", "deduction_percentage": 8, "is_blocking": False, "yes_deducts": True},
        {"id": "q42", "text": "Any third-party repairs done?", "category": "Repair History", "deduction_percentage": 10, "is_blocking": False, "yes_deducts": True},
        {"id": "q43", "text": "Do you have charger?", "category": "Accessories", "deduction_percentage": 2, "is_blocking": False, "yes_deducts": False},
        {"id": "q44", "text": "Do you have original box?", "category": "Accessories", "deduction_percentage": 3, "is_blocking": False, "yes_deducts": False},
        {"id": "q45", "text": "Do you have purchase bill?", "category": "Accessories", "deduction_percentage": 5, "is_blocking": False, "yes_deducts": False},
    ]
    await db.questions.insert_many(questions)
    
    # Phones for Sale
    phones_for_sale = [
        {
            "id": "sale-1",
            "brand": "Samsung",
            "model": "Galaxy S22 Ultra",
            "price": 42000,
            "condition": "Excellent",
            "image": "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400",
            "description": "Like new condition, barely used for 6 months. All original accessories included.",
            "specs": {"RAM": "12GB", "Storage": "256GB", "Battery": "95% Health", "Warranty": "3 Months"},
            "in_stock": True
        },
        {
            "id": "sale-2",
            "brand": "OnePlus",
            "model": "10 Pro",
            "price": 35000,
            "condition": "Good",
            "image": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400",
            "description": "Well maintained, minor scratches on back. Works perfectly.",
            "specs": {"RAM": "8GB", "Storage": "128GB", "Battery": "88% Health", "Warranty": "3 Months"},
            "in_stock": True
        },
        {
            "id": "sale-3",
            "brand": "Xiaomi",
            "model": "13 Pro",
            "price": 38000,
            "condition": "Excellent",
            "image": "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400",
            "description": "Premium flagship in pristine condition. All accessories and box included.",
            "specs": {"RAM": "12GB", "Storage": "256GB", "Battery": "92% Health", "Warranty": "6 Months"},
            "in_stock": True
        },
        {
            "id": "sale-4",
            "brand": "Samsung",
            "model": "Galaxy A54",
            "price": 24000,
            "condition": "Good",
            "image": "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400",
            "description": "Mid-range champion, perfect for daily use. Camera is excellent.",
            "specs": {"RAM": "8GB", "Storage": "128GB", "Battery": "90% Health", "Warranty": "3 Months"},
            "in_stock": True
        },
        {
            "id": "sale-5",
            "brand": "Realme",
            "model": "11 Pro+",
            "price": 26000,
            "condition": "Excellent",
            "image": "https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=400",
            "description": "Fast charging beast with amazing display. Barely used.",
            "specs": {"RAM": "12GB", "Storage": "256GB", "Battery": "94% Health", "Warranty": "6 Months"},
            "in_stock": True
        },
        {
            "id": "sale-6",
            "brand": "OnePlus",
            "model": "Nord 3",
            "price": 24000,
            "condition": "Good",
            "image": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400",
            "description": "Best value for money. Smooth performance and good camera.",
            "specs": {"RAM": "8GB", "Storage": "128GB", "Battery": "87% Health", "Warranty": "3 Months"},
            "in_stock": True
        },
    ]
    await db.phones_for_sale.insert_many(phones_for_sale)
    
    logger.info("Database seeding completed")
