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
            
            # 1. Seed vehicles
            vehicles = [
                models.Vehicle(name="Tata Winger Ambulance", base_cost=400000.00),
                models.Vehicle(name="Force Traveller Ambulance", base_cost=800000.00),
                models.Vehicle(name="Maruti Suzuki Eeco Ambulance", base_cost=250000.00)
            ]
            for v in vehicles:
                db.add(v)
            
            # 2. Seed equipment items
            equipment_items = {
                "stretcher": models.Equipment(
                    name="Stretcher", 
                    mount_point="mount_stretcher", 
                    unit_cost=50000.00, 
                    model_url="stretcher.glb",
                    is_mandatory=True,
                    category="medical"
                ),
                "oxygen": models.Equipment(
                    name="Oxygen Cylinder", 
                    mount_point="mount_oxygen_cylinder", 
                    unit_cost=30000.00, 
                    model_url="oxygen_cylinder.glb",
                    is_mandatory=True,
                    category="medical"
                ),
                "cabinet": models.Equipment(
                    name="Medical Cabinet", 
                    mount_point="mount_medical_cabinet", 
                    unit_cost=25000.00, 
                    model_url="medical_cabinet.glb",
                    is_mandatory=False,
                    category="storage"
                ),
                "seating": models.Equipment(
                    name="Seating", 
                    mount_point="mount_seating", 
                    unit_cost=20000.00, 
                    model_url="seating.glb",
                    is_mandatory=True,
                    category="comfort"
                ),
                "lighting": models.Equipment(
                    name="Emergency Lighting", 
                    mount_point="mount_emergency_lighting", 
                    unit_cost=15000.00, 
                    model_url="emergency_lighting.glb",
                    is_mandatory=True,
                    category="safety"
                ),
                "storage": models.Equipment(
                    name="Storage Unit", 
                    mount_point="mount_storage_unit", 
                    unit_cost=10000.00, 
                    model_url="storage_unit.glb",
                    is_mandatory=False,
                    category="storage"
                )
            }
            for item in equipment_items.values():
                db.add(item)
                
            db.flush() # Flush to get IDs of equipment items

            # 3. Seed ambulance packages / types with default equipment relationships
            # PTA: Patient Transport
            pta = models.AmbulanceType(
                name="Patient Transport Ambulance (PTA)", 
                package_cost=100000.00,
                description="For simple non-emergency patient transit."
            )
            pta.default_equipment.append(equipment_items["seating"])
            pta.default_equipment.append(equipment_items["lighting"])
            db.add(pta)

            # BLS: Basic Life Support (Basic Ambulance)
            bls = models.AmbulanceType(
                name="Basic Life Support (BLS / Basic)", 
                package_cost=200000.00,
                description="Equipped with mandatory BLS equipment such as stretcher and oxygen."
            )
            bls.default_equipment.append(equipment_items["stretcher"])
            bls.default_equipment.append(equipment_items["oxygen"])
            bls.default_equipment.append(equipment_items["seating"])
            bls.default_equipment.append(equipment_items["lighting"])
            db.add(bls)

            # ALS: Advanced Life Support
            als = models.AmbulanceType(
                name="Advanced Life Support (ALS)", 
                package_cost=400000.00,
                description="Fully-featured ICU-grade ambulance setup with advanced equipment."
            )
            # ALS includes all default equipment items by default
            for item in equipment_items.values():
                als.default_equipment.append(item)
            db.add(als)

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
