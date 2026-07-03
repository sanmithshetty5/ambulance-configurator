import React, { useState, useEffect } from 'react';
import axios from 'axios';
import VehicleSelector from './components/VehicleSelector';
import AmbulanceTypeSelector from './components/AmbulanceTypeSelector';
import EquipmentPanel from './components/EquipmentPanel';
import CostSummary from './components/CostSummary';
import Viewer3D from './components/Viewer3D';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function App() {
  const [vehicles, setVehicles] = useState([]);
  const [packages, setPackages] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [conversions, setConversions] = useState([]);
  
  // Selection states
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);
  const [selectedPackageId, setSelectedPackageId] = useState(null);
  
  // App UI states
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [loadError, setLoadError] = useState(null);
  
  // Viewer states
  const [instances, setInstances] = useState([]);
  const [mountLimits, setMountLimits] = useState({});

  // Fetch initial seed data from FastAPI server
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoadingData(true);
        const [vehiclesRes, packagesRes, equipmentRes, conversionsRes] = await Promise.all([
          axios.get(`${API_BASE}/vehicles`),
          axios.get(`${API_BASE}/packages`),
          axios.get(`${API_BASE}/equipment`),
          axios.get(`${API_BASE}/conversions`)
        ]);
        
        setVehicles(vehiclesRes.data);
        setPackages(packagesRes.data);
        setEquipment(equipmentRes.data);
        setConversions(conversionsRes.data);
        
        // Auto-select first vehicle and package if available
        if (vehiclesRes.data.length > 0) {
          setSelectedVehicleId(vehiclesRes.data[0].id);
        }
        if (packagesRes.data.length > 0) {
          setSelectedPackageId(packagesRes.data[0].id);
        }
        
        setLoadError(null);
      } catch (err) {
        console.error("Error loading data from API:", err);
        setLoadError("Failed to connect to backend server. Make sure the FastAPI backend is running.");
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchData();
  }, []);

  const triggerNotification = (message) => {
    setNotification(message);
    setTimeout(() => {
      setNotification(null);
    }, 3500);
  };

  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId);
  const selectedPackage = packages.find((p) => p.id === selectedPackageId);
  
  const activeConversion = conversions.find(
    (c) => c.vehicle_id === selectedVehicleId && c.ambulance_type_id === selectedPackageId
  );
  const isUnsupported = !activeConversion;

  // When selected active conversion changes, load its default equipment instances
  useEffect(() => {
    if (isUnsupported || !activeConversion) {
      setInstances([]);
      return;
    }
    
    if (activeConversion.default_equipment) {
      const defaultInstances = activeConversion.default_equipment.map((item) => ({
        instanceId: crypto.randomUUID(),
        equipmentId: item.id,
        mountPoint: item.mount_point,
        modelFile: item.model_file,
        name: item.name,
        unitCost: Number(item.unit_cost),
        width_mm: item.width_mm,
        height_mm: item.height_mm,
        depth_mm: item.depth_mm,
        position_x: item.position_x,
        position_y: item.position_y,
        position_z: item.position_z,
        rotation_x: item.rotation_x,
        rotation_y: item.rotation_y,
        rotation_z: item.rotation_z,
        position: null
      }));
      setInstances(defaultInstances);
    } else {
      setInstances([]);
    }
  }, [activeConversion, isUnsupported]);

  const handleAddInstance = (item) => {
    const newInstance = {
      instanceId: crypto.randomUUID(),
      equipmentId: item.id,
      mountPoint: item.mount_point,
      modelFile: item.model_file,
      name: item.name,
      unitCost: Number(item.unit_cost),
      width_mm: item.width_mm,
      height_mm: item.height_mm,
      depth_mm: item.depth_mm,
      position_x: item.position_x,
      position_y: item.position_y,
      position_z: item.position_z,
      rotation_x: item.rotation_x,
      rotation_y: item.rotation_y,
      rotation_z: item.rotation_z,
      position: null
    };
    setInstances((prev) => [...prev, newInstance]);
  };
  
  const handleRemoveInstance = (instanceId) => {
    setInstances((prev) => prev.filter(i => i.instanceId !== instanceId));
  };

  const handleSaveConfiguration = async (name) => {
    if (isUnsupported || !activeConversion) return;

    try {
      setIsSaving(true);
      // For compatibility with HEAD's schema, pass both equipment_ids and instances
      const equipmentIds = [...new Set(instances.map(i => i.equipmentId))];
      
      const payload = {
        name,
        conversion_spec_id: activeConversion.id,
        equipment_ids: equipmentIds,
        instances: instances.map(i => ({
            equipment_id: i.equipmentId,
            position: [i.position_x || 0, i.position_y || 0, i.position_z || 0]
        })),
        total_cost: totalCost
      };

      const response = await axios.post(`${API_BASE}/configurations`, payload);
      triggerNotification(`Configuration "${response.data.name}" saved successfully!`);
    } catch (err) {
      console.error("Error saving configuration:", err);
      triggerNotification("Error: Failed to save configuration to the database.");
    } finally {
      setIsSaving(false);
    }
  };

  const baseCost = selectedVehicle ? Number(selectedVehicle.base_cost) : 0;
  const conversionCost = activeConversion ? Number(activeConversion.conversion_cost) : 0;
  
  // Pricing model: Only charge extra for optional equipment NOT included by default
  // In the instances model, we count how many defaults there are, and charge for any extras
  let optionalEquipmentCost = 0;
  if (activeConversion && activeConversion.default_equipment) {
    const defaultCounts = {};
    activeConversion.default_equipment.forEach(item => {
        defaultCounts[item.id] = (defaultCounts[item.id] || 0) + 1;
    });
    
    const instanceCounts = {};
    instances.forEach(inst => {
        instanceCounts[inst.equipmentId] = (instanceCounts[inst.equipmentId] || 0) + 1;
    });
    
    Object.keys(instanceCounts).forEach(eqId => {
        const id = parseInt(eqId);
        const count = instanceCounts[id];
        const defaultCount = defaultCounts[id] || 0;
        const extraCount = Math.max(0, count - defaultCount);
        
        if (extraCount > 0) {
            const item = equipment.find(e => e.id === id);
            if (item) {
                optionalEquipmentCost += (Number(item.unit_cost) * extraCount);
            }
        }
    });
  } else {
    // If no defaults, charge for everything
    optionalEquipmentCost = instances.reduce((sum, item) => sum + item.unitCost, 0);
  }

  const totalCost = baseCost + conversionCost + optionalEquipmentCost;

  return (
    <div className="app-container">
      {notification && (
        <div className="notification-banner">
          {notification}
        </div>
      )}

      <header className="app-header">
        <div className="brand-container">
          <div className="brand-icon">A</div>
          <span className="brand-title">Ambulance Configurator</span>
          <span className="brand-badge">POC</span>
        </div>
      </header>

      <main className="app-content">
        <section className="configurator-sidebar">
          {isLoadingData ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center', margin: 'auto' }}>
              <div className="spinner"></div>
              <p style={{ color: 'var(--text-muted)' }}>Loading configurator options...</p>
            </div>
          ) : loadError ? (
            <div style={{ color: '#ef4444', textAlign: 'center', margin: 'auto', padding: '1.5rem' }}>
              <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>⚠️ Connection Error</p>
              <p style={{ fontSize: '0.85rem' }}>{loadError}</p>
            </div>
          ) : (
            <>
              <VehicleSelector 
                vehicles={vehicles}
                selectedVehicleId={selectedVehicleId}
                onSelectVehicle={setSelectedVehicleId}
              />

              <AmbulanceTypeSelector
                packages={packages}
                selectedPackageId={selectedPackageId}
                onSelectPackage={setSelectedPackageId}
                conversions={conversions}
                selectedVehicleId={selectedVehicleId}
              />

              {isUnsupported ? (
                <div className="unsupported-alert-card">
                  <div className="unsupported-alert-icon">⚠️</div>
                  <h4 className="unsupported-alert-title">Configuration Unsupported</h4>
                  <p className="unsupported-alert-text">
                    The combination of <strong>{selectedVehicle?.name}</strong> and <strong>{selectedPackage?.name}</strong> is not supported by our engineering department.
                  </p>
                  <p style={{ fontSize: '0.8rem', marginTop: '0.5rem', color: 'var(--text-muted)' }}>
                    Compact chassis structures (like Maruti Suzuki Eeco) do not meet the interior compartment volume, payload limits, and electrical power generation specs required for Advanced Life Support (ALS) medical equipment conversions. Please choose a PTA or BLS package.
                  </p>
                </div>
              ) : (
                <>
                  <EquipmentPanel
                    equipment={equipment}
                    instances={instances}
                    mountLimits={mountLimits}
                    activeConversion={activeConversion}
                    onAddInstance={handleAddInstance}
                    onRemoveInstance={handleRemoveInstance}
                  />

                  <CostSummary
                    selectedVehicle={selectedVehicle}
                    selectedPackage={selectedPackage}
                    activeConversion={activeConversion}
                    selectedEquipmentItems={[]}
                    optionalEquipmentCost={optionalEquipmentCost}
                    totalCost={totalCost}
                    isUnsupported={isUnsupported}
                    onSaveConfiguration={handleSaveConfiguration}
                    isSaving={isSaving}
                  />
                </>
              )}
            </>
          )}
        </section>

        <section style={{ flex: 1, position: 'relative' }}>
          <Viewer3D 
            instances={instances}
            selectedVehicle={selectedVehicle}
            onMountLimitsUpdate={setMountLimits}
          />
        </section>
      </main>
    </div>
  );
}

export default App;
