from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import SessionLocal
import models
import schemas

router = APIRouter(prefix="/conversions", tags=["conversions"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/", response_model=List[schemas.ConversionSpecResponse])
def get_conversion_specs(db: Session = Depends(get_db)):
    return db.query(models.ConversionSpec).all()

@router.get("/{spec_id}", response_model=schemas.ConversionSpecResponse)
def get_conversion_spec(spec_id: int, db: Session = Depends(get_db)):
    spec = db.query(models.ConversionSpec).filter(models.ConversionSpec.id == spec_id).first()
    if not spec:
        raise HTTPException(status_code=404, detail="Conversion specification not found")
    return spec
