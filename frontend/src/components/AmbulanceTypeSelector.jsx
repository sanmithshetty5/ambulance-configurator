import React from 'react';

const AmbulanceTypeSelector = ({ packages, selectedPackageId, onSelectPackage, conversions, selectedVehicleId }) => {
  return (
    <div className="config-card">
      <div className="config-card-title">
        <span>🚑</span> Ambulance Package
      </div>
      <div className="package-options">
        {packages.map((pkg) => {
          const conv = conversions?.find(
            (c) => c.vehicle_id === selectedVehicleId && c.ambulance_type_id === pkg.id
          );
          return (
            <div 
              key={pkg.id} 
              className={`package-option ${selectedPackageId === pkg.id ? 'active' : ''}`}
              onClick={() => onSelectPackage(pkg.id)}
            >
              <div className="package-info" style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', textAlign: 'left' }}>
                <span className="package-name">{pkg.name}</span>
                {conv && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Payload: {conv.payload_capacity_kg} kg | HVAC: {conv.hvac_type}
                  </span>
                )}
              </div>
              <span className="package-cost" style={{ color: conv ? 'var(--color-primary)' : '#ef4444' }}>
                {conv ? `+ ₹${Number(conv.conversion_cost).toLocaleString('en-IN')}` : 'Unsupported'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AmbulanceTypeSelector;
