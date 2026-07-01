from pydantic import BaseModel, ConfigDict, field_validator
from typing import List, Optional
from decimal import Decimal
from datetime import datetime

# Vehicle Schemas
class VehicleBase(BaseModel):
    name: str
    base_cost: Decimal
    length_mm: Optional[float] = None
    width_mm: Optional[float] = None
    height_mm: Optional[float] = None

class VehicleResponse(VehicleBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

# Equipment Schemas
class EquipmentBase(BaseModel):
    name: str
    mount_point: str
    unit_cost: Decimal
    model_url: str
    is_mandatory: bool
    category: Optional[str] = None
    width_mm: Optional[float] = None
    height_mm: Optional[float] = None
    depth_mm: Optional[float] = None
    position_x: Optional[float] = None
    position_y: Optional[float] = None
    position_z: Optional[float] = None
    rotation_x: Optional[float] = None
    rotation_y: Optional[float] = None
    rotation_z: Optional[float] = None


class EquipmentResponse(EquipmentBase):
    id: int
    model_file: str  # Kept for frontend compatibility

    model_config = ConfigDict(from_attributes=True)

    @field_validator("model_file", mode="before")
    @classmethod
    def set_model_file(cls, v, info):
        # If model_file is not passed, fallback to using model_url (which maps to the file name)
        if not v and "model_url" in info.data:
            return info.data["model_url"]
        return v or ""

# Package / Ambulance Type Schemas
class PackageBase(BaseModel):
    name: str
    package_cost: Decimal
    description: Optional[str] = None

class PackageResponse(PackageBase):
    id: int
    default_equipment: List[EquipmentResponse] = []
    model_config = ConfigDict(from_attributes=True)

# Configuration Schemas
class ConfigurationCreate(BaseModel):
    name: str
    vehicle_id: int
    package_id: int  # Frontend sends package_id
    equipment_ids: List[int]
    total_cost: Decimal

class ConfigurationResponse(BaseModel):
    id: int
    name: str
    vehicle_id: int
    package_id: int  # Map ambulance_type_id to package_id for frontend
    equipment_ids: List[int]  # Expose list of equipment IDs
    total_cost: Decimal
    status: str
    share_token: str
    created_at: datetime
    equipment: List[EquipmentResponse]

    model_config = ConfigDict(from_attributes=True)

    @field_validator("package_id", mode="before")
    @classmethod
    def get_package_id(cls, v, info):
        # When serializing a SavedConfiguration model, it contains ambulance_type_id
        return v


