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
  
  // Selection states
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);
  const [selectedPackageId, setSelectedPackageId] = useState(null);
  const [activeEquipmentIds, setActiveEquipmentIds] = useState([]);
  
  // App UI states
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [loadError, setLoadError] = useState(null);

  // Fetch initial seed data from FastAPI server
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoadingData(true);
        const [vehiclesRes, packagesRes, equipmentRes] = await Promise.all([
          axios.get(`${API_BASE}/vehicles`),
          axios.get(`${API_BASE}/packages`),
          axios.get(`${API_BASE}/equipment`)
        ]);
        
        setVehicles(vehiclesRes.data);
        setPackages(packagesRes.data);
        setEquipment(equipmentRes.data);
        
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

  // Show notification helpers
  const triggerNotification = (message) => {
    setNotification(message);
    setTimeout(() => {
      setNotification(null);
    }, 3500);
  };

  // Toggle equipment handler
  const handleToggleEquipment = (id) => {
    setActiveEquipmentIds((prev) => 
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Save current configuration to DB
  const handleSaveConfiguration = async (name) => {
    if (!selectedVehicleId || !selectedPackageId) return;

    try {
      setIsSaving(true);
      const payload = {
        name,
        vehicle_id: selectedVehicleId,
        package_id: selectedPackageId,
        equipment_ids: activeEquipmentIds,
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

  // Cost calculation (Calculated live on frontend)
  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId);
  const selectedPackage = packages.find((p) => p.id === selectedPackageId);
  const selectedEquipmentItems = equipment.filter((item) => activeEquipmentIds.includes(item.id));

  const baseCost = selectedVehicle ? Number(selectedVehicle.base_cost) : 0;
  const packageCost = selectedPackage ? Number(selectedPackage.package_cost) : 0;
  const equipmentCost = selectedEquipmentItems.reduce((sum, item) => sum + Number(item.unit_cost), 0);
  const totalCost = baseCost + packageCost + equipmentCost;

  // Build active equipment map for the 3D Viewer: { mount_name: boolean }
  const activeEquipmentMap = {};
  equipment.forEach((item) => {
    activeEquipmentMap[item.mount_point] = activeEquipmentIds.includes(item.id);
  });

  return (
    <div className="app-container">
      {notification && (
        <div className="notification-banner">
          {notification}
        </div>
      )}

      {/* Brand Header */}
      <header className="app-header">
        <div className="brand-container">
          <div className="brand-icon">A</div>
          <span className="brand-title">Ambulance Configurator</span>
          <span className="brand-badge">POC</span>
        </div>
      </header>

      {/* Main Layout split into Configurator & 3D Viewer */}
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
              {/* Vehicle Dropdown */}
              <VehicleSelector 
                vehicles={vehicles}
                selectedVehicleId={selectedVehicleId}
                onSelectVehicle={setSelectedVehicleId}
              />

              {/* Package Selector */}
              <AmbulanceTypeSelector
                packages={packages}
                selectedPackageId={selectedPackageId}
                onSelectPackage={setSelectedPackageId}
              />

              {/* Equipment Toggles */}
              <EquipmentPanel
                equipment={equipment}
                activeEquipmentIds={activeEquipmentIds}
                onToggleEquipment={handleToggleEquipment}
              />

              {/* Cost Summary & Save button */}
              <CostSummary
                selectedVehicle={selectedVehicle}
                selectedPackage={selectedPackage}
                selectedEquipmentItems={selectedEquipmentItems}
                totalCost={totalCost}
                onSaveConfiguration={handleSaveConfiguration}
                isSaving={isSaving}
              />
            </>
          )}
        </section>

        {/* 3D Viewport Column */}
        <section style={{ flex: 1, position: 'relative' }}>
          <Viewer3D 
            activeEquipmentMap={activeEquipmentMap}
            equipment={equipment}
          />
        </section>
      </main>
    </div>
  );
}

export default App;
