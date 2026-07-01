import React from 'react';

const EquipmentPanel = ({ equipment, activeEquipmentIds, onToggleEquipment }) => {
  // Group definitions
  const categories = {
    medical: { name: 'Medical Devices', icon: '🩺' },
    safety: { name: 'Safety & Signaling', icon: '🚨' },
    comfort: { name: 'Attendant & Seating', icon: '💺' },
    storage: { name: 'Cabinets & Storage', icon: '📦' }
  };

  // Helper to group items
  const groupedEquipment = {};
  equipment.forEach((item) => {
    const cat = item.category || 'medical';
    if (!groupedEquipment[cat]) {
      groupedEquipment[cat] = [];
    }
    groupedEquipment[cat].push(item);
  });

  return (
    <div className="config-card">
      <div className="config-card-title">
        <span>🛠️</span> Interior Equipment
      </div>
      <div className="equipment-categories">
        {Object.keys(categories).map((catKey) => {
          const catInfo = categories[catKey];
          const items = groupedEquipment[catKey] || [];
          
          if (items.length === 0) return null;

          return (
            <div key={catKey} className="category-group">
              <div className="category-header">
                <span className="category-icon">{catInfo.icon}</span>
                <span className="category-name">{catInfo.name}</span>
              </div>
              <div className="equipment-list">
                {items.map((item) => {
                  const isActive = activeEquipmentIds.includes(item.id);
                  const isMandatory = item.is_mandatory;

                  return (
                    <div 
                      key={item.id} 
                      className={`equipment-item ${isActive ? 'active' : ''} ${isMandatory ? 'mandatory-item' : ''}`}
                    >
                      <div className="equipment-info">
                        <div className="equipment-meta">
                          <span className="equipment-name">{item.name}</span>
                          {isMandatory && (
                            <span className="mandatory-badge">Mandatory</span>
                          )}
                        </div>
                        <span className="equipment-cost">₹{Number(item.unit_cost).toLocaleString('en-IN')}</span>
                      </div>
                      <label className={`switch ${isMandatory ? 'disabled' : ''}`}>
                        <input 
                          type="checkbox"
                          checked={isActive}
                          disabled={isMandatory}
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
        })}
      </div>
    </div>
  );
};

export default EquipmentPanel;

