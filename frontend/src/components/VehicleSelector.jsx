import React from 'react';

const VehicleSelector = ({ vehicles, selectedVehicleId, onSelectVehicle }) => {
  return (
    <div className="config-card">
      <div className="config-card-title">
        <span>🚐</span> Vehicle Base
      </div>
      <div className="select-wrapper">
        <select 
          className="custom-select"
          value={selectedVehicleId || ''}
          onChange={(e) => onSelectVehicle(Number(e.target.value))}
        >
          <option value="" disabled>-- Select Vehicle --</option>
          {vehicles.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name} (₹{Number(v.base_cost).toLocaleString('en-IN')})
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default VehicleSelector;
