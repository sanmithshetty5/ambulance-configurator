import React from 'react';

const EquipmentPanel = ({ equipment, activeEquipmentIds, onToggleEquipment }) => {
  return (
    <div className="config-card">
      <div className="config-card-title">
        <span>🛠️</span> Interior Equipment
      </div>
      <div className="equipment-list">
        {equipment.map((item) => {
          const isActive = activeEquipmentIds.includes(item.id);
          return (
            <div 
              key={item.id} 
              className={`equipment-item ${isActive ? 'active' : ''}`}
            >
              <div className="equipment-info">
                <span className="equipment-name">{item.name}</span>
                <span className="equipment-cost">₹{Number(item.unit_cost).toLocaleString('en-IN')}</span>
              </div>
              <label className="switch">
                <input 
                  type="checkbox"
                  checked={isActive}
                  onChange={() => onToggleEquipment(item.id)}
                />
                <span className="slider"></span>
              </label>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EquipmentPanel;
