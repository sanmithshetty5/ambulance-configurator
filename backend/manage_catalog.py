import sys
import os

# Set path to backend
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal
import models

def print_separator():
    print("\n" + "="*50 + "\n")

def add_vehicle(db):
    print("--- Add New Vehicle Chassis ---")
    name = input("Vehicle Name (e.g. Force Traveller): ").strip()
    if not name:
        print("Name cannot be empty.")
        return
        
    try:
        base_cost = float(input("Base Cost (₹, e.g. 500000): "))
        length_mm = float(input("Interior Cargo Length (mm, e.g. 3000) or Enter to skip: ") or 0)
        width_mm = float(input("Interior Cargo Width (mm, e.g. 1700) or Enter to skip: ") or 0)
        height_mm = float(input("Interior Cargo Height (mm, e.g. 1800) or Enter to skip: ") or 0)
    except ValueError:
        print("Invalid number input. Aborting.")
        return

    new_v = models.Vehicle(
        name=name,
        base_cost=base_cost,
        length_mm=length_mm if length_mm > 0 else None,
        width_mm=width_mm if width_mm > 0 else None,
        height_mm=height_mm if height_mm > 0 else None
    )
    db.add(new_v)
    db.commit()
    print(f"\n✅ Vehicle '{name}' added successfully with ID: {new_v.id}!")

def add_equipment(db):
    print("--- Add New Interior Equipment ---")
    name = input("Equipment Name (e.g. Ventilator): ").strip()
    if not name:
        print("Name cannot be empty.")
        return
        
    category = input("Category (medical / safety / comfort / storage): ").strip().lower()
    mount_point = input("Mount Point Coordinate Key (e.g. mount_ventilator): ").strip()
    model_url = input("3D GLB Model Filename (e.g. ventilator.glb): ").strip()
    is_mandatory_input = input("Is this item mandatory? (y/n): ").strip().lower()
    is_mandatory = is_mandatory_input == 'y'

    try:
        unit_cost = float(input("Unit Cost (₹, e.g. 45000): "))
        width_mm = float(input("Physical Width (mm) or Enter to skip: ") or 0)
        height_mm = float(input("Physical Height (mm) or Enter to skip: ") or 0)
        depth_mm = float(input("Physical Depth (mm) or Enter to skip: ") or 0)
        pos_x = float(input("3D Position X (m, e.g. 0.5) or Enter to skip: ") or 0)
        pos_y = float(input("3D Position Y (m, e.g. -0.5) or Enter to skip: ") or 0)
        pos_z = float(input("3D Position Z (m, e.g. 0.2) or Enter to skip: ") or 0)
        rot_x = float(input("3D Rotation X (rad, e.g. 0) or Enter to skip: ") or 0)
        rot_y = float(input("3D Rotation Y (rad, e.g. 0) or Enter to skip: ") or 0)
        rot_z = float(input("3D Rotation Z (rad, e.g. 0) or Enter to skip: ") or 0)
    except ValueError:
        print("Invalid number input. Aborting.")
        return

    new_eq = models.Equipment(
        name=name,
        category=category if category else "medical",
        mount_point=mount_point if mount_point else f"mount_{name.lower().replace(' ', '_')}",
        model_url=model_url if model_url else f"{name.lower().replace(' ', '_')}.glb",
        is_mandatory=is_mandatory,
        unit_cost=unit_cost,
        width_mm=width_mm if width_mm > 0 else None,
        height_mm=height_mm if height_mm > 0 else None,
        depth_mm=depth_mm if depth_mm > 0 else None,
        position_x=pos_x,
        position_y=pos_y,
        position_z=pos_z,
        rotation_x=rot_x,
        rotation_y=rot_y,
        rotation_z=rot_z
    )
    db.add(new_eq)
    db.commit()
    print(f"\n✅ Equipment '{name}' added successfully with ID: {new_eq.id}!")

def add_ambulance_type(db):
    print("--- Add New Ambulance Package Type ---")
    name = input("Package Name (e.g. Coronary Care Unit): ").strip()
    if not name:
        print("Name cannot be empty.")
        return
        
    try:
        package_cost = float(input("Package Cost (₹, e.g. 300000): "))
    except ValueError:
        print("Invalid cost. Aborting.")
        return
        
    description = input("Description: ").strip()

    new_type = models.AmbulanceType(
        name=name,
        package_cost=package_cost,
        description=description if description else None
    )
    db.add(new_type)
    db.flush()

    # Link default equipment items
    print("\nAvailable Equipment items:")
    equipment = db.query(models.Equipment).all()
    for eq in equipment:
        print(f"[{eq.id}] {eq.name} (₹{eq.unit_cost})")
        
    eq_ids_input = input("\nEnter equipment IDs to include by default (comma separated, e.g. 1,2,4) or Enter for none: ").strip()
    if eq_ids_input:
        try:
            eq_ids = [int(x.strip()) for x in eq_ids_input.split(",") if x.strip()]
            selected_items = db.query(models.Equipment).filter(models.Equipment.id.in_(eq_ids)).all()
            new_type.default_equipment.extend(selected_items)
            print(f"Linked {len(selected_items)} equipment items as defaults.")
        except ValueError:
            print("Invalid IDs format. No defaults linked.")

    db.commit()
    print(f"\n✅ Ambulance Type '{name}' added successfully with ID: {new_type.id}!")

def list_catalog(db):
    print_separator()
    print("=== CURRENT VEHICLES ===")
    for v in db.query(models.Vehicle).all():
         print(f"ID: {v.id} | {v.name} (₹{v.base_cost}) - Dim: {v.length_mm}x{v.width_mm}x{v.height_mm} mm")
         
    print("\n=== CURRENT AMBULANCE PACKAGES ===")
    for t in db.query(models.AmbulanceType).all():
         defaults = ", ".join([eq.name for eq in t.default_equipment])
         print(f"ID: {t.id} | {t.name} (₹{t.package_cost}) - Defaults: [{defaults}]")
         
    print("\n=== CURRENT EQUIPMENT CATALOG ===")
    for eq in db.query(models.Equipment).all():
         mandatory_str = "MANDATORY" if eq.is_mandatory else "OPTIONAL"
         print(f"ID: {eq.id} | {eq.name} ({eq.category}) - ₹{eq.unit_cost} [{mandatory_str}]")
    print_separator()

def main():
    db = SessionLocal()
    try:
        while True:
            print("\n🚑 AMBULANCE CONFIGURATOR DATABASE CATALOG MANAGER 🚑")
            print("1. Add New Vehicle Chassis")
            print("2. Add New Equipment Item")
            print("3. Add New Ambulance Package / Type")
            print("4. List Current Catalog Data")
            print("5. Exit")
            
            choice = input("\nEnter choice (1-5): ").strip()
            
            if choice == "1":
                print_separator()
                add_vehicle(db)
            elif choice == "2":
                print_separator()
                add_equipment(db)
            elif choice == "3":
                print_separator()
                add_ambulance_type(db)
            elif choice == "4":
                list_catalog(db)
            elif choice == "5":
                print("\nGoodbye!")
                break
            else:
                print("Invalid choice. Try again.")
    finally:
        db.close()

if __name__ == "__main__":
    main()
