from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas

router = APIRouter(prefix="/configurations", tags=["configurations"])

@router.post("", response_model=schemas.ConfigurationResponse, status_code=status.HTTP_201_CREATED)
def create_configuration(config: schemas.ConfigurationCreate, db: Session = Depends(get_db)):
    # Validate vehicle_id
    vehicle = db.query(models.Vehicle).filter(models.Vehicle.id == config.vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=400, detail=f"Vehicle with id {config.vehicle_id} does not exist.")
        
    # Validate package_id
    package = db.query(models.AmbulancePackage).filter(models.AmbulancePackage.id == config.package_id).first()
    if not package:
        raise HTTPException(status_code=400, detail=f"Ambulance package with id {config.package_id} does not exist.")
        
    # Save the configuration
    db_config = models.SavedConfiguration(
        name=config.name,
        vehicle_id=config.vehicle_id,
        package_id=config.package_id,
        equipment_ids=config.equipment_ids,
        total_cost=config.total_cost
    )
    db.add(db_config)
    db.commit()
    db.refresh(db_config)
    return db_config

@router.get("/{config_id}", response_model=schemas.ConfigurationResponse)
def get_configuration(config_id: int, db: Session = Depends(get_db)):
    db_config = db.query(models.SavedConfiguration).filter(models.SavedConfiguration.id == config_id).first()
    if not db_config:
        raise HTTPException(status_code=404, detail=f"Configuration with id {config_id} not found.")
    return db_config
