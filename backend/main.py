from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, SessionLocal
import models
from routers import vehicles, packages, equipment, configurations, conversions, admin
import json

# Create database tables on startup if they don't exist
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Ambulance Interior Configurator API",
    description="Backend API for managing vehicles, equipment, and saved configurations.",
    version="1.1.0"
)

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify the exact frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(vehicles.router)
app.include_router(packages.router)
app.include_router(equipment.router)
app.include_router(configurations.router)
app.include_router(conversions.router)
app.include_router(admin.router)

def seed_database():
    db = SessionLocal()
    try:
        # Check if manufacturers are seeded
        if db.query(models.Manufacturer).first() is None:
            print("Seeding database with production-grade data...")

            # 1. Seed Manufacturers
            m_tata = models.Manufacturer(name="Tata Motors Limited", country="India", website="https://www.tatamotors.com")
            m_force = models.Manufacturer(name="Force Motors Limited", country="India", website="https://www.forcemotors.com")
            m_maruti = models.Manufacturer(name="Maruti Suzuki India Limited", country="India", website="https://www.marutisuzuki.com")
            db.add_all([m_tata, m_force, m_maruti])
            db.flush()

            # 2. Seed Brands
            b_bpl = models.Brand(name="BPL Medical Technologies", description="Leading Indian medical devices manufacturer")
            b_allied = models.Brand(name="Allied Healthcare Products", description="Premium medical gas and respiratory equipment")
            b_godrej = models.Brand(name="Godrej Interio", description="Commercial storage and medical cabinetry specialists")
            b_harita = models.Brand(name="Harita Seating Systems", description="Leading automotive seating provider in India")
            b_autolite = models.Brand(name="Autolite India", description="Certified automotive auxiliary lighting and warning sirens")
            db.add_all([b_bpl, b_allied, b_godrej, b_harita, b_autolite])
            db.flush()

            # 3. Seed Equipment Categories
            cat_medical = models.EquipmentCategory(name="Medical Devices", description="Clinical and diagnostic equipment")
            cat_safety = models.EquipmentCategory(name="Safety & Signaling", description="Alarms, external lights, and sirens")
            cat_comfort = models.EquipmentCategory(name="Attendant & Seating", description="Cabin and patient compartment seating systems")
            cat_storage = models.EquipmentCategory(name="Cabinets & Storage", description="Storage bins, oxygen cylinder housing, and medicine lockers")
            db.add_all([cat_medical, cat_safety, cat_comfort, cat_storage])
            db.flush()

            # 4. Seed Certifications
            cert_ce = models.Certification(name="CE Certificate", authority="European Economic Area Conformity")
            cert_fda = models.Certification(name="US FDA Approved", authority="United States Food and Drug Administration")
            cert_cdsco = models.Certification(name="CDSCO Registration", authority="Central Drugs Standard Control Organisation (India)")
            cert_iso = models.Certification(name="ISO 13485", authority="Medical devices quality management system")
            db.add_all([cert_ce, cert_fda, cert_cdsco, cert_iso])
            db.flush()

            # 5. Seed Conversion Features
            feat_abs = models.ConversionFeature(name="Seamless Anti-Bacterial ABS Wall Paneling", description="Easy-to-disinfect seamless wall paneling inside patient cabin")
            feat_oxy_pipe = models.ConversionFeature(name="Integrated Central Oxygen Piping System", description="Piped gas outlet manifolds connected to cylinders")
            feat_inv = models.ConversionFeature(name="220V Pure Sine Wave Inverter System", description="Powers ventilators, monitors, and suction units")
            feat_beacon = models.ConversionFeature(name="Roof-Mounted LED Beacon Bar with Multi-tone Siren", description="Exterior emergency warning lights")
            feat_hvac = models.ConversionFeature(name="Split Climate Control Patient Cabin HVAC", description="Dedicated cooling and ventilation system for the patient zone")
            db.add_all([feat_abs, feat_oxy_pipe, feat_inv, feat_beacon, feat_hvac])
            db.flush()

            # 6. Seed Vehicles
            v_winger = models.Vehicle(
                name="Tata Winger Ambulance Chassis", 
                manufacturer_id=m_tata.id, 
                base_cost=400000.00,
                length_mm=4940, width_mm=1950, height_mm=2670
            )
            v_traveller = models.Vehicle(
                name="Force Traveller Ambulance Chassis", 
                manufacturer_id=m_force.id, 
                base_cost=800000.00,
                length_mm=5415, width_mm=1975, height_mm=2535
            )
            v_eeco = models.Vehicle(
                name="Maruti Suzuki Eeco Ambulance Chassis", 
                manufacturer_id=m_maruti.id, 
                base_cost=250000.00,
                length_mm=3675, width_mm=1475, height_mm=1825
            )
            db.add_all([v_winger, v_traveller, v_eeco])
            db.flush()

            # 7. Seed Ambulance Types
            t_pta = models.AmbulanceType(name="Patient Transport Ambulance (PTA)", code="PTA", description="For simple non-emergency patient transit.")
            t_bls = models.AmbulanceType(name="Basic Life Support (BLS)", code="BLS", description="Equipped with mandatory BLS equipment such as stretcher and oxygen.")
            t_als = models.AmbulanceType(name="Advanced Life Support (ALS)", code="ALS", description="Fully-featured ICU-grade ambulance setup with advanced equipment.")
            db.add_all([t_pta, t_bls, t_als])
            db.flush()

            # 8. Seed Conversion Specifications (Supported Matrix)
            # Tata Winger
            spec_winger_pta = models.ConversionSpec(
                vehicle_id=v_winger.id, ambulance_type_id=t_pta.id,
                patient_length_mm=2800, patient_width_mm=1600, patient_height_mm=1750,
                patient_volume_liters=7840.0, conversion_cost=100000.00,
                payload_capacity_kg=850.0, electrical_capacity_ah=90.0,
                oxygen_mounting_capacity_liters=20.0, hvac_type="Dual AC Blower System",
                description="Economy patient transport build on Winger chassis"
            )
            spec_winger_bls = models.ConversionSpec(
                vehicle_id=v_winger.id, ambulance_type_id=t_bls.id,
                patient_length_mm=2800, patient_width_mm=1600, patient_height_mm=1750,
                patient_volume_liters=7840.0, conversion_cost=200000.00,
                payload_capacity_kg=800.0, electrical_capacity_ah=110.0,
                oxygen_mounting_capacity_liters=90.0, hvac_type="Dual Climate Zone AC",
                description="Standard Basic Life Support (BLS) compliant build"
            )
            spec_winger_als = models.ConversionSpec(
                vehicle_id=v_winger.id, ambulance_type_id=t_als.id,
                patient_length_mm=2800, patient_width_mm=1600, patient_height_mm=1750,
                patient_volume_liters=7840.0, conversion_cost=350000.00,
                payload_capacity_kg=700.0, electrical_capacity_ah=150.0,
                oxygen_mounting_capacity_liters=180.0, hvac_type="Integrated HEPA Climate Control HVAC",
                description="Premium ALS mobile ICU conversion"
            )
            
            # Force Traveller
            spec_traveller_pta = models.ConversionSpec(
                vehicle_id=v_traveller.id, ambulance_type_id=t_pta.id,
                patient_length_mm=3200, patient_width_mm=1700, patient_height_mm=1900,
                patient_volume_liters=10336.0, conversion_cost=120000.00,
                payload_capacity_kg=1200.0, electrical_capacity_ah=100.0,
                oxygen_mounting_capacity_liters=20.0, hvac_type="High-Capacity Rear AC Blower",
                description="Spacious patient transport conversion"
            )
            spec_traveller_bls = models.ConversionSpec(
                vehicle_id=v_traveller.id, ambulance_type_id=t_bls.id,
                patient_length_mm=3200, patient_width_mm=1700, patient_height_mm=1900,
                patient_volume_liters=10336.0, conversion_cost=220000.00,
                payload_capacity_kg=1100.0, electrical_capacity_ah=120.0,
                oxygen_mounting_capacity_liters=90.0, hvac_type="Dual Zone Climate Blower",
                description="AIS-125 Compliant BLS Traveller build"
            )
            spec_traveller_als = models.ConversionSpec(
                vehicle_id=v_traveller.id, ambulance_type_id=t_als.id,
                patient_length_mm=3200, patient_width_mm=1700, patient_height_mm=1900,
                patient_volume_liters=10336.0, conversion_cost=400000.00,
                payload_capacity_kg=1000.0, electrical_capacity_ah=180.0,
                oxygen_mounting_capacity_liters=180.0, hvac_type="Full HEPA Filter Climate Control HVAC",
                description="Large-format premium ICU conversion"
            )

            # Maruti Eeco
            spec_eeco_pta = models.ConversionSpec(
                vehicle_id=v_eeco.id, ambulance_type_id=t_pta.id,
                patient_length_mm=1800, patient_width_mm=1350, patient_height_mm=1400,
                patient_volume_liters=3402.0, conversion_cost=80000.00,
                payload_capacity_kg=400.0, electrical_capacity_ah=60.0,
                oxygen_mounting_capacity_liters=10.0, hvac_type="Standard Front AC + Cabin Air Fan",
                description="Compact urban patient transport build"
            )
            spec_eeco_bls = models.ConversionSpec(
                vehicle_id=v_eeco.id, ambulance_type_id=t_bls.id,
                patient_length_mm=1800, patient_width_mm=1350, patient_height_mm=1400,
                patient_volume_liters=3402.0, conversion_cost=150000.00,
                payload_capacity_kg=350.0, electrical_capacity_ah=70.0,
                oxygen_mounting_capacity_liters=40.0, hvac_type="Cabinet-mounted Cabin AC Duct",
                description="AIS-125 Type B (BLS) compliant micro-ambulance"
            )
            # Eeco ALS is unsupported and NOT seeded, keeping the Eeco-ALS combination invalid.

            db.add_all([
                spec_winger_pta, spec_winger_bls, spec_winger_als,
                spec_traveller_pta, spec_traveller_bls, spec_traveller_als,
                spec_eeco_pta, spec_eeco_bls
            ])
            db.flush()

            # Attach Conversion Features to Conversion Specs
            spec_winger_pta.features.extend([feat_beacon])
            spec_winger_bls.features.extend([feat_abs, feat_oxy_pipe, feat_beacon])
            spec_winger_als.features.extend([feat_abs, feat_oxy_pipe, feat_inv, feat_beacon, feat_hvac])

            spec_traveller_pta.features.extend([feat_beacon])
            spec_traveller_bls.features.extend([feat_abs, feat_oxy_pipe, feat_beacon])
            spec_traveller_als.features.extend([feat_abs, feat_oxy_pipe, feat_inv, feat_beacon, feat_hvac])

            spec_eeco_pta.features.extend([feat_beacon])
            spec_eeco_bls.features.extend([feat_abs, feat_oxy_pipe, feat_beacon])
            db.flush()

            # 9. Seed Equipment Product Catalog
            eq_stretcher = models.Equipment(
                name="BPL-Schiller Foldable Roll-in Stretcher",
                category_id=cat_medical.id, brand_id=b_bpl.id,
                sku="BPL-STR-R1-IND", hsn_code="94029020",
                unit_cost=50000.00, gst_rate=12.00, is_mandatory=True,
                warranty_months=24, stock_status="in_stock", lead_time_days=0,
                brochure_url="/docs/stretcher_brochure.pdf",
                specifications_json=json.dumps({
                    "Material": "High-strength Aluminum Alloy",
                    "Max Load Capacity": "159 kg",
                    "Adjustable Positions": "8 positions",
                    "Safety Belts": "Included"
                }),
                technical_features_json=json.dumps([
                    "One-person operation roll-in loading design",
                    "Locking side rails to prevent patient fall",
                    "Anti-corrosive polyurethane wheels"
                ]),
                mount_point="mount_stretcher", model_url="stretcher.glb",
                width_mm=550, height_mm=200, depth_mm=1900,
                position_x=0.0, position_y=-0.65, position_z=0.6,
                rotation_x=0.0, rotation_y=0.0, rotation_z=0.0
            )

            eq_oxygen = models.Equipment(
                name="Allied Healthcare D-Type Oxygen Cylinder Kit",
                category_id=cat_medical.id, brand_id=b_allied.id,
                sku="ALL-OXY-D-IND", hsn_code="73110010",
                unit_cost=30000.00, gst_rate=12.00, is_mandatory=True,
                warranty_months=60, stock_status="in_stock", lead_time_days=0,
                brochure_url="/docs/oxygen_kit.pdf",
                specifications_json=json.dumps({
                    "Capacity": "47 Liters Water Capacity",
                    "Working Pressure": "150 bar",
                    "Material": "Alloy Steel / Seamless design",
                    "Valves": "Pin Index Valve installed"
                }),
                technical_features_json=json.dumps([
                    "Click-style flowmeter with 0-15 L/min adjustment",
                    "Humidifier bottle attachment included",
                    "Heavy-duty bulkhead mounting brackets included"
                ]),
                mount_point="mount_oxygen_cylinder", model_url="oxygen_cylinder.glb",
                width_mm=230, height_mm=760, depth_mm=230,
                position_x=-0.65, position_y=-0.35, position_z=0.5,
                rotation_x=0.0, rotation_y=0.0, rotation_z=0.0
            )

            eq_cabinet = models.Equipment(
                name="Godrej Interio Poly-Laminated Medicine Cabinet",
                category_id=cat_storage.id, brand_id=b_godrej.id,
                sku="GOD-CAB-POLY-L", hsn_code="94031000",
                unit_cost=25000.00, gst_rate=18.00, is_mandatory=False,
                warranty_months=12, stock_status="in_stock", lead_time_days=3,
                brochure_url="/docs/cabinet_brochure.pdf",
                specifications_json=json.dumps({
                    "Material": "Poly-laminated MDF board",
                    "Compartments": "6 locked bins",
                    "Lock Type": "Central key-locking"
                }),
                technical_features_json=json.dumps([
                    "Anti-bacterial coating prevents mold growth",
                    "Transparent acrylic sliding doors for inventory check",
                    "Vibration-isolated wall fasteners"
                ]),
                mount_point="mount_medical_cabinet", model_url="medical_cabinet.glb",
                width_mm=400, height_mm=500, depth_mm=200,
                position_x=0.7, position_y=0.1, position_z=0.0,
                rotation_x=0.0, rotation_y=0.0, rotation_z=0.0
            )

            eq_seating = models.Equipment(
                name="Harita Fold-Down Doctor & Attendant Bench",
                category_id=cat_comfort.id, brand_id=b_harita.id,
                sku="HAR-SEA-BEN-01", hsn_code="94012000",
                unit_cost=20000.00, gst_rate=18.00, is_mandatory=True,
                warranty_months=36, stock_status="in_stock", lead_time_days=0,
                brochure_url="/docs/attendant_seating.pdf",
                specifications_json=json.dumps({
                    "Material": "Flame-retardant polyurethane foam",
                    "Belts": "2-point lap belts included",
                    "Underseat Storage": "120-Liter boot"
                }),
                technical_features_json=json.dumps([
                    "Comfortable ergonomic lumbar support design",
                    "Fold-down action saves floor workspace",
                    "Easily wipeable vinyl upholstery"
                ]),
                mount_point="mount_seating", model_url="seating.glb",
                width_mm=700, height_mm=800, depth_mm=400,
                position_x=0.55, position_y=-0.5, position_z=-0.3,
                rotation_x=0.0, rotation_y=0.0, rotation_z=0.0
            )

            eq_lighting = models.Equipment(
                name="Autolite LED High-Intensity Interior Light Panel",
                category_id=cat_safety.id, brand_id=b_autolite.id,
                sku="AUT-LIT-LED-INT", hsn_code="85122020",
                unit_cost=15000.00, gst_rate=18.00, is_mandatory=True,
                warranty_months=24, stock_status="in_stock", lead_time_days=0,
                brochure_url="/docs/cabin_lights.pdf",
                specifications_json=json.dumps({
                    "Voltage": "12V DC input",
                    "Illuminance": "500 Lux at 1 meter",
                    "Color Temp": "6000K Cool White / 3000K Blue Night Light Mode"
                }),
                technical_features_json=json.dumps([
                    "High energy efficiency drawing under 1.5 Amps",
                    "Includes blue night-light mode for patient comfort",
                    "Shatterproof flush-mount ceiling profile"
                ]),
                mount_point="mount_emergency_lighting", model_url="emergency_lighting.glb",
                width_mm=600, height_mm=30, depth_mm=100,
                position_x=0.0, position_y=0.85, position_z=0.0,
                rotation_x=0.0, rotation_y=0.0, rotation_z=0.0
            )

            eq_storage = models.Equipment(
                name="Godrej Under-Bench Utility Storage Box",
                category_id=cat_storage.id, brand_id=b_godrej.id,
                sku="GOD-STR-BENCH-BOX", hsn_code="94032000",
                unit_cost=10000.00, gst_rate=18.00, is_mandatory=False,
                warranty_months=12, stock_status="in_stock", lead_time_days=2,
                brochure_url="/docs/underbench_storage.pdf",
                specifications_json=json.dumps({
                    "Volume Capacity": "85 Liters",
                    "Material": "Powder-coated sheet steel (1.2mm)",
                    "Locks": "Dual padlock clamps"
                }),
                technical_features_json=json.dumps([
                    "Sits compactly in empty spaces or under stretchers",
                    "Vibration-damping rubber gasket seal",
                    "Corrosion resistant finish"
                ]),
                mount_point="mount_storage_unit", model_url="storage_unit.glb",
                width_mm=500, height_mm=350, depth_mm=350,
                position_x=-0.65, position_y=-0.65, position_z=-0.3,
                rotation_x=0.0, rotation_y=0.0, rotation_z=0.0
            )

            db.add_all([eq_stretcher, eq_oxygen, eq_cabinet, eq_seating, eq_lighting, eq_storage])
            db.flush()

            # Attach certifications to equipment items
            eq_stretcher.certifications.extend([cert_ce, cert_cdsco, cert_iso])
            eq_oxygen.certifications.extend([cert_iso, cert_cdsco])
            eq_cabinet.certifications.extend([cert_iso])
            eq_seating.certifications.extend([cert_iso])
            eq_lighting.certifications.extend([cert_iso])
            eq_storage.certifications.extend([cert_iso])
            db.flush()

            # Link Default Bundled Equipment to Conversion Specs (Mandatory list)
            # PTA Conversions: Seating & Lighting
            spec_winger_pta.default_equipment.extend([eq_seating, eq_lighting])
            spec_traveller_pta.default_equipment.extend([eq_seating, eq_lighting])
            spec_eeco_pta.default_equipment.extend([eq_seating, eq_lighting])

            # BLS Conversions: Stretcher, Oxygen, Seating, Lighting
            spec_winger_bls.default_equipment.extend([eq_stretcher, eq_oxygen, eq_seating, eq_lighting])
            spec_traveller_bls.default_equipment.extend([eq_stretcher, eq_oxygen, eq_seating, eq_lighting])
            spec_eeco_bls.default_equipment.extend([eq_stretcher, eq_oxygen, eq_seating, eq_lighting])

            # ALS Conversions: All 6 equipment items
            spec_winger_als.default_equipment.extend([eq_stretcher, eq_oxygen, eq_cabinet, eq_seating, eq_lighting, eq_storage])
            spec_traveller_als.default_equipment.extend([eq_stretcher, eq_oxygen, eq_cabinet, eq_seating, eq_lighting, eq_storage])
            db.commit()
            print("Database production seed completed successfully.")
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
