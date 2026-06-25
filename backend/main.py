from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, SessionLocal
import models
from routers import vehicles, packages, equipment, configurations

# Create database tables on startup if they don't exist
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Ambulance Interior Configurator API",
    description="Backend API for managing vehicles, equipment, and saved configurations.",
    version="1.0.0"
)

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify the exact frontend URL (e.g. http://localhost:5173)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(vehicles.router)
app.include_router(packages.router)
app.include_router(equipment.router)
app.include_router(configurations.router)

def seed_database():
    db = SessionLocal()
    try:
        # Check if vehicles are already seeded
        if db.query(models.Vehicle).first() is None:
            print("Seeding database...")
            
            # 1. Seed vehicle
            winger = models.Vehicle(name="Tata Winger Ambulance", base_cost=400000.00)
            db.add(winger)
            
            # 2. Seed package
            basic = models.AmbulancePackage(name="Basic Ambulance", package_cost=200000.00)
            db.add(basic)
            
            # 3. Seed equipment items
            equipment_items = [
                models.Equipment(name="Stretcher", mount_point="mount_stretcher", unit_cost=50000.00, model_file="stretcher.glb"),
                models.Equipment(name="Oxygen Cylinder", mount_point="mount_oxygen_cylinder", unit_cost=30000.00, model_file="oxygen_cylinder.glb"),
                models.Equipment(name="Medical Cabinet", mount_point="mount_medical_cabinet", unit_cost=25000.00, model_file="medical_cabinet.glb"),
                models.Equipment(name="Seating", mount_point="mount_seating", unit_cost=20000.00, model_file="seating.glb"),
                models.Equipment(name="Emergency Lighting", mount_point="mount_emergency_lighting", unit_cost=15000.00, model_file="emergency_lighting.glb"),
                models.Equipment(name="Storage Unit", mount_point="mount_storage_unit", unit_cost=10000.00, model_file="storage_unit.glb")
            ]
            for item in equipment_items:
                db.add(item)
                
            db.commit()
            print("Database seeding completed successfully.")
        else:
            print("Database already contains data. Seeding skipped.")
    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

@app.on_event("startup")
def on_startup():
    seed_database()

@app.get("/")
def read_root():
    return {"message": "Ambulance Configurator API is running."}
