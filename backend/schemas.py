from pydantic import BaseModel, ConfigDict
from typing import List
from decimal import Decimal
from datetime import datetime

# Vehicle Schemas
class VehicleBase(BaseModel):
    name: str
    base_cost: Decimal

class VehicleResponse(VehicleBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

# Package Schemas
class PackageBase(BaseModel):
    name: str
    package_cost: Decimal

class PackageResponse(PackageBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

# Equipment Schemas
class EquipmentBase(BaseModel):
    name: str
    mount_point: str
    unit_cost: Decimal
    model_file: str

class EquipmentResponse(EquipmentBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

# Configuration Schemas
class ConfigurationCreate(BaseModel):
    name: str
    vehicle_id: int
    package_id: int
    equipment_ids: List[int]
    total_cost: Decimal

class ConfigurationResponse(ConfigurationCreate):
    id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)
