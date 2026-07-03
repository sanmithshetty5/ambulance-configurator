from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas

router = APIRouter(prefix="/configurations", tags=["configurations"])

@router.post("", response_model=schemas.ConfigurationResponse, status_code=status.HTTP_201_CREATED)
def create_configuration(config: schemas.ConfigurationCreate, db: Session = Depends(get_db)):
    # Validate conversion_spec_id
    conversion_spec = db.query(models.ConversionSpec).filter(models.ConversionSpec.id == config.conversion_spec_id).first()
    if not conversion_spec:
        raise HTTPException(
            status_code=400, 
            detail=f"Conversion spec with id {config.conversion_spec_id} does not exist."
        )
        
    # Save the configuration base fields
    db_config = models.SavedConfiguration(
        name=config.name,
        conversion_spec_id=config.conversion_spec_id,
        total_cost=config.total_cost,
        status="draft"
    )
    db.add(db_config)
    
    # Associate selected equipment items via configuration_equipment junction table
    if config.equipment_ids:
        equipment_items = db.query(models.Equipment).filter(models.Equipment.id.in_(config.equipment_ids)).all()
        if len(equipment_items) != len(config.equipment_ids):
            # Find which IDs were invalid
            found_ids = {eq.id for eq in equipment_items}
            missing_ids = set(config.equipment_ids) - found_ids
            raise HTTPException(
                status_code=400, 
                detail=f"Equipment with these IDs do not exist: {list(missing_ids)}"
            )
        db_config.equipment.extend(equipment_items)
        
    db.flush()

    if hasattr(config, 'instances') and config.instances:
        for instance_data in config.instances:
            db_instance = models.ConfigurationInstance(
                configuration_id=db_config.id,
                equipment_id=instance_data.equipment_id,
                position_x=instance_data.position[0],
                position_y=instance_data.position[1],
                position_z=instance_data.position[2]
            )
            db.add(db_instance)
    db.commit()
    db.refresh(db_config)
    return db_config

@router.get("/{config_id}", response_model=schemas.ConfigurationResponse)
def get_configuration(config_id: int, db: Session = Depends(get_db)):
    db_config = db.query(models.SavedConfiguration).filter(models.SavedConfiguration.id == config_id).first()
    if not db_config:
        raise HTTPException(status_code=404, detail=f"Configuration with id {config_id} not found.")
    return db_config

@router.get("/share/{share_token}", response_model=schemas.ConfigurationResponse)
def get_configuration_by_share_token(share_token: str, db: Session = Depends(get_db)):
    db_config = db.query(models.SavedConfiguration).filter(models.SavedConfiguration.share_token == share_token).first()
    if not db_config:
        raise HTTPException(status_code=404, detail=f"Configuration with share token {share_token} not found.")
    return db_config

