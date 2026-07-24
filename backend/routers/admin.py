from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from database import get_db
import models
import schemas

router = APIRouter(prefix="/admin", tags=["admin"])

@router.post("/login", response_model=schemas.AdminLoginResponse)
def admin_login(req: schemas.AdminLoginRequest):
    # SECURITY NOTE: Plaintext comparison with no hashing or rate limiting is only acceptable for local/internal POC use.
    if req.username == "admin" and req.password == "1234":
        return schemas.AdminLoginResponse(success=True, token="admin-session")
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid admin credentials"
    )

@router.post("/vehicles", response_model=schemas.VehicleResponse)
def create_vehicle(req: schemas.VehicleCreate, db: Session = Depends(get_db)):
    db_vehicle = models.Vehicle(
        name=req.name,
        manufacturer_id=req.manufacturer_id,
        base_cost=req.base_cost,
        length_mm=req.length_mm,
        width_mm=req.width_mm,
        height_mm=req.height_mm
    )
    db.add(db_vehicle)
    db.commit()
    db.refresh(db_vehicle)
    return db_vehicle

@router.post("/equipment", response_model=schemas.EquipmentResponse)
def create_equipment(req: schemas.EquipmentCreate, db: Session = Depends(get_db)):
    db_equipment = models.Equipment(
        name=req.name,
        category_id=req.category_id,
        brand_id=req.brand_id,
        sku=req.sku,
        hsn_code=req.hsn_code,
        unit_cost=req.unit_cost,
        gst_rate=req.gst_rate,
        is_mandatory=req.is_mandatory,
        warranty_months=req.warranty_months,
        stock_status=req.stock_status,
        stock_quantity=req.stock_quantity,
        lead_time_days=req.lead_time_days,
        mount_point=req.mount_point,
        model_url=req.model_url,
        width_mm=req.width_mm,
        height_mm=req.height_mm,
        depth_mm=req.depth_mm,
        position_x=req.position_x,
        position_y=req.position_y,
        position_z=req.position_z,
        rotation_x=req.rotation_x,
        rotation_y=req.rotation_y,
        rotation_z=req.rotation_z
    )
    db.add(db_equipment)
    db.flush()
    
    # Link certifications
    if req.certification_ids:
        certs = db.query(models.Certification).filter(models.Certification.id.in_(req.certification_ids)).all()
        db_equipment.certifications.extend(certs)
        
    db.commit()
    db.refresh(db_equipment)
    return db_equipment

@router.post("/ambulance-types", response_model=schemas.PackageResponse)
def create_ambulance_type(req: schemas.AmbulanceTypeCreate, db: Session = Depends(get_db)):
    db_type = models.AmbulanceType(
        name=req.name,
        code=req.code,
        description=req.description
    )
    db.add(db_type)
    db.commit()
    db.refresh(db_type)
    return db_type

@router.post("/conversion-specs", response_model=schemas.ConversionSpecResponse)
def create_conversion_spec(req: schemas.ConversionSpecCreate, db: Session = Depends(get_db)):
    db_spec = models.ConversionSpec(
        vehicle_id=req.vehicle_id,
        ambulance_type_id=req.ambulance_type_id,
        patient_length_mm=req.patient_length_mm,
        patient_width_mm=req.patient_width_mm,
        patient_height_mm=req.patient_height_mm,
        patient_volume_liters=req.patient_volume_liters,
        conversion_cost=req.conversion_cost,
        payload_capacity_kg=req.payload_capacity_kg,
        electrical_capacity_ah=req.electrical_capacity_ah,
        oxygen_mounting_capacity_liters=req.oxygen_mounting_capacity_liters,
        hvac_type=req.hvac_type,
        description=req.description
    )
    db.add(db_spec)
    db.flush()
    
    # Link default equipment
    if req.default_equipment_ids:
        eq_items = db.query(models.Equipment).filter(models.Equipment.id.in_(req.default_equipment_ids)).all()
        db_spec.default_equipment.extend(eq_items)
        
    # Link features
    if req.feature_ids:
        features = db.query(models.ConversionFeature).filter(models.ConversionFeature.id.in_(req.feature_ids)).all()
        db_spec.features.extend(features)
        
    db.commit()
    db.refresh(db_spec)
    return db_spec

@router.get("/catalog-summary")
def get_catalog_summary(db: Session = Depends(get_db)):
    vehicles = db.query(models.Vehicle).all()
    equipment = db.query(models.Equipment).all()
    packages = db.query(models.AmbulanceType).all()
    conversions = db.query(models.ConversionSpec).all()
    manufacturers = db.query(models.Manufacturer).all()
    brands = db.query(models.Brand).all()
    categories = db.query(models.EquipmentCategory).all()
    features = db.query(models.ConversionFeature).all()
    certifications = db.query(models.Certification).all()
    
    return {
        "vehicles": vehicles,
        "equipment": equipment,
        "packages": packages,
        "conversions": conversions,
        "manufacturers": manufacturers,
        "brands": brands,
        "categories": categories,
        "features": features,
        "certifications": certifications
    }
