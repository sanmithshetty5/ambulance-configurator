-- Seed data for vehicles
INSERT INTO vehicles (name, base_cost) VALUES ('Tata Winger Ambulance', 400000.00);

-- Seed data for ambulance packages
INSERT INTO ambulance_packages (name, package_cost) VALUES ('Basic Ambulance', 200000.00);

-- Seed data for equipment items
INSERT INTO equipment (name, mount_point, unit_cost, model_file) VALUES
('Stretcher', 'mount_stretcher', 50000.00, 'stretcher.glb'),
('Oxygen Cylinder', 'mount_oxygen_cylinder', 30000.00, 'oxygen_cylinder.glb'),
('Medical Cabinet', 'mount_medical_cabinet', 25000.00, 'medical_cabinet.glb'),
('Seating', 'mount_seating', 20000.00, 'seating.glb'),
('Emergency Lighting', 'mount_emergency_lighting', 15000.00, 'emergency_lighting.glb'),
('Storage Unit', 'mount_storage_unit', 10000.00, 'storage_unit.glb');
