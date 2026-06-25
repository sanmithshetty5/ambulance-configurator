from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import models
import schemas

router = APIRouter(prefix="/packages", tags=["packages"])

@router.get("", response_model=List[schemas.PackageResponse])
def list_packages(db: Session = Depends(get_db)):
    return db.query(models.AmbulancePackage).all()
